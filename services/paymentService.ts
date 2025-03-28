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
        path: 'payment',
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
        path: 'payment101',
        options: {
          body: {
            action: 'addPaymentMethod',
            data
          }
        }
      });
      const { body } = await restOperation.response;

      console.log("---success",restOperation.response, body);
      const result = await body.json();
      
      // No need to save payment method here - it's now handled in the backend Lambda function

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
      // Fetch payment methods from backend
      const response = await post({
        apiName: 'paymentApi',
        path: 'payment',
        options: {
          body: {
            action: 'listPaymentMethods',
            data: { customerId, type }
          }
        }
      });

      const { body } = await response.response;

      const result = await body.json();
      console.log(result);


      return result;
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
        path: 'payment',
        options: {
          body: {
            action: 'setDefaultPaymentMethod',
            data
          }
        }
      });

      const { body } = await response.response;

      const result = await body.json();
      


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
      const restOperation = await post({
        apiName: 'paymentApi',
        path: 'payment',
        options: {
          body: {
            action: 'processDeposit',
            data
          }
        }
      });

      const { body } = await restOperation.response;
      const result = await body.json();
      


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
        path: 'payment',
        options: {
          body: {
            action: 'createPaymentIntent',
            data
          }
        }
      });

      const result = (await response.response).body.json();
      


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
        path: 'payment',
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
        path: 'payment',
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
        path: 'payment',
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
        path: 'payment',
        options: {
          body: {
            action: 'processACHPayment',
            data
          }
        }
      });

      const result = (await response.response).body.json();



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
        path: 'payment',
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