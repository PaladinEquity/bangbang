/**
 * Service for handling payment processing
 */

import { getStripe } from '@/lib/stripe-client';
import { PaymentMethod, PaymentResult, StripeCustomer } from '@/types';

// Extended PaymentResult for Stripe-specific responses
interface StripePaymentResult extends PaymentResult {
  paymentIntentId?: string;
  status?: string;
}

// Create or get a Stripe customer for the user
export async function createOrGetStripeCustomer(userId: string, email: string, name: string): Promise<StripeCustomer> {
  try {
    const response = await fetch('/api/stripe/create-customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        email,
        name,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create Stripe customer');
    }
    
    const customerData: StripeCustomer = await response.json();
    return customerData;
  } catch (error) {
    console.error('Error creating/getting Stripe customer:', error);
    throw error;
  }
}

// Process payment with a saved payment method
export async function processPayment(amount: number, paymentMethodId: string): Promise<StripePaymentResult> {
  try {
    // In a real implementation, this would call your backend API
    // which would then use Stripe to create a payment intent
    const response = await fetch('/api/stripe/process-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        paymentMethodId,
        currency: 'usd',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Payment processing failed');
    }

    const data = await response.json();
    return {
      success: true,
      paymentIntentId: data.paymentIntent?.id,
      status: data.paymentIntent?.status,
    };
  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown payment error',
    };
  }
}

// Get saved payment methods for the current user
export async function getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
  try {
    const response = await fetch('/api/stripe/get-payment-methods', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch payment methods');
    }

    const data = await response.json();
    return data.paymentMethods || [];
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return [];
  }
}

// Set a payment method as default
export async function setDefaultPaymentMethod(paymentMethodId: string, type: 'card' | 'bank_account'): Promise<boolean> {
  try {
    const response = await fetch('/api/stripe/set-default-payment-method', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethodId,
        type,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update default payment method');
    }

    return true;
  } catch (error) {
    console.error('Error setting default payment method:', error);
    return false;
  }
}

// Process a new card payment (for guest checkout)
export async function processCardPayment(amount: number, cardElement: any): Promise<StripePaymentResult> {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }

    // Create a payment method from the card element
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      throw new Error(error.message || 'Failed to create payment method');
    }

    if (!paymentMethod) {
      throw new Error('No payment method created');
    }

    // Process the payment with the created payment method
    return await processPayment(amount, paymentMethod.id);
  } catch (error) {
    console.error('Card payment processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown payment error',
    };
  }
}

// Create a card payment method and attach it to a customer
export async function createCardPaymentMethod(
  cardToken: string,
  customerId: string,
  isDefault: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/stripe/create-card-payment-method', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardToken,
        customerId,
        isDefault,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to attach card to customer');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding card payment method:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Create a bank account payment method and attach it to a customer
export async function createBankPaymentMethod(
  paymentMethodId: string,
  customerId: string,
  isDefault: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/stripe/create-bank-payment-method', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethodId,
        customerId,
        isDefault,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to attach bank account to customer');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding bank payment method:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Process an ACH deposit
export async function processACHDeposit(
  amount: number,
  bankAccountToken: string,
  userId: string,
  description: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/stripe/process-ach-deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        bankAccountToken,
        userId,
        description,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to process ACH deposit');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error processing ACH deposit:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}