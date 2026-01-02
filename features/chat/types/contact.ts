export type Contact = {
  id: string;
  wa_id?: string;
  fb_id?: string;
  ig_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  custom_fields?: Record<string, any>;
  status?: 'lead' | 'open' | 'customer' | 'closed';
  source?: string;
  assigned_to?: string;
  last_interaction?: Date;
  created_at?: Date;
  updated_at?: Date;
  visitor_id?: string;
};
