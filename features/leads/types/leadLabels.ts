// Mapeos de labels para leads

import { LeadEntityType, LeadEntityTypeEnum, LeadProductType, LeadProductTypeEnum, LeadSource, LeadSourceEnum, LeadStatus, LeadStatusEnum } from "./leadEnums";

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
