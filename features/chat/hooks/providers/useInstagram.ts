import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Message, SendInstagramVars } from '../../types/message';
import { create, updateMessageStatus, setMessageExternalId, markMessageAsFailed } from '../../api';
import { sendInstagram } from '../../api/providers/instagram';

export function useSendInstagram() {
  const queryClient = useQueryClient();

  return useMutation<
    { created: Message },
    Error,
    SendInstagramVars,
    { previousMessages?: Message[]; optimisticId: string }
  >({
    /* ───────── mutation ───────── */
    mutationFn: async ({ conversationId, sendRequest, dbData }) => {
      /* 1️⃣ Crear mensaje DB */
      const created = await create(conversationId, {
        body: sendRequest.message ?? dbData.body,
        type: sendRequest.type ?? dbData.type ?? 'text',
        media_url: sendRequest.mediaUrl ?? dbData.media_url,
        media_name: dbData.media_name,
        media_mime: dbData.media_mime,
        media_size: dbData.media_size,
        metadata: {
          ...dbData.metadata,
          instagram: true,
        },
        // provider: 'instagram',
        status: 'pending',
        sender_type: dbData.sender_type,
        sender_id: dbData.sender_id,
      });

      /* 2️⃣ Enviar a Instagram */
      try {
        const sendRes = await sendInstagram(sendRequest);

        /* 3️⃣ Actualizar estado */
        if (sendRes.messageId && created.id) {
          await setMessageExternalId(created.id, sendRes.messageId, 'instagram');
          await updateMessageStatus(created.id, 'sent');
        }
      } catch (error) {
        if (created.id) {
            await markMessageAsFailed(created.id, error instanceof Error ? error.message : String(error));
        }
        throw error;
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
        provider: 'instagram',
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

      toast.error('Error al enviar mensaje por Instagram');
    },
  });
}
