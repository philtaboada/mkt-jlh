'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useChatStore } from '../stores/chat.store';
import type { Message } from '@/features/chat/types/message';
import { usePathname, useRouter } from 'next/navigation';

export function useChatRealtime() {
  const queryClient = useQueryClient();
  const { activeConversationId, soundEnabled } = useChatStore();
  const pathname = usePathname();
  const router = useRouter();

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
          if (old.some((m) => m.id === message.id)) return old;

          const optimisticId = message.metadata?.optimistic_id;
          if (optimisticId) {
            const exists = old.some((m) => m.id === optimisticId);
            if (exists) {
              return old.map((m) => (m.id === optimisticId ? message : m));
            }
          }

          return [...old, message];
        });

        queryClient.invalidateQueries({ queryKey: ['conversations'] });

        const isInChatRoute = pathname?.startsWith('/chat');

        if (!isActive && message.sender_type !== 'bot' && !isInChatRoute) {
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
            action: {
              label: 'Abrir',
              onClick: () =>
                router.push(`/chat/inbox/${encodeURIComponent(String(message.conversation_id))}`),
            },
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
  }, [activeConversationId, queryClient, soundEnabled, pathname]);
}
