import type { Contact } from '@/features/chat/types/contact';
import type { Conversation } from '@/features/chat/types/conversation';

export function createContactFromData(
  selectedContact: any,
  selectedConversation: any
): Contact | undefined {
  if (selectedContact) {
    return {
      id: selectedContact.id,
      name: selectedContact.name || 'Contacto',
      email: selectedContact.email,
      phone: selectedContact.phone,
      avatar_url: selectedContact.avatar_url,
      source: selectedContact.source || 'unknown',
      created_at: selectedContact.created_at,
      updated_at: selectedContact.updated_at,
    };
  }

  if (selectedConversation) {
    const visitorInfo = selectedConversation.metadata?.visitor_info as any;
    const normalizedMetadataName =
      visitorInfo?.name ||
      visitorInfo?.email ||
      visitorInfo?.phone ||
      selectedConversation.metadata?.visitor_id;
    return {
      id: selectedConversation.metadata?.visitor_id || selectedConversation.id,
      name: normalizedMetadataName ?? `Visitante Web`,
      avatar_url: undefined,
      source: selectedConversation.channel || 'website',
    } as Contact;
  }

  return undefined;
}

export function createConversationFromData(selectedConversation: any): Conversation | undefined {
  if (!selectedConversation) return undefined;

  return {
    id: selectedConversation.id,
    contact_id: selectedConversation.contact_id,
    channel_id: selectedConversation.channel_id,
    channel: selectedConversation.channel,
    status: selectedConversation.status,
    assigned_to: selectedConversation.assigned_to,
    last_message_at: selectedConversation.last_message_at,
    created_at: selectedConversation.created_at,
    updated_at: selectedConversation.updated_at,
  };
}
