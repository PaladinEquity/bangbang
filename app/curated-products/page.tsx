'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllWallpapers, toggleWallpaperLike, hasUserLikedWallpaper, updateWallpaperRankingByCart } from '@/services/wallpaperService';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'react-hot-toast';

export default function CuratedProducts() {
  const router = useRouter();
  const { user } = useAuth();
  const [wallpapers, setWallpapers] = useState([] as any[]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [likedWallpapers, setLikedWallpapers] = useState<Record<string, boolean>>({});
  const [likeLoading, setLikeLoading] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const fetchWallpapers = async () => {
      try {
        const data = await getAllWallpapers() as any;
        // Sort wallpapers by ranking if available
        const sortedData = [...data].sort((a, b) => {
          // If both have rankings, sort by ranking (lower number = higher rank)
          if (a.ranking !== null && b.ranking !== null) {
            return a.ranking - b.ranking;
          }
          // If only one has ranking, prioritize the one with ranking
          if (a.ranking !== null) return -1;
          if (b.ranking !== null) return 1;
          
          // Otherwise sort by creation date (newest first) if available
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return 0;
        });
        setWallpapers(sortedData);
        
        // Check which wallpapers the user has liked
        if (user && user.userId) {
          const likedStatus: Record<string, boolean> = {};
          
          for (const wallpaper of sortedData) {
            if (wallpaper.id) {
              const isLiked = await hasUserLikedWallpaper(wallpaper.id, user.userId);
              likedStatus[wallpaper.id] = isLiked;
            }
          }
          
          setLikedWallpapers(likedStatus);
        }
      } catch (error) {
        console.error('Error fetching wallpapers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWallpapers();
  }, [user]);
  
  // Handle like/unlike
  const handleToggleLike = async (wallpaperId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigating to product page
    
    if (!user || !user.userId) {
      toast.error('Please log in to like this wallpaper');
      return;
    }
    
    try {
      setLikeLoading(prev => ({ ...prev, [wallpaperId]: true }));
      
      const success = await toggleWallpaperLike(wallpaperId, user.userId);
      
      if (success) {
        setLikedWallpapers(prev => ({
          ...prev,
          [wallpaperId]: !prev[wallpaperId]
        }));
        
        // Refresh the wallpapers to get updated rankings
        const updatedWallpapers = await getAllWallpapers() as any;
        const sortedData = [...updatedWallpapers].sort((a, b) => {
          if (a.ranking !== null && b.ranking !== null) {
            return a.ranking - b.ranking;
          }
          if (a.ranking !== null) return -1;
          if (b.ranking !== null) return 1;
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return 0;
        });
        setWallpapers(sortedData);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update preference');
    } finally {
      setLikeLoading(prev => ({ ...prev, [wallpaperId]: false }));
    }
  };
  
  // Handle add to cart with ranking update
  const handleAddToCart = async (wallpaper: any, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigating to product page
    
    if (!user || !user.userId) {
      toast.error('Please log in to add items to your cart');
      return;
    }
    
    try {
      // Here you would add the wallpaper to cart
      // This is just a placeholder for the actual cart functionality
      toast.success(`Added ${wallpaper.description || 'Custom Wallpaper'} to cart!`);
      
      // Update the wallpaper ranking when added to cart
      if (wallpaper.id) {
        await updateWallpaperRankingByCart(wallpaper.id, 1);
        
        // Refresh the wallpapers to get updated rankings
        const updatedWallpapers = await getAllWallpapers() as any;
        const sortedData = [...updatedWallpapers].sort((a, b) => {
          if (a.ranking !== null && b.ranking !== null) {
            return a.ranking - b.ranking;
          }
          if (a.ranking !== null) return -1;
          if (b.ranking !== null) return 1;
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return 0;
        });
        setWallpapers(sortedData);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  
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
              {/* Like Button */}
              <button 
                onClick={(e) => handleToggleLike(wallpaper.id, e)}
                disabled={likeLoading[wallpaper.id]}
                className={`absolute top-2 left-2 p-2 rounded-full ${likedWallpapers[wallpaper.id] ? 'bg-red-100 text-red-600' : 'bg-white text-gray-600'} hover:bg-opacity-80 transition-colors`}
                aria-label={likedWallpapers[wallpaper.id] ? 'Unlike' : 'Like'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={likedWallpapers[wallpaper.id] ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={likedWallpapers[wallpaper.id] ? "0" : "2"}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
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
                  onClick={(e) => handleAddToCart(wallpaper, e)}
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