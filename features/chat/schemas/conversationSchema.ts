import { z } from 'zod';

// ============================================
// CONVERSATIONS
// ============================================
export const conversationSchema = z.object({
  id: z.uuid().optional(),
  contact_id: z.uuid(),
  channel: z.enum(['whatsapp', 'facebook', 'instagram']),
  status: z.enum(['open', 'closed']).default('open'),
  assigned_to: z.uuid().optional(),
  last_message_at: z.date().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type Conversation = z.infer<typeof conversationSchema>;
