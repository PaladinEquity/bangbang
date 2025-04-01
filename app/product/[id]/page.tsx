'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { saveWallpaperData, addToCart, getWallpaperById } from '@/services/wallpaperService';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'react-hot-toast';

// Define wallpaper interface
interface Wallpaper {
  id?: string | null;
  imageData: string;
  description: string | null;
  primaryImagery: string | null;
  size: string | null;
  price: number;
  userId?: string | null;
}

// Helper function to get human-readable size label
const getSizeLabel = (size: string): string => {
  switch (size) {
    case 'standard':
      return "24\" x 108\"";
    case 'large':
      return "48\" x 108\"";
    case 'custom':
      return "Custom Size";
    default:
      return "24\" x 108\""; // Default size
  }
};



export default function ProductDetail() {
  const params = useParams();
  const { user } = useAuth();
  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('standard');
  
  useEffect(() => {
    const fetchWallpaper = async () => {
      try {
        setLoading(true);
        setError(null);
        const wallpaperId = params.id as string;
        const data = await getWallpaperById(wallpaperId);
        
        if (data) {
          setWallpaper(data);
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
  }, [params.id]);

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

  const handleAddToCart = async () => {
    try {
      if (!wallpaper || !wallpaper.id) {
        toast.error('Wallpaper data is missing');
        return;
      }

      // Create cart item
      const cartItem = {
        id: '', // This will be generated in the addToCart function
        name: wallpaper.description || 'Custom Wallpaper',
        description: wallpaper.primaryImagery || 'Wallpaper',
        price: wallpaper.price,
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
        return;
      }
      
      await addToCart(cartItem, user.userId);

      toast.success(`Added ${quantity} ${cartItem.name} to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
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
          <h1 className="text-3xl font-bold mb-2">{wallpaper.description || 'Custom Wallpaper'}</h1>
          <p className="text-2xl font-bold mb-4">${wallpaper.price.toFixed(2)}</p>
          {wallpaper.userId && (
            <p className="text-gray-600 mb-2">Created by: {wallpaper.userId}</p>
          )}
          
          {/* Size Selection */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Roll Size</h3>
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-4 py-2 border rounded-md ${selectedSize === 'standard' ? 'border-black bg-gray-100' : 'border-gray-300'}`}
                onClick={() => setSelectedSize('standard')}
              >
                Standard (24" x 108")
              </button>
              <button 
                className={`px-4 py-2 border rounded-md ${selectedSize === 'large' ? 'border-black bg-gray-100' : 'border-gray-300'}`}
                onClick={() => setSelectedSize('large')}
              >
                Large (48" x 108")
              </button>
              <button 
                className={`px-4 py-2 border rounded-md ${selectedSize === 'custom' ? 'border-black bg-gray-100' : 'border-gray-300'}`}
                onClick={() => setSelectedSize('custom')}
              >
                Custom Size
              </button>
            </div>
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
            className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors"
          >
            Add to Cart
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
    </div>
  );
}