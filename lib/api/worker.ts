'use server';

import { createClient } from '../supabase/server';
export interface Worker {
  id: string;
  name: string;
  email: string;
}

export const getWorkers = async (): Promise<Worker[]> => {
  try {
    const commercialId = '5595245c-0a3f-46b0-98a4-17a729241be2';
    const adminId = '92b25d0c-291c-4ad5-9448-85ec62d76d50';
    const commercialAdminId = '0a303a57-9400-4899-95de-4e907b889b0c';
    const legalId = '4cb8dfef-d8cb-4ca4-993e-1823f67088c1';
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('workers')
      .select('id, name, email')
      .in('role_area_id', [commercialId, adminId, commercialAdminId, legalId]);
    if (error) throw new Error(error.message);
    console.log('Workers fetched:', data.length);
    return data;
  } catch (error) {
    throw new Error('Error fetching workers');
  }
};
