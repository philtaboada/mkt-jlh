import { z } from 'zod';

const companySchema = z.object({
  document_type: z.enum(['DNI', 'RUC', 'CI']),
  document: z.string().min(3, 'El documento debe tener al menos 3 caracteres'),
  legal_name: z.string().min(2, 'El nombre legal debe tener al menos 2 caracteres'),
  classification_business: z.string().optional(),
  worker_id: z.string().optional(),
  mobile_number: z.string().optional(),
  email: z.email('Email inválido').optional(),
  is_marketing: z.boolean().optional().default(true),
  address: z
    .object({
      address_detail: z.string().optional(),
      district: z.string().optional(),
      province: z.string().optional(),
      department: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  is_markeing: z.boolean().optional().default(true),
});

export type CompanyInput = z.infer<typeof companySchema>;
export { companySchema };
