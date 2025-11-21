// Enums para status y source de leads
export const LeadStatusEnum = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  DEALS: 'deals',
  CLOSED_WON: 'closed_won',
  CLOSED_LOST: 'closed_lost',
} as const;

export const LeadSourceEnum = {
  WEBSITE: 'website',
  SOCIAL_MEDIA: 'social_media',
  REFERRAL: 'referral',
  COLD_CALL: 'cold_call',
  EMAIL_CAMPAIGN: 'email_campaign',
  EVENT: 'event',
  OTHER: 'other',
} as const;

export const LeadProductTypeEnum = {
  CARTA_FIANZA: 'Carta Fianza',
  ISOS: 'Isos',
  FIDEICOMISOS: 'Fideicomisos',
  SEGUROS: 'Seguros',
} as const;

export const LeadEntityTypeEnum = {
  BUSINESS: 'business',
  PARTNERSHIPS: 'partnerships',
} as const;

export type LeadStatus = (typeof LeadStatusEnum)[keyof typeof LeadStatusEnum];
export type LeadSource = (typeof LeadSourceEnum)[keyof typeof LeadSourceEnum];
export type LeadProductType = (typeof LeadProductTypeEnum)[keyof typeof LeadProductTypeEnum];
export type LeadEntityType = (typeof LeadEntityTypeEnum)[keyof typeof LeadEntityTypeEnum];
