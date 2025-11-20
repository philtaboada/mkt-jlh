import { z } from 'zod';
import { LeadEntityTypeEnum, LeadSource, LeadSourceEnum, LeadStatus, LeadStatusEnum } from '../types/leadEnums';
import { LeadStatusLabels, LeadSourceLabels } from '../types/leadLabels';

// 

const leadFormSchema = z
  .object({
    first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    email: z.email('Email inválido'),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    job_title: z.string().optional(),
    type_entity: z.enum([LeadEntityTypeEnum.BUSINESS, LeadEntityTypeEnum.PARTNERSHIPS]),
    business_or_partnership_id: z.string().optional().nullable(),
    business_or_person_name: z.string().optional().nullable(),
    status: z.enum([
      LeadStatusEnum.NEW,
      LeadStatusEnum.CONTACTED,
      LeadStatusEnum.QUALIFIED,
      LeadStatusEnum.PROPOSAL,
      LeadStatusEnum.NEGOTIATION,
      LeadStatusEnum.DEALS,
      LeadStatusEnum.CLOSED_WON,
      LeadStatusEnum.CLOSED_LOST,
    ]),
    ruc: z.string().optional(),
    source: z.enum([
      LeadSourceEnum.WEBSITE,
      LeadSourceEnum.SOCIAL_MEDIA,
      LeadSourceEnum.REFERRAL,
      LeadSourceEnum.COLD_CALL,
      LeadSourceEnum.EMAIL_CAMPAIGN,
      LeadSourceEnum.EVENT,
      LeadSourceEnum.OTHER,
    ]),
    platform: z.string().nullish(),
    score: z.number().min(0).max(100),
    estimated_value: z.number().optional().nullable(),
    last_contact_date: z.string().optional().nullable(),
    next_follow_up: z.string().optional().nullable(),
    assigned_to: z.string().optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.source === LeadSourceEnum.SOCIAL_MEDIA) {
      if (!data.platform || data.platform.trim() === '') {
        ctx.addIssue({
          code: 'custom',
          message: 'La plataforma es requerida cuando la fuente es redes sociales',
          path: ['platform'],
        });
      }
    }
  });

// Funciones utilitarias para obtener etiquetas
export function getLeadStatusLabel(status: LeadStatus): string {
  return LeadStatusLabels[status] || status;
}

export function getLeadSourceLabel(source: LeadSource): string {
  return LeadSourceLabels[source] || source;
}

export type LeadFormInput = z.infer<typeof leadFormSchema>;
export { leadFormSchema };
