'use server';
import { createClient } from '@/lib/supabase/server';

export async function create(conversationId: string, data: any) {
  const supabase = await createClient();
  const { body, type, senderId, metadata, mediaUrl, mediaMime, mediaSize, mediaName } = data;

  return await supabase.from('mkt_messages').insert({
    conversation_id: conversationId,
    sender_type: 'user',
    sender_id: senderId,
    type,
    body,
    media_url: mediaUrl,
    media_mime: mediaMime,
    media_size: mediaSize,
    media_name: mediaName,
    metadata,
  });
}

export async function getMessagesByConversation(conversationId: string) {
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
