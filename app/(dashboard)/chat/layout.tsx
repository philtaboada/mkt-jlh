import { ChatSidebar } from '@/features/chat/components/chat/sidebar';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Chatwoot-style sidebar */}
      <ChatSidebar />

      {/* Main content */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
