'use client';

import { useState } from 'react';
import { useConversation } from '@/features/chat/hooks/useConversations';
import { ChatPanel } from '@/features/chat/components/ChatPanel';
import { ConversationsList } from '@/features/chat/components/ConversationsList';
import { ContactDetails } from '@/features/chat/components/ContactDetail';
import { Button } from '@/components/ui/button';
import { MessageCircle, Inbox, PanelRightClose, PanelRight } from 'lucide-react';
import type { Contact } from '@/features/chat/types/contact';
import type { Conversation } from '@/features/chat/types/conversation';
import { cn } from '@/lib/utils';

export function InboxView() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactPanel, setShowContactPanel] = useState(false);

  const { data: selectedConversation } = useConversation(selectedConversationId || '');

  // Create contact object from conversation data
  const contact: Contact | undefined = selectedConversation
    ? (() => {
        const mktName = selectedConversation.mkt_contacts?.name;
        const metadataName = selectedConversation.metadata?.visitor_info?.name;

        const normalizedMktName =
          typeof mktName === 'string' && mktName.trim() !== '' ? mktName : undefined;
        const normalizedMetadataName =
          typeof metadataName === 'string' && metadataName.trim() !== '' ? metadataName : undefined;

        if (selectedConversation.mkt_contacts?.id) {
          return {
            id: selectedConversation.mkt_contacts.id,
            name: normalizedMktName ?? 'Sin nombre',
            avatar_url: selectedConversation.mkt_contacts.avatar_url || undefined,
            wa_id: selectedConversation.mkt_contacts.wa_id,
            source: selectedConversation.channel,
          } as Contact;
        }

        return {
          id: selectedConversation.metadata?.visitor_id || selectedConversation.id,
          name: normalizedMetadataName ?? `Visitante Web`,
          avatar_url: undefined,
          source: selectedConversation.channel || 'website',
        } as Contact;
      })()
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
    <div className="flex h-full bg-background overflow-hidden">
      {/* Conversations Sidebar */}
      <ConversationsList
        onSelectConversation={setSelectedConversationId}
        selectedConversationId={selectedConversationId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        {selectedConversation && contact && conversation ? (
          <>
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
              <ChatPanel contact={contact} conversation={conversation} />
            </div>

            {/* Contact Details Panel - Collapsible */}
            <div
              className={cn(
                'border-l border-border bg-card transition-all duration-300 overflow-hidden',
                showContactPanel ? 'w-80' : 'w-0'
              )}
            >
              {showContactPanel && (
                <ContactDetails
                  contact={contact}
                  onContactUpdated={() => {}}
                  onClose={() => setShowContactPanel(false)}
                />
              )}
            </div>
          </>
        ) : (
          <InboxEmptyState />
        )}
      </div>
    </div>
  );
}

function InboxEmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-card">
      <div className="text-center max-w-md px-8">
        <div className="w-20 h-20 bg-primary/10 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <Inbox className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Bandeja de entrada</h3>
        <p className="text-muted-foreground mb-6">
          Selecciona una conversación del panel lateral para comenzar a responder mensajes
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <MessageCircle className="w-4 h-4" />
          <span>Todas las conversaciones en un solo lugar</span>
        </div>
      </div>
    </div>
  );
}
