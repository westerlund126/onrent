import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt'; 

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret });

  const isAuthenticated = !!token;

  const { pathname } = req.nextUrl;

  const publicPaths = ['/', '/auth/sign-in', '/auth/sign-up'];

  const isPublicPath = publicPaths.includes(pathname);

  if (isPublicPath && isAuthenticated) {
    // If user already signed in and tries to access sign-in/sign-up, redirect to dashboard
    return NextResponse.redirect(new URL('/admin/default', req.url));
  }

  if (!isPublicPath && !isAuthenticated) {
    // If user NOT signed in and tries to access protected routes, redirect to sign-in
    return NextResponse.redirect(new URL('/auth/sign-in', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/orders/:path*',
  ],
};
