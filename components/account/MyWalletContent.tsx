'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';
import { generateClient } from 'aws-amplify/data';
import { toast } from 'react-hot-toast';
import type { Schema } from '@/amplify/data/resource';
import { PaymentMethodSelector } from '../payment/PaymentMethodSelector';
import { dynamoDBService } from '@/services/dynamoDBService';
import { paymentService } from '@/services/paymentService';

// Define types for our data models
type PaymentMethod = {
  id: string;
  cardType: string;
  lastFour: string;
  expiryDate: string;
  isDefault: boolean;
};

type Transaction = {
  id: string | number;
  date: string;
  description: string;
  amount: number;
  status: string;
};

type WalletData = {
  balance: number;
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
};

export default function MyWalletContent() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showAddFundsDialog, setShowAddFundsDialog] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Form states for adding a payment method
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for adding funds
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  // Initialize the Amplify data client
  const client = generateClient<Schema>();

  // Fetch wallet data on component mount
  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
    // else {
    //   // If no user, use sample data
    //   setBalance(250.00);
    //   setTransactions([
    //     { id: 1, date: '2023-12-15', description: 'Wallpaper Purchase', amount: -120.00, status: 'completed' },
    //     { id: 2, date: '2023-12-10', description: 'Account Deposit', amount: 200.00, status: 'completed' },
    //     { id: 3, date: '2023-12-05', description: 'Promotional Credit', amount: 50.00, status: 'completed' },
    //     { id: 4, date: '2023-11-28', description: 'Wallpaper Purchase', amount: -85.00, status: 'completed' },
    //     { id: 5, date: '2023-11-20', description: 'Account Deposit', amount: 150.00, status: 'completed' },
    //   ]);
    //   setPaymentMethods([
    //     { id: '1', cardType: 'visa', lastFour: '4242', expiryDate: '12/25', isDefault: true },
    //     { id: '2', cardType: 'mastercard', lastFour: '8888', expiryDate: '09/24', isDefault: false },
    //   ]);
    //   setIsLoading(false);
    // }
  }, [user]);

  // Fetch wallet data from AWS Amplify
  const fetchWalletData = async () => {
    try {
      setIsLoading(true);

      if (!user || !user.userId) {
        throw new Error('User not authenticated');
      }

      // Fetch wallet data from DynamoDB
      const wallet = await dynamoDBService.getOrCreateWallet(user.userId);
      if (wallet && 'balance' in wallet) {
        setBalance(wallet.balance);
      } else if (wallet === null) {
        // Handle case where wallet creation failed due to authorization
        console.warn('Could not create wallet - using default balance');
        setBalance(0); // Set default balance
      } else {
        console.error('Unexpected wallet data structure:', wallet);
        toast.error('Error loading wallet data');
        setBalance(0); // Set default balance as fallback
      }

      // Fetch payment methods from DynamoDB
      const paymentMethodsData = await dynamoDBService.getPaymentMethodsByUser(user.userId);
      const formattedPaymentMethods: PaymentMethod[] = paymentMethodsData.map(method => ({
        id: method.paymentMethodId,
        cardType: method.type === 'card' ? (method.brand || 'unknown') : 'ach',
        lastFour: method.last4 || '****',
        expiryDate: method.type === 'card' ? 'XX/XX' : method.brand || 'Bank Account',
        isDefault: method.isDefault || false
      }));
      setPaymentMethods(formattedPaymentMethods);

      // Fetch transactions from DynamoDB
      const transactionsData = await dynamoDBService.getTransactionsByUser(user.userId);
      const formattedTransactions: Transaction[] = transactionsData.map(transaction => ({
        id: transaction.createdDate,
        date: new Date(transaction.createdDate).toISOString().split('T')[0],
        description: (transaction.metadata as any)?.description ||
          (transaction.amount > 0 ? 'Account Deposit' : 'Wallpaper Purchase'),
        amount: transaction.amount,
        status: transaction.status || 'unknown'
      }));
      setTransactions(formattedTransactions)
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a new payment method
  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!cardNumber || !expiryDate || !cvv || !nameOnCard) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (!user || !user.userId) {
        throw new Error('User not authenticated');
      }

      // Format card number to get last four digits
      const lastFour = cardNumber.replace(/\s/g, '').slice(-4);

      // Determine card type based on first digit
      const firstDigit = cardNumber.replace(/\s/g, '')[0];
      let cardType = 'unknown';
      if (firstDigit === '4') cardType = 'visa';
      else if (firstDigit === '5') cardType = 'mastercard';
      else if (firstDigit === '3') cardType = 'amex';
      else if (firstDigit === '6') cardType = 'discover';

      // First, create a customer if not exists
      let customerId = user.userId;

      // Add payment method to Stripe via our payment service
      const paymentMethodResult = await paymentService.addPaymentMethod({
        customerId,
        paymentMethodId: `pm_card_${cardType}_${lastFour}`, // This would normally come from Stripe.js
      });
      
      if (!paymentMethodResult || typeof paymentMethodResult !== 'object') {
        throw new Error('Failed to add payment method');
      }

      if ('error' in paymentMethodResult && paymentMethodResult.error) {
        throw new Error(paymentMethodResult.error.toString());
      }

      if (!('paymentMethod' in paymentMethodResult)) {
        throw new Error("Failed to retrieve payment method");
      }
      const paymentMethod = paymentMethodResult.paymentMethod;

      if (!paymentMethod || typeof paymentMethod !== 'object' || !('id' in paymentMethod) || !paymentMethod.id) {
        throw new Error('Failed to retrieve payment method ID');
      }
      // If this should be the default payment method
      if (isDefault) {
        await paymentService.setDefaultPaymentMethod({
          customerId,
          paymentMethodId: paymentMethod.id as string,
        });
      }

      // Refresh payment methods from the backend
      await fetchWalletData();

      toast.success('Payment method added successfully');

      // Reset form
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setNameOnCard('');
      setIsDefault(false);
      setShowPaymentDialog(false);
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error('Failed to add payment method');
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

      if (!user || !user.userId) {
        throw new Error('User not authenticated');
      }

      // Process the deposit through the payment service
      const depositResult = await paymentService.processDeposit({
        amount,
        currency: 'USD',
        customerId: user.userId,
        paymentMethodId: selectedPaymentMethod,
        metadata: { description: 'Account Deposit' }
      });
      if (!depositResult || typeof depositResult !== 'object') {
        throw new Error('Failed to add deposit result');
      }

      if ('error' in depositResult && depositResult.error) {
        throw new Error(depositResult.error.toString());
      }

      // Refresh wallet data to get updated balance and transactions
      await fetchWalletData();

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
      if (!user || !user.userId) {
        throw new Error('User not authenticated');
      }

      // Update the default payment method in the backend
      await paymentService.setDefaultPaymentMethod({
        customerId: user.userId,
        paymentMethodId: id,
      });

      // Refresh payment methods from the backend
      await fetchWalletData();

      toast.success('Default payment method updated');
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error('Failed to update default payment method');
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date (MM/YY)
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');

    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
    }

    return v;
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
                  setSelectedPaymentMethod(defaultMethod.id);
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

                <form onSubmit={handleAddFunds}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      value={selectedPaymentMethod}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      required
                    >
                      <option value="">Select a payment method</option>
                      {paymentMethods.map(method => (
                        <option key={method.id} value={method.id}>
                          {method.cardType === 'ach' ? 'Bank account' : method.cardType.charAt(0).toUpperCase() + method.cardType.slice(1)} ending in {method.lastFour}
                          {method.isDefault ? ' (Default)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2">$</span>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded p-2 pl-6 text-sm"
                        placeholder="0.00"
                        value={depositAmount}
                        onChange={(e) => {
                          // Only allow numbers and decimal point
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setDepositAmount(value);
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-gray-600 mr-4 px-4 py-2 text-sm"
                      onClick={() => setShowAddFundsDialog(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-gray-800 text-white px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
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
                    <span className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
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
          <button
            onClick={() => setShowPaymentDialog(true)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            + Add New
          </button>
        </div>

        {paymentMethods.length > 0 ? (
          paymentMethods.map((method) => (
            <div key={method.id} className="border rounded-lg p-4 mb-4 flex justify-between items-center">
              <div className="flex items-center">
                <div 
                  className={`w-10 h-6 rounded mr-3 ${method.cardType === 'visa' ? 'bg-blue-600' : 
                    method.cardType === 'mastercard' ? 'bg-red-500' : 
                    method.cardType === 'amex' ? 'bg-blue-400' : 
                    method.cardType === 'discover' ? 'bg-orange-500' : 
                    method.cardType === 'ach' ? 'bg-green-600' : 'bg-gray-500'}`}
                ></div>
                <div>
                  <p className="font-medium">
                    {method.cardType === 'ach' ? 'Bank account' : method.cardType.charAt(0).toUpperCase() + method.cardType.slice(1)} ending in {method.lastFour}
                  </p>
                  <p className="text-sm text-gray-500">
                    {method.cardType === 'ach' ? method.expiryDate : `Expires ${method.expiryDate}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                {method.isDefault && (
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded mr-2">Default</span>
                )}
                {!method.isDefault && (
                  <button 
                    onClick={() => handleSetDefaultPaymentMethod(method.id)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded mr-2"
                  >
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            No payment methods added yet. Click "+ Add New" to add your first payment method.
          </div>
        )}
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

                {/* Import the PaymentMethodSelector component */}
                <div className="mt-4">
                  <PaymentMethodSelector
                    onCardSuccess={async (paymentMethod) => {
                      try {
                        setIsSubmitting(true);
                        
                        if (!user || !user.userId) {
                          throw new Error('User not authenticated');
                        }
                        
                        // Add payment method to Stripe via our payment service
                        const paymentMethodResult = await paymentService.addPaymentMethod({
                          customerId: user.userId,
                          paymentMethodId: paymentMethod.id,
                        });
                        
                        if (!paymentMethodResult || typeof paymentMethodResult !== 'object') {
                          throw new Error('Failed to add payment method');
                        }

                        if ('error' in paymentMethodResult && paymentMethodResult.error) {
                          throw new Error(paymentMethodResult.error.toString());
                        }
                        
                        // If this should be the default payment method
                        if (isDefault) {
                          await paymentService.setDefaultPaymentMethod({
                            customerId: user.userId,
                            paymentMethodId: paymentMethod.id,
                          });
                        }
                        
                        // Handle card payment method for UI
                        const newPaymentMethod: PaymentMethod = {
                          id: paymentMethod.id,
                          cardType: paymentMethod.card.brand,
                          lastFour: paymentMethod.card.last4,
                          expiryDate: `${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year}`,
                          isDefault: isDefault,
                        };

                        // Refresh wallet data from the backend
                        await fetchWalletData();
                        
                        toast.success('Payment method added successfully');
                        setShowPaymentDialog(false);
                      } catch (error) {
                        console.error('Error adding payment method:', error);
                        toast.error('Failed to add payment method');
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    onACHSuccess={async (paymentMethod) => {
                      try {
                        setIsSubmitting(true);
                        
                        if (!user || !user.userId) {
                          throw new Error('User not authenticated');
                        }
                        
                        // Add payment method to Stripe via our payment service
                        const paymentMethodResult = await paymentService.addPaymentMethod({
                          customerId: user.userId,
                          paymentMethodId: paymentMethod.id,
                        });
                        
                        if (!paymentMethodResult || typeof paymentMethodResult !== 'object') {
                          throw new Error('Failed to add payment method');
                        }

                        if ('error' in paymentMethodResult && paymentMethodResult.error) {
                          throw new Error(paymentMethodResult.error.toString());
                        }
                        
                        // If this should be the default payment method
                        if (isDefault) {
                          await paymentService.setDefaultPaymentMethod({
                            customerId: user.userId,
                            paymentMethodId: paymentMethod.id,
                          });
                        }
                        
                        // Handle ACH payment method for UI
                        const newPaymentMethod: PaymentMethod = {
                          id: paymentMethod.id,
                          cardType: 'ach', // Use 'ach' as the type for bank accounts
                          lastFour: paymentMethod.bank_account.last4,
                          expiryDate: `${paymentMethod.bank_account.bank_name}`, // Store bank name in expiryDate field
                          isDefault: isDefault,
                        };

                        // Refresh wallet data from the backend
                        await fetchWalletData();
                        
                        toast.success('Bank account added successfully');
                        setShowPaymentDialog(false);
                      } catch (error) {
                        console.error('Error adding payment method:', error);
                        toast.error('Failed to add payment method');
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    onError={(error) => {
                      console.error('Error adding payment method:', error);
                      toast.error('Failed to add payment method');
                    }}
                    isDefault={isDefault}
                    onDefaultChange={setIsDefault}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}