// Tipos y funciones para Facebook Leads y Excel genérico
import { LeadEntityTypeEnum, LeadEntityType, LeadStatus, LeadSource } from './leadEnums';
import { Lead } from './leads';
import { getPlatformLabel } from './platformLabels';

// ============= MAPEO DE EXCEL GENÉRICO =============

/**
 * Interfaz para datos de Excel con columnas en español
 */
export interface GenericExcelLeadData {
  'NOMBRE COMPLETO'?: string;
  'CELULAR'?: string;
  'CORREO ELECTRÓNICO'?: string;
  'PRODUCTO'?: string;
  'LUGAR'?: string;
  'RESPONSABLE'?: string;
  'ESTADO'?: string;
  'RED SOCIAL'?: string;
  'MARCA'?: string;
  'ATENCIÓN'?: string;
  'RUC'?: string;
  [key: string]: string | number | undefined;
}

/**
 * Mapea el estado del Excel al enum de LeadStatus
 */
function mapExcelStatusToLeadStatus(status: string | undefined): string {
  if (!status) return 'new';
  
  const statusLower = status.toLowerCase().trim();
  const statusMap: Record<string, string> = {
    'nuevo': 'new',
    'new': 'new',
    'contactado': 'contacted',
    'contacted': 'contacted',
    'calificado': 'qualified',
    'qualified': 'qualified',
    'propuesta': 'proposal',
    'proposal': 'proposal',
    'negociación': 'negotiation',
    'negociacion': 'negotiation',
    'negotiation': 'negotiation',
    'deals': 'deals',
    'deal': 'deals',
    'trato': 'deals',
    'ganado': 'closed_won',
    'closed_won': 'closed_won',
    'cerrado ganado': 'closed_won',
    'perdido': 'closed_lost',
    'closed_lost': 'closed_lost',
    'cerrado perdido': 'closed_lost',
  };
  
  return statusMap[statusLower] || 'new';
}

/**
 * Mapea la red social del Excel al source y platform
 */
function mapExcelSocialToSourceAndPlatform(social: string | undefined): { source: string; platform: string | null } {
  if (!social) return { source: 'other', platform: null };
  
  const socialLower = social.toLowerCase().trim();
  
  if (socialLower.includes('facebook') || socialLower.includes('fb')) {
    return { source: 'social_media', platform: 'facebook' };
  }
  if (socialLower.includes('instagram') || socialLower.includes('ig')) {
    return { source: 'social_media', platform: 'instagram' };
  }
  if (socialLower.includes('whatsapp') || socialLower.includes('wa')) {
    return { source: 'social_media', platform: 'whatsapp' };
  }
  if (socialLower.includes('linkedin')) {
    return { source: 'social_media', platform: 'linkedin' };
  }
  if (socialLower.includes('twitter') || socialLower.includes('x')) {
    return { source: 'social_media', platform: 'twitter' };
  }
  if (socialLower.includes('web') || socialLower.includes('sitio')) {
    return { source: 'website', platform: null };
  }
  if (socialLower.includes('referido') || socialLower.includes('referral')) {
    return { source: 'referral', platform: null };
  }
  if (socialLower.includes('llamada') || socialLower.includes('call')) {
    return { source: 'cold_call', platform: null };
  }
  if (socialLower.includes('email') || socialLower.includes('correo')) {
    return { source: 'email_campaign', platform: null };
  }
  if (socialLower.includes('evento') || socialLower.includes('event')) {
    return { source: 'event', platform: null };
  }
  
  return { source: 'social_media', platform: social.trim() };
}

/**
 * Limpia y formatea un número de teléfono
 */
function cleanPhoneNumber(phone: string | number | undefined): string {
  if (!phone) return '';
  const phoneStr = String(phone).trim();
  // Remover caracteres no numéricos excepto + al inicio
  return phoneStr.replace(/[^\d+]/g, '').replace(/^\+/, '');
}

/**
 * Detecta si un archivo es un Excel genérico (no Facebook Leads)
 */
export function isGenericExcelFormat(headers: string[]): boolean {
  const genericHeaders = ['NOMBRE COMPLETO', 'CELULAR', 'CORREO ELECTRÓNICO', 'PRODUCTO', 'LUGAR', 'RESPONSABLE'];
  return genericHeaders.some(h => headers.includes(h));
}

