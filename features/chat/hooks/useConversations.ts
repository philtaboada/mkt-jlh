import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getConversationById,
  getConversations,
  findOrCreate,
  updateLastMessage,
} from '../api/conversation.api';

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

export const useFindOrCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactId, channel }: { contactId: string; channel: string }) =>
      findOrCreate(contactId, channel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Conversación creada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear conversación: ' + error.message);
    },
  });
};

export const useUpdateLastMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => updateLastMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
