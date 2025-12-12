import { LeadEntityType, LeadSource, LeadStatus } from './leadEnums';

export enum Platform {
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  WHATSAPP = 'whatsapp',
  LINKEDIN = 'linkedin',
  TWITTER = 'twitter',
}

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  status: LeadStatus;
  source: LeadSource | null;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  whatsapp: string | null;
  job_title: string | null;
  score: number;
  estimated_value: number | null;
  last_contact_date: string | null;
  next_follow_up: string | null;
  tags: string[] | null;
  business_or_partnership_id: string | null;
  type_entity: LeadEntityType;
  business_or_person_name: string | null;
  ruc: string | null;
  province: string | null;
  facebook_lead_id: string | null;
  platform: string | null;
  assigned_user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LeadsFilters {
  page?: number;
  limit?: number;
  status?: LeadStatus;
  source?: LeadSource;
  assigned_to?: string;
  search?: string;
  minScore?: number;
  maxScore?: number;
}
