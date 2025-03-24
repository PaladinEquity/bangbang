'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';
import { generateClient } from 'aws-amplify/data';
import { toast } from 'react-hot-toast';
import type { Schema } from '@/amplify/data/resource';

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
    } else {
      // If no user, use sample data
      setBalance(250.00);
      setTransactions([
        { id: 1, date: '2023-12-15', description: 'Wallpaper Purchase', amount: -120.00, status: 'completed' },
        { id: 2, date: '2023-12-10', description: 'Account Deposit', amount: 200.00, status: 'completed' },
        { id: 3, date: '2023-12-05', description: 'Promotional Credit', amount: 50.00, status: 'completed' },
        { id: 4, date: '2023-11-28', description: 'Wallpaper Purchase', amount: -85.00, status: 'completed' },
        { id: 5, date: '2023-11-20', description: 'Account Deposit', amount: 150.00, status: 'completed' },
      ]);
      setPaymentMethods([
        { id: '1', cardType: 'visa', lastFour: '4242', expiryDate: '12/25', isDefault: true },
        { id: '2', cardType: 'mastercard', lastFour: '8888', expiryDate: '09/24', isDefault: false },
      ]);
      setIsLoading(false);
    }
  }, [user]);
  
  // Fetch wallet data from AWS Amplify
  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, you would fetch data from your Amplify backend
      // For now, we'll use sample data
      // Example of how you would fetch data from a real Amplify backend:
      // const walletData = await client.models.Wallet.get({ userId: user.userId });
      
      // Using sample data for now
      const sampleData: WalletData = {
        balance: 250.00,
        paymentMethods: [
          { id: '1', cardType: 'visa', lastFour: '4242', expiryDate: '12/25', isDefault: true },
          { id: '2', cardType: 'mastercard', lastFour: '8888', expiryDate: '09/24', isDefault: false },
        ],
        transactions: [
          { id: 1, date: '2023-12-15', description: 'Wallpaper Purchase', amount: -120.00, status: 'completed' },
          { id: 2, date: '2023-12-10', description: 'Account Deposit', amount: 200.00, status: 'completed' },
          { id: 3, date: '2023-12-05', description: 'Promotional Credit', amount: 50.00, status: 'completed' },
          { id: 4, date: '2023-11-28', description: 'Wallpaper Purchase', amount: -85.00, status: 'completed' },
          { id: 5, date: '2023-11-20', description: 'Account Deposit', amount: 150.00, status: 'completed' },
        ],
      };
      
      setBalance(sampleData.balance);
      setPaymentMethods(sampleData.paymentMethods);
      setTransactions(sampleData.transactions);
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
      
      // Format card number to get last four digits
      const lastFour = cardNumber.replace(/\s/g, '').slice(-4);
      
      // Determine card type based on first digit
      const firstDigit = cardNumber.replace(/\s/g, '')[0];
      let cardType = 'unknown';
      if (firstDigit === '4') cardType = 'visa';
      else if (firstDigit === '5') cardType = 'mastercard';
      else if (firstDigit === '3') cardType = 'amex';
      else if (firstDigit === '6') cardType = 'discover';
      
      // Create new payment method object
      const newPaymentMethod: PaymentMethod = {
        id: Date.now().toString(), // In a real app, this would be generated by the backend
        cardType,
        lastFour,
        expiryDate,
        isDefault: isDefault || paymentMethods.length === 0, // Make default if it's the first card
      };
      
      // In a real implementation, you would save this to your Amplify backend
      // Example:
      // await client.models.PaymentMethod.create({
      //   userId: user.userId,
      //   cardType,
      //   lastFour,
      //   expiryDate,
      //   isDefault: isDefault || paymentMethods.length === 0,
      // });
      
      // Update payment methods state
      let updatedPaymentMethods;
      if (isDefault) {
        // If this is the new default, update all other cards to not be default
        updatedPaymentMethods = paymentMethods.map(method => ({
          ...method,
          isDefault: false,
        }));
        updatedPaymentMethods.push(newPaymentMethod);
      } else {
        updatedPaymentMethods = [...paymentMethods, newPaymentMethod];
      }
      
      setPaymentMethods(updatedPaymentMethods);
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
      
      // In a real implementation, you would process the payment through AWS Amplify
      // Example:
      // await client.models.Transaction.create({
      //   userId: user.userId,
      //   amount,
      //   description: 'Account Deposit',
      //   paymentMethodId: selectedPaymentMethod,
      //   date: new Date().toISOString(),
      //   status: 'completed',
      // });
      
      // Update balance and transactions
      const newBalance = balance + amount;
      setBalance(newBalance);
      
      const newTransaction: Transaction = {
        id: Date.now(), // In a real app, this would be generated by the backend
        date: new Date().toISOString().split('T')[0],
        description: 'Account Deposit',
        amount: amount,
        status: 'completed',
      };
      
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
  const handleSetDefaultPaymentMethod = (id: string) => {
    const updatedPaymentMethods = paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id,
    }));
    
    setPaymentMethods(updatedPaymentMethods);
    toast.success('Default payment method updated');
    
    // In a real implementation, you would update this in your Amplify backend
    // Example:
    // await client.models.PaymentMethod.update({
    //   id,
    //   isDefault: true,
    // });
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
        
        <div className="border rounded-lg p-4 mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-6 bg-blue-600 rounded mr-3"></div>
            <div>
              <p className="font-medium">Visa ending in 4242</p>
              <p className="text-sm text-gray-500">Expires 12/25</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-xs bg-gray-200 px-2 py-1 rounded mr-2">Default</span>
            <button className="text-sm text-gray-500 hover:text-gray-700">Edit</button>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-6 bg-red-500 rounded mr-3"></div>
            <div>
              <p className="font-medium">Mastercard ending in 8888</p>
              <p className="text-sm text-gray-500">Expires 09/24</p>
            </div>
          </div>
          <div>
            <button className="text-sm text-gray-500 hover:text-gray-700">Edit</button>
          </div>
        </div>
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
                
                <form className="space-y-4" onSubmit={handleAddPaymentMethod}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19} // 16 digits + 3 spaces
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                      placeholder="John Doe"
                      value={nameOnCard}
                      onChange={(e) => setNameOnCard(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                        maxLength={5} // MM/YY format
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4} // 3 digits for most cards, 4 for Amex
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-0 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div className="flex items-center mt-2">
                    <input 
                      type="checkbox" 
                      id="defaultCard" 
                      className="h-4 w-4 text-gray-800 focus:ring-0 border-gray-300 rounded"
                    />
                    <label htmlFor="defaultCard" className="ml-2 block text-sm text-gray-700">
                      Set as default payment method
                    </label>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowPaymentDialog(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-0 focus:border-transparent"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-0 focus:border-transparent"
                    >
                      Save Payment Method
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