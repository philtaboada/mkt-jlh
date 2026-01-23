'use client';

import { useRef, useState, useMemo } from 'react';
import type { Contact } from '../../../types/contact';
import type { Conversation } from '../../../types/conversation';
import { MessageList } from './MessageList';
import { ChatHeader } from '../header';
import { MessageInput } from '../input';
import { TemplateSelector } from '../templates/TemplateSelector';
import { useMessages, useCreateMessage, useTemplates } from '../../../hooks';
import { uploadChatAttachment } from '@/features/chat/actions/chat-storage';
import { toast } from 'sonner';
import type { MessageTemplate } from '../../../types/template';
import { sendFirstMessageWithTemplate } from '../../../api/whatsapp-message.api';
import { sendWhatsAppTextMessage, sendWhatsAppMediaMessage } from '../../../api/send-message.api';
import { resolveMediaType, resolveWhatsAppType } from '@/features/chat/utils/media-utils';

interface ChatPanelProps {
  contact: Contact;
  conversation: Conversation;
  templateMessage?: string;
}

export function ChatPanel({ contact, conversation, templateMessage }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [templateParams, setTemplateParams] = useState<Record<string, string>>({});

  // Use React Query hooks
  const { data: messages = [], isLoading } = useMessages(conversation.id || '');
  const createMessageMutation = useCreateMessage();

  // Detectar si es el primer mensaje (no hay mensajes del agente)
  const isFirstMessage = useMemo(() => {
    if (!messages || messages.length === 0) return true;
    return !messages.some((msg) => msg.sender_type === 'agent');
  }, [messages]);

  // Cargar templates solo si es WhatsApp y es primer mensaje
  const shouldLoadTemplates =
    conversation.channel === 'whatsapp' && isFirstMessage && !!conversation.channel_id;
  const { data: templates = [], isLoading: isLoadingTemplates } = useTemplates(
    conversation.channel_id || undefined,
    shouldLoadTemplates ? 'whatsapp' : undefined
  );

  const handleFileDrop = (files: File[]): void => {
    setDroppedFiles((prev) => [...prev, ...files]);
  };

  const handleSendMessage = async (content: string, attachments?: File[]): Promise<void> => {
    console.log('[ChatPanel] handleSendMessage called:', {
      content: content.trim(),
      attachmentsCount: attachments?.length,
      conversationId: conversation.id,
      channel: conversation.channel,
      wa_id: contact.wa_id,
    });
    if ((!content.trim() && (!attachments || attachments.length === 0)) || !conversation.id) return;

    if (
      isFirstMessage &&
      selectedTemplate &&
      conversation.channel === 'whatsapp' &&
      contact.wa_id
    ) {
      console.log('[Debug] Enviando primer mensaje con plantilla - condiciones:', {
        isFirstMessage,
        selectedTemplate: !!selectedTemplate,
        channel: conversation.channel,
        wa_id: contact.wa_id,
      });
      const bodyComponent = selectedTemplate.components.find((c) => c.type === 'BODY');
      let preview = bodyComponent?.text || '';
      if (bodyComponent) {
        const placeholders = selectedTemplate.components
          .filter((c) => c.type === 'BODY' || c.type === 'HEADER')
          .flatMap((comp) => {
            const matches = comp.text?.match(/\{\{(\d+)\}\}/g) || [];
            return matches.map((match) => {
              const index = parseInt(match.replace(/\{\{|\}\}/g, ''), 10);
              return { index, component: comp.type };
            });
          });
        placeholders.forEach((p) => {
          const value = templateParams[`param_${p.index}`] || `{{${p.index}}}`;
          preview = preview.replace(new RegExp(`\\{\\{${p.index}\\}\\}`, 'g'), value);
        });
      }
      // Guardar mensaje en la base de datos local
      await createMessageMutation.mutateAsync({
        conversationId: conversation.id,
        data: {
          sender_type: 'agent' as const,
          sender_id: 'agent-current',
          type: 'text' as const,
          body: preview,
        },
      });
      // Enviar a WhatsApp
      const result = await sendFirstMessageWithTemplate({
        to: contact.wa_id,
        templateName: selectedTemplate.name,
        channelId: conversation.channel_id || undefined,
        templateParams: Object.keys(templateParams).length > 0 ? templateParams : undefined,
      });

      if (result.success) {
        toast.success('Mensaje con plantilla enviado');
        setSelectedTemplate(null);
        setTemplateParams({});
      } else {
        toast.error(result.error || 'Error al enviar plantilla');
      }
      return;
    }

    // Enviar mensaje de texto
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

      if (conversation.channel === 'whatsapp' && contact.wa_id) {
        const result = await sendWhatsAppTextMessage({
          to: contact.wa_id,
          message: content,
        });
        if (!result.success) {
          console.error('[whatsapp-send] error:', result.error);
        }
      }
    }

    // Procesar adjuntos
    if (attachments && attachments.length > 0) {
      const uploadPromises = attachments.map(async (file) => {
        try {
          const formData = new FormData();
          formData.append('file', file);
          const uploadResult = await uploadChatAttachment(formData);
          const mime = uploadResult.mime || file.type || 'application/octet-stream';
          const type = resolveMediaType({ mime });

          if (
            (file.type.startsWith('image/') ||
              file.type.startsWith('audio/') ||
              file.type.startsWith('video/')) &&
            type === 'file'
          ) {
            toast.warning(`WhatsApp no soporta ${file.type}, se enviará como documento`);
          }

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

          if (conversation.channel === 'whatsapp' && contact.wa_id) {
            const whatsappType = resolveWhatsAppType({ type });
            console.log('[WhatsApp] Enviando medio:', {
              to: contact.wa_id,
              type: whatsappType,
              mediaUrl: uploadResult.url,
            });
            const result = await sendWhatsAppMediaMessage({
              to: contact.wa_id,
              type: whatsappType,
              mediaUrl: uploadResult.url,
              caption: file.name,
            });
            console.log('[WhatsApp] Resultado del envío de medio:', result);
            if (!result.success) {
              console.error('[whatsapp-send] media error:', result.error);
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

      {/* Template Selector - Solo mostrar si es primer mensaje y WhatsApp */}
      {shouldLoadTemplates && (
        <div className="px-4 py-2 border-b bg-muted/30">
          <TemplateSelector
            templates={templates}
            onSelect={(template, params) => {
              setSelectedTemplate(template);
              setTemplateParams(params || {});
            }}
            isLoading={isLoadingTemplates}
            disabled={createMessageMutation.isPending}
            channelId={conversation.channel_id || undefined}
          />
        </div>
      )}

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
