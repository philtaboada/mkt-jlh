'use server';
import { createClient } from '@/lib/supabase/server';
import { Prospect } from '@/features/prospects/types/prospects';
import { UpdateProspectWorkerData } from '@/features/prospects/types/updateWorker';

export interface GetProspectsParams {
  page_index?: number;
  page_size?: number;
  workers?: string[];
  statuscode?: number[];
  typeproduct?: string[];
  search?: string;
  start_date?: string;
  end_date?: string;
}

export interface GetProspectsResult {
  data: Prospect[];
  pagination: {
    pageIndex: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export async function getProspects(params: GetProspectsParams): Promise<GetProspectsResult> {
  const supabase = await createClient();
  try {
    params.page_index = (params?.page_index ?? 1) - 1;
    const { data: result, error } = await supabase.rpc('mkt_prospect', { params });
    if (error) throw error;
    const pageIndex = params.page_index ?? 0;
    const pageSize = params.page_size ?? 10;
    return {
      data: result.data || [],
      pagination: {
        pageIndex,
        pageSize,
        total: result.total ?? 0,
        totalPages: Math.ceil((result.total ?? 0) / pageSize),
      },
    };
  } catch (error) {
    console.error('Error fetching prospects:', error);
    throw error;
  }
}

export async function createProspectIso(payload: any) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.rpc('mkt_isos_prospect_new', {
      data: payload,
    });
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function createProspectTrust(payload: any) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.rpc('mkt_trust_prospect_new', {
      data: payload,
    });
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function createProspectInsurance(payload: any) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.rpc('mkt_insurances_prospect_new', {
      data: payload,
    });
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function createProspectGuaranteeLetter(payload: any) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.rpc('mkt_guarante_letters_prospect_new', {
      data: payload,
    });
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateProspectWorker(prospectId: string, workerId: string) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('mkt_prospects')
      .update({ worker_id: workerId })
      .eq('id', prospectId);
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateProductAndEntityFromJson(payload: UpdateProspectWorkerData) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.rpc('update_product_and_entity_from_json', {
      p_payload: payload,
    });
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error updating product and entity:', error);
    throw error;
  }
}
