import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import {
  getConversationById,
  getConversations,
  findOrCreate,
  updateLastMessage,
  getConversationCounts,
} from '../api/conversation.api';
import { createClient } from '@/lib/supabase/client';
import type { Conversation } from '../types/conversation';

export const useConversations = (pageIndex = 0, pageSize = 10) => {
  const queryClient = useQueryClient();

  // Suscripción a Realtime para conversaciones nuevas/actualizadas
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'mkt_conversations',
        },
        () => {
          // Invalidar queries para refetch
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['conversation-counts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['conversations', pageIndex, pageSize],
    queryFn: () => getConversations(pageIndex, pageSize),
    // Sin polling - usamos Realtime
    staleTime: 30000,
  });
};

export const useConversation = (id: string) => {
  const queryClient = useQueryClient();

  // Validar que sea un UUID válido
  const isValidUUID = Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

  // Suscripción específica para esta conversación
  useEffect(() => {
    if (!isValidUUID) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`conversation:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'mkt_conversations',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          queryClient.setQueryData(['conversation', id], (existing?: Conversation) => {
            const updated: Conversation = payload.new as Conversation;
            if (!existing) return updated;
            return {
              ...existing,
              ...updated,
              mkt_contacts: existing.mkt_contacts,
            };
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, isValidUUID, queryClient]);

  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => getConversationById(id),
    enabled: isValidUUID,
    staleTime: 30000,
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
  const queryClient = useQueryClient();

  // Reutilizar la suscripción del canal de conversaciones
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('conversation-counts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mkt_conversations',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversation-counts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['conversation-counts'],
    queryFn: () => getConversationCounts(),
    staleTime: 30000,
  });
};
