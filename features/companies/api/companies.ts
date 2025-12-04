'use server';

interface Filters {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
}

import { createClient } from '@/lib/supabase/server';
import { DataResponse } from '@/lib/types/common';
import { randomUUID } from 'crypto';
import { Company } from '../components/CompaniesTable';
import { CompanyInput } from '../schemas/companySchema';

export async function getCompanies(params: Filters = {}): Promise<DataResponse<Company>> {
  const supabase = await createClient();
  const { pageIndex = 0, pageSize = 20, search = '' } = params;

  try {
    let query = supabase
      .from('businesses')
      .select(
        'id, legal_name, document,document_type,classification_business, mobile_number, email, worker_id, workers(id, name), address_business(*)',
        {
          count: 'exact',
        }
      );

    if (search) {
      query = query.or(`legal_name.ilike.%${search}%,document.ilike.%${search}%`);
    }

    query = query.eq('is_marketing', true);

    query = query
      .range(pageIndex * pageSize, pageIndex * pageSize + pageSize - 1)
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    const mappedData = (data ?? []).map((business: any) => ({
      ...business,
      address: business.address_business?.[0] || null,
    }));
    return {
      data: mappedData,
      pagination: {
        pageIndex,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    };
  } catch (error) {
    throw error;
  }
}

export async function createCompany(data: CompanyInput) {
  const supabase = await createClient();
  data.is_marketing = true;
  try {
    const { data: result, error } = await supabase.rpc('create_business', {
      data: { ...data, id: randomUUID() },
    });

    if (error) throw error;
    return result;
  } catch (error: any) {
    // Handle duplicate document error
    if (error?.code === '23505' && error?.message?.includes('businesses_document_key')) {
      throw new Error('El RUC ya está registrado en el sistema. Por favor, use un RUC diferente.');
    }
    throw error;
  }
}

export async function updateCompany(id: string, data: Partial<CompanyInput>) {
  const supabase = await createClient();
  try {
    const { data: result, error } = await supabase.rpc('update_business', {
      data: { id, ...data },
    });

    if (error) throw error;
    return result;
  } catch (error: any) {
    // Handle duplicate document error
    if (error?.code === '23505' && error?.message?.includes('businesses_document_key')) {
      throw new Error('El RUC ya está registrado en el sistema. Por favor, use un RUC diferente.');
    }
    throw error;
  }
}

export async function deleteCompany(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('businesses').delete().eq('id', id);

  if (error) throw error;
}

export async function getCompanyById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('businesses').select('*').eq('id', id).single();

  if (error) throw error;
  return data;
}

export async function searchCompanies(search: string) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.rpc('search_businesses', { params: { search } });
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function checkDocumentExists(
  document: string,
  documentType: string
): Promise<boolean> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('id')
      .eq('document', document)
      .limit(1);

    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
    throw error;
  }
}

export async function getCompanyByDocument(
  document: string
): Promise<{ document: string; legal_name: string; worker_id: string | null; id: string } | null> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('id, document, legal_name, worker_id')
      .eq('document', document)
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    throw error;
  }
}
