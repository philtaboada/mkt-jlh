import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getConversationById,
  getConversations,
  findOrCreate,
  updateLastMessage,
  getConversationCounts,
} from '../api/conversation.api';

export const useConversations = (pageIndex = 0, pageSize = 10) => {
  return useQuery({
    queryKey: ['conversations', pageIndex, pageSize],
    queryFn: () => getConversations(pageIndex, pageSize),
    // Polling cada 5 segundos para ver nuevas conversaciones
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  });
};

export const useConversation = (id: string) => {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => getConversationById(id),
    enabled: !!id,
    // Polling cada 5 segundos para actualizar estado de la conversación
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
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

// Hook para obtener los conteos del sidebar
export const useConversationCounts = () => {
  return useQuery({
    queryKey: ['conversation-counts'],
    queryFn: () => getConversationCounts(),
    // Refetch cada 30 segundos para mantener los conteos actualizados
    refetchInterval: 30000,
    staleTime: 10000,
  });
};
