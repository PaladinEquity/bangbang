'use client';

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

// Generate the client to interact with the Amplify Data API
const client = generateClient<Schema>();

// Interface for transaction data
interface TransactionInput {
  userId: string;
  customerId: string;
  amount: number;
  currency?: string;
  paymentMethodId?: string;
  bankAccountId?: string;
  paymentType: 'card' | 'ach' | 'wallet';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  metadata?: Record<string, any>;
}

// Interface for wallet data
interface WalletInput {
  userId: string;
  balance: number;
  currency?: string;
}

// Interface for payment method data
interface PaymentMethodInput {
  userId: string;
  customerId: string;
  paymentMethodId: string;
  type: 'card' | 'ach';
  last4?: string;
  brand?: string;
  isDefault?: boolean;
  metadata?: Record<string, any>;
}

// DynamoDB service for interacting with Amplify Storage
export const dynamoDBService = {
  // Transaction methods
  async createTransaction(data: TransactionInput) {
    try {
      const result = await client.models.Transaction.create({
        ...data,
        currency: data.currency || 'USD',
        createdDate: new Date().toISOString(),
      });
      
      console.log('Transaction created:', result);
      return result.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },

  async getTransactionsByUser(userId: string) {
    try {
      const { data } = await client.models.Transaction.list({
        filter: { userId: { eq: userId } }
      });
      
      // Sort manually after fetching
      return data.sort((a, b) => 
        new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      );
      return data;
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  },

  async updateTransactionStatus(userId: string, createdDate: string, status: 'pending' | 'completed' | 'failed' | 'refunded') {
    try {
      const { data: transactions } = await client.models.Transaction.list({
        filter: {
          userId: { eq: userId },
          createdDate: {eq: createdDate}
        },
        limit: 1
      });

      if (!transactions || transactions.length === 0) {
        throw new Error('Transaction not found');
      }

      const result = await client.models.Transaction.update({
        id: transactions[0].id,
        status,
        updatedDate: new Date().toISOString()
      });

      console.log('Transaction updated:', result);
      return result.data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  // Wallet methods
  async getOrCreateWallet(userId: string, currency: string = 'USD') {
    try {
      // Try to get existing wallet
      const { data } = await client.models.Wallet.list({
        filter: { userId: { eq: userId } }
      });

      if (data.length > 0) {
        return data[0];
      }

      // Create new wallet if none exists
      const result = await client.models.Wallet.create({
        userId,
        balance: 0,
        currency,
        lastUpdated: new Date().toISOString()
      }, {
        authMode: 'userPool'
      });

      console.log('Wallet created:', result);
      return result.data;
    } catch (error) {
      console.error('Error with wallet operation:', error);
      throw error;
    }
  },

  async updateWalletBalance(userId: string, amount: number) {
    try {
      const wallet = await this.getOrCreateWallet(userId);
      if (!wallet) {
        throw new Error('Wallet not found and could not be created');
      }
      const newBalance = wallet.balance + amount;
      const result = await client.models.Wallet.update({
        id: wallet.id,  // Use the id field for updates
        balance: newBalance,
        lastUpdated: new Date().toISOString()
      });

      console.log('Wallet updated:', result);
      return result.data;
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      throw error;
    }
  },

  // Payment Method methods
  async savePaymentMethod(data: PaymentMethodInput) {
    try {
      // Validate metadata if provided
      if (data.metadata && typeof data.metadata !== 'object') {
        throw new Error('Metadata must be an object');
      }

      // If this is set as default, unset any existing default methods
      if (data.isDefault) {
        await this.unsetDefaultPaymentMethods(data.userId, data.type);
      }

      const result = await client.models.PaymentMethod.create({
        ...data,
        metadata: data.metadata || {},
        createdDate: new Date().toISOString()
      });

      console.log('Payment method saved:', result);
      return result.data;
    } catch (error) {
      console.error('Error saving payment method:', error);
      throw error;
    }
  },

  async getPaymentMethodsByUser(userId: string, type?: 'card' | 'ach') {
    try {
      const filter: any = { userId: { eq: userId } };
      if (type) {
        filter.type = { eq: type };
      }

      const { data } = await client.models.PaymentMethod.list({ filter });
      return data;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  },

  async getDefaultPaymentMethod(userId: string, type: 'card' | 'ach') {
    try {
      const { data } = await client.models.PaymentMethod.list({
        filter: { 
          userId: { eq: userId },
          type: { eq: type },
          isDefault: { eq: true }
        }
      });

      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error getting default payment method:', error);
      throw error;
    }
  },

  async deletePaymentMethod(userId: string, paymentMethodId: string) {
    try {

      const { data: paymentMethods } = await client.models.PaymentMethod.list({
        filter: {
          userId: { eq: userId },
          paymentMethodId: { eq: paymentMethodId }
        },
        limit: 1
      });
  
      if (!paymentMethods || paymentMethods.length === 0) {
        throw new Error('Payment method not found');
      }
  
      const paymentMethod = paymentMethods[0];
      const result = await client.models.PaymentMethod.delete({
        id: paymentMethod.id  // Use the auto-generated id
      });

      console.log('Payment method deleted:', result);
      return true;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  },

  async unsetDefaultPaymentMethods(userId: string, type: 'card' | 'ach') {
    try {
      const { data } = await client.models.PaymentMethod.list({
        filter: { 
          userId: { eq: userId },
          type: { eq: type },
          isDefault: { eq: true }
        }
      });

      for (const method of data) {
        await client.models.PaymentMethod.update({
          id: method.id,
          isDefault: false
        });
      }

      return true;
    } catch (error) {
      console.error('Error unsetting default payment methods:', error);
      throw error;
    }
  },

  async setDefaultPaymentMethod(userId: string, paymentMethodId: string) {
    try {
      // First find the payment method to get its ID and type
      const { data: paymentMethods } = await client.models.PaymentMethod.list({
        filter: {
          userId: { eq: userId },
          paymentMethodId: { eq: paymentMethodId }
        },
        limit: 1
      });
  
      if (!paymentMethods || paymentMethods.length === 0) {
        throw new Error('Payment method not found');
      }
  
      const method = paymentMethods[0];
      
      if (method.type !== 'card' && method.type !== 'ach') {
        throw new Error('Invalid payment method type');
      }
      // Unset any existing default methods of the same type
      await this.unsetDefaultPaymentMethods(userId, method.type);
  
      // Set this method as default using its ID
      const result = await client.models.PaymentMethod.update({
        id: method.id,  // Use the auto-generated id
        isDefault: true
      });
  
      console.log('Payment method set as default:', result);
      return result.data;
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }
};