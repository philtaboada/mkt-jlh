import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Message, SendMessengerVars } from '../../types/message';
import { create, updateMessageStatus, setMessageExternalId } from '../../api';
import { sendMessenger } from '../../api/providers/messenger';

export function useSendMessenger() {
  const queryClient = useQueryClient();

  return useMutation<
    { created: Message },
    Error,
    SendMessengerVars,
    { previousMessages?: Message[]; optimisticId: string }
  >({
    /* ───────────────── mutation ───────────────── */
    mutationFn: async ({ conversationId, sendRequest, dbData }) => {
      /* 1️⃣ Crear mensaje en DB */
      const created = await create(conversationId, {
        body: sendRequest.message ?? dbData.body,
        type: sendRequest.type ?? dbData.type ?? 'text',
        media_url: sendRequest.mediaUrl ?? dbData.media_url,
        media_name: dbData.media_name,
        media_mime: dbData.media_mime,
        media_size: dbData.media_size,
        metadata: {
          ...dbData.metadata,
          messenger: {
            tag: sendRequest.tag,
          },
        },
        // provider: 'messenger',
        status: 'pending',
        sender_type: dbData.sender_type,
        sender_id: dbData.sender_id,
      });

      const sendRes = await sendMessenger(sendRequest);

      if (sendRes.messageId && created.id) {
        await setMessageExternalId(created.id, sendRes.messageId, 'messenger');
        await updateMessageStatus(created.id, 'sent');
      }

      return { created };
    },

    /* ───────── optimistic UI ───────── */
    onMutate: async ({ conversationId, dbData }) => {
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] });

      const previousMessages = queryClient.getQueryData<Message[]>(['messages', conversationId]);

      const optimisticId = crypto.randomUUID();

      const optimisticMessage: Message = {
        id: optimisticId,
        conversation_id: conversationId,
        body: dbData.body,
        type: dbData.type ?? 'text',
        media_url: dbData.media_url,
        media_name: dbData.media_name,
        metadata: dbData.metadata,
        provider: 'messenger',
        status: 'pending',
        sender_id: dbData.sender_id,
        sender_type: dbData.sender_type,
        created_at: new Date(),
        optimistic: true,
      } as Message;

      queryClient.setQueryData<Message[]>(['messages', conversationId], (old = []) => [
        ...old,
        optimisticMessage,
      ]);

      return { previousMessages, optimisticId };
    },

    /* ───────── success ───────── */
    onSuccess: ({ created }, { conversationId }, context) => {
      queryClient.setQueryData<Message[]>(['messages', conversationId], (old = []) =>
        old.map((m) => (m.id === context?.optimisticId ? { ...created, optimistic: false } : m))
      );

      queryClient.invalidateQueries({
        queryKey: ['messages', conversationId],
        exact: true,
      });
    },

    /* ───────── error ───────── */
    onError: (_err, { conversationId }, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', conversationId], context.previousMessages);
      }

      toast.error('Error al enviar mensaje por Messenger');
    },
  });
}
