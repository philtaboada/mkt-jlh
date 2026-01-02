export type Contact = {
  id: string;
  name?: string;
  wa_id?: string;
  last_interaction?: Date | null;
  avatar_url?: string | null;
  source?: string;
};

export type Conversation = {
  id: string;
  contact_id?: string | null;
  channel_id?: string | null;
  channel: 'whatsapp' | 'facebook' | 'instagram' | 'website';
  status?: 'open' | 'closed';
  assigned_to?: string | null;
  last_message_at?: Date | null;
  last_message_body?: string | null;
  unread_count?: number;
  is_starred?: boolean;
  created_at?: Date;
  updated_at?: Date;
  metadata?: {
    visitor_id?: string;
    visitor_info?: Record<string, unknown>;
    user_agent?: string;
    origin?: string;
  };
  mkt_contacts?: Contact;
};
