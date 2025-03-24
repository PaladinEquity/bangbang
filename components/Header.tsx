"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './auth/AuthContext';
import AuthButtons from './auth/AuthButtons';

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
          {/* Mobile Menu Button - Positioned at top right */}
          <div className="md:hidden flex items-center order-last ml-auto">
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

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center cursor-pointer focus:outline-none"
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
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 overflow-hidden focus:outline-none"
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
            {/* Use the auth context to determine if user is logged in */}
            <AuthButtons />

            <Link href="/cart" className="flex items-center text-neutral-700 hover:text-gray-900 transition-colors duration-200 ml-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button is now positioned at the top right */}
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
            className="md:hidden w-full overflow-hidden bg-white border-t border-gray-200 mt-2 focus:outline-none"
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
                {/* Mobile Auth Buttons */}
                <div className="mb-4">
                  <AuthButtons isMobile={true} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
                </div>
                <Link
                  href="/cart"
                  className="flex py-2 px-3 text-base font-medium hover:bg-gray-100 rounded-md transition-colors duration-200"
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
          </motion.div>
        )}
      </AnimatePresence>
      {/* </div> */}
    </header >
  );
};

export default Header;