'use server';
import { createClient } from '@/lib/supabase/server';

export async function findOrCreateByWhatsApp(waId: string, name: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('mkt_contacts')
    .select('*')
    .eq('wa_id', waId)
    .single();

  if (existing) {
    return existing;
  }

  const { data: newContact, error } = await supabase
    .from('mkt_contacts')
    .insert({
      wa_id: waId,
      name,
      phone: waId,
      source: 'whatsapp',
      status: 'lead',
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return newContact;
}
export async function getContacts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_contacts')
    .select('*')
    .order('last_interaction', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function updateLastInteraction(id: string) {
  const supabase = await createClient();
  await supabase.from('mkt_contacts').update({ last_interaction: new Date() }).eq('id', id);
}
