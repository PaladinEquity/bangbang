'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { saveWallpaperData, addToCart, getWallpaperById, toggleWallpaperLike, hasUserLikedWallpaper } from '@/services/wallpaperService';
import { useAuth } from '@/components/auth/AuthContext';
import { useCart } from '@/components/cart/CartContext';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

import WallpaperSimulation from '@/components/WallpaperSimulation';

// Import wallpaper type from types folder
import { WallpaperData as Wallpaper } from '@/types/wallpaper';

// Helper function to get human-readable size label
const getSizeLabel = (size: string): string => {
  switch (size) {
    case '396l-21w':
      return "396' l x 21' w";
    case '396l-42w':
      return "396' l x 42' w";
    case '600l-42w':
      return "600' l x 42' w";
    case '1200l-42w':
      return "1200' l x 42' w";
    default:
      return "396' l x 42' w"; // Default size
  }
};

// Helper function to calculate price based on selected size
const calculatePrice = (size: string, basePrice: number): number => {
  switch (size) {
    case '396l-21w':
      return 360;
    case '396l-42w':
      return 700;
    case '600l-42w':
      return 1000;
    case '1200l-42w':
      return 1360;
    default:
      return 700; // Default price
  }
};



export default function ProductDetail() {
  const params = useParams();
  const { user } = useAuth();
  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('396l-42w');
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  
  useEffect(() => {
    const fetchWallpaper = async () => {
      try {
        setLoading(true);
        setError(null);
        const wallpaperId = params.id as string;
        const data = await getWallpaperById(wallpaperId);
        
        if (data) {
          setWallpaper(data);
          
          // Check if user has liked this wallpaper
          if (user && user.userId) {
            const liked = await hasUserLikedWallpaper(wallpaperId, user.userId);
            setIsLiked(liked);
          }
        } else {
          setError('Wallpaper not found');
        }
      } catch (err) {
        console.error('Error fetching wallpaper:', err);
        setError('Failed to load wallpaper data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWallpaper();
  }, [params.id, user]);
  
  // Handle like/unlike
  const handleToggleLike = async () => {
    if (!user || !user.userId) {
      toast.error('Please log in to like this wallpaper');
      return;
    }
    
    if (!wallpaper || !wallpaper.id) return;
    
    try {
      setLikeLoading(true);
      const success = await toggleWallpaperLike(wallpaper.id, user.userId);
      
      if (success) {
        setIsLiked(!isLiked);
        toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update preference');
    } finally {
      setLikeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading wallpaper...</h2>
          <p>Please wait while we fetch the wallpaper details.</p>
        </div>
      </div>
    );
  }
  
  if (error || !wallpaper) {
    return (
      <div className="max-w-6xl mx-auto p-6 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Wallpaper not found</h2>
          <p>{error || 'The requested wallpaper could not be found.'}</p>
          <Link href="/curated-products" className="text-blue-600 hover:underline mt-4 inline-block">
            Browse Curated Wallpapers
          </Link>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const { setIsLoading, refreshCart, isLoading } = useCart();

  const handleAddToCart = async () => {
    try {
      if (!wallpaper || !wallpaper.id) {
        toast.error('Wallpaper data is missing');
        return;
      }

      // Set loading state
      setIsLoading(true);

      // Calculate price based on selected size
      const adjustedPrice = calculatePrice(selectedSize, wallpaper.price);
      
      // Create cart item
      const cartItem = {
        id: '', // This will be generated in the addToCart function
        name: wallpaper.description || 'Custom Wallpaper',
        description: wallpaper.primaryImagery || 'Wallpaper',
        price: adjustedPrice,
        quantity: quantity,
        imageData: wallpaper.imageData, // Store the image data
        options: {
          rollSize: getSizeLabel(selectedSize),
          patternSize: '21" (half)'
        },
        isCustom: false,
        wallpaperId: wallpaper.id
      };

      // Add to cart
      if (!user || !user.userId) {
        toast.error('Please log in to add items to your cart');
        setIsLoading(false);
        return;
      }
      
      await addToCart(cartItem, user.userId);
      
      // Refresh cart to update cart count
      await refreshCart();

      toast.success(`Added ${quantity} ${cartItem.name} to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/curated-products" className="text-blue-600 hover:underline">
          &larr; Back to Products
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Wallpaper Image */}
        <div className="bg-gray-100 aspect-square rounded-lg overflow-hidden">
          {wallpaper.imageData ? (
            <img 
              src={wallpaper.imageData} 
              alt={wallpaper.description || 'Wallpaper'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400 text-center p-4 h-full flex items-center justify-center">
              <p>Image not available</p>
            </div>
          )}
        </div>
        
        {/* Wallpaper Details */}
        <div>
          {wallpaper.primaryImagery && (
            <span className="inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm mb-4">
              {wallpaper.primaryImagery}
            </span>
          )}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{wallpaper.description || 'Custom Wallpaper'}</h1>
              <p className="text-2xl font-bold mb-4">${calculatePrice(selectedSize, wallpaper.price).toFixed(2)}</p>
              {wallpaper.userId && (
                <p className="text-gray-600 mb-2">Created by: {wallpaper.userId}</p>
              )}
            </div>
            <button 
              onClick={handleToggleLike}
              disabled={likeLoading}
              className={`p-2 rounded-full ${isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80 transition-colors`}
              aria-label={isLiked ? 'Unlike' : 'Like'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isLiked ? "0" : "2"}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
          
          {/* Size Selection Dropdown */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Roll Size *</h3>
            <div className="relative">
              <select 
                className="w-full p-2 border border-gray-300 rounded text-sm sm:text-base appearance-none"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <option value="" disabled>Pick a size</option>
                <option value="396l-21w">396' l x 21' w: $360</option>
                <option value="396l-42w">396' l x 42' w: $700</option>
                <option value="600l-42w">600' l x 42' w: $1000 (Recommended)</option>
                <option value="1200l-42w">1200' l x 42' w: $1360</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">* Affects pricing and pattern scale</p>
          </div>
          
          {/* Quantity */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Quantity</h3>
            <input 
              type="number" 
              min="1" 
              value={quantity} 
              onChange={handleQuantityChange}
              className="w-20 border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            disabled={isLoading}
            className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="small" color="#ffffff" />
                <span className="ml-2">Adding to Cart...</span>
              </>
            ) : (
              'Add to Cart'
            )}
          </button>
          {/* Additional Info */}
          <div className="mt-8 border-t pt-6">
            <div className="mb-4">
              <h3 className="font-semibold mb-1">Materials</h3>
              <p className="text-gray-600 text-sm">Premium non-woven wallpaper material</p>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold mb-1">Shipping</h3>
              <p className="text-gray-600 text-sm">Ships within 2-3 business days</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Returns</h3>
              <p className="text-gray-600 text-sm">30-day return policy for unopened products</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wallpaper Simulation */}
      <div className="mt-10 border-t pt-6">
        <h2 className="text-2xl font-bold mb-4 text-center">See How It Looks</h2>
        <p className="text-center text-gray-600 mb-6">Visualize how this wallpaper will look on your wall at different scales</p>
        
        {wallpaper.imageData && (
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <WallpaperSimulation 
              imageUrl={wallpaper.imageData} 
              selectedRollSize={selectedSize}
              onScaleChange={(scale) => console.log('Scale changed:', scale)}
              onImageLoad={() => console.log('Wallpaper simulation image loaded')}
            />
            <p className="text-sm text-gray-500 text-center mt-4">This simulation shows how the pattern will appear at your selected roll size: {getSizeLabel(selectedSize)}</p>
          </div>
        )}
      </div>
    </div>
  );
}