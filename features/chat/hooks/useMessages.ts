import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getMessagesByConversation,
  create as createMessage,
  markMessagesAsRead,
} from '../api/message.api';

/* -------------------------------------------------------------------------- */
/*                                   MESSAGES                                 */
/* -------------------------------------------------------------------------- */

export const useMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessagesByConversation(conversationId),
    enabled: !!conversationId,
    staleTime: Infinity,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/* -------------------------------------------------------------------------- */
/*                               SEND MESSAGE                                 */
/* -------------------------------------------------------------------------- */

export const useCreateMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: any }) =>
      createMessage(conversationId, data),

    onMutate: async ({ conversationId, data }) => {
      await queryClient.cancelQueries({
        queryKey: ['messages', conversationId],
      });

      const previousMessages = queryClient.getQueryData(['messages', conversationId]);

      const optimisticMessage = {
        id: crypto.randomUUID(),
        conversation_id: conversationId,
        ...data,
        created_at: new Date().toISOString(),
        optimistic: true,
      };

      queryClient.setQueryData(['messages', conversationId], (old: any[] = []) => [
        ...old,
        optimisticMessage,
      ]);

      return { previousMessages };
    },

    onError: (error: any, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', variables.conversationId], context.previousMessages);
      }
      toast.error('Error al enviar mensaje');
    },

    onSettled: (_, __, { conversationId }) => {
      // Realtime va a reemplazar el mensaje optimistic
      queryClient.invalidateQueries({
        queryKey: ['messages', conversationId],
        exact: true,
      });
    },
  });
};

/* -------------------------------------------------------------------------- */
/*                             MARK AS READ                                   */
/* -------------------------------------------------------------------------- */

export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => markMessagesAsRead(conversationId),

    onMutate: async (conversationId) => {
      await queryClient.cancelQueries({ queryKey: ['conversations'] });

      const previousConversations = queryClient.getQueryData<any>(['conversations']);

      queryClient.setQueryData(['conversations'], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((conv: any) =>
            conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
          ),
        };
      });

      return { previousConversations };
    },

    onError: (_, __, context) => {
      if (context?.previousConversations) {
        queryClient.setQueryData(['conversations'], context.previousConversations);
      }
    },
  });
};
