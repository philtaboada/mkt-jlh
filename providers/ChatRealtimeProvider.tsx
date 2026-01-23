'use client';

import { useChatRealtime } from '@/features/chat/hooks/useChatRealtime';

export function ChatRealtimeProvider() {
  useChatRealtime();
  return null;
}
