'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Define product interface
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
}

// This would typically come from an API or database
const productData: Product[] = [
  { id: 1, name: 'Tropical Paradise', price: 49.99, category: 'Nature', description: 'A lush tropical pattern featuring exotic plants and vibrant colors.', image: '/images/products/tropical.jpg' },
  { id: 2, name: 'Urban Geometry', price: 59.99, category: 'Abstract', description: 'Modern geometric patterns inspired by urban architecture and cityscapes.', image: '/images/products/geometry.jpg' },
  { id: 3, name: 'Vintage Florals', price: 45.99, category: 'Floral', description: 'Classic floral patterns with a vintage touch, perfect for creating a timeless atmosphere.', image: '/images/products/florals.jpg' },
  { id: 4, name: 'Minimalist Lines', price: 39.99, category: 'Minimalist', description: 'Clean, simple lines in a minimalist style for a modern, understated look.', image: '/images/products/minimalist.jpg' },
  { id: 5, name: 'Bohemian Dreams', price: 54.99, category: 'Bohemian', description: 'Free-spirited bohemian patterns with rich textures and eclectic elements.', image: '/images/products/bohemian.jpg' },
  { id: 6, name: 'Art Deco Elegance', price: 64.99, category: 'Art Deco', description: 'Sophisticated Art Deco patterns featuring geometric shapes and luxurious details.', image: '/images/products/artdeco.jpg' },
  { id: 7, name: 'Watercolor Wonders', price: 49.99, category: 'Artistic', description: 'Dreamy watercolor effects creating soft, artistic wallpaper designs.', image: '/images/products/watercolor.jpg' },
  { id: 8, name: 'Geometric Patterns', price: 44.99, category: 'Geometric', description: 'Bold geometric patterns that add visual interest and dimension to any space.', image: '/images/products/geometric.jpg' },
];

export default function ProductDetail() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('standard');
  
  useEffect(() => {
    // In a real app, this would be an API call
    const productId = parseInt(params.id as string);
    const foundProduct = productData.find(p => p.id === productId);
    setProduct(foundProduct || null);
  }, [params.id]);

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto p-6 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading product...</h2>
          <p>If the product doesn't load, it may not exist.</p>
          <Link href="/curated-products" className="text-blue-600 hover:underline mt-4 inline-block">
            Return to Products
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

  const handleAddToCart = () => {
    // In a real app, this would add the product to cart
    alert(`Added ${quantity} ${product.name} to cart!`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/curated-products" className="text-blue-600 hover:underline">
          &larr; Back to Products
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Product Image */}
        <div className="bg-gray-100 aspect-square rounded-lg flex items-center justify-center">
          {product.image && product.image.startsWith('/images/') ? (
            <div className="text-gray-400 text-center p-4">
              [Product Image: {product.name}]
              {/* In a real app, this would be an actual image */}
              {/* <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> */}
            </div>
          ) : (
            <div className="text-gray-400 text-center p-4">
              <p>[Product Image: {product.name}]</p>
              <p className="text-sm mt-2">Image not available</p>
            </div>
          )}
        </div>
        
        {/* Product Details */}
        <div>
          <span className="inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm mb-4">
            {product.category}
          </span>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl font-bold mb-4">${product.price}</p>
          <p className="text-gray-600 mb-6">{product.description}</p>
          
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
          in my main page, I click create product button,

move to product page with selected image and size.

I'll share the product page design.
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