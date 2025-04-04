'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-hot-toast';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe-client';
import { PaymentMethodSelector } from '../payment/PaymentMethodSelector';
import { PaymentMethod, BankAccount, StripeCustomer } from '@/types/payment';
import { Transaction, WalletData } from '@/types/wallet';
import { updateUserAttributes } from 'aws-amplify/auth';
import { createOrGetStripeCustomer as getStripeCustomer, createCardPaymentMethod, createBankPaymentMethod, processACHDeposit,setDefaultPaymentMethod,getPaymentMethods, } from '@/services/paymentService';

export default function MyWalletContent() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showBankAccountDialog, setShowBankAccountDialog] = useState(false);
  const [showAddFundsDialog, setShowAddFundsDialog] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethodType, setPaymentMethodType] = useState<'card' | 'bank_account'>('card');
  const [stripeCustomerId, setStripeCustomerId] = useState<string>('');
  
  // Form states
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states for adding funds
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  
  // Ref to track if wallet data fetch is in progress
  const isFetchingWalletData = React.useRef(false);

  // Fetch wallet data on component mount
  useEffect(() => {
    if (user) {
      console.log(user);
      fetchWalletData();
      
      // Check if user already has a Stripe customer ID in their attributes
      const existingStripeCustomerId = user.attributes?.['custom:stripeCustomerId'];
      
      if (existingStripeCustomerId) {
        // Use the existing Stripe customer ID from user attributes
        console.log('Using existing Stripe customer ID from user attributes:', existingStripeCustomerId);
        setStripeCustomerId(existingStripeCustomerId);
        fetchStripePaymentMethods(existingStripeCustomerId);
      } else if (!stripeCustomerId) {
        // Only create customer if we don't already have an ID
        createOrGetStripeCustomer();
      }
    } else {
      // If no user, show empty state
      setBalance(0);
      setTransactions([]);
      setPaymentMethods([]);
      setIsLoading(false);
    }
  }, [user]);
  
  // Create or get a Stripe customer for the user
  const createOrGetStripeCustomer = React.useCallback(async () => {
    try {
      if (!user?.userId) {
        throw new Error('User not authenticated');
      }
      
      // Skip if we already have a customer ID or request is in progress
      if (stripeCustomerId || isCreatingCustomer.current) {
        return;
      }
      
      isCreatingCustomer.current = true;
      
      // Use the paymentService to create or get a Stripe customer
      const customerData = await getStripeCustomer(
        user.userId,
        user?.email || '',
        user.name || user.username
      );
      
      console.log("customerData", customerData);
      setStripeCustomerId(customerData.customerId);
      
      // Save the Stripe customer ID to the user's custom attribute
      if (customerData.customerId) {
        try {
          // Update the user's custom attribute with the Stripe customer ID
          await updateUserAttributes({
            userAttributes: {
              'custom:stripeCustomerId': customerData.customerId
            }
          });
          
          console.log('Stripe customer ID saved to user attributes');
        } catch (attrError) {
          console.error('Error saving Stripe customer ID to user attributes:', attrError);
          // Continue with the flow even if saving to attributes fails
        }
        
        // Fetch payment methods from Stripe
        fetchStripePaymentMethods(customerData.customerId);
      }
    } catch (error) {
      console.error('Error creating/getting Stripe customer:', error);
      // Don't show error to user as this is a background operation
    } finally {
      isCreatingCustomer.current = false;
    }
  }, [user?.userId, user?.email, user?.name, user?.username, stripeCustomerId]);
  
  // Ref to track if customer creation is in progress
  const isCreatingCustomer = React.useRef(false);
  
  // Fetch payment methods from Stripe
  const fetchStripePaymentMethods = async (customerId: string) => {
    try {
      // Use paymentService to get payment methods
      const methods = await getPaymentMethods(customerId);
      
      // Set payment methods directly from the service response
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error fetching Stripe payment methods:', error);
      // Don't show error to user as this is a background operation
    }
  };
  
  // Fetch wallet data
  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      
      if (!user?.userId) {
        throw new Error('User not authenticated');
      }
      
      // Initialize with default values
      setBalance(0);
      setTransactions([]);
      
      // We'll only fetch payment methods from Stripe if we have a customer ID
      if (stripeCustomerId) {
        fetchStripePaymentMethods(stripeCustomerId);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle adding a new card payment method
  const handleCardSuccess = async (paymentMethod: { id: string; card: { brand: string; last4: string; exp_month: number; exp_year: number } }) => {
    setIsSubmitting(true);
    
    try {
      if (!user?.userId || !stripeCustomerId) {
        toast.error('You must be logged in to add a payment method');
        return;
      }
      
      // Use paymentService to attach the card to the customer
      const paymentMethodData = await createCardPaymentMethod(
        paymentMethod.id,
        stripeCustomerId,
        isDefault || paymentMethods.length === 0 // Make default if it's the first card
      );
      
      if (!paymentMethodData.success) {
        throw new Error(paymentMethodData.error || 'Failed to attach card to customer');
      }
      
      // Update local state with the new payment method
      if (paymentMethodData.success) {
        // Create a new payment method object
        const newPaymentMethod: PaymentMethod = {
          id: paymentMethod.id,
          userId: user.userId,
          type: 'card',
          lastFour: paymentMethod.card.last4,
          isDefault: isDefault || paymentMethods.length === 0,
          stripeTokenId: paymentMethod.id,
          expiryDate: `${paymentMethod.card.exp_month.toString().padStart(2, '0')}/${paymentMethod.card.exp_year.toString().slice(-2)}`,
          cardType: paymentMethod.card.brand,
        };
        
        // No longer saving payment method to database, only using Stripe
        
        // If this is the default card, update all other cards in our local state
        if (isDefault || paymentMethods.length === 0) {
          setPaymentMethods(prevMethods => {
            return [
              ...prevMethods.map(method => ({
                ...method,
                isDefault: false
              })),
              newPaymentMethod
            ];
          });
        } else {
          setPaymentMethods(prevMethods => [...prevMethods, newPaymentMethod]);
        }
        
        toast.success('Payment method added successfully');
      }
      
      // Reset form and close dialog
      setIsDefault(false);
      setShowPaymentDialog(false);
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error('Failed to add payment method');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle adding a bank account
  const handleACHSuccess = async (paymentMethod: { id: string; bank_account: { bank_name: string; last4: string; routing_number: string } }) => {
    setIsSubmitting(true);
    console.log(user, stripeCustomerId)
    try {
      if (!user?.userId || !stripeCustomerId) {
        toast.error('You must be logged in to add a bank account');
        return;
      }
      
      // Use paymentService to attach the bank account to the customer
      const paymentMethodData = await createBankPaymentMethod(
        paymentMethod.id,
        stripeCustomerId,
        isDefault || paymentMethods.length === 0 // Make default if it's the first payment method
      );
      
      if (!paymentMethodData.success) {
        throw new Error(paymentMethodData.error || 'Failed to attach bank account to customer');
      }
      
      // Update local state with the new payment method
      if (paymentMethodData.success) {
        // Create a payment method entry for this bank account
        const newPaymentMethod: PaymentMethod = {
          id: paymentMethod.id,
          type: 'bank_account',
          lastFour: paymentMethod.bank_account.last4 || '****',
          isDefault: isDefault || paymentMethods.length === 0,
          stripeTokenId: paymentMethod.id,
          userId: user.userId,
          bankName: paymentMethod.bank_account.bank_name,
        };
        
        // No longer saving to database, only using Stripe
        
        // If this is the default payment method, update all other methods in our local state
        if (isDefault || paymentMethods.length === 0) {
          setPaymentMethods(prevMethods => {
            return [
              ...prevMethods.map(method => ({
                ...method,
                isDefault: false
              })),
              newPaymentMethod
            ];
          });
        } else {
          // Just add the new bank account
          setPaymentMethods(prevMethods => [...prevMethods, newPaymentMethod]);
        }
        
        toast.success('Bank account added successfully');
        setShowPaymentDialog(false);
      }
    } catch (error) {
      console.error('Error adding bank account:', error);
      toast.error('Failed to add bank account');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle adding funds to wallet
  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form data
      if (!selectedPaymentMethod || !depositAmount) {
        toast.error('Please select a payment method and enter an amount');
        return;
      }
      
      const amount = parseFloat(depositAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }
      
      // Get the selected payment method
      const selectedMethod = paymentMethods.find(method => method.id === selectedPaymentMethod);
      
      // Different processing based on payment method type
      if (selectedMethod?.type === 'bank_account') {
        // Process ACH deposit using paymentService
        const result = await processACHDeposit(
          amount,
          selectedMethod.id,
          user?.userId || 'guest',
          'Wallet deposit via ACH'
        );
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to process ACH deposit');
        }
      }
      
      // Update balance and transactions in UI only (no longer saving to database)
      const newBalance = balance + amount;
      setBalance(newBalance);
      
      // Create a transaction object for the UI
      const newTransaction = {
        id: Date.now().toString(), // Generate a temporary ID
        date: new Date().toISOString(),
        description: 'Account Deposit',
        amount,
        status: 'completed',
        type: 'deposit' as 'deposit',
        paymentMethodId: selectedPaymentMethod,
        userId: user?.userId
      };
      
      // Add the transaction to the state
      setTransactions([newTransaction, ...transactions]);
      toast.success(`Successfully added $${amount.toFixed(2)} to your wallet`);
      
      // Reset form
      setDepositAmount('');
      setSelectedPaymentMethod('');
      setShowAddFundsDialog(false);
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error('Failed to process payment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle setting a payment method as default
  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      if (!stripeCustomerId) {
        toast.error('Unable to update payment method');
        return;
      }
      
      // Find the payment method to set as default
      const method = paymentMethods.find(m => m.id === id);
      if (!method) {
        toast.error('Payment method not found');
        return;
      }
      
      // Use paymentService to set default payment method
      const success = await setDefaultPaymentMethod(id, method.type);
      
      if (!success) {
        throw new Error('Failed to update default payment method');
      }
      
      // Update local state
      const updatedPaymentMethods = paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id,
      }));
      
      setPaymentMethods(updatedPaymentMethods);
      toast.success('Default payment method updated');
    } catch (error) {
      console.error('Error updating default payment method:', error);
      toast.error('Failed to update default payment method'); 
    }
  };
  
  // Handle payment method errors
  const handlePaymentError = (error: Error) => {
    console.error('Payment method error:', error);
    toast.error(error.message || 'Failed to process payment method');
    setIsSubmitting(false);
  };
  
  // Handle default payment method change
  const handleDefaultChange = (isDefaultSelected: boolean) => {
    setIsDefault(isDefaultSelected);
  };
  
  if (isLoading) {
    return <div className="flex justify-center py-8">Loading wallet data...</div>;
  }
  
  return (
    <>
      
      {/* Balance Card */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8" style={{ backgroundColor: "#FBE8E8" }}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold mb-1">Current Balance</h2>
            <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
          </div>
          <button 
            className="bg-gray-800 text-white px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
            onClick={() => {
              // Only show add funds dialog if there's at least one payment method
              if (paymentMethods.length > 0) {
                setShowAddFundsDialog(true);
                // Pre-select the default payment method if available
                const defaultMethod = paymentMethods.find(method => method.isDefault);
                if (defaultMethod) {
                  setSelectedPaymentMethod(defaultMethod?.id || '');
                }
              } else {
                // If no payment methods, prompt to add one first
                toast.error('Please add a payment method first');
                setShowPaymentDialog(true);
              }
            }}
          >
            Add Funds
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Description</th>
                <th className="text-right py-3 px-4">Amount</th>
                <th className="text-right py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{transaction.date}</td>
                  <td className="py-3 px-4">{transaction.description}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={(transaction?.amount || 0) > 0 ? 'text-green-600' : 'text-red-600'}>
                      {(transaction?.amount || 0) > 0 ? '+' : ''}{(transaction?.amount || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Payment Methods</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => {
                setShowPaymentDialog(true);
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              + Add Payment Method
            </button>
          </div>
        </div>
        
        {paymentMethods.map((method : PaymentMethod) => (
          <div key={method.id} className="border rounded-lg p-4 mb-4 flex justify-between items-center">
            <div className="flex items-center">
              {method.type === 'card' ? (
                <>
                  <div className={`w-10 h-6 ${method.cardType === 'visa' ? 'bg-blue-600' : method.cardType === 'mastercard' ? 'bg-red-500' : method.cardType === 'amex' ? 'bg-blue-400' : 'bg-gray-500'} rounded mr-3`}></div>
                  <div>
                    <p className="font-medium">{(method?.cardType || '')?.charAt(0).toUpperCase() + method.cardType?.slice(1) || 'Card'} ending in {method.lastFour}</p>
                    {method.expiryDate && <p className="text-sm text-gray-500">Expires {method.expiryDate}</p>}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-6 bg-green-600 rounded mr-3"></div>
                  <div>
                    <p className="font-medium">{method.bankName || 'Bank Account'} ending in {method.lastFour}</p>
                    <p className="text-sm text-gray-500">ACH Direct Debit</p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center">
              {method.isDefault && <span className="text-xs bg-gray-200 px-2 py-1 rounded mr-2">Default</span>}
              <button 
                onClick={() => handleSetDefaultPaymentMethod(method?.id || '')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {method.isDefault ? 'Edit' : 'Set Default'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Promo Codes */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Promo Codes</h2>
        
        <div className="flex mb-4">
          <input
            type="text"
            className="flex-grow border border-gray-300 rounded-l p-2 text-sm"
            placeholder="Enter promo code"
          />
          <button className="bg-gray-800 text-white px-4 py-2 text-sm rounded-r">
            Apply
          </button>
        </div>
        
        <div className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">WELCOME20</p>
              <p className="text-sm text-gray-500">20% off your first order</p>
            </div>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Expires: December 31, 2023</p>
        </div>
        
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">HOLIDAY10</p>
              <p className="text-sm text-gray-500">$10 off holiday designs</p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Used</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Expired: November 30, 2023</p>
        </div>
      </div>
      
      {/* Payment Method Dialog */}
      <AnimatePresence>
        {showPaymentDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Add Payment Method</h2>
                  <button 
                    onClick={() => setShowPaymentDialog(false)}
                    className="text-gray-500 hover:text-gray-700"
                    disabled={isSubmitting}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                
                <PaymentMethodSelector
                  onCardSuccess={handleCardSuccess}
                  onACHSuccess={handleACHSuccess}
                  onError={handlePaymentError}
                  isDefault={isDefault}
                  onDefaultChange={handleDefaultChange}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Add Funds Dialog */}
      <AnimatePresence>
        {showAddFundsDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Add Funds to Wallet</h2>
                  <button 
                    onClick={() => setShowAddFundsDialog(false)}
                    className="text-gray-500 hover:text-gray-700"
                    disabled={isSubmitting}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                
                <form className="space-y-4" onSubmit={handleAddFunds}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                      value={selectedPaymentMethod}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Select a payment method</option>
                      {paymentMethods.map((method) => (
                        <option key={method.id} value={method.id || ''}>
                          {method.type === 'card' 
                            ? `${(method?.cardType || '')?.charAt(0).toUpperCase() + method.cardType?.slice(1) || 'Card'} ending in ${method.lastFour}` 
                            : `${'Bank Account'} ending in ${method.lastFour} (ACH)`}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2">$</span>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                        placeholder="0.00"
                        value={depositAmount}
                        onChange={(e) => {
                          // Only allow numbers and decimal point
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          // Only allow one decimal point
                          const decimalCount = (value.match(/\./g) || []).length;
                          if (decimalCount <= 1) {
                            setDepositAmount(value);
                          }
                        }}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddFundsDialog(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processing...' : 'Add Funds'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}