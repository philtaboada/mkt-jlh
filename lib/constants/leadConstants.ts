import {
  LeadStatus,
  LeadSource,
  LeadStatusEnum,
  LeadSourceEnum,
  LeadProductType,
  LeadEntityType,
  LeadProductTypeEnum,
  LeadEntityTypeEnum,
} from '../enums/leadEnums';

// Mapeo para mostrar en español
export const LeadStatusLabels: Record<LeadStatus, string> = {
  [LeadStatusEnum.NEW]: 'Nuevo',
  [LeadStatusEnum.CONTACTED]: 'Contactado',
  [LeadStatusEnum.QUALIFIED]: 'Calificado',
  [LeadStatusEnum.PROPOSAL]: 'Propuesta',
  [LeadStatusEnum.NEGOTIATION]: 'Negociación',
  [LeadStatusEnum.DEALS]: 'Deals',
  [LeadStatusEnum.CLOSED_WON]: 'Ganado',
  [LeadStatusEnum.CLOSED_LOST]: 'Perdido',
};

export const LeadSourceLabels: Record<LeadSource, string> = {
  [LeadSourceEnum.WEBSITE]: 'Sitio Web',
  [LeadSourceEnum.SOCIAL_MEDIA]: 'Redes Sociales',
  [LeadSourceEnum.REFERRAL]: 'Referencia',
  [LeadSourceEnum.COLD_CALL]: 'Llamada',
  [LeadSourceEnum.EMAIL_CAMPAIGN]: 'Campaña Email',
  [LeadSourceEnum.EVENT]: 'Evento',
  [LeadSourceEnum.OTHER]: 'Otro',
};

export const LeadProductTypeLabels: Record<LeadProductType, string> = {
  [LeadProductTypeEnum.CARTA_FIANZA]: 'Carta fianza',
  [LeadProductTypeEnum.ISOS]: 'Isos',
  [LeadProductTypeEnum.FIDEICOMISOS]: 'Fideicomisos',
  [LeadProductTypeEnum.SEGUROS]: 'Seguros',
};

export const LeadEntityTypeLabels: Record<LeadEntityType, string> = {
  [LeadEntityTypeEnum.BUSINESS]: 'Empresa',
  [LeadEntityTypeEnum.PARTNERSHIPS]: 'Consorcio',
};

// Mapeo de plataformas de redes sociales
export const PlatformLabels: Record<string, string> = {
  fb: 'Facebook',
  ig: 'Instagram',
  twitter: 'Twitter',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  other: 'Otro',
};

// Función para obtener la etiqueta legible de una plataforma
export function getPlatformLabel(platform: string): string {
  return PlatformLabels[platform] || platform;
}

// Opciones pre-construidas para formularios
export const LeadStatusOptions = Object.entries(LeadStatusLabels).map(([value, label]) => ({
  value,
  label,
}));

export const LeadSourceOptions = Object.entries(LeadSourceLabels).map(([value, label]) => ({
  value,
  label,
}));

export const LeadProductTypeOptions = Object.entries(LeadProductTypeLabels).map(
  ([value, label]) => ({
    value,
    label,
  })
);

export const LeadEntityTypeOptions = Object.entries(LeadEntityTypeLabels).map(([value, label]) => ({
  value,
  label,
}));
