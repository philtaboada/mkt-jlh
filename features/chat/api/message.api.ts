'use server';
import { createClient } from '@/lib/supabase/server';
import { Message } from '../types/message';

export async function create(conversationId: string, data: Partial<Message>): Promise<Message> {
  const supabase = await createClient();
  const { body, type, sender_id, metadata, media_url, media_mime, media_size, media_name } = data;

  const { data: newMessage, error } = await supabase
    .from('mkt_messages')
    .insert({
      conversation_id: conversationId,
      sender_type: 'user',
      sender_id,
      type,
      body,
      media_url,
      media_mime,
      media_size,
      media_name,
      metadata,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

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
