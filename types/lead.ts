// Keep these aligned with the database enum values (leads_mkt)
import { LeadEntityType, LeadEntityTypeEnum, LeadProductType } from '@/lib/enums/leadEnums';
import { getPlatformLabel } from '@/lib/constants/leadConstants';
export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'deals'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';

export type LeadSource =
  | 'website'
  | 'social_media'
  | 'referral'
  | 'cold_call'
  | 'email_campaign'
  | 'event'
  | 'other';

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
  sortBy?: 'created_at' | 'score' | 'updated_at' | 'first_name';
  sortOrder?: 'asc' | 'desc';
}

// Tipo para datos crudos de Facebook Leads
export interface FacebookLeadData {
  id: string;
  created_time: string;
  ad_id?: string;
  ad_name?: string;
  adset_id?: string;
  adset_name?: string;
  campaign_id?: string;
  campaign_name?: string;
  form_id?: string;
  form_name?: string;
  is_organic: string;
  platform: string;
  '¿cuenta_con_una_licitación_pública_o_privada_aprobada?': string;
  '¿ganó_el_proyecto_o_servicio_como_empresa_o_consorcio?': string;
  '¿por_cuál_medio_prefiere_que_nos_comuniquemos_con_usted?': string;
  ruc: string;
  nombre_y_apellidos: string;
  phone_number: string;
  correo_electrónico: string;
  provincia: string;
  lead_status: string;
}

// Función para mapear datos de Facebook a Lead
export function mapFacebookLeadToLead(
  fbData: FacebookLeadData
): Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'assigned_user'> {
  // Separar nombre y apellido
  const nameParts = fbData.nombre_y_apellidos.trim().split(' ');
  const first_name = nameParts[0] || '';
  const last_name = nameParts.slice(1).join(' ') || '';

  // Limpiar número de teléfono
  const phone = fbData.phone_number.replace('p:+', '').replace('+', '');

  // Determinar tipo de entidad basado en la respuesta
  const tipoRespuesta = fbData['¿ganó_el_proyecto_o_servicio_como_empresa_o_consorcio?'];
  const type_entity = tipoRespuesta.toLowerCase().includes('consorcio')
    ? LeadEntityTypeEnum.PARTNERSHIPS
    : LeadEntityTypeEnum.BUSINESS;

  // Crear notas organizadas con las respuestas del formulario
  const notes = `
Preguntas del formulario:
• ¿Cuenta con una licitación pública o privada aprobada?: ${fbData['¿cuenta_con_una_licitación_pública_o_privada_aprobada?']}
• ¿Ganó el proyecto o servicio como empresa o consorcio?: ${fbData['¿ganó_el_proyecto_o_servicio_como_empresa_o_consorcio?']}
• ¿Por cuál medio prefiere que nos comuniquemos?: ${fbData['¿por_cuál_medio_prefiere_que_nos_comuniquemos_con_usted?']}

Información adicional:
• Provincia: ${fbData.provincia}
• Plataforma: ${getPlatformLabel(fbData.platform)}
• Campaña: ${fbData.campaign_name || 'N/A'}
• Formulario: ${fbData.form_name || 'N/A'}
  `.trim();

  return {
    first_name,
    last_name,
    email: fbData['correo_electrónico'],
    phone,
    whatsapp: phone,
    type_entity,
    business_or_person_name: null,
    ruc: fbData.ruc,
    province: fbData.provincia,
    facebook_lead_id: fbData.id,
    platform: fbData.platform,
    status: 'new',
    source: 'social_media',
    score: 50,
    notes,
    business_or_partnership_id: null,
    assigned_to: null,
    job_title: null,
    estimated_value: null,
    last_contact_date: null,
    next_follow_up: null,
    tags: null,
  };
}
