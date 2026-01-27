import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sendWhatsApp } from '@/features/chat/api/providers/whatsapp';
import type { Message, MessageType, SendWhatsappVars } from '../../types/message';
import { create, updateMessageStatus, setMessageExternalId, markMessageAsFailed } from '../../api';

export function useSendWhatsapp() {
  const queryClient = useQueryClient();

  return useMutation<
    { created: Message },
    Error,
    SendWhatsappVars,
    { previousMessages?: Message[]; optimisticId: string }
  >({
    /* ───────────────── mutation ───────────────── */
    mutationFn: async ({ conversationId, sendRequest, dbData }) => {
      const created = await create(conversationId, {
        body: sendRequest.message ?? dbData.body,
        type: (sendRequest.type as MessageType) ?? (dbData.type as MessageType) ?? 'text',
        media_url: sendRequest.mediaUrl ?? dbData.media_url,
        media_name: sendRequest.filename ?? dbData.media_name,
        media_mime: dbData.media_mime,
        media_size: dbData.media_size,
        metadata: {

          ...dbData.metadata,
          whatsapp_template: sendRequest.template ? { name: sendRequest.template.name } : undefined,
        },
        // provider: 'whatsapp', // <-- Remove this to avoid constraint violation
        status: 'pending',
        sender_type: dbData.sender_type,
        sender_id: dbData.sender_id,
      });

      try {
        const sendRes = await sendWhatsApp(sendRequest);

        if (sendRes.messageId && created.id) {
          await setMessageExternalId(created.id, sendRes.messageId, 'whatsapp');
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

    onMutate: async ({ conversationId, dbData }) => {
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] });

      const previousMessages = queryClient.getQueryData<Message[]>(['messages', conversationId]);

      const optimisticId = dbData.metadata?.optimistic_id || crypto.randomUUID();

      const optimisticMessage: Message = {
        id: optimisticId,
        conversation_id: conversationId,
        body: dbData.body,
        type: dbData.type ?? 'text',
        media_url: dbData.media_url,
        media_name: dbData.media_name,
        metadata: dbData.metadata,
        status: 'pending',
        provider: 'whatsapp',
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

    onSuccess: ({ created }, { conversationId }, context) => {
      queryClient.setQueryData<Message[]>(['messages', conversationId], (old = []) => {
        const exists = old.some((m) => m.id === created.id);
        if (exists) {
          return old.filter((m) => m.id !== context?.optimisticId);
        }
        return old.map((m) =>
          m.id === context?.optimisticId ? { ...created, optimistic: false } : m
        );
      });

      queryClient.invalidateQueries({
        queryKey: ['messages', conversationId],
        exact: true,
      });
    },

    onError: (_err, { conversationId }, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', conversationId], context.previousMessages);
      }

      toast.error('Error al enviar mensaje por WhatsApp');
    },
  });
}
