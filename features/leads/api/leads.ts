'use server';

import { createClient } from '@/lib/supabase/server';
import { Lead, LeadsFilters } from '../types/leads';
import { DataResponse } from '@/lib/types/common';
import { LeadStatus } from '../types/leadEnums';

// Obtener leads con filtros y paginación
export async function getLeads(filters: LeadsFilters = {}): Promise<DataResponse<Lead>> {
  const supabase = await createClient();

  try {
    const {
      page = 1,
      limit = 10,
      status,
      source,
      assigned_to,
      search,
      minScore,
      maxScore,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = filters;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('leads_mkt').select(
      `
        *,
        assigned_user:workers(id, name, email)
      `,
      { count: 'exact' }
    );

    if (status) {
      query = query.eq('status', status);
    }

    if (source) {
      query = query.eq('source', source);
    }

    if (assigned_to) {
      query = query.eq('assigned_to', assigned_to);
    }

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,ruc.ilike.%${search}%,business_or_person_name.ilike.%${search}%`
      );
    }

    if (minScore !== undefined) {
      query = query.gte('score', minScore);
    }

    if (maxScore !== undefined) {
      query = query.lte('score', maxScore);
    }

    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        total: count || 0,
        pageIndex: page - 1,
        pageSize: limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (error) {
    throw error;
  }
}

// Obtener lead por ID
export async function getLeadById(id: string): Promise<Lead> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('leads_mkt')
      .select(
        `
        *,
        assigned_user:workers(id, name, email)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

// Obtener estadísticas de leads
export async function getLeadsStats() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('leads_mkt')
      .select('status, score, estimated_value');

    if (error) throw error;

    interface LeadStat {
      status: string;
      score: number;
      estimated_value: number | null;
    }

    interface LeadsStats {
      total: number;
      byStatus: Record<string, number>;
      avgScore: number;
      hotLeads: number;
      totalPipeline: number;
      dealsCount: number;
      conversionRate: number;
    }

    const typedData = (data || []) as LeadStat[];

    const byStatus = typedData.reduce(
      (acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const total = typedData.length;

    const totalPipeline = typedData.reduce((sum, lead) => sum + (lead.estimated_value ?? 0), 0);

    const dealsCount = byStatus['deals'] || 0;

    const avgScore = total > 0 ? typedData.reduce((sum, lead) => sum + lead.score, 0) / total : 0;

    const stats: LeadsStats = {
      total,
      byStatus,
      avgScore,
      hotLeads: typedData.filter((lead) => lead.score >= 75).length,
      totalPipeline,
      dealsCount,
      conversionRate: total > 0 ? (dealsCount / total) * 100 : 0,
    };

    return stats;
  } catch (error) {
    throw error;
  }
}

// Crear nuevo lead
export async function createLead(newLead: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'assigned_user'>) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.from('leads_mkt').insert(newLead).select().single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

// Actualizar lead
export async function updateLead(id: string, updates: Partial<Lead>) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('leads_mkt')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

// Actualizar status del lead
export async function updateLeadStatus(id: string, status: LeadStatus, assigned_to?: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('leads_mkt')
      .update({ status, assigned_to })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

// Asignar lead a usuario
export async function assignLead(id: string, userId: string | null) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('leads_mkt')
      .update({ assigned_to: userId })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

// Actualizar score del lead
export async function updateLeadScore(id: string, score: number) {
  const supabase = await createClient();

  try {
    if (score < 0 || score > 100) {
      throw new Error('Score debe estar entre 0 y 100');
    }

    const { data, error } = await supabase
      .from('leads_mkt')
      .update({ score })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

// Eliminar lead
export async function deleteLead(id: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from('leads_mkt').delete().eq('id', id);

    if (error) throw error;
  } catch (error) {
    throw error;
  }
}

// Actualizar múltiples campos a la vez
export async function bulkUpdateLeads(ids: string[], updates: Partial<Lead>) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.from('leads_mkt').update(updates).in('id', ids).select();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

// Importar leads masivamente desde Facebook
export async function bulkImportFacebookLeads(
  leads: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'assigned_user'>[]
) {
  const supabase = await createClient();

  try {
    // Verificar duplicados por email o facebook_lead_id
    const emails = leads.map((lead) => lead.email).filter(Boolean);
    const fbIds = leads.map((lead) => lead.facebook_lead_id).filter(Boolean);

    const { data: existingLeads } = await supabase
      .from('leads_mkt')
      .select('email, facebook_lead_id')
      .or(`email.in.(${emails.join(',')}),facebook_lead_id.in.(${fbIds.join(',')})`);

    const existingEmails = new Set(existingLeads?.map((l) => l.email) || []);
    const existingFbIds = new Set(existingLeads?.map((l) => l.facebook_lead_id) || []);

    // Filtrar leads que no existen
    const newLeads = leads.filter(
      (lead) =>
        !existingEmails.has(lead.email) &&
        (!lead.facebook_lead_id || !existingFbIds.has(lead.facebook_lead_id))
    );

    if (newLeads.length === 0) {
      return { imported: 0, duplicates: leads.length, total: leads.length };
    }

    const { data, error } = await supabase.from('leads_mkt').insert(newLeads).select();

    if (error) throw error;

    return {
      imported: data?.length || 0,
      duplicates: leads.length - newLeads.length,
      total: leads.length,
    };
  } catch (error) {
    throw error;
  }
}

// Función para bulk insert masivo de leads
export async function bulkInsertLeads(
  leads: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'assigned_user'>[],
  options?: {
    chunkSize?: number;
    skipDuplicates?: boolean;
    duplicateCheckFields?: string[];
  }
): Promise<{ inserted: number; duplicates: number; errors: any[] }> {
  const supabase = await createClient();

  try {
    const {
      chunkSize = 500,
      skipDuplicates = true,
      duplicateCheckFields = ['email', 'facebook_lead_id'],
    } = options || {};

    let totalInserted = 0;
    let duplicates = 0;
    const errors: any[] = [];

    // Verificar duplicados si está habilitado
    if (skipDuplicates && duplicateCheckFields.length > 0) {
      const checkConditions = duplicateCheckFields
        .map((field) => {
          const values = leads.map((lead: any) => lead[field]).filter(Boolean);
          if (values.length === 0) return null;
          return `${field}.in.(${values.map((v: any) => `'${v}'`).join(',')})`;
        })
        .filter(Boolean)
        .join(',');

      if (checkConditions) {
        const { data: existingRecords } = await supabase
          .from('leads_mkt')
          .select(duplicateCheckFields.join(','))
          .or(checkConditions);

        if (existingRecords && existingRecords.length > 0) {
          const duplicateSets = duplicateCheckFields.reduce(
            (acc, field) => {
              acc[field] = new Set(
                (existingRecords as any[]).map((record: any) => record[field]).filter(Boolean)
              );
              return acc;
            },
            {} as Record<string, Set<any>>
          );

          const uniqueLeads = leads.filter((lead: any) => {
            return !duplicateCheckFields.some((field) => {
              const value = lead[field];
              return value && duplicateSets[field].has(value);
            });
          });

          duplicates = leads.length - uniqueLeads.length;
          leads = uniqueLeads;
        }
      }
    }

    if (leads.length === 0) {
      return { inserted: 0, duplicates, errors };
    }

    // Procesar en chunks para evitar límites de memoria y timeouts
    for (let i = 0; i < leads.length; i += chunkSize) {
      const chunk = leads.slice(i, i + chunkSize);

      try {
        const { data: insertedData, error } = await supabase
          .from('leads_mkt')
          .insert(chunk)
          .select();

        if (error) {
          // Si es un error de llave duplicada, caemos a inserciones por fila para omitir duplicados
          const isDuplicateKeyError =
            (error as any)?.code === '23505' ||
            ((error as any)?.message || '').toLowerCase().includes('duplicate key');

          if (isDuplicateKeyError) {
            // intentar insertar fila por fila y omitir duplicados
            for (let j = 0; j < chunk.length; j++) {
              const row = chunk[j];
              try {
                const { data: singleData, error: singleError } = await supabase
                  .from('leads_mkt')
                  .insert(row)
                  .select();

                if (singleError) {
                  const dup =
                    (singleError as any)?.code === '23505' ||
                    ((singleError as any)?.message || '').toLowerCase().includes('duplicate key');
                  if (dup) {
                    duplicates += 1;
                  } else {
                    errors.push({
                      chunk: Math.floor(i / chunkSize) + 1,
                      rowIndex: j,
                      error: singleError,
                      data: row,
                    });
                  }
                } else {
                  totalInserted += (singleData as any[])?.length || 1;
                }
              } catch (singleCatch) {
                // Si falla la inserción por fila, registrar el error
                const msg = (singleCatch as any)?.message || singleCatch;
                if (typeof msg === 'string' && msg.toLowerCase().includes('duplicate key')) {
                  duplicates += 1;
                } else {
                  errors.push({
                    chunk: Math.floor(i / chunkSize) + 1,
                    rowIndex: j,
                    error: singleCatch,
                    data: row,
                  });
                }
              }
            }
          } else {
            errors.push({ chunk: Math.floor(i / chunkSize) + 1, error, data: chunk });
          }
        } else {
          totalInserted += (insertedData as any[])?.length || 0;
        }
      } catch (chunkError) {
        // En caso de excepción inesperada en insert por chunk, intentar insertar fila por fila
        for (let j = 0; j < chunk.length; j++) {
          const row = chunk[j];
          try {
            const { data: singleData, error: singleError } = await supabase
              .from('leads_mkt')
              .insert(row)
              .select();

            if (singleError) {
              const dup =
                (singleError as any)?.code === '23505' ||
                ((singleError as any)?.message || '').toLowerCase().includes('duplicate key');
              if (dup) {
                duplicates += 1;
              } else {
                errors.push({
                  chunk: Math.floor(i / chunkSize) + 1,
                  rowIndex: j,
                  error: singleError,
                  data: row,
                });
              }
            } else {
              totalInserted += (singleData as any[])?.length || 1;
            }
          } catch (singleCatch) {
            const msg = (singleCatch as any)?.message || singleCatch;
            if (typeof msg === 'string' && msg.toLowerCase().includes('duplicate key')) {
              duplicates += 1;
            } else {
              errors.push({
                chunk: Math.floor(i / chunkSize) + 1,
                rowIndex: j,
                error: singleCatch,
                data: row,
              });
            }
          }
        }
      }
    }

    return {
      inserted: totalInserted,
      duplicates,
      errors,
    };
  } catch (error) {
    throw error;
  }
}

//VERIFICAR QUE TIPO DE PRODUCTO YA SE CREO EN MAIN_PRODUCTS
export async function verifyProducts(leadId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('main_products')
      .select('products')
      .eq('mkt_lead_id', leadId);

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}
