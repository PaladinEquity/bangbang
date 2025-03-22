'use client';

import { useState } from 'react';
import Link from 'next/link';

type CartItem = {
  id: string;
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

export default function Cart() {
  // In a real implementation, this would come from a state management solution or API
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Abstract Geometric Pattern',
      description: 'Modern geometric pattern with blue and gold accents',
      price: 49.99,
      quantity: 1,
      imageUrl: 'https://via.placeholder.com/150',
      options: {
        rollSize: "396' l x 21' w",
        patternSize: '21" (half)',
      },
    },
    {
      id: '2',
      name: 'Tropical Leaf Design',
      description: 'Lush tropical pattern with green palm leaves',
      price: 59.99,
      quantity: 2,
      imageUrl: 'https://via.placeholder.com/150',
      options: {
        rollSize: "396' l x 42' w",
        patternSize: '21" (half)',
      },
    },
  ]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = 15.00;
  const tax = subtotal * 0.07; // 7% tax rate
  const total = subtotal + shipping + tax;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-xl mb-4">Your cart is empty</p>
          <Link 
            href="/image-creation" 
            className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors inline-block"
          >
            Create a Design
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Cart Items ({cartItems.length})</h2>
              </div>
              
              {cartItems.map((item) => (
                <div key={item.id} className="p-6 border-b flex flex-col md:flex-row gap-4">
                  <div className="flex-shrink-0">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-24 h-24 object-cover rounded-md"
                    />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                    <div className="text-sm mb-2">
                      <p><span className="font-medium">Roll Size:</span> {item.options.rollSize}</p>
                      <p><span className="font-medium">Pattern Size:</span> {item.options.patternSize}</p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md"
                        >
                          -
                        </button>
                        <span className="w-10 h-8 flex items-center justify-center border-t border-b border-gray-300">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800"
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
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
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
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <button 
                className="w-full bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
                onClick={() => alert('Checkout functionality would be implemented here')}
              >
                Proceed to Checkout
              </button>
              
              <div className="mt-4">
                <Link 
                  href="/image-creation" 
                  className="block text-center text-black hover:underline"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}