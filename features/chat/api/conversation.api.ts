'use server';

import { createClient } from '@/lib/supabase/server';
import { Conversation } from '../types/conversation';
import {
  PaginatedResponse,
  ConversationCounts,
  FindWidgetConversationParams,
  CreateWidgetConversationParams,
} from '../types/api';
import { findOrCreateByEmail } from './contact.api';

// ============================================================================
// Core Conversation Functions
// ============================================================================

export async function findOrCreate(contactId: string, channel: string): Promise<Conversation> {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('mkt_conversations')
    .select('*')
    .eq('contact_id', contactId)
    .eq('channel', channel)
    .eq('status', 'open')
    .single();

  if (existing) {
    return existing;
  }

  const { data: newConversation, error } = await supabase
    .from('mkt_conversations')
    .insert({
      contact_id: contactId,
      channel: channel,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return newConversation;
}

export async function getConversations(
  pageIndex = 0,
  pageSize = 10
): Promise<PaginatedResponse<Conversation>> {
  const supabase = await createClient();

  // Get total count
  const { count } = await supabase
    .from('mkt_conversations')
    .select('*', { count: 'exact', head: true });

  // Get paginated data
  const from = pageIndex * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('mkt_conversations')
    .select(
      `
        *,
        mkt_contacts (
          id,
          name,
          wa_id,
          last_interaction,
          avatar_url
        ),
        mkt_channels (
          id,
          name,
          type
        )
      `
    )
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    data: data || [],
    pagination: {
      pageIndex,
      pageSize,
      total,
      totalPages,
    },
  };
}

export async function getConversationById(id: string): Promise<Conversation> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_conversations')
    .select(
      `
        *,
        mkt_contacts (*)
      `
    )
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateLastMessage(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from('mkt_conversations').update({ last_message_at: new Date() }).eq('id', id);
}

export async function updateConversationContact(
  conversationId: string,
  contactId: string
): Promise<Conversation> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_conversations')
    .update({ contact_id: contactId })
    .eq('id', conversationId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// ============================================================================
// Conversation Counts
// ============================================================================

export async function getConversationCounts(): Promise<ConversationCounts> {
  const supabase = await createClient();

  const [
    { count: inboxCount },
    { count: starredCount },
    { count: snoozedCount },
    { count: archivedCount },
    { count: unreadCount },
  ] = await Promise.all([
    supabase
      .from('mkt_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open'),
    supabase
      .from('mkt_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('is_starred', true),
    supabase
      .from('mkt_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'snoozed'),
    supabase
      .from('mkt_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'archived'),
    supabase
      .from('mkt_conversations')
      .select('*', { count: 'exact', head: true })
      .gt('unread_count', 0),
  ]);

  return {
    inbox: inboxCount || 0,
    mentions: 0, // TODO: Implementar cuando tengamos la tabla de menciones
    starred: starredCount || 0,
    snoozed: snoozedCount || 0,
    archived: archivedCount || 0,
    unread: unreadCount || 0,
  };
}

// ============================================================================
// Widget-specific Functions
// ============================================================================

export async function findWidgetConversation(
  params: FindWidgetConversationParams
): Promise<Pick<Conversation, 'id' | 'created_at' | 'last_message_at'> | null> {
  const supabase = await createClient();

  const { data: conversations, error } = await supabase
    .from('mkt_conversations')
    .select('id, created_at, last_message_at')
    .eq('channel_id', params.channelId)
    .eq('status', 'open')
    .filter('metadata->>visitor_id', 'eq', params.visitorId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error finding conversation:', error);
    throw error;
  }

  return conversations?.[0] || null;
}

export async function createWidgetConversation(
  params: CreateWidgetConversationParams
): Promise<Conversation> {
  const supabase = await createClient();

  // Si hay email, buscar o crear contacto usando la función reutilizable
  let contactId: string | null = null;

  if (params.visitorInfo?.email) {
    const contact = await findOrCreateByEmail(
      params.visitorInfo.email,
      params.visitorInfo.name,
      params.visitorInfo.phone,
      'website_widget'
    );
    contactId = contact.id;
  }

  const { data: newConversation, error } = await supabase
    .from('mkt_conversations')
    .insert({
      channel_id: params.channelId,
      channel: 'website',
      contact_id: contactId,
      status: 'open',
      // priority: 'medium',
      metadata: {
        visitor_id: params.visitorId,
        visitor_info: params.visitorInfo,
        user_agent: params.userAgent,
        origin: params.origin,
      },
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }

  return newConversation;
}

export async function findOrCreateWidgetConversation(
  params: CreateWidgetConversationParams
): Promise<Conversation | Pick<Conversation, 'id' | 'created_at' | 'last_message_at'>> {
  const existing = await findWidgetConversation({
    channelId: params.channelId,
    visitorId: params.visitorId,
  });

  if (existing) return existing;

  return createWidgetConversation(params);
}

// Re-exportar tipos para conveniencia
export type { ConversationCounts } from '../types/api';
