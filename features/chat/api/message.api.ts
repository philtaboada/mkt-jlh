'use server';
import { createClient } from '@/lib/supabase/server';
import { Message } from '../types/message';

export async function create(conversationId: string, data: Partial<Message>): Promise<Message> {
  const supabase = await createClient();
  const {
    body,
    type,
    sender_type,
    sender_id,
    metadata,
    media_url,
    media_mime,
    media_size,
    media_name,
  } = data;

  const { data: newMessage, error } = await supabase
    .from('mkt_messages')
    .insert({
      conversation_id: conversationId,
      sender_type: sender_type || 'user',
      sender_id,
      type: type || 'text',
      body,
      media_url,
      media_mime,
      media_size,
      media_name,
      metadata,
      status: 'sent',
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  // Actualizar last_message_at en la conversación
  await supabase
    .from('mkt_conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  return newMessage;
}

export async function getMessagesByConversation(conversationId: string): Promise<Message[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  // Reverse to show oldest first
  return data.reverse();
}

/**
 * Obtiene el último mensaje de una conversación
 */
export async function getLastMessage(conversationId: string): Promise<Message | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No messages found
    throw error;
  }

  return data;
}

// ============================================================================
// Widget-specific functions
// ============================================================================

interface CreateWidgetMessageParams {
  conversationId: string;
  body: string;
  senderId: string;
  senderType: 'user' | 'bot' | 'agent';
  metadata?: Record<string, unknown>;
}

export async function createWidgetMessage(params: CreateWidgetMessageParams): Promise<Message> {
  const supabase = await createClient();

  const { data: message, error } = await supabase
    .from('mkt_messages')
    .insert({
      conversation_id: params.conversationId,
      body: params.body,
      sender_type: params.senderType,
      sender_id: params.senderId,
      type: 'text',
      status: 'sent',
      metadata: params.metadata,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating message:', error);
    throw error;
  }

  // Actualizar last_message_at en la conversación
  await supabase
    .from('mkt_conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', params.conversationId);

  return message;
}

interface GetMessagesAfterParams {
  conversationId: string;
  afterMessageId?: string;
}

export async function getMessagesAfter(params: GetMessagesAfterParams): Promise<Message[]> {
  const supabase = await createClient();

  let query = supabase
    .from('mkt_messages')
    .select('*')
    .eq('conversation_id', params.conversationId)
    .order('created_at', { ascending: true });

  // Si hay un último mensaje, solo obtener los nuevos
  if (params.afterMessageId) {
    const { data: lastMsg } = await supabase
      .from('mkt_messages')
      .select('created_at')
      .eq('id', params.afterMessageId)
      .single();

    if (lastMsg) {
      query = query.gt('created_at', lastMsg.created_at);
    }
  }

  const { data: messages, error } = await query;

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }

  return messages || [];
}

export async function createAutoReplyMessage(
  conversationId: string,
  body: string
): Promise<Message> {
  const supabase = await createClient();

  const { data: message, error } = await supabase
    .from('mkt_messages')
    .insert({
      conversation_id: conversationId,
      body,
      sender_type: 'bot',
      type: 'text',
      status: 'sent',
      metadata: { is_auto_reply: true },
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating auto-reply:', error);
    throw error;
  }

  return message;
}

// ============================================================================
// Read/Unread Functions
// ============================================================================

/**
 * Marca todos los mensajes de una conversación como leídos
 * y resetea el contador de no leídos
 */
export async function markMessagesAsRead(conversationId: string): Promise<void> {
  const supabase = await createClient();

  // Marcar todos los mensajes no leídos de esta conversación como leídos
  const { error: messagesError } = await supabase
    .from('mkt_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .is('read_at', null)
    .eq('sender_type', 'user'); // Solo marcar como leídos los mensajes del usuario

  if (messagesError) {
    console.error('Error marking messages as read:', messagesError);
    throw messagesError;
  }

  // Resetear el contador de no leídos en la conversación
  const { error: conversationError } = await supabase
    .from('mkt_conversations')
    .update({ unread_count: 0 })
    .eq('id', conversationId);

  if (conversationError) {
    console.error('Error resetting unread count:', conversationError);
    throw conversationError;
  }
}

/**
 * Obtiene el conteo de mensajes no leídos de una conversación
 */
export async function getUnreadCount(conversationId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('mkt_messages')
    .select('*', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)
    .is('read_at', null)
    .eq('sender_type', 'user');

  if (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }

  return count || 0;
}
