'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllWallpapers } from '@/services/wallpaperService';

export default function CuratedProducts() {
  const router = useRouter();
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  useEffect(() => {
    const fetchWallpapers = async () => {
      try {
        const data = await getAllWallpapers() as any;
        setWallpapers(data);
      } catch (error) {
        console.error('Error fetching wallpapers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWallpapers();
  }, []);
  
  // Extract unique categories from wallpapers
  // const categories = ['All', ...new Set(wallpapers.map(w => w.primaryImagery).filter(Boolean))];
  
  // Filter wallpapers by selected category
  const filteredWallpapers = selectedCategory === 'All' 
    ? wallpapers 
    : wallpapers.filter((w : any) => w.primaryImagery === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2 text-center">Curated Wallpaper Collection</h1>
      <p className="text-center text-gray-600 mb-8">Professionally designed wallpapers ready to ship to your door</p>
      

      
      {/* Loading State */}
      {loading && (
        <div className="text-center py-10">
          <p>Loading wallpapers...</p>
        </div>
      )}
      
      {/* Empty State */}
      {!loading && filteredWallpapers.length === 0 && (
        <div className="text-center py-10">
          <p>No wallpapers found. Try a different category or check back later.</p>
        </div>
      )}
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {filteredWallpapers.map((wallpaper: any) => (
          <div 
            key={wallpaper.id} 
            className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/product/${wallpaper.id}`)}
          >
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
              {wallpaper.imageData && (
                <img 
                  src={wallpaper.imageData} 
                  alt={wallpaper.description || 'Wallpaper'}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-medium">{wallpaper.primaryImagery || 'Custom'}</div>
              {wallpaper.userId && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 text-xs">
                  <p className="font-medium">Created by: {wallpaper.userId}</p>
                  <p className="truncate">{wallpaper.description}</p>
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{wallpaper.description || 'Custom Wallpaper'}</h3>
              <p className="text-gray-500 text-sm mb-2">{wallpaper.size || 'Standard size'}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold">${wallpaper.price.toFixed(2)}</span>
                <button 
                  className="bg-gray-800 text-white px-3 py-1 rounded text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Here you would add the wallpaper to cart
                    alert(`Added ${wallpaper.description || 'Custom Wallpaper'} to cart!`);
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