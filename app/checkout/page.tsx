'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RouteProtection from '@/components/auth/RouteProtection';
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';
import { getCartItems, calculateCartTotal, clearCart } from '@/services/wallpaperService';
import { getPaymentMethods, processPayment } from '@/services/paymentService';
import { toast } from 'react-hot-toast';

type CartItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  imageData?: string;
  options: {
    rollSize: string;
    patternSize?: string;
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

function CheckoutContent() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  
  // Shipping information
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });

  useEffect(() => {
    // Load cart items
    const items = getCartItems();
    setCartItems(items);
    
    // Load payment methods
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCardSuccess = (paymentMethod: any) => {
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
  };

  const handleACHSuccess = (paymentMethod: any) => {
    // Add the new bank account to the list
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
    toast.success('Bank account added successfully');
  };

  const handlePaymentError = (error: Error) => {
    console.error('Payment method error:', error);
    toast.error(error.message || 'Failed to add payment method');
  };

  const handlePlaceOrder = async () => {
    // Validate shipping information
    const requiredFields = ['firstName', 'lastName', 'address', 'city', 'state', 'zipCode'];
    const missingFields = requiredFields.filter(field => !shippingInfo[field as keyof typeof shippingInfo]);
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all required shipping information');
      return;
    }
    
    // Validate payment method
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Process payment
      const total = calculateCartTotal();
      const result = await processPayment(total, selectedPaymentMethod);
      
      if (result.success) {
        // Clear cart and redirect to success page
        clearCart();
        toast.success('Order placed successfully!');
        router.push(`/order-confirmation?orderId=${result.paymentIntentId}`);
      } else {
        toast.error(result.error || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('An error occurred while placing your order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = calculateCartTotal();
  const shipping = 15.00;
  const tax = subtotal * 0.07; // 7% tax rate
  const total = subtotal + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-xl mb-4">Your cart is empty</p>
          <Link 
            href="/image-creation" 
            className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors inline-block"
          >
            Create a Design
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Shipping Information</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={shippingInfo.firstName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={shippingInfo.lastName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleSelectChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Payment Method</h2>
            </div>
            
            <div className="p-6">
              {paymentMethods.length > 0 ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select a payment method</label>
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="mb-2">
                      <label className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selectedPaymentMethod === method.id}
                          onChange={() => setSelectedPaymentMethod(method.id)}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span>
                          {method.type === 'card' ? (
                            <span className="flex items-center">
                              <span className="font-medium">{method.cardType?.toUpperCase()}</span>
                              <span className="mx-2">•••• {method.lastFour}</span>
                              {method.expiryDate && <span className="text-gray-500 text-sm">Exp: {method.expiryDate}</span>}
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <span className="font-medium">{method.bankName}</span>
                              <span className="mx-2">•••• {method.lastFour}</span>
                            </span>
                          )}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              ) : null}
              
              {showAddPaymentMethod ? (
                <div className="mt-4">
                  <PaymentMethodSelector
                    onCardSuccess={handleCardSuccess}
                    onACHSuccess={handleACHSuccess}
                    onError={handlePaymentError}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPaymentMethod(false)}
                    className="mt-4 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddPaymentMethod(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  + Add a new payment method
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="max-h-60 overflow-y-auto mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center py-2 border-b">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden mr-3">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-sm font-medium">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.options.rollSize}</p>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs">Qty: {item.quantity}</span>
                      <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
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
              className={`w-full ${isLoading ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'} text-white px-6 py-3 rounded-full font-medium transition-colors`}
              onClick={handlePlaceOrder}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Place Order'}
            </button>
            
            <div className="mt-4">
              <Link 
                href="/cart" 
                className="block text-center text-black hover:underline"
              >
                Return to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <RouteProtection requireAuth={true}>
      <CheckoutContent />
    </RouteProtection>
  );
}