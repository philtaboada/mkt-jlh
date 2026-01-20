'use client';

import { useRef, useState } from 'react';
import type { Contact } from '../../../types/contact';
import type { Conversation } from '../../../types/conversation';
import { MessageList } from './MessageList';
import { ChatHeader } from '../header';
import { MessageInput } from '../input';
import { useMessages, useCreateMessage } from '../../../hooks';

import { uploadChatAttachment } from '@/features/chat/actions/chat-storage';
import { toast } from 'sonner';

const SUPPORTED_WHATSAPP_IMAGE_MIMES = ['image/jpeg', 'image/png'] as const;
const SUPPORTED_WHATSAPP_AUDIO_MIMES = ['audio/mpeg', 'audio/ogg', 'audio/aac'] as const;
const SUPPORTED_WHATSAPP_VIDEO_MIMES = ['video/mp4', 'video/3gpp'] as const;

function resolveMediaType(params: { mime: string }): 'image' | 'video' | 'audio' | 'file' {
  if (params.mime.startsWith('image/')) {
    return SUPPORTED_WHATSAPP_IMAGE_MIMES.includes(params.mime as (typeof SUPPORTED_WHATSAPP_IMAGE_MIMES)[number])
      ? 'image'
      : 'file';
  }
  if (params.mime.startsWith('video/')) {
    return SUPPORTED_WHATSAPP_VIDEO_MIMES.includes(params.mime as (typeof SUPPORTED_WHATSAPP_VIDEO_MIMES)[number])
      ? 'video'
      : 'file';
  }
  if (params.mime.startsWith('audio/')) {
    return SUPPORTED_WHATSAPP_AUDIO_MIMES.includes(params.mime as (typeof SUPPORTED_WHATSAPP_AUDIO_MIMES)[number])
      ? 'audio'
      : 'file';
  }
  return 'file';
}

function resolveWhatsAppType(params: { type: 'image' | 'video' | 'audio' | 'file' }): 'image' | 'video' | 'audio' | 'document' {
  if (params.type === 'file') return 'document';
  return params.type;
}

interface ChatPanelProps {
  contact: Contact;
  conversation: Conversation;
  templateMessage?: string;
}

export function ChatPanel({ contact, conversation, templateMessage }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);

  // Use React Query hooks
  const { data: messages = [], isLoading } = useMessages(conversation.id || '');
  const createMessageMutation = useCreateMessage();

  const handleFileDrop = (files: File[]): void => {
    setDroppedFiles((prev) => [...prev, ...files]);
  };

  const handleSendMessage = async (content: string, attachments?: File[]): Promise<void> => {
    if ((!content.trim() && (!attachments || attachments.length === 0)) || !conversation.id) return;

    // 1. Enviar mensaje de texto si existe
    if (content.trim()) {
      await createMessageMutation.mutateAsync({
        conversationId: conversation.id,
        data: {
          sender_type: 'agent' as const,
          sender_id: 'agent-current',
          type: 'text' as const,
          body: content,
        },
      });

      // Lógica existente de WhatsApp para texto
      if (conversation.channel === 'whatsapp') {
        const recipient = contact.wa_id;
        if (recipient) {
          try {
            await fetch('/api/whatsapp/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ to: recipient, message: content }),
            });
          } catch (error) {
            console.error('[whatsapp-send] request error', error);
          }
        }
      }
    }

    // 2. Procesar adjuntos
    if (attachments && attachments.length > 0) {
      const uploadPromises = attachments.map(async (file) => {
        try {
          // Subir a GCS
          const formData = new FormData();
          formData.append('file', file);
          const uploadResult = await uploadChatAttachment(formData);
          const mime = uploadResult.mime || file.type || 'application/octet-stream';
          const type = resolveMediaType({ mime });
          if ((file.type.startsWith('image/') || file.type.startsWith('audio/') || file.type.startsWith('video/')) && type === 'file') {
            toast.warning(`WhatsApp no soporta ${file.type}, se enviará como documento`);
          }

          // Crear mensaje en DB con referencia al archivo
          await createMessageMutation.mutateAsync({
            conversationId: conversation.id,
            data: {
              sender_type: 'agent' as const,
              sender_id: 'agent-current',
              type,
              media_url: uploadResult.url,
              media_mime: uploadResult.mime,
              media_size: uploadResult.size,
              media_name: uploadResult.name,
            },
          });

          // Aquí se podría agregar la lógica para enviar el archivo a WhatsApp
          // usando uploadResult.url que es pública.
          if (conversation.channel === 'whatsapp') {
            const recipient = contact.wa_id;
            if (recipient) {
              try {
                const whatsappType = resolveWhatsAppType({ type });
                await fetch('/api/whatsapp/send', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    to: recipient,
                    type: whatsappType,
                    mediaUrl: uploadResult.url,
                    caption: file.name,
                  }),
                });
              } catch (error) {
                console.error('[whatsapp-send] media request error', error);
              }
            }
          }

        } catch (error) {
          console.error('Error uploading file:', error);
          toast.error(`Error al enviar archivo ${file.name}`);
        }
      });

      await Promise.all(uploadPromises);
    }

    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <ChatHeader contact={contact} conversation={conversation} />

      {/* Messages */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        contact={contact}
        scrollRef={scrollRef}
        onFileDrop={handleFileDrop}
      />

      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={createMessageMutation.isPending}
        initialValue={templateMessage}
        additionalFiles={droppedFiles}
        onFilesCleared={() => setDroppedFiles([])}
      />
    </div>
  );
}
