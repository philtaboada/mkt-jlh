import { LeadEntityType, LeadProductType } from "@/features/leads/types/leadEnums";


export interface Prospect {
  id: string;
  created_at: string;
  worker_id: string | null;
  updated_at: string | null;
  business_or_person_name: string | null;
  business_or_partnership_id: string | null;
  management_date: string | null;
  referral_channel: string | null;
  type_entity: LeadEntityType;
  products: ProspectProducts[] | null;
  status_code: number | null;
  effective_start_date: string | null;
  mkt_lead_id: string | null;
  worker:{
    id: string;
    name: string;
  }
}

export interface ProspectProducts {
  id: string;
  type: LeadProductType;
  status_code: number;
  insurance_type?: string;
  date_passed: string | null;
  update_date_passed: string | null;
}

export interface ProspectFilters {
  search: string;
  status: string;
  referralChannel: string;
  typeEntity: string;
  pageIndex: number;
  pageSize: number;
}