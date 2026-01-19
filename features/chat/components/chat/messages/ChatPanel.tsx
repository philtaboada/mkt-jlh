'use client';

import { useRef, useState } from 'react';
import type { Contact } from '../../../types/contact';
import type { Conversation } from '../../../types/conversation';
import { MessageList } from './MessageList';
import { ChatHeader } from '../header';
import { MessageInput } from '../input';
import { useMessages, useCreateMessage } from '../../../hooks';

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

  const handleSendMessage = async (content: string): Promise<void> => {
    if (!content.trim() || !conversation.id) return;

    await createMessageMutation.mutateAsync({
      conversationId: conversation.id,
      data: {
        sender_type: 'agent' as const,
        sender_id: 'agent-current',
        type: 'text' as const,
        body: content,
      },
    });
    if (conversation.channel === 'whatsapp') {
      const recipient = contact.wa_id;
      if (!recipient) {
        console.warn('[whatsapp-send] missing wa_id for contact', {
          conversationId: conversation.id,
          contactId: contact.id,
        });
      } else {
        console.info('[whatsapp-send] sending message', {
          conversationId: conversation.id,
          contactId: contact.id,
          to: recipient,
          messageLength: content.length,
        });
        try {
          const response = await fetch('/api/whatsapp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: recipient, message: content }),
          });
          const responseBody = await response.json();
          if (!response.ok) {
            console.error('[whatsapp-send] failed', { status: response.status, responseBody });
          } else {
            console.info('[whatsapp-send] delivered', { responseBody });
          }
        } catch (error) {
          console.error('[whatsapp-send] request error', error);
        }
      }
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
