export type Contact = {
  id: string;
  name: string;
  wa_id: string;
  last_interaction: string | null;
  avatar_url?: string | null;
};

export type Conversation = {
  id: string;
  contact_id: string;
  channel: string;
  status: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  mkt_contacts: Contact;
};
