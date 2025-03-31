/**
 * Service for handling payment processing
 */

import { getStripe } from '@/lib/stripe-client';

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

type PaymentResult = {
  success: boolean;
  error?: string;
  paymentIntentId?: string;
  status?: string;
};

// Process payment with a saved payment method
export async function processPayment(amount: number, paymentMethodId: string): Promise<PaymentResult> {
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
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const response = await fetch('/api/stripe/get-payment-methods', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
export async function processCardPayment(amount: number, cardElement: any): Promise<PaymentResult> {
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