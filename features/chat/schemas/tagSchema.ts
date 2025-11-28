import { z } from 'zod';

// ============================================
// TAGS
// ============================================
export const tagSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1),
  color: z.string().default('#888888'),
  created_at: z.date().optional(),
});

export type Tag = z.infer<typeof tagSchema>;
