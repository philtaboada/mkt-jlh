'use client';

import ConversationsTable from '@/features/chat/components/ConversationsTable';
import { useConversations } from '@/features/chat/hooks/useConversations';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ConversationsPage() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { data: result, isLoading } = useConversations(pageIndex, pageSize);
  const router = useRouter();

  const conversations = result?.data || [];
  const pagination = result?.pagination;

  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleView = (conversation: any) => {
    // Navigate to the chat interface with the conversation
    // router.push(`/dashboard/chat/inbox?conversation=${conversation.id}`);
  };

  const handleAssign = (id: string, assignedTo: string) => {
    // TODO: Implement assign logic
    console.log('Assign', id, assignedTo);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Conversaciones</h1>
        <p>Lista de todas las conversaciones activas e inactivas.</p>
      </div>
      <ConversationsTable
        conversations={conversations}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onView={handleView}
        onAssign={handleAssign}
      />
    </div>
  );
}
