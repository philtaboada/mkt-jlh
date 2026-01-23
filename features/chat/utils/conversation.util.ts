import type { Conversation } from '../types/conversation';

export function updateLastMessage(
  conversations: Conversation[],
  message: any,
  isActive: boolean
): Conversation[] {
  return conversations.map((conv) => {
    if (conv.id !== message.conversation_id) return conv;

    return {
      ...conv,
      last_message_body: message.body,
      last_message_at: message.created_at,
      unread_count: isActive ? conv.unread_count : (conv.unread_count || 0) + 1,
    };
  });
}
