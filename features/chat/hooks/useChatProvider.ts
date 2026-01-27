
import { useCallback } from 'react';

import type { Contact } from '@/features/chat/types/contact';
import type { Conversation } from '@/features/chat/types/conversation';
import { MessageTemplate } from '@/features/chat/types/template';
import { useUser } from '@/features/auth/hooks/useAuth';
import { useCreateMessage } from '@/features/chat/hooks/useMessages';
import { useSendWhatsapp } from '@/features/chat/hooks/providers/useWhatsapp';
import { useSendMessenger } from '@/features/chat/hooks/providers/useMessenger';
import { useSendInstagram } from '@/features/chat/hooks/providers/useInstagram';
import { uploadChatAttachment } from '@/features/chat/actions/chat-storage';
import { resolveMediaType, resolveWhatsAppType } from '@/features/chat/utils/media-utils';
import { buildTemplatePreview } from '@/features/chat/utils/templateUtils';
import { MessengerMessageType } from '../api/providers/messenger';
import { InstagramMessageType } from '../api/providers/instagram';
import { toast } from 'sonner';

interface SendMessageParams {
  content?: string;
  files?: File[];
  template?: MessageTemplate;
  templateParams?: Record<string, string>;
}

export function useChatProvider(conversation: Conversation, contact: Contact) {
  const { data: user } = useUser();
  const createMessageMutation = useCreateMessage();
  const sendWhatsappMutation = useSendWhatsapp();
  const sendMessengerMutation = useSendMessenger();
  const sendInstagramMutation = useSendInstagram();

  const activeChannel = conversation.channel;
  const conversationId = conversation.id!;

  const sendMessage = useCallback(
    async ({ content, files, template, templateParams }: SendMessageParams) => {
      const hasText = content && content.trim().length > 0;
      const hasFiles = files && files.length > 0;

      if (!hasText && !hasFiles && !template) return;

      try {
        // 1. WhatsApp Template
        if (template && activeChannel === 'whatsapp' && contact.wa_id) {
          const preview = buildTemplatePreview(template, templateParams || {});
          
          await sendWhatsappMutation.mutateAsync({
            conversationId,
            sendRequest: {
              to: contact.wa_id,
              template: {
                name: template.name,
                languageCode: template.language ?? undefined,
                components: templateParams && Object.keys(templateParams).length
                  ? Object.values(templateParams).map((value) => ({
                      type: 'body',
                      parameters: [{ type: 'text', text: value }],
                    }))
                  : undefined,
              },
            },
            dbData: {
              sender_type: 'agent',
              sender_id: user?.id ?? 'agent-current',
              type: 'text',
              body: preview,
            },
          });
          
          toast.success('Mensaje con plantilla enviado');
          return true;
        }

        // 2. Text Message
        if (hasText) {
          if (activeChannel === 'whatsapp' && contact.wa_id) {
            await sendWhatsappMutation.mutateAsync({
              conversationId,
              sendRequest: {
                to: contact.wa_id,
                message: content,
                type: 'text',
              },
              dbData: {
                sender_type: 'agent',
                sender_id: user?.id ?? 'agent-current',
                type: 'text',
                body: content,
              },
            });
          } else if (activeChannel === 'facebook' && contact.fb_id) {
             await sendMessengerMutation.mutateAsync({
                conversationId,
                sendRequest: {
                    to: contact.fb_id,
                    message: content,
                    type: 'text'
                },
                dbData: {
                    sender_type: 'agent',
                    sender_id: user?.id ?? 'agent-current',
                    type: 'text',
                    body: content
                }
             })
          } else if (activeChannel === 'instagram' && contact.ig_id) {
             await sendInstagramMutation.mutateAsync({
                conversationId,
                instagramBusinessId: conversation.channel_id!, 
                sendRequest: {
                    to: contact.ig_id,
                    message: content,
                    type: 'text'
                },
                dbData: {
                    sender_type: 'agent',
                    sender_id: user?.id ?? 'agent-current',
                    type: 'text',
                    body: content
                }
             })
          } else if (activeChannel === 'website') {
             // Widget / Website channel - Internal only
             await createMessageMutation.mutateAsync({
              conversationId,
              data: {
                sender_type: 'agent',
                sender_id: user?.id ?? 'agent-current',
                type: 'text',
                body: content,
                provider: 'website', 
                status: 'sent', 
              },
            });
          } else {
            // Default / Internal
            await createMessageMutation.mutateAsync({
              conversationId,
              data: {
                sender_type: 'agent',
                sender_id: user?.id ?? 'agent-current',
                type: 'text',
                body: content,
              },
            });
          }
        }

        // 3. Files
        if (hasFiles) {
          await Promise.all(
            files!.map(async (file) => {
              try {
                const formData = new FormData();
                formData.append('file', file);

                const upload = await uploadChatAttachment(formData);
                const mime = upload.mime || file.type;
                const type = resolveMediaType({ mime });

                if (activeChannel === 'whatsapp' && contact.wa_id) {
                  const whatsappType = resolveWhatsAppType({ type });
                  await sendWhatsappMutation.mutateAsync({
                    conversationId,
                    sendRequest: {
                      to: contact.wa_id,
                      type: whatsappType,
                      mediaUrl: upload.url,
                      caption: file.name,
                      filename: upload.name,
                    },
                    dbData: {
                      sender_type: 'agent',
                      sender_id: user?.id ?? 'agent-current',
                      type,
                      media_url: upload.url,
                      media_mime: upload.mime,
                      media_size: upload.size,
                      media_name: upload.name,
                    },
                  });
                } else if (activeChannel === 'facebook' && contact.fb_id) {
                    await sendMessengerMutation.mutateAsync({
                        conversationId,
                        sendRequest: {
                            to: contact.fb_id,
                            type: type as MessengerMessageType, 
                            mediaUrl: upload.url,
                        },
                        dbData: {
                            sender_type: 'agent',
                            sender_id: user?.id ?? 'agent-current',
                            type,
                            media_url: upload.url,
                            media_mime: upload.mime,
                            media_size: upload.size,
                            media_name: upload.name,
                        }
                    })
                } else if (activeChannel === 'instagram' && contact.ig_id) {
                    await sendInstagramMutation.mutateAsync({
                        conversationId,
                        instagramBusinessId: conversation.channel_id!,
                        sendRequest: {
                            to: contact.ig_id,
                            type: type as InstagramMessageType,
                            mediaUrl: upload.url,
                        },
                        dbData: {
                            sender_type: 'agent',
                            sender_id: user?.id ?? 'agent-current',
                            type,
                            media_url: upload.url,
                            media_mime: upload.mime,
                            media_size: upload.size,
                            media_name: upload.name,
                        }
                    })
                } else if (activeChannel === 'website') {
                    await createMessageMutation.mutateAsync({
                        conversationId,
                        data: {
                            sender_type: 'agent',
                            sender_id: user?.id ?? 'agent-current',
                            type,
                            media_url: upload.url,
                            media_mime: upload.mime,
                            media_size: upload.size,
                            media_name: upload.name,
                            provider: 'website',
                            status: 'sent',
                        },
                    });
                } else {
                  await createMessageMutation.mutateAsync({
                    conversationId,
                    data: {
                      sender_type: 'agent',
                      sender_id: user?.id ?? 'agent-current',
                      type,
                      media_url: upload.url,
                      media_mime: upload.mime,
                      media_size: upload.size,
                      media_name: upload.name,
                    },
                  });
                }
              } catch (error) {
                console.error('[ChatProvider] Error sending file:', error);
                toast.error(`Error al enviar archivo ${file.name}`);
              }
            })
          );
        }

        return true;
      } catch (error) {
        console.error('[ChatProvider] Error sending message:', error);
        toast.error('Error al enviar mensaje');
        return false;
      }
    },
    [
      conversation,
      contact,
      user,
      activeChannel,
      conversationId,
      createMessageMutation,
      sendWhatsappMutation,
      sendMessengerMutation,
      sendInstagramMutation
    ]
  );

  return {
    sendMessage,
    isSending:
      createMessageMutation.isPending ||
      sendWhatsappMutation.isPending ||
      sendMessengerMutation.isPending ||
      sendInstagramMutation.isPending,
  };
}
