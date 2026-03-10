import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'bucketsai-secret-key-2026');
const COOKIE_NAME = 'bucketsai-session';

const PROTECTED = ['/', '/history', '/api/generate', '/api/download', '/api/history', '/admin', '/api/admin'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip auth routes and static files
  if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/verify-email') || pathname.startsWith('/setup-password') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password') || pathname.startsWith('/api/auth') || pathname.startsWith('/_next') || pathname.startsWith('/logo')) {
    return NextResponse.next();
  }

  // Check if path needs protection
  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (!needsAuth) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);

    // Admin routes require admin role
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      if (payload.role !== 'admin') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    return NextResponse.next();
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Sesion expirada' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
