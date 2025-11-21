import { z } from 'zod';

const partnershipSchema = z
  .object({
    document: z.string().min(3, 'El documento debe tener al menos 3 caracteres'),
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    economic_activity: z.string().nullable().optional(),
    mobile_number: z.string().optional(),
    email: z.email('Email inválido').optional(),
    is_marketing: z.boolean().optional().default(true),
    business_principal_id: z.string().nullable().optional().default(null),
    address: z.string().nullable().optional(),
    partnership_businesses: z
      .array(
        z.object({
          business_id: z.string(),
          participation_percent: z.coerce.number().min(0).max(100),
        })
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    const list = data.partnership_businesses ?? [];
    if (list.length === 0) return;
    const sum = list.reduce((acc, it) => acc + (Number(it.participation_percent) || 0), 0);
    if (sum !== 100) {
      ctx.addIssue({
        code: 'custom',
        message: 'La suma de porcentajes debe ser exactamente 100',
        path: ['partnership_businesses'],
      });
    }
  });

export type PartnershipInput = z.infer<typeof partnershipSchema>;
export { partnershipSchema };
