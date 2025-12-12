// Tipos y funciones para Facebook Leads
import { LeadEntityTypeEnum, LeadEntityType } from './leadEnums';
import { Lead } from './leads';
import { getPlatformLabel } from './platformLabels';

export interface FacebookLeadData {
  id: string;
  created_time: string | number;
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
  // Campos del primer formato
  '¿cuenta_con_una_licitación_pública_o_privada_aprobada?': string;
  '¿ganó_el_proyecto_o_servicio_como_empresa_o_consorcio?': string;
  '¿por_cuál_medio_prefiere_que_nos_comuniquemos_con_usted?': string;
  ruc?: string;
  nombre_y_apellidos?: string;
  phone_number?: string;
  correo_electrónico?: string;
  provincia?: string;
  // Campos del segundo formato
  'solo_atendemos_fideicomisos_públicos,_¿deseas_recibir_información?': string;
  '¿cuenta_con_un_proceso_de_fideicomiso_ganado?': string;
  '¿qué_medio_prefiere_para_ponernos_en_contacto_con_usted?_': string;
  déjenos_su_ruc_de_empresa?: number;
  full_name?: string;
  phone?: string;
  email?: string;
  city?: string;
  lead_status: string;
}

export function mapFacebookLeadToLead(
  fbData: FacebookLeadData
): Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'assigned_user'> {
  // Determinar el formato basado en campos presentes
  const isFirstFormat = !!fbData.nombre_y_apellidos;
  const isSecondFormat = !!fbData.full_name;

  // Nombre completo
  const fullName = isFirstFormat ? fbData.nombre_y_apellidos! : fbData.full_name!;
  const nameParts = fullName.trim().split(' ');
  const first_name = nameParts[0] || '';
  const last_name = nameParts.slice(1).join(' ') || '';

  // Número de teléfono
  const phoneRaw = isFirstFormat ? fbData.phone_number! : fbData.phone!;
  const phone = phoneRaw.replace('p:+', '').replace('+', '');

  // Email
  const email = isFirstFormat ? fbData['correo_electrónico']! : fbData.email!;

  // Provincia/Ciudad
  const province = isFirstFormat ? fbData.provincia! : fbData.city!;

  // RUC
  const ruc = isFirstFormat ? fbData.ruc! : fbData['déjenos_su_ruc_de_empresa']?.toString()!;

  // Determinar tipo de entidad
  let type_entity: LeadEntityType = LeadEntityTypeEnum.BUSINESS;
  if (isFirstFormat) {
    const tipoRespuesta = fbData['¿ganó_el_proyecto_o_servicio_como_empresa_o_consorcio?'];
    type_entity = tipoRespuesta.toLowerCase().includes('consorcio')
      ? LeadEntityTypeEnum.PARTNERSHIPS
      : LeadEntityTypeEnum.BUSINESS;
  } else if (isSecondFormat) {
    // Para fideicomisos, asumir BUSINESS
    type_entity = LeadEntityTypeEnum.BUSINESS;
  }

  // Crear notas organizadas con las respuestas del formulario
  let notes = '';
  if (isFirstFormat) {
    notes = `
Preguntas del formulario:
• ¿Cuenta con una licitación pública o privada aprobada?: ${fbData['¿cuenta_con_una_licitación_pública_o_privada_aprobada?']}
• ¿Ganó el proyecto o servicio como empresa o consorcio?: ${fbData['¿ganó_el_proyecto_o_servicio_como_empresa_o_consorcio?']}
• ¿Por cuál medio prefiere que nos comuniquemos?: ${fbData['¿por_cuál_medio_prefiere_que_nos_comuniquemos_con_usted?']}

Información adicional:
• Nombre y Apellidos: ${fullName}
• RUC : ${ruc}
• WhatsApp: ${phone}
• Provincia: ${province}
• Plataforma: ${getPlatformLabel(fbData.platform)}
• Campaña: ${fbData.campaign_name || 'N/A'}
• Formulario: ${fbData.form_name || 'N/A'}
    `.trim();
  } else if (isSecondFormat) {
    notes = `
Preguntas del formulario:
• Solo atendemos fideicomisos públicos, ¿deseas recibir información?: ${fbData['solo_atendemos_fideicomisos_públicos,_¿deseas_recibir_información?']}
• ¿Cuenta con un proceso de fideicomiso ganado?: ${fbData['¿cuenta_con_un_proceso_de_fideicomiso_ganado?']}
• ¿Qué medio prefiere para ponernos en contacto?: ${fbData['¿qué_medio_prefiere_para_ponernos_en_contacto_con_usted?_']}

Información adicional:
• Nombre y Apellidos: ${fullName}
• RUC : ${ruc}
• WhatsApp: ${phone}
• Plataforma: ${getPlatformLabel(fbData.platform)}
• Campaña: ${fbData.campaign_name || 'N/A'}
• Formulario: ${fbData.form_name || 'N/A'}
    `.trim();
  }

  return {
    first_name,
    last_name,
    email,
    phone,
    whatsapp: phone,
    type_entity,
    business_or_person_name: null,
    ruc,
    province,
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
