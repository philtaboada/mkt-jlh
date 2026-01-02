'use client';

import { useRef, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageRenderer } from '../renderer';
import type { Contact } from '../../../types/contact';

interface MessageListProps {
  messages: any[];
  isLoading: boolean;
  contact: Contact;
  scrollRef: React.RefObject<HTMLDivElement>;
  onFileDrop?: (files: File[]) => void;
}

export function MessageList({
  messages,
  isLoading,
  contact,
  scrollRef,
  onFileDrop,
}: MessageListProps) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set false if leaving the container, not child elements
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && onFileDrop) {
      onFileDrop(files);
    }
  };

  return (
    <div className="flex-1 overflow-hidden relative">
      <ScrollArea className="h-full overflow-hidden">
        <div
          className="p-4 space-y-4"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag hint */}
          <div className="text-center text-muted-foreground text-sm py-2">
            Puedes arrastrar archivos aquí para compartirlos
          </div>
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
                  onFileDrop={onFileDrop}
                />
              );
            })
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      {isDragging && (
        <div className="absolute inset-0 bg-primary/20 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-background/90 p-6 rounded-lg shadow-lg border">
            <p className="text-primary font-semibold text-xl text-center">
              Suelta tus archivos aquí
            </p>
            <p className="text-muted-foreground text-center mt-2">
              Arrastra y suelta para compartir archivos
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
