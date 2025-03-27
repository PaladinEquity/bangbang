'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import WallpaperSimulation from '@/components/WallpaperSimulation';
import { databaseService } from '@/services/databaseService';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/components/auth/AuthContext';

function CustomProductContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('396l-21w');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  useEffect(() => {
    const size = searchParams?.get('size') || null;
    if (size) {
      setSelectedSize(size);
    }
  }, [searchParams]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  // Get price based on selected size
  const getPriceForSize = (size: string): number => {
    switch(size) {
      case '396l-21w': return 360;
      case '396l-42w': return 700;
      case '600l-42w': return 1000;
      case '1200l-42w': return 1360;
      default: return 700;
    }
  };

  // Get formatted size string
  const getFormattedSize = (size: string): string => {
    switch(size) {
      case '396l-21w': return "396' l x 21' w";
      case '396l-42w': return "396' l x 42' w";
      case '600l-42w': return "600' l x 42' w";
      case '1200l-42w': return "1200' l x 42' w";
      default: return "396' l x 42' w";
    }
  };

  const handleAddToCart = async () => {
    if (!imageUrl) {
      setStatusMessage('No image selected. Please go back and select an image.');
      return;
    }

    if (!isAuthenticated || !user) {
      setStatusMessage('Please log in to add items to your cart.');
      setTimeout(() => {
        router.push('/auth/login?redirect=/product/custom?image=' + encodeURIComponent(imageUrl || ''));
      }, 1500);
      return;
    }

    setIsLoading(true);
    setStatusMessage('Adding to cart...');
    
    try {
      // Generate a unique project ID
      const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Get price based on selected size
      const price = getPriceForSize(selectedSize);
      const formattedSize = getFormattedSize(selectedSize);
      
      // Save wallpaper data to database
      await databaseService.saveWallpaperData({
        projectId,
        storageKey: imageUrl, // Using the URL directly as we don't need to upload
        mimeType: 'image/jpeg', // Assuming JPEG format
        generationDescription: { primaryImagery }, // Using the primary imagery as description
        userId: user.userId, // Get real user ID from auth context
      });
      
      // Create cart order in database
      await databaseService.saveCartOrder({
        projectId,
        customerId: user.userId, // Get real user ID from auth context
        quantity: quantity,
        totalAmount: price * quantity,
        status: 'pending'
      });
      
      // Create cart item data structure (for reference only, not stored in localStorage)
      const cartItem = {
        projectId,
        name: `Custom Wallpaper - ${primaryImagery}`,
        description: `Custom generated wallpaper design`,
        price: price,
        quantity: quantity,
        imageUrl: imageUrl,
        options: {
          rollSize: formattedSize,
          patternSize: '21" (half)',
        }
      };
      
      // Cart data is now fully managed in DynamoDB through saveCartOrder above
      // No need to use localStorage anymore
      
      setStatusMessage('Added to cart successfully!');
      
      // Navigate to cart page after a short delay
      setTimeout(() => {
        router.push('/cart');
      }, 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setStatusMessage('Failed to add to cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

const imageUrl = searchParams?.get('image') || null;
  const primaryImagery = searchParams?.get('primaryImagery') || 'default';

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <Link href="/" className="text-blue-600 hover:underline inline-flex items-center text-sm sm:text-base">
          <span className="mr-1">&larr;</span> Back to Image Creation
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {/* Product Image */}
        <div className="bg-gray-100 aspect-square rounded-lg flex items-center justify-center shadow-sm">
          {imageUrl ? (
            <img src={imageUrl} alt="Custom Wallpaper" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="text-gray-400 text-center p-4">
              <p>Custom Wallpaper Preview</p>
              <p className="text-sm mt-2">Image not available</p>
            </div>
          )}
        </div>
        
        {/* Product Details */}
        <div>
          <span className="inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm mb-3 sm:mb-4">
            Custom Design
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{primaryImagery}</h1>
          <p className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">${getPriceForSize(selectedSize).toFixed(2)}</p>
          <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">Your unique custom-generated wallpaper design, ready to transform your space.</p>
          
          {/* Size Selection */}
          <div className="mb-4 sm:mb-6">
            <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Roll Size *</h3>
            <select 
              className="w-full p-2 border border-gray-300 rounded text-sm sm:text-base"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              <option value="">Pick a size</option>
              <option value="396l-21w">396' l x 21' w: $360</option>
              <option value="396l-42w">396' l x 42' w: $700</option>
              <option value="600l-42w" className="bg-cyan-100">600' l x 42' w: $1000</option>
              <option value="1200l-42w">1200' l x 42' w: $1360</option>
            </select>
          </div>
          
          {/* Quantity */}
          <div className="mb-5 sm:mb-6">
            <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Quantity</h3>
            <input 
              type="number" 
              min="1" 
              value={quantity} 
              onChange={handleQuantityChange}
              className="w-20 border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base"
            />
          </div>
          
          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            disabled={isLoading || !imageUrl}
            className="w-full bg-black text-white py-2.5 sm:py-3 rounded-md hover:bg-gray-800 transition-colors text-sm sm:text-base font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoadingSpinner size="small" /> : 'Add to Cart'}
          </button>
          
          {/* Status Message */}
          {statusMessage && (
            <div className={`mt-3 text-sm ${statusMessage.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
              {statusMessage}
            </div>
          )}
          
          {/* Wallpaper Simulation */}
          <div className="mt-6 sm:mt-8 border-t pt-4 sm:pt-6">
            {imageUrl && (
              <WallpaperSimulation 
                imageUrl={imageUrl} 
                onScaleChange={(scale) => console.log('Scale changed:', scale)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomProductDetail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomProductContent />
    </Suspense>
  );
}