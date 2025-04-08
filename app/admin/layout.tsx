'use client';

import { useState,useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';

import { isUserAdmin } from '@/services/adminService';

// Admin role check - now checks if user is in ADMINS group
const isAdmin = async (user: any) => {
  // Check if user exists
  if (!user) return false;
  
  // Check if user is in ADMINS group
  return await isUserAdmin(user.username || user.userId);
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    // Check if user is admin when user changes
    const checkAdminStatus = async () => {
      if (!isLoading && isAuthenticated && user) {
        const adminStatus = await isAdmin(user);
        setIsAdminUser(adminStatus);
        
        if (!adminStatus) {
          // Redirect non-admin users away from admin pages
          router.push('/auth/login?redirect=/admin');
        }
      } else if (!isLoading && !isAuthenticated) {
        // Redirect unauthenticated users
        router.push('/auth/login');
      }
    };
    
    checkAdminStatus();
  }, [isLoading, isAuthenticated, user, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // If not authenticated or not admin, don't render anything (will redirect)
  if (!isAuthenticated || !isAdminUser) {
    return null;
  }

  // This layout completely replaces the root layout for admin pages
  // No Header or Footer components from the root layout will be rendered
  return (
    <html lang="en">
      <body className="bg-neutral-50">
        <Toaster position="top-center" />
        <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 z-50"></div>
        
        <div className="flex min-h-screen bg-gray-100">
          {/* Admin Sidebar */}
          <div className="w-64 bg-white shadow-md h-screen sticky top-0">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-purple-600">Admin Panel</h2>
            </div>
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link href="/admin" className="block p-2 rounded hover:bg-purple-50 hover:text-purple-600 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/admin/users" className="block p-2 rounded hover:bg-purple-50 hover:text-purple-600 transition-colors">
                    User Management
                  </Link>
                </li>
                <li>
                  <Link href="/admin/products" className="block p-2 rounded hover:bg-purple-50 hover:text-purple-600 transition-colors">
                    Product Management
                  </Link>
                </li>
                <li>
                  <Link href="/admin/orders" className="block p-2 rounded hover:bg-purple-50 hover:text-purple-600 transition-colors">
                    Order Management
                  </Link>
                </li>
                <li>
                  <Link href="/admin/analytics" className="block p-2 rounded hover:bg-purple-50 hover:text-purple-600 transition-colors">
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link href="/admin/settings" className="block p-2 rounded hover:bg-purple-50 hover:text-purple-600 transition-colors">
                    Settings
                  </Link>
                </li>
                <li className="mt-8">
                  <Link href="/" className="block p-2 rounded hover:bg-purple-50 hover:text-purple-600 transition-colors">
                    Back to Site
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}