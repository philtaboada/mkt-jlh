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
    .order('created_at', { ascending: true });

  if (error) {
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
