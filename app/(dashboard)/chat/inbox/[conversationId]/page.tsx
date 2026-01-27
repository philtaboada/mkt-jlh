'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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

export default function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [showContactPanel, setShowContactPanel] = useState(false);

  const { setActiveConversationId } = useChatStore();
  const { data: selectedConversation } = useConversation(conversationId);
  const markAsReadMutation = useMarkMessagesAsRead();

  useEffect(() => {
    if (conversationId) {
      setActiveConversationId(conversationId);
    }

    return () => {
      setActiveConversationId(null);
    };
  }, [conversationId, setActiveConversationId]);

  useEffect(() => {
    if (conversationId && selectedConversation && (selectedConversation.unread_count ?? 0) > 0) {
      markAsReadMutation.mutate(conversationId);
    }
  }, [conversationId, selectedConversation?.id]);

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-card">
        <p className="text-muted-foreground">Cargando conversación...</p>
      </div>
    );
  }

  const contact = createContactFromData(selectedConversation.mkt_contacts, selectedConversation);

  const conversation = createConversationFromData(selectedConversation);

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex w-full overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden bg-card">
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowContactPanel((v) => !v)}
              className="h-8 w-8 bg-card shadow-sm"
            >
              {showContactPanel ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelRight className="h-4 w-4" />
              )}
            </Button>
          </div>

          <ChatPanel conversation={conversation!} contact={contact!} />
        </div>

        {showContactPanel && (
          <div className="w-80 border-l border-border bg-card">
            <ContactDetails contact={contact!} onContactUpdated={() => {}} />
          </div>
        )}
      </div>
    </div>
  );
}
