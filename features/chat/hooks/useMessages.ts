import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { getMessagesByConversation, create as createMessage } from '../api/message.api';
import { createClient } from '@/lib/supabase/client';

export const useMessages = (conversationId: string) => {
  const queryClient = useQueryClient();

  // Suscripción a Realtime para mensajes nuevos
  useEffect(() => {
    if (!conversationId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mkt_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Agregar el nuevo mensaje al cache
          queryClient.setQueryData(['messages', conversationId], (oldData: any[] | undefined) => {
            if (!oldData) return [payload.new];
            // Evitar duplicados
            const exists = oldData.some((msg) => msg.id === payload.new.id);
            if (exists) return oldData;
            return [...oldData, payload.new];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'mkt_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Actualizar el mensaje en el cache
          queryClient.setQueryData(['messages', conversationId], (oldData: any[] | undefined) => {
            if (!oldData) return oldData;
            return oldData.map((msg) => (msg.id === payload.new.id ? payload.new : msg));
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessagesByConversation(conversationId),
    enabled: !!conversationId,
    // Sin polling - usamos Realtime
    staleTime: Infinity,
  });
};

export const useCreateMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: any }) =>
      createMessage(conversationId, data),
    onSuccess: (_, { conversationId }) => {
      // Invalidar para asegurar que se sincronice
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      toast.error('Error al enviar mensaje: ' + error.message);
    },
  });
};
