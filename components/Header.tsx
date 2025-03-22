'use client';

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
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                >
                  <Link href="/about" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    About Us
                  </Link>
                  <Link href="/curated-products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Curated Products
                  </Link>
                  <Link href="/try-me" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Try Me
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* User Account */}
        <div className="ml-6 relative" ref={userDropdownRef}>
          <button
            onClick={toggleUserDropdown}
            className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
            </svg>
            <span className="ml-1 text-sm">Account</span>
          </button>

          <AnimatePresence>
            {showUserDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
              >
                <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  My Account
                </Link>
                <Link href="/account/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Login
                </Link>
                <Link href="/account/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Register
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cart */}
        <Link href="/cart" className="ml-4 flex items-center text-gray-700 hover:text-gray-900">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18ZM7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L21.16 4.96L19.42 4H19.41L18.31 6L15.55 11H8.53L8.4 10.73L6.16 6L5.21 4L4.27 2H1V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.29 15 7.17 14.89 7.17 14.75Z" fill="currentColor"/>
          </svg>
          <span className="ml-1 text-sm">Cart</span>
        </Link>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden flex items-center">
        <button
          onClick={toggleMobileMenu}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
        >
          <svg
            className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg
            className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>

  {/* Mobile menu */}
  <AnimatePresence>
    {isMobileMenuOpen && (
      <motion.div
        ref={mobileMenuRef}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="md:hidden bg-white border-t border-gray-200"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50">
            Image Creation
          </Link>
          <Link href="/how-to-guide" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
            How-To-Guide
          </Link>
          <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
            About Us
          </Link>
          <Link href="/curated-products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
            Curated Products
          </Link>
          <Link href="/try-me" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
            Try Me
          </Link>
          <Link href="/account" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
            My Account
          </Link>
          <Link href="/cart" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
            Cart
          </Link>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</header>
  );
};

export default Header;