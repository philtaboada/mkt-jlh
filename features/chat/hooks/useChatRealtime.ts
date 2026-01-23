'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useChatStore } from '../stores/chat.store';

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
        const message = payload.new;
        const isActive = message.conversation_id === activeConversationId;

        queryClient.setQueryData(['messages', message.conversation_id], (old: any[] = []) => {
          const updated = old.some((m) => m.id === message.id) ? old : [...old, message];
          return updated;
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

    // 💬 NUEVA CONVERSATION
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'mkt_conversations' },
      (payload) => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['conversation-counts'] });
      }
    );

    // 💬 UPDATE CONVERSATION
    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'mkt_conversations' },
      (payload) => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['conversation-counts'] });
      }
    );

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, queryClient]);
}
