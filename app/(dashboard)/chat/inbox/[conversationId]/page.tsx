'use client';

import { use, useState, useEffect } from 'react';
import { ChatPanel } from '@/features/chat/components/chat/messages';
import { ContactDetails } from '@/features/chat/components/ContactDetail';
import { useConversation } from '@/features/chat/hooks/useConversations';
import { useMarkMessagesAsRead } from '@/features/chat/hooks/useMessages';
import { Button } from '@/components/ui/button';
import { PanelRightClose, PanelRight } from 'lucide-react';
import { useChatStore } from '@/features/chat/stores/chat.store';
import {
  createContactFromData,
  createConversationFromData,
} from '@/features/chat/utils/chat.utils';

export default function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = use(params);
  const [showContactPanel, setShowContactPanel] = useState(false);

  const { setActiveConversationId } = useChatStore();

  useEffect(() => {
    if (conversationId) {
      setActiveConversationId(conversationId);
    }
  }, [conversationId, setActiveConversationId]);

  const { data: selectedConversation } = useConversation(conversationId);
  const selectedContact = selectedConversation?.mkt_contacts || null;
  const markAsReadMutation = useMarkMessagesAsRead();

  useEffect(() => {
    if (selectedConversation && (selectedConversation?.unread_count ?? 0) > 0) {
      markAsReadMutation.mutate(conversationId);
    }
  }, [conversationId, selectedConversation, markAsReadMutation]);

  const contact = createContactFromData(selectedContact, selectedConversation);
  const conversation = createConversationFromData(selectedConversation);

  return (
    <div className="flex-1 flex overflow-hidden">
      {selectedConversation && contact && conversation ? (
        <div className="flex w-full overflow-hidden">
          {/* Chat Panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-card">
            {/* Toggle Contact Panel Button */}
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowContactPanel(!showContactPanel)}
                className="h-8 w-8 bg-card shadow-sm"
              >
                {showContactPanel ? (
                  <PanelRightClose className="h-4 w-4" />
                ) : (
                  <PanelRight className="h-4 w-4" />
                )}
              </Button>
            </div>

            <ChatPanel conversation={conversation} contact={contact} />
          </div>

          {/* Contact Details Panel */}
          {showContactPanel && (
            <div className="w-80 border-l border-border bg-card">
              <ContactDetails contact={contact} onContactUpdated={() => {}} />
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-card">
          <div className="text-center">
            <p className="text-muted-foreground">Cargando conversación...</p>
          </div>
        </div>
      )}
    </div>
  );
}
