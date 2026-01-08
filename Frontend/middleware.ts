import { NextRequest, NextResponse } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = [
  '/admin',
  '/employer-dashboard',
  '/profile',
  '/applications',
  '/saved',
  '/messages',
  '/settings',
];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Try multiple ways to get the token
    // 1. Check cookies first
    let token = request.cookies.get('auth_token')?.value;
    
    // 2. Check alternative cookie name
    if (!token) {
      token = request.cookies.get('token')?.value;
    }
    
    // 3. Check Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }
    
    // If still no token, redirect to login
    if (!token) {
      // Redirect to login page with return URL
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Token exists, allow access
    return NextResponse.next();
  }

  // Not a protected route, allow access
  return NextResponse.next();
}

// Configure which routes to apply middleware to
export const config = {
  matcher: [
    // Protect admin routes
    '/admin/:path*',
    '/employer-dashboard/:path*',
    '/profile/:path*',
    '/applications/:path*',
    '/saved/:path*',
    '/messages/:path*',
    '/settings/:path*',
  ],
};
