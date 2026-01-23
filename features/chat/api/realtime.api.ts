import { createClient } from '@/lib/supabase/client';

export function createChatChannel() {
  const supabase = createClient();

  return supabase.channel('chat-realtime');
}
