'use client';

import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Contact } from '../types/contact';
import type { Conversation } from '../types/conversation';
import { MessageRenderer } from './MessageRenderer';
import { ChatHeader } from './ChatHeader';
import { MessageInput } from './MessageInput';
import { useMessages, useCreateMessage } from '../hooks';

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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
          setTimeout(scrollToBottom, 100);
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <ChatHeader contact={contact} conversation={conversation} />

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full overflow-hidden">
          <div className="p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Cargando mensajes...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No hay mensajes aún</p>
              </div>
            ) : (
              messages.map((msg) => {
                // Determinar nombre y avatar según tipo de sender
                const getSenderInfo = () => {
                  switch (msg.sender_type) {
                    case 'agent':
                      return { name: 'Agente', avatar: '/agent-avatar.jpg' };
                    case 'bot':
                      return { name: 'Asistente IA', avatar: '/bot-avatar.jpg' };
                    case 'system':
                      return { name: 'Sistema', avatar: undefined };
                    default: // 'user'
                      return { name: contact.name || 'Cliente', avatar: contact.avatar_url };
                  }
                };
                const senderInfo = getSenderInfo();
                // agent y bot se muestran a la derecha (como "nuestros" mensajes)
                const isOurMessage = msg.sender_type === 'agent' || msg.sender_type === 'bot';

                return (
                  <MessageRenderer
                    key={msg.id}
                    message={msg}
                    senderName={senderInfo.name}
                    senderAvatar={senderInfo.avatar}
                    isAgent={isOurMessage}
                    senderType={msg.sender_type}
                  />
                );
              })
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={createMessageMutation.isPending}
        initialValue={templateMessage}
      />
    </div>
  );
}
