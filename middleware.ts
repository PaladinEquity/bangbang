import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Define protected routes that require authentication
const protectedRoutes = [
  '/account',
  '/cart',
];

// Function to check if a route is protected
function isProtectedRoute(path: string): boolean {
  return protectedRoutes.some(route => path.startsWith(route));
}

// Middleware function to handle authentication
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  // Skip authentication check for non-protected routes or login/register pages
  if (!isProtectedRoute(path) || !isProtectedPath(path)) {
    return NextResponse.next();
  }

  // For protected routes, check if user is authenticated
  // This is a simple check - in a real app, you would verify the token
  const authCookie = request.cookies.get('amplify-authenticator-authState');
  const isAuthenticated = authCookie?.value === 'signedIn';

  // If not authenticated and trying to access a protected route, redirect to login
  if (!isAuthenticated) {
    const url = new URL('/account/login', request.url);
    // Add a redirect parameter to return to the original page after login
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure middleware to run only on protected routes
export const config = {
  matcher: [
    // Only include specific protected routes
    '/account/:path*',
    '/cart/:path*',
  ],
};

// Exclude login and register pages from the matcher
export function isProtectedPath(path: string): boolean {
  // Don't apply middleware to login/register pages
  if (path.includes('/account/login') || path.includes('/account/register') || path.includes('/account/forgot-password') ||  path.includes('/account/reset-password')) {
    return false;
  }
  return true;
}