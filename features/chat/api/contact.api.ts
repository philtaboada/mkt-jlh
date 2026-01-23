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

export async function findOrCreateByFacebook(fbId: string, name?: string): Promise<Contact> {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('mkt_contacts')
    .select('*')
    .eq('fb_id', fbId)
    .single();

  if (existing) {
    return existing;
  }

  const { data: newContact, error } = await supabase
    .from('mkt_contacts')
    .insert({
      fb_id: fbId,
      name: name || 'Contacto Facebook',
      source: 'facebook',
      status: 'lead',
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return newContact;
}

export async function findOrCreateByInstagram(igId: string, name?: string): Promise<Contact> {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('mkt_contacts')
    .select('*')
    .eq('ig_id', igId)
    .single();

  if (existing) {
    return existing;
  }

  const { data: newContact, error } = await supabase
    .from('mkt_contacts')
    .insert({
      ig_id: igId,
      name: name || 'Contacto Instagram',
      source: 'instagram',
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
    .order('created_at', { ascending: false })
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

export async function getContactByEmail(email: string): Promise<Contact | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_contacts')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

export async function findOrCreateByEmail(
  email: string,
  name?: string,
  phone?: string,
  source = 'website_widget'
): Promise<Contact> {
  const existing = await getContactByEmail(email);
  if (existing) return existing;

  return createContact({
    email,
    name: name || 'Visitante',
    phone,
    source,
    status: 'lead',
  });
}

export async function createContact(contact: Partial<Contact>): Promise<Contact> {
  const supabase = await createClient();

  // Build object with only non-empty values
  const insertData: any = {
    name: contact.name,
    status: contact.status || 'lead',
    custom_fields: contact.custom_fields || {},
  };

  // Only include optional fields if they have values
  if (contact.email) insertData.email = contact.email;
  if (contact.phone) insertData.phone = contact.phone;
  if (contact.wa_id) insertData.wa_id = contact.wa_id;
  if (contact.fb_id) insertData.fb_id = contact.fb_id;
  if (contact.ig_id) insertData.ig_id = contact.ig_id;
  if (contact.avatar_url) insertData.avatar_url = contact.avatar_url;
  if (contact.source) insertData.source = contact.source;

  const { data, error } = await supabase
    .from('mkt_contacts')
    .insert(insertData)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
  const supabase = await createClient();

  // Build update object, removing empty string values
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  // Only include fields that have non-empty values
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      updateData[key] = value;
    }
  });

  const { data, error } = await supabase
    .from('mkt_contacts')
    .update(updateData)
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
