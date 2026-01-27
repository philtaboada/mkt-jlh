'use client';

import { useRef, useState, useMemo, useCallback } from 'react';
import type { Contact } from '@/features/chat/types/contact';
import type { Conversation } from '@/features/chat/types/conversation';
import { MessageList } from './MessageList';
import { ChatHeader } from '../header';
import { useMessages, useChatProvider } from '@/features/chat/hooks';
import { useActivateIAForConversation } from '@/features/chat/hooks/useConversations';
import { MessageTemplate } from '@/features/chat/types/template';

import { MessageInput } from '../input';
import { TemplateAlert } from '../templates/TemplateAlert';

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

  const { data: messages = [], isLoading } = useMessages(conversation.id);
  const { sendMessage, isSending } = useChatProvider(conversation, contact);
  const enableIaMutation = useActivateIAForConversation();

  const isOutsideHours = useMemo(() => {
    if (!conversation.last_inbound_at) return false;
    const lastInbound = new Date(conversation.last_inbound_at);
    // eslint-disable-next-line react-hooks/purity
    const diffHours = (Date.now() - lastInbound.getTime()) / (1000 * 60 * 60);
    return diffHours > 24;
  }, [conversation.last_inbound_at]);

  const isNotConnected = !conversation.channel_id;

  /**
   * Handlers
   */
  const handleFileDrop = useCallback((files: File[]) => {
    setDroppedFiles((prev) => [...prev, ...files]);
  }, []);

  const handleAIAssist = useCallback(async () => {
    if (!conversation.id) return;
    await enableIaMutation.mutateAsync(conversation.id);
  }, [conversation.id, enableIaMutation]);

  const handleSendMessage = useCallback(
    async (content: string, attachments?: File[]) => {
      const hasText = content.trim().length > 0;
      const hasFiles = attachments && attachments.length > 0;
      const hasTemplate = !!selectedTemplate;

      if (!hasText && !hasFiles && !hasTemplate) return;

      const success = await sendMessage({
        content,
        files: attachments,
        template: selectedTemplate || undefined,
        templateParams,
      });

      if (success) {
        if (selectedTemplate) {
          setSelectedTemplate(null);
          setTemplateParams({});
        }

        requestAnimationFrame(() => {
          scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        });
      }
    },
    [sendMessage, selectedTemplate, templateParams]
  );

  /**
   * Render
   */
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <ChatHeader contact={contact} conversation={conversation} />

      <TemplateAlert
        isOutsideHours={isOutsideHours}
        isNotConnected={isNotConnected}
        channelId={conversation.channel_id!}
      />

      <MessageList
        messages={messages}
        isLoading={isLoading}
        contact={contact}
        scrollRef={scrollRef}
        onFileDrop={handleFileDrop}
      />

      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={isSending}
        initialValue={templateMessage}
        additionalFiles={droppedFiles}
        onFilesCleared={() => setDroppedFiles([])}
        enableAIAssist={conversation.ia_enabled}
        onAIAssist={handleAIAssist}
        channelId={conversation.channel_id!}
        
        selectedTemplate={selectedTemplate}
        templateParams={templateParams}
        onClearTemplate={() => {
          setSelectedTemplate(null);
          setTemplateParams({});
        }}
        onTemplateSelect={(template, params) => {
          console.debug('[ChatPanel] template selected', { templateId: template.id, params });
          setSelectedTemplate(template);
          setTemplateParams(params || {});
        }}
      />
    </div>
  );
}

