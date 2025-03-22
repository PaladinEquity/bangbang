'use client';

import React from 'react';
import Link from 'next/link';

export default function MyOrdersContent() {
  // Empty orders state
  const orders = [];

  return (
    <>
      <p className="text-sm text-gray-600 mb-8">View your order history or check the status of a recent order.</p>
      
      <div className="text-center py-12">
        <p className="text-lg mb-6">You haven't placed any orders yet.</p>
        <Link 
          href="/" 
          className="bg-black text-white px-6 py-3 rounded text-sm hover:bg-gray-800 transition-colors inline-block"
        >
          Start Browsing
        </Link>
      </div>
    </>
  );
}