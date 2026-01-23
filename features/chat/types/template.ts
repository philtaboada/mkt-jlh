export type TemplateProvider = 'whatsapp' | 'facebook' | 'instagram' | 'telegram';

export type TemplateStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'PAUSED';

export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';

export interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  text?: string;
  example?: {
    header_text?: string[];
    body_text?: string[][];
  };
  buttons?: Array<{
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
    text: string;
    url?: string;
    phone_number?: string;
  }>;
}

export interface MessageTemplate {
  id: string;
  channel_id: string;
  provider: TemplateProvider;
  name: string;
  language: string;
  category: TemplateCategory;
  status: TemplateStatus;
  components: TemplateComponent[];
  provider_template_id?: string;
  provider_data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  last_synced_at?: string;
}

export interface CreateTemplateInput {
  channel_id: string;
  provider: TemplateProvider;
  name: string;
  language: string;
  category: TemplateCategory;
  status: TemplateStatus;
  components: TemplateComponent[];
  provider_template_id?: string;
  provider_data?: Record<string, unknown>;
}

export interface UpdateTemplateInput {
  name?: string;
  status?: TemplateStatus;
  components?: TemplateComponent[];
  provider_template_id?: string;
  provider_data?: Record<string, unknown>;
  last_synced_at?: string;
}
