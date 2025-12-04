import { z } from 'zod';

// ============================================
// CONTACTOS
// ============================================
export const contactSchema = z.object({
  id: z.uuid().optional(),
  wa_id: z.string().optional(),
  fb_id: z.string().optional(),
  ig_id: z.string().optional(),
  name: z.string().optional(),
  email: z.email().optional().or(z.literal('')),
  phone: z.string().optional(),
  avatar_url: z.url().optional().or(z.literal('')),
  custom_fields: z.any().default({}),
  status: z.enum(['lead', 'open', 'customer', 'closed']).default('lead'),
  source: z.string().optional(),
  assigned_to: z.uuid().optional(),
  last_interaction: z.date().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type Contact = z.infer<typeof contactSchema>;
