'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CuratedProducts() {
  const router = useRouter();
  // Sample product data - in a real application, this would come from an API or database
  const products = [
    { id: 1, name: 'Tropical Paradise', price: 49.99, category: 'Nature' },
    { id: 2, name: 'Urban Geometry', price: 59.99, category: 'Abstract' },
    { id: 3, name: 'Vintage Florals', price: 45.99, category: 'Floral' },
    { id: 4, name: 'Minimalist Lines', price: 39.99, category: 'Minimalist' },
    { id: 5, name: 'Bohemian Dreams', price: 54.99, category: 'Bohemian' },
    { id: 6, name: 'Art Deco Elegance', price: 64.99, category: 'Art Deco' },
    { id: 7, name: 'Watercolor Wonders', price: 49.99, category: 'Artistic' },
    { id: 8, name: 'Geometric Patterns', price: 44.99, category: 'Geometric' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2 text-center">Curated Wallpaper Collection</h1>
      <p className="text-center text-gray-600 mb-8">Professionally designed wallpapers ready to ship to your door</p>
      
      {/* Filters */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          <button className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm">All Designs</button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm">Nature</button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm">Abstract</button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm">Floral</button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm">Geometric</button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm">Minimalist</button>
        </div>
      </div>
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/product/${product.id}`)}
          >
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 relative">
              <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-medium">{product.category}</div>
            </div>
            
            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{product.name}</h3>
              <p className="text-gray-500 text-sm mb-2">Pre-designed wallpaper</p>
              <div className="flex justify-between items-center">
                <span className="font-bold">${product.price}</span>
                <button 
                  className="bg-gray-800 text-white px-3 py-1 rounded text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Added ${product.name} to cart!`);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Features */}
      <div className="bg-gray-50 p-6 rounded-lg mb-10">
        <h2 className="text-xl font-semibold mb-4 text-center">Why Choose Our Curated Collection</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="font-bold mb-2">Professional Design</div>
            <p className="text-sm text-gray-600">Created by our team of experienced designers with an eye for style and quality</p>
          </div>
          <div className="text-center">
            <div className="font-bold mb-2">Premium Materials</div>
            <p className="text-sm text-gray-600">Printed on high-quality, durable wallpaper that's easy to install and maintain</p>
          </div>
          <div className="text-center">
            <div className="font-bold mb-2">Ready to Ship</div>
            <p className="text-sm text-gray-600">No waiting for custom designs - our curated collection ships within 2 business days</p>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-3">Want something completely unique?</h2>
        <p className="mb-4">Try our custom wallpaper creator to design your own personalized wallpaper</p>
        <Link 
          href="/"
          className="bg-gray-800 text-white px-6 py-3 rounded inline-block hover:bg-gray-700 transition-colors"
        >
          Create Your Own Design
        </Link>
      </div>
    </div>
  );
}