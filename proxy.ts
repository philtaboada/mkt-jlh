import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const protectedPaths = [
  '/dashboard',
  '/leads',
  '/prospects',
  '/companies',
  '/partnerships',
  '/activities',
  '/chat',
  '/chat/inbox',
  '/chat/conversations',
  '/chat/mentions',
  '/chat/settings/integrations',
  '/chat/settings/api-keys',
  '/analytics',
  '/calendar',
  '/settings',
];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[proxy] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Skipping Supabase client creation.'
      );
    }
  } else {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (
      !user &&
      protectedPaths.some(
        (p) => request.nextUrl.pathname === p || request.nextUrl.pathname.startsWith(p + '/')
      )
    ) {
      const loginUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (user && ['/auth/login', '/auth/register'].includes(request.nextUrl.pathname)) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/dashboard',
    '/leads',
    '/prospects',
    '/companies',
    '/partnerships',
    '/activities',
    '/chat',
    '/chat/inbox',
    '/chat/conversations',
    '/chat/mentions',
    '/chat/settings/integrations',
    '/chat/settings/api-keys',
    '/analytics',
    '/calendar',
    '/settings',
  ],
};
