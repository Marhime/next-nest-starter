import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  console.log('🔥 Middleware triggered for:', request.url);
  console.log('🔥 Pathname:', request.nextUrl.pathname);

  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('better-auth.session_token');

  // Auth routes - redirect if already connected (match /auth/* with or without locale)
  const isAuthRoute = pathname.match(/^\/([a-z]{2}\/)?auth\//);

  if (isAuthRoute && sessionCookie) {
    console.log('🔄 Auth route detected with active session, verifying...');

    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
      const res = await fetch(`${backendUrl}/api/auth/get-session`, {
        headers: {
          cookie: `better-auth.session_token=${sessionCookie.value}`,
        },
      });

      if (res.status === 200) {
        const sessionData = await res.json();
        console.log('✅ User is connected, redirecting to dashboard');

        // Redirect to dashboard if ADMIN, otherwise to home
        const redirectUrl =
          sessionData.user.role === 'ADMIN' ? '/dashboard' : '/';
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    } catch (error) {
      console.error('❌ Error verifying session for auth route:', error);
      // Continue to auth page if session verification fails
    }
  }

  // Protected routes - match /dashboard/* with or without locale
  const isDashboardRoute = pathname.match(/^\/([a-z]{2}\/)?dashboard/);

  if (isDashboardRoute) {
    console.log('🔒 Protected route detected');

    if (!sessionCookie) {
      console.log('❌ No session cookie found, redirecting to home');
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Verify the session with your backend
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
      const res = await fetch(`${backendUrl}/api/auth/get-session`, {
        headers: {
          cookie: `better-auth.session_token=${sessionCookie.value}`,
        },
      });

      if (res.status !== 200) {
        console.log('❌ Session invalid, redirecting to home');
        return NextResponse.redirect(new URL('/', request.url));
      }

      const sessionData = await res.json();
      console.log('✅ Session Data:', sessionData);

      // Check role for dashboard - only ADMIN can access
      if (sessionData.user.role !== 'ADMIN') {
        console.log('❌ User is not ADMIN, redirecting to home');
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      console.error('❌ Error verifying session:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Continue with i18n middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
