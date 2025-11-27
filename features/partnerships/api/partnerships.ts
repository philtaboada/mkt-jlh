'use server';
import { createClient } from '@/lib/supabase/server';
import type { PartnershipInput } from '@/features/partnerships/schemas/partnershipSchema';
import { randomUUID } from 'crypto';
import { Partnerships } from '@/types/database';
import { DataResponse, Filters } from '@/lib/types/common';

export async function getPartnerships(params: Filters = {}): Promise<DataResponse<Partnerships>> {
  const supabase = await createClient();
  const { pageIndex = 0, pageSize = 10, search = '' } = params;
  try {
    const start = pageIndex * pageSize;
    const end = start + pageSize - 1;

    let query = supabase
      .from('partnerships')
      .select(
        'id, name, document, email, mobile_number, business_principal_id,economic_activity, address,  partnership_businesses(business_id, participation_percent, businesses(id, legal_name, document))',
        { count: 'exact' }
      )
      .order('updated_at', { ascending: false })
      .range(start, end);

    if (search) {
      query = query.or(`name.ilike.%${search}%,document.ilike.%${search}%`);
    }

    query = query.eq('is_marketing', true);

    const { data, error, count } = await query;

    if (error) throw error;
    const flattenedData: Partnerships[] = (data ?? []).map((partnership: any) => ({
      id: partnership.id,
      name: partnership.name,
      document: partnership.document,
      email: partnership.email,
      mobile_number: partnership.mobile_number,
      business_principal_id: partnership.business_principal_id,
      economic_activity: partnership.economic_activity,
      address: partnership.address,
      partnership_businesses: partnership.partnership_businesses,
    }));

    return {
      data: flattenedData,
      pagination: {
        total: count ?? 0,
        pageIndex,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      },
    };
  } catch (error) {
    throw error;
  }
}

export async function createPartnership(data: PartnershipInput) {
  const supabase = await createClient();
  data.is_marketing = true;
  try {
    const { data: result, error } = await supabase.rpc('create_partnership', {
      data: {
        ...data,
        id: randomUUID(),
      },
    });

    if (error) throw error;
    return result;
  } catch (error) {
    throw error;
  }
}

export async function updatePartnership(id: string, data: Partial<PartnershipInput>) {
  const supabase = await createClient();
  try {
    const { error, data: result } = await supabase.rpc('update_partnership', {
      data: { id, ...data },
    });

    if (error) {
      throw error;
    }

    return {
      message: 'Consorcio actualizado correctamente',
      data: result,
    };
  } catch (error) {
    throw error;
  }
}

export async function searchPartnerships(term: string) {
  const supabase = await createClient();
  try {
    const params = { search: term, limit: 15 };
    const { data, error } = await supabase.rpc('search_partnerships', { params });
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function checkPartnershipDocumentExists(document: string): Promise<boolean> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('partnerships')
      .select('id')
      .eq('document', document)
      .limit(1);

    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
    throw error;
  }
}

export async function getPartnershipByDocument(
  document: string
): Promise<{ document: string; legal_name: string; worker_id: null } | null> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('partnerships')
      .select('document, name')
      .eq('document', document)
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) return null;
    const row = data[0] as { document: string; name: string };
    return {
      document: row.document,
      legal_name: row.name,
      worker_id: null,
    };
  } catch (error) {
    throw error;
  }
}
