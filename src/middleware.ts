import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function validateToken(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname === '/') {
    return NextResponse.next();
  }
  
  const authCookie = request.cookies.get('pb_auth')?.value;
  
  if (!authCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    const authData = JSON.parse(decodeURIComponent(authCookie));
    if (!authData.token || !validateToken(authData.token)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico).*)'],
};
