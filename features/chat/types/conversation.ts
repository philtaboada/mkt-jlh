export type Contact = {
  id: string;
  name?: string;
  wa_id?: string;
  last_interaction?: Date | null;
  avatar_url?: string | null;
};

export type Conversation = {
  id: string;
  contact_id: string;
  channel: 'whatsapp' | 'facebook' | 'instagram';
  status?: 'open' | 'closed';
  assigned_to?: string | null;
  last_message_at?: Date | null;
  created_at?: Date;
  updated_at?: Date;
  mkt_contacts?: Contact;
};
