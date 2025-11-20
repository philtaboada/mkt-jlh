import { useQuery } from '@tanstack/react-query';
import { getMessagesByConversation } from '../api/message.api';

export const useMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessagesByConversation(conversationId),
    enabled: !!conversationId,
  });
};
