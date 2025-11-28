import { z } from 'zod';

// ============================================
// CONTACT NOTES
// ============================================
export const contactNoteSchema = z.object({
  id: z.uuid().optional(),
  contact_id: z.uuid(),
  author_id: z.uuid().optional(),
  note: z.string().min(1),
  created_at: z.date().optional(),
});

export type ContactNote = z.infer<typeof contactNoteSchema>;
