'use client';

import { useState, useEffect } from 'react';
import RouteProtection from '../../components/auth/RouteProtection';
import Link from 'next/link';
import { getCartItems, updateCartItemQuantity, removeCartItem, calculateCartTotal, createCartOrder } from '@/services/wallpaperService';
import { processPayment, processCardPayment, getPaymentMethods } from '@/services/paymentService';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'react-hot-toast';
import { StripeCardElement } from '@/components/payment/StripeCardElement';
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';
import { useRouter } from 'next/navigation';

type CartItem = {
  id: string | null;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  imageData?: string | null; // For custom wallpapers
  options: {
    rollSize: string;
    patternSize?: string | null;
  };
  isCustom: boolean;
  wallpaperId: string;
};

type PaymentMethod = {
  id: string;
  type: 'card' | 'bank_account';
  name: string;
  lastFour: string;
  isDefault: boolean;
  stripeTokenId: string;
  expiryDate?: string;
  cardType?: string;
  bankName?: string;
};

function CartContent() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  
  // Load user's saved payment methods
  useEffect(() => {
    const loadPaymentMethods = async () => {
      if (!user) return;
      try {
        const methods = await getPaymentMethods();
        setPaymentMethods(methods);
        
        // Set default payment method if available
        const defaultMethod = methods.find(method => method.isDefault);
        if (defaultMethod) {
          setSelectedPaymentMethod(defaultMethod.id);
        }
      } catch (error) {
        console.error('Error loading payment methods:', error);
      }
    };
    
    loadPaymentMethods();
  }, [user]);

  // Load user's saved addresses
  useEffect(() => {
    if (user?.attributes?.address) {
      try {
        const addressesData = JSON.parse(user.attributes.address);
        if (Array.isArray(addressesData) && addressesData.length > 0) {
          // Find default address or use the first one
          const defaultAddress = addressesData.find(addr => addr.isDefault) || addressesData[0];
          const formattedAddress = `${defaultAddress.recipient}\n${defaultAddress.street}\n${defaultAddress.city}, ${defaultAddress.state} ${defaultAddress.zipCode}\n${defaultAddress.country}\n${defaultAddress.phone}`;
          setShippingAddress(formattedAddress);
        }
      } catch (error) {
        console.error('Error parsing address data:', error);
      }
    }
  }, [user]);

  // Handle new card payment method
  const handleCardSuccess = (paymentMethod: { id: string; card: { brand: string; last4: string; exp_month: number; exp_year: number } }) => {
    // Add the new payment method to the list
    const newMethod: PaymentMethod = {
      id: paymentMethod.id,
      type: 'card',
      name: `${paymentMethod.card.brand.toUpperCase()} ending in ${paymentMethod.card.last4}`,
      lastFour: paymentMethod.card.last4,
      isDefault: paymentMethods.length === 0, // Make default if it's the first one
      stripeTokenId: paymentMethod.id,
      expiryDate: `${paymentMethod.card.exp_month.toString().padStart(2, '0')}/${paymentMethod.card.exp_year.toString().slice(-2)}`,
      cardType: paymentMethod.card.brand
    };
    
    setPaymentMethods(prev => [...prev, newMethod]);
    setSelectedPaymentMethod(newMethod.id);
    setShowAddPaymentMethod(false);
    toast.success('Payment method added successfully');
    
    // Process payment with the new method
    processPaymentWithMethod(newMethod.id);
  };

  // Handle ACH payment method
  const handleACHSuccess = (paymentMethod: { id: string; bank_account: { bank_name: string; last4: string; routing_number: string } }) => {
    // Add the new payment method to the list
    const newMethod: PaymentMethod = {
      id: paymentMethod.id,
      type: 'bank_account',
      name: `${paymentMethod.bank_account.bank_name} ending in ${paymentMethod.bank_account.last4}`,
      lastFour: paymentMethod.bank_account.last4,
      isDefault: paymentMethods.length === 0, // Make default if it's the first one
      stripeTokenId: paymentMethod.id,
      bankName: paymentMethod.bank_account.bank_name
    };
    
    setPaymentMethods(prev => [...prev, newMethod]);
    setSelectedPaymentMethod(newMethod.id);
    setShowAddPaymentMethod(false);
    toast.success('Payment method added successfully');
    
    // Process payment with the new method
    processPaymentWithMethod(newMethod.id);
  };

  // Process payment with selected or new payment method
  const processPaymentWithMethod = async (paymentMethodId: string) => {
    if (!user) {
      toast.error('You must be logged in to complete a purchase');
      return;
    }
    
    if (!shippingAddress) {
      toast.error('Please enter a shipping address');
      return;
    }
    
    const finalBillingAddress = useSameAddress ? shippingAddress : billingAddress;
    if (!finalBillingAddress) {
      toast.error('Please enter a billing address');
      return;
    }
    
    setIsProcessingPayment(true);
    
    try {
      // Process the payment
      const paymentResult = await processPayment(total, paymentMethodId);
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }
      
      // Find the payment method details
      const method = paymentMethods.find(m => m.id === paymentMethodId);
      let paymentMethodDescription = 'Payment method';
      if (method) {
        paymentMethodDescription = method.name;
      }
      
      // Create the order
      const orderId = await createCartOrder(
        user.userId,
        shippingAddress,
        finalBillingAddress,
        paymentMethodDescription,
        paymentResult.paymentIntentId
      );
      
      toast.success('Payment successful! Your order has been placed.');
      
      // Redirect to order confirmation page
      router.push(`/account?tab=orders`);
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred during payment processing');
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  // Handle successful payment with new card
  const handlePaymentSuccess = async (paymentMethod: { id: string; card: { brand: string; last4: string; exp_month: number; exp_year: number } }) => {
    handleCardSuccess(paymentMethod);
  };
  
  // Handle payment error
  const handlePaymentError = (error: Error) => {
    console.error('Payment error:', error);
    toast.error(error.message || 'An error occurred with your payment');
    setIsProcessingPayment(false);
  };
  // Load cart items on component mount
  useEffect(() => {
    const fetchCartItems = async () => {
      if(!user) return;
      const items = await getCartItems(user.userId);

      console.log("------------",items,"------------")
      setCartItems(items);
    };
    fetchCartItems();
  }, [user]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    // Update in local state
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
    
    // Update in storage
    updateCartItemQuantity(id, newQuantity);
  };

  const removeItem = (id: string) => {
    // Show confirmation dialog
    toast((t) => (
      <div className="flex flex-col gap-4 p-2">
        <p className="font-medium">Are you sure you want to remove this item?</p>
        <div className="flex justify-between gap-2">
          <button
            onClick={() => {
              // Update in local state
              setCartItems(cartItems.filter(item => item.id !== id));
              
              // Update in storage
              removeCartItem(id);
              
              toast.dismiss(t.id);
              toast.success('Item removed from cart');
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
          >
            No
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
    });
  };

  const calculateSubtotal = () => {
    return cartItems?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
  };

  const subtotal = calculateSubtotal();
  const shipping = 15.00;
  const tax = subtotal * 0.07; // 7% tax rate
  const total = subtotal + shipping + tax;

  return (
    <div className="max-w-6xl mx-auto p-6">
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
                      src={item.imageUrl || ''} 
                      alt={item.name} 
                      className="w-24 h-24 object-cover rounded-md"
                    />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                    <div className="text-sm mb-2">
                      <p><span className="font-medium">Roll Size:</span> {item.options.rollSize}</p>
                      {item.options.patternSize && (
                        <p><span className="font-medium">Pattern Size:</span> {item.options.patternSize}</p>
                      )}
                      {item.isCustom && (
                        <p><span className="font-medium">Type:</span> Custom Design</p>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center">
                        <button 
                          onClick={() => updateQuantity(item.id || '', item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md"
                        >
                          -
                        </button>
                        <span className="w-10 h-8 flex items-center justify-center border-t border-b border-gray-300">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id || '', item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                        <button 
                          onClick={() => removeItem(item.id || '')}
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
              
              {!showPaymentForm ? (
                <button 
                  className="w-full bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
                  onClick={() => setShowPaymentForm(true)}
                  disabled={isProcessingPayment}
                >
                  Proceed to Checkout
                </button>
              ) : (
                <div className="space-y-4 mt-4 border-t pt-4">
                  <h3 className="text-lg font-semibold">Shipping Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700 mb-1">
                        Shipping Address
                      </label>
                      <textarea
                        id="shippingAddress"
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                        rows={3}
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        disabled={isProcessingPayment}
                        placeholder="Enter your full shipping address"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="sameAddress"
                        checked={useSameAddress}
                        onChange={(e) => setUseSameAddress(e.target.checked)}
                        className="h-4 w-4 text-gray-800 focus:ring-0 border-gray-300 rounded"
                        disabled={isProcessingPayment}
                      />
                      <label htmlFor="sameAddress" className="ml-2 block text-sm text-gray-700">
                        Billing address same as shipping
                      </label>
                    </div>
                    
                    {!useSameAddress && (
                      <div>
                        <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700 mb-1">
                          Billing Address
                        </label>
                        <textarea
                          id="billingAddress"
                          className="w-full border border-gray-300 rounded-md p-2 text-sm"
                          rows={3}
                          value={billingAddress}
                          onChange={(e) => setBillingAddress(e.target.value)}
                          disabled={isProcessingPayment}
                          placeholder="Enter your full billing address"
                        />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold mt-4">Payment Information</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    {paymentMethods.length > 0 && !showAddPaymentMethod ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Select a payment method</label>
                          {paymentMethods.map((method) => (
                            <div key={method.id} className="flex items-center mb-2">
                              <input
                                type="radio"
                                id={`payment-${method.id}`}
                                name="paymentMethod"
                                className="h-4 w-4 text-gray-800 focus:ring-0 border-gray-300"
                                checked={selectedPaymentMethod === method.id}
                                onChange={() => setSelectedPaymentMethod(method.id)}
                                disabled={isProcessingPayment}
                              />
                              <label htmlFor={`payment-${method.id}`} className="ml-2 block text-sm text-gray-700">
                                {method.name}
                              </label>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex flex-col space-y-3">
                          <button
                            type="button"
                            className="bg-black text-white px-4 py-2 rounded font-medium hover:bg-gray-800 transition-colors"
                            onClick={() => processPaymentWithMethod(selectedPaymentMethod)}
                            disabled={!selectedPaymentMethod || isProcessingPayment}
                          >
                            {isProcessingPayment ? "Processing..." : `Pay $${total.toFixed(2)}`}
                          </button>
                          
                          <button
                            type="button"
                            className="text-gray-600 hover:text-gray-800 text-sm underline"
                            onClick={() => setShowAddPaymentMethod(true)}
                            disabled={isProcessingPayment}
                          >
                            + Add a new payment method
                          </button>
                        </div>
                      </div>
                    ) : (
                      showAddPaymentMethod ? (
                        <div>
                          <PaymentMethodSelector
                            onCardSuccess={handleCardSuccess}
                            onACHSuccess={handleACHSuccess}
                            onError={handlePaymentError}
                          />
                          <button
                            type="button"
                            className="text-gray-600 hover:text-gray-800 text-sm mt-2 underline"
                            onClick={() => setShowAddPaymentMethod(false)}
                            disabled={isProcessingPayment}
                          >
                            ← Back to saved payment methods
                          </button>
                        </div>
                      ) : (
                        <StripeCardElement
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                          buttonText={isProcessingPayment ? "Processing..." : "Pay $" + total.toFixed(2)}
                        />
                      )
                    )}
                  </div>
                  
                  <button 
                    type="button"
                    className="text-gray-600 hover:text-gray-800 text-sm mt-2"
                    onClick={() => setShowPaymentForm(false)}
                    disabled={isProcessingPayment}
                  >
                    ← Back to cart
                  </button>
                </div>
              )}
              
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

export default function Cart() {
  return (
    <RouteProtection requireAuth={true}>
      <CartContent />
    </RouteProtection>
  );
}