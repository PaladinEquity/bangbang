'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import WallpaperSimulation from '@/components/WallpaperSimulation';
import { saveWallpaperData, addToCart } from '@/services/wallpaperService';
import { useAuth } from '@/components/auth/AuthContext';
import { useCart } from '@/components/cart/CartContext';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

// Helper function to calculate price based on selected size
const calculatePrice = (size: string): number => {
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

function CustomProductContent() {
  const searchParams = useSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('396l-21w');
  const { user } = useAuth();
  useEffect(() => {
    const size = searchParams.get('size');
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

  const { isLoading, setIsLoading, refreshCart } = useCart();

  const handleAddToCart = async () => {
    if (!imageUrl) {
      toast.error('Please select an image first!');
      return;
    }

    try {
      // Set loading state
      setIsLoading(true);

      // Create wallpaper data object
      const wallpaperData = {
        imageData: imageUrl, // Store the image data (URL in this case)
        description: primaryImagery || 'Custom Wallpaper',
        primaryImagery: primaryImagery || 'Custom Design',
        size: selectedSize,
        price: calculatePrice(selectedSize)
      };

      // Save wallpaper data and get wallpaper ID
      const wallpaperId = await saveWallpaperData(wallpaperData);

      // Create cart item
      const cartItem = {
        id: '', // This will be generated in the addToCart function
        name: primaryImagery || 'Custom Wallpaper',
        description: 'Custom-generated wallpaper design',
        price: calculatePrice(selectedSize),
        quantity: quantity,
        imageData: imageUrl, // Store the actual image data
        options: {
          rollSize: getSizeLabel(selectedSize),
        },
        isCustom: true,
        wallpaperId: wallpaperId
      };

      // Add to cart
      await addToCart(cartItem, user?.userId || '');

      // Refresh cart to update cart count
      await refreshCart();

      toast.success('Added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const imageUrl = searchParams.get('image');
  const primaryImagery = searchParams.get('primaryImagery') || '1525';

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
          <p className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">$700.00</p>
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
            disabled={isLoading}
            className="w-full bg-black text-white py-2.5 sm:py-3 rounded-md hover:bg-gray-800 transition-colors text-sm sm:text-base font-medium flex items-center justify-center"
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
        </div>
      </div>
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
  );
}

export default function CustomProductDetail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomProductContent />
    </Suspense>
  );
}