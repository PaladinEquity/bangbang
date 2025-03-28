import { post } from 'aws-amplify/api';
import { dynamoDBService } from './dynamoDBService';

// Type definitions for payment service
type PaymentMethodData = {
  customerId: string;
  paymentMethodId: string;
};

type CustomerData = {
  email: string;
  name: string;
  metadata?: Record<string, string>;
};

type DepositData = {
  amount: number;
  currency?: string;
  customerId: string;
  paymentMethodId: string;
  metadata?: Record<string, string>;
};

type PaymentIntentData = {
  amount: number;
  currency?: string;
  customerId: string;
  paymentMethodId: string;
  metadata?: Record<string, string>;
};

type ACHBankAccountData = {
  customerId: string;
  accountHolderName: string;
  accountHolderType: 'individual' | 'company';
  routingNumber: string;
  accountNumber: string;
  accountType?: 'checking' | 'savings';
  metadata?: Record<string, string>;
};

type ACHPaymentData = {
  amount: number;
  currency?: string;
  customerId: string;
  bankAccountId: string;
  metadata?: Record<string, string>;
};

type TransactionData = {
  userId: string;
  customerId: string;
  amount: number;
  currency?: string;
  paymentMethodId?: string;
  bankAccountId?: string;
  paymentType: 'card' | 'ach' | 'wallet';
  metadata?: Record<string, any>;
};

/**
 * Service for handling payment-related operations using Stripe via AWS Amplify function
 */
