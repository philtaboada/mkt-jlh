import { z } from 'zod';

// ============================================
// CONTACT TAGS (pivot)
// ============================================
export const contactTagSchema = z.object({
  id: z.uuid().optional(),
  contact_id: z.uuid(),
  tag_id: z.uuid(),
  created_at: z.date().optional(),
});

export type ContactTag = z.infer<typeof contactTagSchema>;
