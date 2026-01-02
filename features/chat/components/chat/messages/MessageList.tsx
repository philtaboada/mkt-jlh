'use client';

import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageRenderer } from '../renderer';
import type { Contact } from '../../../types/contact';

interface MessageListProps {
  messages: any[];
  isLoading: boolean;
  contact: Contact;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export function MessageList({ messages, isLoading, contact, scrollRef }: MessageListProps) {
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
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
  );
}
