import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabase/client] Missing NEXT_PUBLIC_SUPABASE_URL or PUBLISHABLE/ANON key. Make sure env vars are set.'
  );
}

const isBrowser = typeof window !== 'undefined';
const persistSessionEnv = process.env.NEXT_PUBLIC_SUPABASE_PERSIST_SESSION;
const persistSession = persistSessionEnv ? persistSessionEnv === 'true' : true;

const supabaseClient = createSupabaseClient<Database>(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    persistSession: isBrowser ? persistSession : false,
  },
});

export function createClient() {
  return supabaseClient;
}

export { supabaseClient };
