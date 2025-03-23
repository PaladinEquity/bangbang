'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';

interface AuthButtonsProps {
  isMobile?: boolean;
  closeMobileMenu?: () => void;
}

const AuthButtons = ({ isMobile = false, closeMobileMenu }: AuthButtonsProps) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = React.useRef<HTMLDivElement>(null);

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  // Handle logout
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    setShowUserDropdown(false);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center text-neutral-700 animate-pulse">
        <div className="h-8 w-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // If user is authenticated, show account dropdown
  if (isAuthenticated && user) {
    return (
      <div className="relative" ref={userDropdownRef}>
        <button
          className="flex items-center text-neutral-700 hover:text-gray-900 transition-colors duration-200"
          onClick={toggleUserDropdown}
        >
          <span className="mr-1">
            <svg data-bbox="0 0 50 50" data-type="shape" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 50 50"><g><path d="M25 48.077c-5.924 0-11.31-2.252-15.396-5.921 2.254-5.362 7.492-8.267 15.373-8.267 7.889 0 13.139 3.044 15.408 8.418-4.084 3.659-9.471 5.77-15.385 5.77m.278-35.3c4.927 0 8.611 3.812 8.611 8.878 0 5.21-3.875 9.456-8.611 9.456s-8.611-4.246-8.611-9.456c0-5.066 3.684-8.878 8.611-8.878M25 0C11.193 0 0 11.193 0 25c0 .915.056 1.816.152 2.705.032.295.091.581.133.873.085.589.173 1.176.298 1.751.073.338.169.665.256.997.135.515.273 1.027.439 1.529.114.342.243.675.37 1.01.18.476.369.945.577 1.406.149.331.308.657.472.98.225.446.463.883.714 1.313.182.312.365.619.56.922.272.423.56.832.856 1.237.207.284.41.568.629.841.325.408.671.796 1.02 1.182.22.244.432.494.662.728.405.415.833.801 1.265 1.186.173.154.329.325.507.475l.004-.011A24.886 24.886 0 0 0 25 50a24.881 24.881 0 0 0 16.069-5.861.126.126 0 0 1 .003.01c.172-.144.324-.309.49-.458.442-.392.88-.787 1.293-1.209.228-.232.437-.479.655-.72.352-.389.701-.78 1.028-1.191.218-.272.421-.556.627-.838.297-.405.587-.816.859-1.24a26.104 26.104 0 0 0 1.748-3.216c.208-.461.398-.93.579-1.406.127-.336.256-.669.369-1.012.167-.502.305-1.014.44-1.53.087-.332.183-.659.256-.996.126-.576.214-1.164.299-1.754.042-.292.101-.577.133-.872.095-.89.152-1.791.152-2.707C50 11.193 38.807 0 25 0" fill="currentColor"></path></g></svg>
          </span>
          <span>{user.attributes?.given_name || user.name || 'Account'}</span>
        </button>

        <AnimatePresence>
          {showUserDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 overflow-hidden"
            >
              <div className="py-1">
                <Link href="/account?tab=account" className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-150">My Account</Link>
                <Link href="/account?tab=orders" className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-150">My Orders</Link>
                <Link href="/account?tab=addresses" className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-150">My Addresses</Link>
                <Link href="/account?tab=wallet" className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-150">My Wallet</Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors duration-150"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // If user is not authenticated, show only login button
  return (
    <div className="flex items-center">
      <Link 
        href="/account/login"
        className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md transition-colors duration-200"
        onClick={isMobile && closeMobileMenu ? closeMobileMenu : undefined}
      >
        Login
      </Link>
    </div>
  );
};

export default AuthButtons;