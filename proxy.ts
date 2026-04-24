import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnProtectedRoute = 
    req.nextUrl.pathname.startsWith('/admin') ||
    req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/settings') ||
    req.nextUrl.pathname.startsWith('/profile') ||
    req.nextUrl.pathname.startsWith('/billing');

  if (isOnProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/billing/:path*',
  ],
};