export const paymentService = {
  /**
   * Create a new Stripe customer
   */
  createCustomer: async (data: CustomerData) => {
    try {
      const restOperation = await post({
        apiName: 'paymentApi',
        path: '/payment',
        options: {
          body: {
            action: 'createCustomer',
            data
          }
        }
      });

      const { body } = await restOperation.response;

      const response = await body.json();

      return response;
      // return await response;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  /**
   * Add a payment method to a customer
   */
  addPaymentMethod: async (data: PaymentMethodData) => {
    try {
      const restOperation = await post({
        apiName: 'paymentApi',
        path: '/payment',
        options: {
          body: {
            action: 'addPaymentMethod',
            data
          }
        }
      });

      const { body } = await restOperation.response;

      const result = await body.json();
      
      // Save payment method to DynamoDB if API call succeeds
      if ((result as any).success) {
        await dynamoDBService.savePaymentMethod({
          userId: data.customerId,
          customerId: data.customerId,
          paymentMethodId: data.paymentMethodId,
          type: 'card',
          last4: (result as any).paymentMethod.card?.last4 || '',
          brand: (result as any).paymentMethod.card?.brand || 'unknown',
          isDefault: true,
          metadata: {}
        });
      }

      return result;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  },

  /**
   * List payment methods for a customer
   */
  listPaymentMethods: async (customerId: string, type: string = 'card') => {
    try {
      // Get payment methods from DynamoDB first
      const paymentMethods = await dynamoDBService.getPaymentMethodsByUser(customerId, type as 'card' | 'ach');

      if (paymentMethods.length > 0) {
        return { paymentMethods };
      }

      // If no payment methods in DynamoDB, fetch from Stripe
      const response = await post({
        apiName: 'paymentApi',
        path: '/payment',
        options: {
          body: {
            action: 'listPaymentMethods',
            data: { customerId, type }
          }
        }
      });

      const { body } = await response.response;

      const result = await body.json();

      // Save payment methods to DynamoDB
      if ((result as any).paymentMethods && (result as any).paymentMethods.length > 0) {
        for (const method of (result as any).paymentMethods) {
          await dynamoDBService.savePaymentMethod({
            userId: customerId,
            customerId,
            paymentMethodId: method.id,
            type: 'card',
            last4: method.card?.last4,
            brand: method.card?.brand,
            isDefault: method.id === (result as any).paymentMethods[0].id, // Make first one default
            metadata: method.metadata
          });
        }
      }

      return { paymentMethods };
    } catch (error) {
      console.error('Error listing payment methods:', error);
      throw error;
    }
  },

  /**
   * Set a payment method as default for a customer
   */
  setDefaultPaymentMethod: async (data: PaymentMethodData) => {
    try {
      const response = await post({
        apiName: 'paymentApi',
        path: '/payment',
        options: {
          body: {
            action: 'setDefaultPaymentMethod',
            data
          }
        }
      });

      const { body } = await response.response;

      const result = await body.json();
      
      // Update payment method in DynamoDB if API call succeeds
      if ((result as any).success) {
        await dynamoDBService.setDefaultPaymentMethod(data.customerId, data.paymentMethodId);
      }

      return result;
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  },

  /**
   * Process a deposit to the user's wallet
   */
  processDeposit: async (data: DepositData) => {
    try {
      const response = await post({
        apiName: 'paymentApi',
        path: '/payment',
        options: {
          body: {
            action: 'processDeposit',
            data
          }
        }
      });

      const result = (await response.response).body.json();
      
      // Record transaction in DynamoDB if API call succeeds
      if ((result as any).success) {
        await dynamoDBService.createTransaction({
          userId: data.customerId,
          customerId: data.customerId,
          amount: data.amount,
          currency: data.currency || 'USD',
          paymentMethodId: data.paymentMethodId,
          paymentType: 'card',
          status: 'completed',
          metadata: { ...data.metadata, type: 'wallet_deposit' }
        });

        // Update wallet balance
        await dynamoDBService.updateWalletBalance(data.customerId, data.amount);
      }

      return result;
    } catch (error) {
      console.error('Error processing deposit:', error);
      throw error;
    }
  },

  /**
   * Create a payment intent for a purchase
   */
  createPaymentIntent: async (data: PaymentIntentData) => {
    try {
      const response = await post({
        apiName: 'paymentApi',
        path: '/payment',
        options: {
          body: {
            action: 'createPaymentIntent',
            data
          }
        }
      });

      const result = (await response.response).body.json();
      
      // Record transaction in DynamoDB if API call succeeds
      if ((result as any).clientSecret) {
        await dynamoDBService.createTransaction({
          userId: data.customerId,
          customerId: data.customerId,
          amount: data.amount,
          currency: data.currency || 'USD',
          paymentMethodId: data.paymentMethodId,
          paymentType: 'card',
          status: 'pending',
          metadata: data.metadata
        });
      }

      return result;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  /**
   * Confirm a payment intent
   */
  confirmPayment: async (paymentIntentId: string) => {
    try {
      const response = await post({
        apiName: 'paymentApi',
        path: '/payment',
        options: {
          body: {
            action: 'confirmPayment',
            data: { paymentIntentId }
          }
        }
      });

      return (await response.response).body.json();
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  },

  /**
   * Create a bank account for ACH payments
   */
  createBankAccount: async (data: ACHBankAccountData) => {
    try {
      const response = await post({
        apiName: 'paymentApi',
        path: '/payment',
        options: {
          body: {
            action: 'createBankAccount',
            data
          }
        }
      });

      return (await response.response).body.json();
    } catch (error) {
      console.error('Error creating bank account:', error);
      throw error;
    }
  },

  /**
   * Verify a bank account with micro-deposits
   */
  verifyBankAccount: async (bankAccountId: string, amounts: number[]) => {
    try {
      const response = await post({
        apiName: 'paymentApi',
        path: '/payment',
        options: {
          body: {
            action: 'verifyBankAccount',
            data: { bankAccountId, amounts }
          }
        }
      });

      return (await response.response).body.json();
    } catch (error) {
      console.error('Error verifying bank account:', error);
      throw error;
    }
  },

  /**
   * Process an ACH payment
   */
  processACHPayment: async (data: ACHPaymentData) => {
    try {
      const response = await post({
        apiName: 'paymentApi',
        path: '/payment',
        options: {
          body: {
            action: 'processACHPayment',
            data
          }
        }
      });

      const result = (await response.response).body.json();

      // Record transaction in DynamoDB
      await dynamoDBService.createTransaction({
        userId: data.customerId, // Using customerId as userId for simplicity
        customerId: data.customerId,
        amount: data.amount,
        currency: data.currency,
        bankAccountId: data.bankAccountId,
        paymentType: 'ach',
        status: 'pending', // ACH payments start as pending
        metadata: { ...data.metadata, payment_type: 'ach' }
      });

      return result;
    } catch (error) {
      console.error('Error processing ACH payment:', error);
      throw error;
    }
  },

  /**
   * Save a transaction record to the database
   */
  saveTransaction: async (data: TransactionData) => {
    try {
      const response = await post({
        apiName: 'paymentApi',
        path: '/payment',
        options: {
          body: {
            action: 'saveTransaction',
            data
          }
        }
      });

      return (await response.response).body.json();
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  }
};