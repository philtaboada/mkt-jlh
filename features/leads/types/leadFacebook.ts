// Tipos y funciones para Facebook Leads
import { LeadEntityTypeEnum } from './leadEnums';
import { Lead } from './leads';
import { getPlatformLabel } from './platformLabels';

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
