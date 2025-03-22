"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const moreDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Handle clicks outside of dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreDropdownRef.current && event.target instanceof Node && !(moreDropdownRef.current as Node).contains(event.target)) {
        setShowMoreDropdown(false);
      }
      if (userDropdownRef.current && event.target instanceof Node && !(userDropdownRef.current as Node).contains(event.target)) {
        setShowUserDropdown(false);
      }
      if (mobileMenuRef.current && event.target instanceof Node && !(mobileMenuRef.current as Node).contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMoreDropdown = () => {
    setShowMoreDropdown(!showMoreDropdown);
    // Close other dropdown when opening this one
    if (!showMoreDropdown) setShowUserDropdown(false);
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
    // Close other dropdown when opening this one
    if (!showUserDropdown) setShowMoreDropdown(false);
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center cursor-pointer"
              >
                <svg
                  preserveAspectRatio="xMidYMid meet"
                  viewBox="10 10 180 180"
                  height="40"
                  width="40"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2"
                >
                  <g>
                    <path d="M190 100l-27.182-27.182 26-26L182 40l-26 26-56-56-90 90 56 56-26 26 6.818 6.818 26-26L100 190l90-90zm-159.545 0L100 30.455l45.818 45.818-69.545 69.545L30.455 100zm122.181-17l17 17L100 169.545l-17-17L152.636 83z" fill="#000000"></path>
                  </g>
                </svg>
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl lg:text-3xl font-medium">BangBang</span>
                  <span className="text-xl md:text-2xl lg:text-3xl font-medium">Wallpaper</span>
                </div>
              </motion.div>
            </Link>
          </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center ml-auto">
        <nav className="bg-[rgba(238,232,216,1)] rounded-full px-6 py-3 flex items-center space-x-6">
          <Link href="/" className="text-sm lg:text-base font-bold hover:text-gray-700 transition-colors duration-200">Image Creation</Link>
          <Link href="/how-to-guide" className="text-sm lg:text-base hover:text-gray-700 transition-colors duration-200">How-To-Guide</Link>
          <div className="relative" ref={moreDropdownRef}>
            <button
              className="text-sm lg:text-base flex items-center hover:text-gray-700 transition-colors duration-200"
              onClick={toggleMoreDropdown}
            >
              <span>More</span>
              <svg width="16" height="16" viewBox="0 0 24 24" className="ml-1">
                <path d="M7 10l5 5 5-5z" fill="currentColor" />
              </svg>
            </button>

            <AnimatePresence>
              {showMoreDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 overflow-hidden"
                >
                  <div className="py-1">
                    <Link href="/about" className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-150">About Us</Link>
                    <Link href="/try-me" className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-150">Try Me</Link>
                    <Link href="/curated-products" className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-150">Curated Products</Link>
                    <Link href="/privacy-policy" className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-150">Privacy Policy</Link>
                    <Link href="/terms-conditions" className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-150">Terms & Conditions</Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </div>

      {/* User and Cart - Desktop */}
      <div className="hidden md:flex items-center ml-4">
        <div className="relative mr-4" ref={userDropdownRef}>
          <button
            className="flex items-center text-neutral-700 hover:text-gray-900 transition-colors duration-200"
            onClick={toggleUserDropdown}
          >
            <span className="mr-1">
              <svg data-bbox="0 0 50 50" data-type="shape" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 50 50"><g><path d="M25 48.077c-5.924 0-11.31-2.252-15.396-5.921 2.254-5.362 7.492-8.267 15.373-8.267 7.889 0 13.139 3.044 15.408 8.418-4.084 3.659-9.471 5.77-15.385 5.77m.278-35.3c4.927 0 8.611 3.812 8.611 8.878 0 5.21-3.875 9.456-8.611 9.456s-8.611-4.246-8.611-9.456c0-5.066 3.684-8.878 8.611-8.878M25 0C11.193 0 0 11.193 0 25c0 .915.056 1.816.152 2.705.032.295.091.581.133.873.085.589.173 1.176.298 1.751.073.338.169.665.256.997.135.515.273 1.027.439 1.529.114.342.243.675.37 1.01.18.476.369.945.577 1.406.149.331.308.657.472.98.225.446.463.883.714 1.313.182.312.365.619.56.922.272.423.56.832.856 1.237.207.284.41.568.629.841.325.408.671.796 1.02 1.182.22.244.432.494.662.728.405.415.833.801 1.265 1.186.173.154.329.325.507.475l.004-.011A24.886 24.886 0 0 0 25 50a24.881 24.881 0 0 0 16.069-5.861.126.126 0 0 1 .003.01c.172-.144.324-.309.49-.458.442-.392.88-.787 1.293-1.209.228-.232.437-.479.655-.72.352-.389.701-.78 1.028-1.191.218-.272.421-.556.627-.838.297-.405.587-.816.859-1.24a26.104 26.104 0 0 0 1.748-3.216c.208-.461.398-.93.579-1.406.127-.336.256-.669.369-1.012.167-.502.305-1.014.44-1.53.087-.332.183-.659.256-.996.126-.576.214-1.164.299-1.754.042-.292.101-.577.133-.872.095-.89.152-1.791.152-2.707C50 11.193 38.807 0 25 0" fill="currentColor"></path></g></svg>
            </span>
            <span>Account</span>
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
                  <Link href="/logout" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors duration-150">Logout</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link href="/cart" className="flex items-center text-neutral-700 hover:text-gray-900 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md text-gray-700 hover:text-gray-900 focus:outline-none"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
    </div>

    {/* Mobile Menu */}
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          ref={mobileMenuRef}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden w-full overflow-hidden bg-white border-t border-gray-200 mt-2"
        >
          <div className="px-4 py-3 space-y-3">
            <Link 
              href="/" 
              className="block py-2 px-3 text-base font-medium hover:bg-gray-100 rounded-md transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Image Creation
            </Link>
            <Link 
              href="/how-to-guide" 
              className="block py-2 px-3 text-base font-medium hover:bg-gray-100 rounded-md transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How-To-Guide
            </Link>
            <Link 
              href="/about" 
              className="block py-2 px-3 text-base font-medium hover:bg-gray-100 rounded-md transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link 
              href="/try-me" 
              className="block py-2 px-3 text-base font-medium hover:bg-gray-100 rounded-md transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Try Me
            </Link>
            <Link 
              href="/curated-products" 
              className="block py-2 px-3 text-base font-medium hover:bg-gray-100 rounded-md transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Curated Products
            </Link>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <Link 
                  href="/account?tab=account" 
                  className="flex items-center py-2 px-3 text-base font-medium hover:bg-gray-100 rounded-md transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg data-bbox="0 0 50 50" data-type="shape" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 50 50" className="mr-2"><g><path d="M25 48.077c-5.924 0-11.31-2.252-15.396-5.921 2.254-5.362 7.492-8.267 15.373-8.267 7.889 0 13.139 3.044 15.408 8.418-4.084 3.659-9.471 5.77-15.385 5.77m.278-35.3c4.927 0 8.611 3.812 8.611 8.878 0 5.21-3.875 9.456-8.611 9.456s-8.611-4.246-8.611-9.456c0-5.066 3.684-8.878 8.611-8.878M25 0C11.193 0 0 11.193 0 25c0 .915.056 1.816.152 2.705.032.295.091.581.133.873.085.589.173 1.176.298 1.751.073.338.169.665.256.997.135.515.273 1.027.439 1.529.114.342.243.675.37 1.01.18.476.369.945.577 1.406.149.331.308.657.472.98.225.446.463.883.714 1.313.182.312.365.619.56.922.272.423.56.832.856 1.237.207.284.41.568.629.841.325.408.671.796 1.02 1.182.22.244.432.494.662.728.405.415.833.801 1.265 1.186.173.154.329.325.507.475l.004-.011A24.886 24.886 0 0 0 25 50a24.881 24.881 0 0 0 16.069-5.861.126.126 0 0 1 .003.01c.172-.144.324-.309.49-.458.442-.392.88-.787 1.293-1.209.228-.232.437-.479.655-.72.352-.389.701-.78 1.028-1.191.218-.272.421-.556.627-.838.297-.405.587-.816.859-1.24a26.104 26.104 0 0 0 1.748-3.216c.208-.461.398-.93.579-1.406.127-.336.256-.669.369-1.012.167-.502.305-1.014.44-1.53.087-.332.183-.659.256-.996.126-.576.214-1.164.299-1.754.042-.292.101-.577.133-.872.095-.89.152-1.791.152-2.707C50 11.193 38.807 0 25 0" fill="currentColor"></path></g></svg>
                  My Account
                </Link>
                <Link 
                  href="/cart" 
                  className="flex items-center py-2 px-3 text-base font-medium hover:bg-gray-100 rounded-md transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  Cart
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
</header>
  );
};

export default Header;