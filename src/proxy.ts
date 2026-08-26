import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

const protectedRoutes = ['/profile', '/orders', '/checkout'];
const authRoutes = ['/login'];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isAuthRoute = authRoutes.some(route => path.startsWith(route));
  const session = request.cookies.get('session')?.value;
  let parsedSession = null;
  if (session) {
    try { parsedSession = await decrypt(session); } catch (e) {}
  }
  if (isProtectedRoute && !parsedSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (isAuthRoute && parsedSession) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};