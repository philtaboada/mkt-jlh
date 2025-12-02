'use server';
import { createClient } from '@/lib/supabase/server';
import { Conversation } from '../types/conversation';

interface PaginatedConversations {
  data: Conversation[];
  pagination: {
    pageIndex: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

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
): Promise<PaginatedConversations> {
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
        mkt_contacts (
          id,
          name,
          wa_id,
          last_interaction,
          avatar_url
        )
      `
    )
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateLastMessage(id: string) {
  const supabase = await createClient();
  await supabase.from('mkt_conversations').update({ last_message_at: new Date() }).eq('id', id);
}

// ============================================================================
// Conversation Counts for Sidebar
// ============================================================================

export interface ConversationCounts {
  inbox: number;
  mentions: number;
  starred: number;
  snoozed: number;
  archived: number;
  unread: number;
}

export async function getConversationCounts(): Promise<ConversationCounts> {
  const supabase = await createClient();

  // Get counts in parallel
  const [
    { count: inboxCount },
    { count: starredCount },
    { count: snoozedCount },
    { count: archivedCount },
    { count: unreadCount },
  ] = await Promise.all([
    // Inbox: open conversations
    supabase
      .from('mkt_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open'),

    // Starred conversations
    supabase
      .from('mkt_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('is_starred', true),

    // Snoozed conversations
    supabase
      .from('mkt_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'snoozed'),

    // Archived conversations
    supabase
      .from('mkt_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'archived'),

    // Unread conversations (has unread messages)
    supabase
      .from('mkt_conversations')
      .select('*', { count: 'exact', head: true })
      .gt('unread_count', 0),
  ]);

  // TODO: Implementar menciones cuando tengamos la tabla de menciones
  const mentionsCount = 0;

  return {
    inbox: inboxCount || 0,
    mentions: mentionsCount,
    starred: starredCount || 0,
    snoozed: snoozedCount || 0,
    archived: archivedCount || 0,
    unread: unreadCount || 0,
  };
}
