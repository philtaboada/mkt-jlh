export interface DashboardCommercial {
  end_date: Date;
  comercials: Comercial[];
  start_date: Date;
  ranking_global: RankingGlobal[];
  product_for_type: ProductForType[];
}

export interface Comercial {
  name: string;
  worker_id: string;
  repet_calls: number;
  total_leads: TotalLead[];
  deals_closed: number;
  leads_closed: number;
  assigned_leads: number;
  contacted_leads: number;
  not_managed_leads: number;
  conversion_to_deals: number;
  conversion_to_closed: number;
  average_response_time_hours: number;
}

export interface TotalLead {
  product: string;
  quantity: number;
}

export interface ProductForType {
  deals: number;
  closed: number;
  product: string;
  assigned: number;
  contacted: number;
  not_managed: number;
}

export interface RankingGlobal {
  name: string;
  worker_id: string;
  total_deals: number;
  top_product_type: string;
}
