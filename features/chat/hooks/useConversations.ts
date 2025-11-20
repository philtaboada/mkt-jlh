import { useQuery } from '@tanstack/react-query';
import { getConversationById, getConversations } from '../api/conversation.api';

export const useConversations = (pageIndex = 0, pageSize = 10) => {
  return useQuery({
    queryKey: ['conversations', pageIndex, pageSize],
    queryFn: () => getConversations(pageIndex, pageSize),
  });
};

export const useConversation = (id: string) => {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => getConversationById(id),
    enabled: !!id,
  });
};
