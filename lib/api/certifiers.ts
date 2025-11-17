'use server';
import { createClient } from '../supabase/server';

export async function getCertifiers() {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.from('certifiers').select('*');
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}
