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

export interface ConversationFilters {
  status?: 'all' | 'open' | 'pending' | 'resolved' | 'snoozed';
  channel?: 'all' | string;
  sortBy?: 'newest' | 'oldest' | 'unread_first';
  searchQuery?: string;
}
export async function getConversations(
  pageIndex = 0,
  pageSize = 10,
  filters: ConversationFilters = {}
): Promise<PaginatedResponse<Conversation>> {
  const supabase = await createClient();

  const from = pageIndex * pageSize;
  const to = from + pageSize - 1;
  let query = supabase.from('mkt_conversations').select(
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
      `,
    { count: 'exact' }
  );

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters.channel && filters.channel !== 'all') {
    query = query.eq('channel_id', filters.channel);
  }

  if (filters.searchQuery?.trim()) {
    query = query.or(
      `mkt_contacts.name.ilike.%${filters.searchQuery}%,metadata->visitor_info->>name.ilike.%${filters.searchQuery}%`
    );
  }
  switch (filters.sortBy) {
    case 'oldest':
      query = query.order('last_message_at', { ascending: true });
      break;

    case 'unread_first':
      query = query
        .order('unread_count', { ascending: false })
        .order('last_message_at', { ascending: false });
      break;

    case 'newest':
    default:
      query = query.order('last_message_at', {
        ascending: false,
        nullsFirst: false,
      });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw error;
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    data: data ?? [],
    pagination: {
      pageIndex,
      pageSize,
      total,
      totalPages,
    },
  };
}

export async function findOrCreate(
  contactId: string,
  channel: string,
  channelId?: string
): Promise<Conversation> {
  const supabase = await createClient();

  let query = supabase
    .from('mkt_conversations')
    .select('*')
    .eq('contact_id', contactId)
    .eq('channel', channel)
    .eq('status', 'open');

  if (channelId) {
    query = query.eq('channel_id', channelId);
  }

  const { data: existing } = await query.single();

  if (existing) {
    return existing;
  }

  const insertData: any = {
    contact_id: contactId,
    channel: channel,
  };

  if (channelId) {
    insertData.channel_id = channelId;
  }

  const { data: newConversation, error } = await supabase
    .from('mkt_conversations')
    .insert(insertData)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return newConversation;
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

export async function updateConversationStatus(
  conversationId: string,
  status: 'open' | 'closed' | 'pending' | 'snoozed' | 'bot' | 'agent'
): Promise<Conversation> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_conversations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', conversationId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('mkt_conversations').delete().eq('id', conversationId);

  if (error) {
    throw error;
  }
}

/**
 * Marca una conversación como transferida a agente humano
 * Actualiza el metadata de la conversación con información del handoff
 */
export async function markConversationAsHandoff(conversationId: string): Promise<void> {
  const supabase = await createClient();

  // Obtener el metadata actual
  const { data: conversation, error: fetchError } = await supabase
    .from('mkt_conversations')
    .select('metadata')
    .eq('id', conversationId)
    .single();

  if (fetchError) {
    console.error('Error fetching conversation for handoff:', fetchError);
    throw fetchError;
  }

  if (!conversation) {
    console.warn(`Conversation ${conversationId} not found for handoff marking`);
    return;
  }

  const currentMetadata = (conversation.metadata as Record<string, unknown>) || {};

  const { error: updateError } = await supabase
    .from('mkt_conversations')
    .update({
      metadata: {
        ...currentMetadata,
        ai_handoff: true,
        ai_handoff_at: new Date().toISOString(),
      },
    })
    .eq('id', conversationId);

  if (updateError) {
    console.error('Error marking conversation as handoff:', updateError);
    throw updateError;
  }

  console.log(`✅ Conversación ${conversationId} marcada como transferida a agente`);
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
      status: params.status || 'open',
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

export async function enableIAForConversation(conversationId: string): Promise<Conversation> {
  const supabase = await createClient();
  const conversation = await getConversationById(conversationId);
  const { data, error } = await supabase
    .from('mkt_conversations')
    .update({
      ia_enabled: conversation.ia_enabled ? false : true,
    })
    .eq('id', conversationId)
    .select('*')
    .single();
  if (error) {
    throw error;
  }
  return data;
}

// Re-exportar tipos para conveniencia
export type { ConversationCounts } from '../types/api';
