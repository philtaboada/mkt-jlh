'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useConversation } from '@/features/chat/hooks/useConversations';
import { useContact } from '@/features/chat/hooks/useContacts';
import { useMarkMessagesAsRead } from '@/features/chat/hooks/useMessages';
import { ChatPanel } from '@/features/chat/components/chat/messages';
import { ConversationsList } from '@/features/chat/components/chat/conversations';
import { ContactDetails } from '@/features/chat/components/ContactDetail';
import { Button } from '@/components/ui/button';
import { MessageCircle, Inbox, PanelRightClose, PanelRight } from 'lucide-react';
import type { Contact } from '@/features/chat/types/contact';
import type { Conversation } from '@/features/chat/types/conversation';
import { cn } from '@/lib/utils';

interface InboxViewProps {
  initialConversationId?: string;
}

export function InboxView({ initialConversationId }: InboxViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactPanel, setShowContactPanel] = useState(false);

  const resolvedConversationId: string | null =
    selectedConversationId ?? searchParams.get('conversation') ?? initialConversationId ?? null;
  const isConversationIdValid = Boolean(
    resolvedConversationId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        resolvedConversationId
      )
  );
  const safeConversationId: string =
    isConversationIdValid && resolvedConversationId ? resolvedConversationId : '';
  const { data: selectedConversation } = useConversation(safeConversationId);
  const selectedContactId: string =
    selectedConversation?.mkt_contacts?.id || selectedConversation?.contact_id || '';
  const { data: selectedContact } = useContact(selectedContactId);
  const markAsReadMutation = useMarkMessagesAsRead();

  // Marcar mensajes como leídos cuando se selecciona una conversación
  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      setSelectedConversationId(conversationId);
      // Update URL with conversation ID in path
      router.push(`/chat/inbox/${conversationId}`);
    },
    [router]
  );

  // Efecto para marcar como leído después de seleccionar la conversación
  useEffect(() => {
    if (
      resolvedConversationId &&
      selectedConversation?.unread_count &&
      selectedConversation.unread_count > 0 &&
      !markAsReadMutation.isPending
    ) {
      // Pequeño delay para asegurar que el usuario realmente está viendo la conversación
      const timer = setTimeout(() => {
        markAsReadMutation.mutate(resolvedConversationId);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [resolvedConversationId, selectedConversation?.unread_count, markAsReadMutation]);
  
  useEffect(() => {
    setShowContactPanel(false);
  }, [resolvedConversationId]);

  // Create contact object from conversation data
  const contact: Contact | undefined = selectedConversation
    ? (() => {
        const mktName = selectedConversation.mkt_contacts?.name;
        const metadataName = selectedConversation.metadata?.visitor_info?.name;

        const normalizedMktName =
          typeof mktName === 'string' && mktName.trim() !== '' ? mktName : undefined;
        const normalizedMetadataName =
          typeof metadataName === 'string' && metadataName.trim() !== '' ? metadataName : undefined;

        // Use full contact object if it exists
        const resolvedContact = selectedConversation.mkt_contacts?.id
          ? selectedConversation.mkt_contacts
          : selectedContact?.id
            ? selectedContact
            : undefined;
        if (resolvedContact) {
          return {
            ...resolvedContact,
            name: normalizedMktName ?? resolvedContact.name ?? 'Sin nombre',
            source: resolvedContact.source || selectedConversation.channel,
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
        onSelectConversation={handleSelectConversation}
        selectedConversationId={resolvedConversationId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        {selectedConversation && contact && conversation ? (
          <div
            className="flex w-full overflow-hidden"
          >
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
                  conversationId={resolvedConversationId || undefined}
                  onContactUpdated={() => {}}
                  onClose={() => setShowContactPanel(false)}
                />
              )}
            </div>
          </div>
        ) : (
          <InboxEmptyState />
        )}
      </div>
    </div>
  );
}

function InboxEmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-muted/30 backdrop-blur-sm">
      <div className="text-center max-w-md px-12 py-16 bg-background rounded-3xl shadow-xl border border-border/50 animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-primary/10 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-inner">
          <Inbox className="w-12 h-12 text-primary animate-bounce-slow" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
          Bandeja de entrada
        </h3>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Selecciona una conversación del panel lateral para comenzar a
          gestionar tus mensajes en tiempo real.
        </p>
        <div className="inline-flex items-center justify-center gap-2.5 px-4 py-2 bg-muted rounded-full text-xs font-bold text-muted-foreground uppercase tracking-widest shadow-sm">
          <MessageCircle className="w-4 h-4 text-primary" />
          <span>Omnicanalidad activa</span>
        </div>
      </div>
    </div>
  );
}
