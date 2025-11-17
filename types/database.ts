export type LeadStatusMkt =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';
export type LeadSourceMkt =
  | 'website'
  | 'social_media'
  | 'referral'
  | 'cold_call'
  | 'email_campaign'
  | 'event'
  | 'other';
export type ContactMethodMkt = 'email' | 'phone' | 'whatsapp' | 'meeting';
export type CampaignStatusMkt = 'draft' | 'active' | 'paused' | 'completed';
export type NotificationTypeMkt =
  | 'lead_assigned'
  | 'follow_up_due'
  | 'campaign_completed'
  | 'system_alert';

export interface Database {
  public: {
    Tables: {
      companies_mkt: {
        Row: {
          id: string;
          name: string;
          industry: string | null;
          size: string | null;
          website: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          industry?: string | null;
          size?: string | null;
          website?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          industry?: string | null;
          size?: string | null;
          website?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      leads_mkt: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          whatsapp: string | null;
          company_id: string | null;
          job_title: string | null;
          status: LeadStatusMkt;
          source: LeadSourceMkt | null;
          score: number;
          estimated_value: number | null;
          assigned_to: string | null;
          last_contact_date: string | null;
          next_follow_up: string | null;
          notes: string | null;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          whatsapp?: string | null;
          company_id?: string | null;
          job_title?: string | null;
          status?: LeadStatusMkt;
          source?: LeadSourceMkt | null;
          score?: number;
          estimated_value?: number | null;
          assigned_to?: string | null;
          last_contact_date?: string | null;
          next_follow_up?: string | null;
          notes?: string | null;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          whatsapp?: string | null;
          company_id?: string | null;
          job_title?: string | null;
          status?: LeadStatusMkt;
          source?: LeadSourceMkt | null;
          score?: number;
          estimated_value?: number | null;
          assigned_to?: string | null;
          last_contact_date?: string | null;
          next_follow_up?: string | null;
          notes?: string | null;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      activities_mkt: {
        Row: {
          id: string;
          lead_id: string;
          type: ContactMethodMkt;
          description: string;
          scheduled_at: string | null;
          completed_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          type: ContactMethodMkt;
          description: string;
          scheduled_at?: string | null;
          completed_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          type?: ContactMethodMkt;
          description?: string;
          scheduled_at?: string | null;
          completed_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      email_campaigns_mkt: {
        Row: {
          id: string;
          name: string;
          subject: string;
          content: string;
          status: CampaignStatusMkt;
          created_by: string | null;
          sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          subject: string;
          content: string;
          status?: CampaignStatusMkt;
          created_by?: string | null;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          subject?: string;
          content?: string;
          status?: CampaignStatusMkt;
          created_by?: string | null;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      campaign_recipients_mkt: {
        Row: {
          id: string;
          campaign_id: string;
          lead_id: string;
          email: string;
          sent_at: string | null;
          opened_at: string | null;
          clicked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          lead_id: string;
          email: string;
          sent_at?: string | null;
          opened_at?: string | null;
          clicked_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          lead_id?: string;
          email?: string;
          sent_at?: string | null;
          opened_at?: string | null;
          clicked_at?: string | null;
          created_at?: string;
        };
      };
      whatsapp_messages_mkt: {
        Row: {
          id: string;
          lead_id: string;
          message: string;
          direction: string;
          status: string;
          sent_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          message: string;
          direction?: string;
          status?: string;
          sent_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          message?: string;
          direction?: string;
          status?: string;
          sent_at?: string;
          created_at?: string;
        };
      };
      notifications_mkt: {
        Row: {
          id: string;
          title: string;
          message: string;
          type: NotificationTypeMkt;
          read: boolean;
          action_url: string | null;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          message: string;
          type: NotificationTypeMkt;
          read?: boolean;
          action_url?: string | null;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          message?: string;
          type?: NotificationTypeMkt;
          read?: boolean;
          action_url?: string | null;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles_mkt: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Tipos para Partnerships
export interface Partnerships {
  id: string;
  name: string;
  document: string;
  email: string;
  mobile_number: string;
  business_principal_id: string;
  economic_activity: string;
  address: string;
  partnership_businesses: PartnershipBusiness[];
}

export interface PartnershipBusiness {
  business_id: string;
  participation_percent: number | string;
  businesses?: {
    id: string;
    legal_name: string;
    document?: string;
  };
}
