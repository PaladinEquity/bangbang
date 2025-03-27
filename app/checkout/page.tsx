'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StripeCardElement } from '../../components/payment/StripeCardElement';
import { paymentService } from '../../services/paymentService';
import RouteProtection from '../../components/auth/RouteProtection';
import toast from 'react-hot-toast';

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

type Address = {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
};

function CheckoutContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: '',
  });
  const [billingAddress, setBillingAddress] = useState<Address | null>(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<any>(null);
  const [customerId, setCustomerId] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Mock data - in a real app, this would come from a state management solution or API
  useEffect(() => {
    // Simulate loading cart items from storage or API
    setCartItems([
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

    // In a real app, you would get the customer ID from your auth context
    // This is just a placeholder
    setCustomerId('cus_example123');
  }, []);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = 15.00;
  const tax = subtotal * 0.07; // 7% tax rate
  const total = subtotal + shipping + tax;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSameAsShipping(e.target.checked);
    if (e.target.checked) {
      setBillingAddress(null);
    } else {
      setBillingAddress({
        ...shippingAddress,
        address2: '',
      });
    }
  };

  const handleBillingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePaymentSuccess = async (paymentMethodData: any) => {
    setPaymentMethod(paymentMethodData);
    setStep(3);
  };

  const handlePaymentError = (error: Error) => {
    setError(error.message);
    toast.error(`Payment error: ${error.message}`);
  };

  const handlePlaceOrder = async () => {
    if (!paymentMethod || !customerId) {
      setError('Payment method or customer information is missing');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Create a payment intent
      const paymentIntentResult = await paymentService.createPaymentIntent({
        amount: total,
        currency: 'usd',
        customerId,
        paymentMethodId: paymentMethod.id,
        metadata: {
          orderId: `order_${Date.now()}`,
          items: JSON.stringify(cartItems.map(item => ({ id: item.id, quantity: item.quantity })))
        }
      });

    //   if (!paymentIntentResult?.clientSecret) {
    //     throw new Error('Failed to create payment intent');
    //   }
      console.log("paymentIntentResult  -----", paymentIntentResult);
      // 2. Process the order (in a real app, you would save the order to your database)
      // This is just a placeholder for demonstration
      
      // 3. Show success message and redirect
      toast.success('Order placed successfully!');
      
      // In a real app, you would redirect to an order confirmation page
      // with the order details
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, addressType: 'shipping' | 'billing') => {
    const { name, value } = e.target;
    
    if (addressType === 'shipping') {
      setShippingAddress(prev => ({ ...prev, [name]: value }));
    } else {
      setBillingAddress(prev => prev ? { ...prev, [name]: value } : { ...shippingAddress, [name]: value });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-black text-white' : 'bg-gray-200'}`}>1</div>
            <span className="ml-2 font-medium">Shipping</span>
          </div>
          <div className="h-0.5 w-16 bg-gray-200 mx-2"></div>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-black text-white' : 'bg-gray-200'}`}>2</div>
            <span className="ml-2 font-medium">Payment</span>
          </div>
          <div className="h-0.5 w-16 bg-gray-200 mx-2"></div>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-black text-white' : 'bg-gray-200'}`}>3</div>
            <span className="ml-2 font-medium">Review</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 1: Shipping Information */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
              
              <form onSubmit={handleShippingSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={shippingAddress.firstName}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={shippingAddress.lastName}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                  <input
                    type="text"
                    id="address1"
                    name="address1"
                    value={shippingAddress.address1}
                    onChange={(e) => handleInputChange(e, 'shipping')}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                  <input
                    type="text"
                    id="address2"
                    name="address2"
                    value={shippingAddress.address2}
                    onChange={(e) => handleInputChange(e, 'shipping')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={shippingAddress.city}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State/Province *</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={shippingAddress.state}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                    <select
                      id="country"
                      name="country"
                      value={shippingAddress.country}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button 
                    type="submit"
                    className="w-full bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Step 2: Payment Information */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
              
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="sameAsShipping"
                    checked={sameAsShipping}
                    onChange={handleBillingChange}
                    className="h-4 w-4 text-gray-800 focus:ring-0 border-gray-300 rounded"
                  />
                  <label htmlFor="sameAsShipping" className="ml-2 block text-sm text-gray-700">
                    Billing address same as shipping address
                  </label>
                </div>
                
                {!sameAsShipping && billingAddress && (
                  <form onSubmit={handleBillingSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="billingFirstName" className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input
                          type="text"
                          id="billingFirstName"
                          name="firstName"
                          value={billingAddress.firstName}
                          onChange={(e) => handleInputChange(e, 'billing')}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label htmlFor="billingLastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input
                          type="text"
                          id="billingLastName"
                          name="lastName"
                          value={billingAddress.lastName}
                          onChange={(e) => handleInputChange(e, 'billing')}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="billingAddress1" className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                      <input
                        type="text"
                        id="billingAddress1"
                        name="address1"
                        value={billingAddress.address1}
                        onChange={(e) => handleInputChange(e, 'billing')}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="billingAddress2" className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                      <input
                        type="text"
                        id="billingAddress2"
                        name="address2"
                        value={billingAddress.address2}
                        onChange={(e) => handleInputChange(e, 'billing')}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input
                          type="text"
                          id="billingCity"
                          name="city"
                          value={billingAddress.city}
                          onChange={(e) => handleInputChange(e, 'billing')}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label htmlFor="billingState" className="block text-sm font-medium text-gray-700 mb-1">State/Province *</label>
                        <input
                          type="text"
                          id="billingState"
                          name="state"
                          value={billingAddress.state}
                          onChange={(e) => handleInputChange(e, 'billing')}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label htmlFor="billingPostalCode" className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                        <input
                          type="text"
                          id="billingPostalCode"
                          name="postalCode"
                          value={billingAddress.postalCode}
                          onChange={(e) => handleInputChange(e, 'billing')}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="billingCountry" className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                        <select
                          id="billingCountry"
                          name="country"
                          value={billingAddress.country}
                          onChange={(e) => handleInputChange(e, 'billing')}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="UK">United Kingdom</option>
                          <option value="AU">Australia</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="billingPhone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          id="billingPhone"
                          name="phone"
                          value={billingAddress.phone}
                          onChange={(e) => handleInputChange(e, 'billing')}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </form>
                )}
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Payment Method</h3>
                <p className="text-sm text-gray-600 mb-4">All transactions are secure and encrypted.</p>
                
                <div className="mb-2">
                  <div className="flex items-center mb-2">
                    <div className="h-5 w-5 rounded-full border border-gray-400 flex items-center justify-center">
                      <div className="h-3 w-3 rounded-full bg-gray-800"></div>
                    </div>
                    <span className="ml-2">Credit Card</span>
                  </div>
                  
                  <div className="pl-7">
                    <div className="flex items-center mb-2">
                      <img src="/visa.svg" alt="Visa" className="h-6 w-10 mr-2" />
                      <img src="/mastercard.svg" alt="Mastercard" className="h-6 w-10" />
                    </div>
                    
                    <StripeCardElement
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      buttonText="Continue to Review"
                    />
                    
                    {error && (
                      <div className="text-red-500 text-sm mt-2">{error}</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 rounded-full font-medium hover:bg-gray-50 transition-colors"
                >
                  Back to Shipping
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Review Order */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Review Your Order</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Shipping Address</h3>
                <div className="text-sm">
                  <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                  <p>{shippingAddress.address1}</p>
                  {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
                  <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                  <p>{shippingAddress.country}</p>
                  <p>{shippingAddress.phone}</p>
                </div>
                <button 
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-600 underline mt-2"
                >
                  Edit
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Payment Method</h3>
                {paymentMethod ? (
                  <div className="text-sm">
                    <p>
                      {paymentMethod.card.brand.charAt(0).toUpperCase() + paymentMethod.card.brand.slice(1)} ending in {paymentMethod.card.last4}
                    </p>
                    <p>Expires {paymentMethod.card.exp_month}/{paymentMethod.card.exp_year}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No payment method selected</p>
                )}
                <button 
                  onClick={() => setStep(2)}
                  className="text-sm text-gray-600 underline mt-2"
                >
                  Edit
                </button>
              </div>
              
              <div className="border-t pt-4 mb-6">
                <h3 className="text-lg font-medium mb-3">Order Items</h3>
                
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-start py-3 border-b">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded-md mr-4"
                    />
                    <div className="flex-grow">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <div className="text-sm">
                        <p>Roll Size: {item.options.rollSize}</p>
                        <p>Pattern Size: {item.options.patternSize}</p>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm">Qty: {item.quantity}</span>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-between">
                <button 
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2 border border-gray-300 rounded-full font-medium hover:bg-gray-50 transition-colors"
                >
                  Back to Payment
                </button>
                
                <button 
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isLoading || !paymentMethod}
                  className="px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
              
              {error && (
                <div className="text-red-500 text-sm mt-4">{error}</div>
              )}
            </div>
          )}
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
            
            <div className="text-sm text-gray-600 mb-4">
              <p className="mb-2">We accept the following payment methods:</p>
              <div className="flex items-center">
                <img src="/visa.svg" alt="Visa" className="h-6 w-10 mr-2" />
                <img src="/mastercard.svg" alt="Mastercard" className="h-6 w-10" />
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              <p>By placing your order, you agree to our <Link href="/terms-conditions" className="underline">Terms and Conditions</Link> and <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.</p>
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
  )
}