'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { databaseService } from '@/services/databaseService';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/components/auth/AuthContext';

type CartItem = {
  id: string;
  projectId: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl: string;
  options: {
    rollSize: string;
    patternSize: string;
  };
};

export default function CartPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load cart items from DynamoDB
    const loadCartItems = async () => {
      try {
        // Wait for auth to be ready before proceeding
        if (authLoading) return;
        
        setIsLoading(true);
        
        // Check if user is authenticated
        if (!isAuthenticated || !user) {
          setError('Please log in to view your cart');
          setIsLoading(false);
          return;
        }
        
        // Get user ID from auth context
        const userId = user.userId;
        
        // Fetch cart items from DynamoDB
        const orders = await databaseService.getCustomerOrders(userId, 'pending');
        
        if (orders && orders.length > 0) {
          // Transform orders into cart items
          const cartItemsFromDB = await Promise.all(orders.map(async (order) => {
            // Get wallpaper data for this order
            const wallpaper = await databaseService.getWallpaperData(order.projectId);
            
            // Create cart item from order and wallpaper data
            return {
              id: order.id,
              projectId: order.projectId,
              name: `Custom Wallpaper - ${wallpaper?.generationDescription || 'Custom Design'}`,
              description: 'Custom generated wallpaper design',
              price: order.totalAmount / order.quantity,
              quantity: order.quantity,
              imageUrl: wallpaper?.storageKey || '',
              options: {
                rollSize: wallpaper?.dimensions ? 
                  (() => {
                    const dimensions = JSON.parse(String(wallpaper.dimensions || "{}"));
                    return `${dimensions.width || '396'}' l x ${dimensions.height || '42'}' w`;
                  })() : '396\'l x 42\'w',
                patternSize: '21" (half)',
              }
            };
          }));
          
          setCartItems(cartItemsFromDB);
        }
      } catch (err) {
        console.error('Error loading cart:', err);
        setError('Failed to load your cart. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCartItems();
  }, [authLoading, isAuthenticated, user]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      // Find the cart item to update
      const itemToUpdate = cartItems.find(item => item.id === itemId);
      if (!itemToUpdate) return;
      
      // Calculate new total amount
      const totalAmount = itemToUpdate.price * newQuantity;
      
      // Update the order in DynamoDB
      await databaseService.updateCartOrder(itemId, {
        quantity: newQuantity,
        totalAmount: totalAmount
      });
      
      // Update local state
      const updatedCart = cartItems.map(item => {
        if (item.id === itemId) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      
      setCartItems(updatedCart);
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError('Failed to update quantity. Please try again.');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      // Update the order status to 'cancelled' in DynamoDB
      await databaseService.updateCartOrderStatus(itemId, 'cancelled');
      
      // Update local state
      const updatedCart = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedCart);
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Failed to remove item. Please try again.');
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = cartItems.length > 0 ? 15.00 : 0;
  const tax = subtotal * 0.07; // 7% tax rate
  const total = subtotal + shipping + tax;

  const handleCheckout = async () => {
    try {
      // Cart items are already in DynamoDB, so we just need to navigate to checkout
      // Any status updates would happen in the checkout process
      
      // Navigate to checkout page
      router.push('/checkout');
    } catch (err) {
      console.error('Error processing checkout:', err);
      setError('Failed to process checkout. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <div className="mt-4">
          <Link href="/" className="text-blue-600 hover:underline">Return to Home</Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-xl mb-4">Your cart is empty</p>
          <Link href="/image-creation" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Create a Custom Wallpaper
          </Link>
          <Link href="/curated-products" className="inline-block ml-4 bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors">
            Browse Curated Designs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {cartItems.map((item) => (
              <div key={item.id} className="p-6 border-b border-gray-200 last:border-b-0">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/4 mb-4 md:mb-0">
                    <img 
                      src={item.imageUrl || '/ImagePlaceHolder.png'} 
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-md" 
                    />
                  </div>
                  <div className="w-full md:w-3/4 md:pl-6">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-lg font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                    <div className="text-sm text-gray-500 mb-4">
                      <p>Roll Size: {item.options.rollSize}</p>
                      <p>Pattern Size: {item.options.patternSize}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          min="1" 
                          value={item.quantity} 
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-12 h-8 text-center border-t border-b border-gray-300" 
                        />
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md"
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200 font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Proceed to Checkout
            </button>
            <div className="mt-4 text-center">
              <Link href="/image-creation" className="text-blue-600 hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}