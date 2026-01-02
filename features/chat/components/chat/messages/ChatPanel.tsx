'use client';

import { useRef } from 'react';
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

  // Use React Query hooks
  const { data: messages = [], isLoading } = useMessages(conversation.id || '');
  const createMessageMutation = useCreateMessage();

  const handleSendMessage = (content: string) => {
    if (!content.trim() || !conversation.id) return;

    createMessageMutation.mutate(
      {
        conversationId: conversation.id,
        data: {
          sender_type: 'agent' as const,
          sender_id: 'agent-current',
          type: 'text' as const,
          body: content,
        },
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        },
      }
    );
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
      />

      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={createMessageMutation.isPending}
        initialValue={templateMessage}
      />
    </div>
  );
}
