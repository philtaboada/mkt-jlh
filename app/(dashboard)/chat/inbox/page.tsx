'use client';

import { useState } from 'react';
import { useConversation } from '@/features/chat/hooks/useConversations';
import { ChatPanel } from '@/features/chat/components/ChatPanel';
import { ConversationsList } from '@/features/chat/components/ConversationsList';
import type { Contact } from '@/features/chat/types/contact';
import type { Conversation } from '@/features/chat/types/conversation';

export default function InboxPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: selectedConversation } = useConversation(selectedConversationId || '');

  // Create contact object from conversation data
  const contact: Contact | undefined =
    selectedConversation &&
    selectedConversation.mkt_contacts &&
    selectedConversation.mkt_contacts.id &&
    selectedConversation.mkt_contacts.name
      ? {
          id: selectedConversation.mkt_contacts.id,
          name: selectedConversation.mkt_contacts.name,
          avatar_url: selectedConversation.mkt_contacts.avatar_url || undefined,
        }
      : undefined;

  const conversation: Conversation | undefined = selectedConversation
    ? {
        id: selectedConversation.id,
        contact_id: selectedConversation.contact_id,
        channel: selectedConversation.channel,
        status: selectedConversation.status,
        assigned_to: selectedConversation.assigned_to,
        last_message_at: selectedConversation.last_message_at,
        created_at: selectedConversation.created_at,
        updated_at: selectedConversation.updated_at,
      }
    : undefined;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]  bg-gray-50 overflow-hidden">
      {/* Conversations Sidebar */}
      <ConversationsList
        onSelectConversation={setSelectedConversationId}
        selectedConversationId={selectedConversationId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden">
        {selectedConversation && contact && conversation ? (
          <ChatPanel contact={contact} conversation={conversation} />
        ) : (
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                💬
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecciona una conversación
              </h3>
              <p className="text-gray-500">
                Elige una conversación del panel lateral para ver los mensajes
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
