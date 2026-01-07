import { InboxView } from '@/features/chat/components/inbox';
export const metadata = {
  title: 'Bandeja de Entrada del Chat',
};
export default async function InboxPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  return <InboxView initialConversationId={conversationId} />;
}
