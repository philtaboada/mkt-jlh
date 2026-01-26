import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getConversationById,
  getConversations,
  findOrCreate,
  getConversationCounts,
  updateConversationStatus,
  enableIAForConversation,
} from '../api/conversation.api';
import { useChatStore } from '../stores/chat.store';

export const useConversations = (pageSize = 20) => {
  const filters = useChatStore((s) => s.filters);

  return useInfiniteQuery({
    queryKey: ['conversations', filters],
    queryFn: ({ pageParam = 0 }) => getConversations(pageParam, pageSize, filters),

    initialPageParam: 0,

    getNextPageParam: (lastPage) => {
      const { pageIndex, totalPages } = lastPage.pagination;
      return pageIndex + 1 < totalPages ? pageIndex + 1 : undefined;
    },

    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
};

export const useFindOrCreateConversation = () => {
  return useMutation({
    mutationFn: ({ contactId, channel }: { contactId: string; channel: string }) =>
      findOrCreate(contactId, channel),

    onSuccess: () => {
      toast.success('Conversación creada exitosamente');
    },

    onError: (error: any) => {
      toast.error('Error al crear conversación: ' + error.message);
    },
  });
};

export const useConversation = (conversationId: string) => {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => getConversationById(conversationId),
    enabled: !!conversationId,
    staleTime: 30_000,
  });
};

export const useConversationCounts = () => {
  return useQuery({
    queryKey: ['conversation-counts'],
    queryFn: getConversationCounts,
    staleTime: 30_000,
  });
};

export const useTotalUnread = () => {
  return useQuery({
    queryKey: ['total-unread'],
    queryFn: async () => {
      const counts = await getConversationCounts();
      return counts.unread || 0;
    },
    staleTime: 30_000,
  });
};

export const useUpdateStatusConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      status,
    }: {
      conversationId: string;
      status: 'open' | 'closed' | 'pending' | 'snoozed' | 'bot' | 'agent';
    }) => updateConversationStatus(conversationId, status),

    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-counts'] });
      toast.success('Estado de conversación actualizado');
    },

    onError: (error: any) => {
      toast.error('Error al actualizar estado: ' + error.message);
    },
  });
};

export const useActivateIAForConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => enableIAForConversation(conversationId),

    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('IA activada para la conversación');
    },

    onError: (error: any) => {
      toast.error('Error al activar IA: ' + error.message);
    },
  });
};
