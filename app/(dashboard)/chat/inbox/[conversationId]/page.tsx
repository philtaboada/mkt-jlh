'use client';

import { use } from 'react';
import { InboxView } from '@/features/chat/components/inbox';

export default function InboxPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = use(params);
  return <InboxView initialConversationId={conversationId} />;
}
