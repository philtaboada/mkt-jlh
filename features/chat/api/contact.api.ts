'use server';
import { createClient } from '@/lib/supabase/server';
import { Contact } from '../types/contact';

export async function findOrCreateByWhatsApp(waId: string, name: string): Promise<Contact> {
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

export async function getContacts(): Promise<Contact[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_contacts')
    .select('*')
    .order('last_interaction', { ascending: false, nullsFirst: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getContactById(id: string): Promise<Contact | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('mkt_contacts').select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

export async function createContact(contact: Partial<Contact>): Promise<Contact> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_contacts')
    .insert({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      wa_id: contact.wa_id,
      fb_id: contact.fb_id,
      ig_id: contact.ig_id,
      avatar_url: contact.avatar_url,
      status: contact.status || 'lead',
      source: contact.source,
      custom_fields: contact.custom_fields || {},
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_contacts')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteContact(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('mkt_contacts').delete().eq('id', id);

  if (error) {
    throw error;
  }
}

export async function updateLastInteraction(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from('mkt_contacts').update({ last_interaction: new Date() }).eq('id', id);
}

// Contact Tags functions
export async function getContactTags(contactId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_contact_tags')
    .select(
      `
      *,
      mkt_tags (
        id,
        name,
        color
      )
    `
    )
    .eq('contact_id', contactId);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function addTagToContact(contactId: string, tagId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_contact_tags')
    .insert({
      contact_id: contactId,
      tag_id: tagId,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function removeTagFromContact(contactId: string, tagId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('mkt_contact_tags')
    .delete()
    .eq('contact_id', contactId)
    .eq('tag_id', tagId);

  if (error) {
    throw error;
  }
}

// Contact Notes functions
export async function getContactNotes(contactId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_contact_notes')
    .select('*')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createContactNote(contactId: string, note: string, authorId?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_contact_notes')
    .insert({
      contact_id: contactId,
      note,
      author_id: authorId,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateContactNote(id: string, updates: Partial<any>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_contact_notes')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteContactNote(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('mkt_contact_notes').delete().eq('id', id);

  if (error) {
    throw error;
  }
}
