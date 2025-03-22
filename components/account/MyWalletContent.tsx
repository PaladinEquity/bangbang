'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MyWalletContent() {
  // Sample wallet data
  const [balance, setBalance] = useState(250.00);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [transactions, setTransactions] = useState([
    { id: 1, date: '2023-12-15', description: 'Wallpaper Purchase', amount: -120.00, status: 'completed' },
    { id: 2, date: '2023-12-10', description: 'Account Deposit', amount: 200.00, status: 'completed' },
    { id: 3, date: '2023-12-05', description: 'Promotional Credit', amount: 50.00, status: 'completed' },
    { id: 4, date: '2023-11-28', description: 'Wallpaper Purchase', amount: -85.00, status: 'completed' },
    { id: 5, date: '2023-11-20', description: 'Account Deposit', amount: 150.00, status: 'completed' },
  ]);
  
  return (
    <>
      
      {/* Balance Card */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8" style={{ backgroundColor: "#FBE8E8" }}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold mb-1">Current Balance</h2>
            <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
          </div>
          <button className="bg-gray-800 text-white px-6 py-2 text-sm">
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
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        placeholder="123"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div className="flex items-center mt-2">
                    <input 
                      type="checkbox" 
                      id="defaultCard" 
                      className="h-4 w-4 text-gray-800 focus:ring-gray-400 border-gray-300 rounded"
                    />
                    <label htmlFor="defaultCard" className="ml-2 block text-sm text-gray-700">
                      Set as default payment method
                    </label>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowPaymentDialog(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
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