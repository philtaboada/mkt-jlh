import { z } from 'zod';

// ============================================
// MESSAGES
// ============================================
export const senderTypeEnum = z.enum(['user', 'agent', 'system']);
export const messageTypeEnum = z.enum(['text', 'image', 'audio', 'video', 'file']);

export const messageSchema = z.object({
  id: z.uuid().optional(),
  conversation_id: z.uuid(),
  sender_type: senderTypeEnum.default('user'),
  sender_id: z.string(),
  type: messageTypeEnum.default('text'),
  body: z.string().optional(),
  media_url: z.url().optional().or(z.literal('')),
  media_mime: z.string().optional(),
  media_size: z.number().optional(),
  media_name: z.string().optional(),
  metadata: z.any().default({}),
  status: z.string().default('sent'),
  created_at: z.date().optional(),
});

export type Message = z.infer<typeof messageSchema>;
export type SenderType = z.infer<typeof senderTypeEnum>;
export type MessageType = z.infer<typeof messageTypeEnum>;
