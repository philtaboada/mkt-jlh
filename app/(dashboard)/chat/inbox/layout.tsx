'use client';

import { ConversationList } from '@/features/chat/components/chat/conversations';

export default function InboxLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <ConversationList />
      {children}
    </div>
  );
}
