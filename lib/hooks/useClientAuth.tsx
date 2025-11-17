'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function useClientAuth() {
  const router = useRouter();
  const supabase: any = createClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function check() {
      let redirected = false;
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        const session = data?.session;
        if (!session) {
          redirected = true;
          router.replace('/auth/login');
        }
      } catch (err) {
        redirected = true;
        router.replace('/auth/login');
      } finally {
        if (mounted && !redirected) setLoading(false);
      }
    }
    check();
    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  return { loading };
}