/**
 * Mapea datos de Excel genérico a la estructura de Lead
 */
export function mapGenericExcelToLead(
  data: GenericExcelLeadData
): Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'assigned_user'> | null {
  // Obtener nombre completo y dividirlo
  const fullName = (data['NOMBRE COMPLETO'] || '').trim();
  
  // Si no hay nombre, retornar null para filtrar esta fila
  if (!fullName) {
    return null;
  }
  
  const nameParts = fullName.split(/\s+/);
  const first_name = nameParts[0] || 'Sin nombre';
  const last_name = nameParts.slice(1).join(' ') || '';
  
  // Obtener email
  const email = (data['CORREO ELECTRÓNICO'] || '').trim();
  
  // Si no hay email válido, generar uno temporal
  const finalEmail = email && email.includes('@') 
    ? email 
    : `${first_name.toLowerCase().replace(/\s/g, '')}.${Date.now()}@temp.lead`;
  
  // Obtener teléfono
  const phone = cleanPhoneNumber(data['CELULAR']);
  
  // Mapear red social a source y platform
  const { source, platform } = mapExcelSocialToSourceAndPlatform(data['RED SOCIAL']);
  
  // Mapear estado
  const status = mapExcelStatusToLeadStatus(data['ESTADO']);
  
  // Construir notas con información adicional
  const noteParts: string[] = [];
  if (data['PRODUCTO']) noteParts.push(`Producto: ${data['PRODUCTO']}`);
  if (data['MARCA']) noteParts.push(`Marca: ${data['MARCA']}`);
  if (data['ATENCIÓN']) noteParts.push(`Atención: ${data['ATENCIÓN']}`);
  if (data['RESPONSABLE']) noteParts.push(`Responsable (Excel): ${data['RESPONSABLE']}`);
  const notes = noteParts.length > 0 ? noteParts.join('\n') : null;
  
  return {
    first_name,
    last_name,
    email: finalEmail,
    phone: phone || null,
    whatsapp: phone || null,
    type_entity: LeadEntityTypeEnum.BUSINESS,
    business_or_person_name: null,
    ruc: data['RUC'] ? String(data['RUC']).trim() : null,
    province: data['LUGAR'] ? String(data['LUGAR']).trim() : null,
    facebook_lead_id: null,
    platform,
    status: status as LeadStatus,
    source: source as LeadSource,
    score: 50,
    notes,
    business_or_partnership_id: null,
    assigned_to: null, // Se asignará después si es necesario
    job_title: null,
    estimated_value: null,
    last_contact_date: null,
    next_follow_up: null,
    tags: null,
  };
}

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
): Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'assigned_user'> | null {
  // Determinar el formato basado en campos presentes
  const isFirstFormat = !!fbData.nombre_y_apellidos;
  const isSecondFormat = !!fbData.full_name;

  // Nombre completo - validar que exista
  const fullName = isFirstFormat 
    ? (fbData.nombre_y_apellidos ?? '') 
    : (fbData.full_name ?? '');
  
  // Si no hay nombre, retornar null para filtrar esta fila
  if (!fullName.trim()) {
    return null;
  }
  
  const nameParts = fullName.trim().split(' ');
  const first_name = nameParts[0] || 'Sin nombre';
  const last_name = nameParts.slice(1).join(' ') || '';

  // Número de teléfono
  const phoneRaw = isFirstFormat 
    ? (fbData.phone_number ?? '') 
    : (fbData.phone ?? '');
  const phone = phoneRaw.replace('p:+', '').replace('+', '');

  // Email - validar que exista o generar temporal
  const emailRaw = isFirstFormat 
    ? (fbData['correo_electrónico'] ?? '') 
    : (fbData.email ?? '');
  const email = emailRaw && emailRaw.includes('@') 
    ? emailRaw 
    : `${first_name.toLowerCase().replace(/\s/g, '')}.${Date.now()}@temp.lead`;

  // Provincia/Ciudad
  const province = isFirstFormat 
    ? (fbData.provincia ?? '') 
    : (fbData.city ?? '');

  // RUC
  const ruc = isFirstFormat 
    ? (fbData.ruc ?? '') 
    : (fbData['déjenos_su_ruc_de_empresa']?.toString() ?? '');

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
