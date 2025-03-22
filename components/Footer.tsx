'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="space-y-4 flex flex-col items-center md:items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <span className="ml-2 text-lg font-medium">Operations</span>
          </motion.div>
          {/* First column - Contact info */}
          <div className="text-sm sm:text-base space-y-2 ml-2 text-center md:text-left">
            <p className="text-gray-600">Mon - Fri, 8 am - 4 pm</p>
            <p className="text-lg font-bold mt-4">Information</p>
            <div className="space-y-2 flex flex-col items-center md:items-start">
              <p><Link href="/about" className="hover:underline transition-colors duration-200">About Us</Link></p>
              <p><Link href="/privacy-policy" className="hover:underline transition-colors duration-200">Privacy Policy</Link></p>
              <p><Link href="/terms-conditions" className="hover:underline transition-colors duration-200">Terms & Conditions</Link></p>
            </div>
          </div>
        </div>

        {/* Second column - Newsletter signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col justify-center items-center space-y-4"
        >
          <div className="font-medium text-lg sm:text-xl text-center">Join the Community</div>
          <div className="flex w-full max-w-xs">
            <input
              type="email"
              className="border-b-2 border-gray-300 px-4 py-2 text-sm w-full focus:outline-none focus:border-gray-800 transition-colors duration-200"
              placeholder="Email"
            />
          </div>
          <button className="border border-gray-300 rounded-md px-4 py-2 text-sm bg-white hover:bg-gray-50 transition-colors duration-200 w-full max-w-xs hover:shadow-sm">
            Sign Up
          </button>
        </motion.div>

        {/* Third column - Social links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center md:items-end"
        >
          <Link href="/write-to-us" className="flex items-center group">
            <span className="font-medium mr-2 text-lg sm:text-xl group-hover:text-gray-700 transition-colors duration-200">Write to US</span>
          </Link>
        </motion.div>
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-center mb-10"
      >
        <div className="flex flex-col items-center">
          <div className="mb-3">
            <svg
              preserveAspectRatio="xMidYMid meet"
              viewBox="10 10 180 180"
              height="50"
              width="50"
              xmlns="http://www.w3.org/2000/svg"
              className="hover:opacity-80 transition-opacity duration-200"
            >
              <g>
                <path d="M190 100l-27.182-27.182 26-26L182 40l-26 26-56-56-90 90 56 56-26 26 6.818 6.818 26-26L100 190l90-90zm-159.545 0L100 30.455l45.818 45.818-69.545 69.545L30.455 100zm122.181-17l17 17L100 169.545l-17-17L152.636 83z" fill="#000000"></path>
              </g>
            </svg>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-medium">BangBang</span>
            <span className="text-xl">Wallpaper</span>
          </div>
        </div>
      </motion.div>

      {/* Copyright */}
      <div className="text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} BangBang Wallpaper. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;