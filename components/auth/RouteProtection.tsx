'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';

type RouteProtectionProps = {
  children: ReactNode;
  requireAuth?: boolean;
  isAuthPage?: boolean;
};

export default function RouteProtection({
  children,
  requireAuth = false,
  isAuthPage = false,
}: RouteProtectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Redirect authenticated users away from auth pages
      if (isAuthenticated && isAuthPage) {
        router.replace('/account');
        return;
      }

      // Redirect unauthenticated users away from protected pages
      if (!isAuthenticated && requireAuth) {
        const returnUrl = encodeURIComponent(pathname);
        router.replace(`/auth/login?redirect=${returnUrl}`);
        return;
      }
    }
  }, [isAuthenticated, isLoading, isAuthPage, requireAuth, router, pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // Don't render protected content for unauthenticated users
  if (!isLoading && requireAuth && !isAuthenticated) {
    return null;
  }

  // Don't render auth pages for authenticated users
  if (!isLoading && isAuthPage && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}