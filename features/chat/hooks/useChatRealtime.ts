'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useChatStore } from '../stores/chat.store';
import type { Message } from '@/features/chat/types/message';

export function useChatRealtime() {
  const queryClient = useQueryClient();
  const { activeConversationId, soundEnabled } = useChatStore();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel('chat-realtime');

    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'mkt_messages' },
      (payload) => {
        const message = payload.new as Message;
        const isActive = message.conversation_id === activeConversationId;

        queryClient.setQueryData<Message[]>(['messages', message.conversation_id], (old = []) => {
          // Si el mensaje real ya existe, no hacemos nada
          if (old.some((m) => m.id === message.id)) return old;

          // Si el mensaje viene con un optimisticId en metadata, 
          // buscamos el mensaje optimista local para reemplazarlo
          const optimisticId = message.metadata?.optimistic_id;
          if (optimisticId) {
            const exists = old.some((m) => m.id === optimisticId);
            if (exists) {
              return old.map((m) => (m.id === optimisticId ? message : m));
            }
          }

          // Si no es un reemplazo de uno optimista, lo añadimos al final
          return [...old, message];
        });

        queryClient.invalidateQueries({ queryKey: ['conversations'] });

        if (!isActive && message.sender_type !== 'bot') {
          if (soundEnabled) {
            const audio = new Audio('/sounds/chat-notification.mp3');
            audio.play().catch(() => {});
          }

          const messageText = message.body || 'Nuevo mensaje';
          const truncatedText =
            messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText;

          toast.success(`${truncatedText}`, {
            description: 'Nuevo mensaje recibido',
            duration: 4000,
          });
        }
      }
    );

    // MESSAGE UPDATES (Status changes: delivered, read, etc)
    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'mkt_messages' },
      (payload) => {
        const newMessage = payload.new as Message;
        // Update specific message in cache
        queryClient.setQueryData<Message[]>(
          ['messages', newMessage.conversation_id],
          (old = []) => {
            if (!old) return [newMessage];
            return old.map((m) => (m.id === newMessage.id ? { ...m, ...newMessage } : m));
          }
        );
      }
    );

    // NUEVA CONVERSATION
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'mkt_conversations' },
      () => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['conversation-counts'] });
      }
    );

    // UPDATE CONVERSATION
    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'mkt_conversations' },
      () => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['conversation-counts'] });
      }
    );

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, queryClient, soundEnabled]);
}
