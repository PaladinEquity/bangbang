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
export async function processPayment(amount: number, paymentMethodId: string, customerId?: string): Promise<StripePaymentResult> {
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
        customerId, // Include the customer ID if provided
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
    console.log("-------",customerId);
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
    // Validate inputs
    if (!cardToken) {
      throw new Error('Card token is required');
    }
    
    if (!customerId) {
      throw new Error('Customer ID is required');
    }
    
    // Check for duplicate payment methods to avoid creating multiple identical cards
    const existingMethods = await getPaymentMethods(customerId);
    const isDuplicate = existingMethods.some(method => 
      method.type === 'card' && method.stripeTokenId === cardToken
    );
    
    if (isDuplicate) {
      return {
        success: false,
        error: 'This card is already saved to your account'
      };
    }
    
    // Limit the number of payment methods per customer (e.g., max 5 cards)
    const cardMethods = existingMethods.filter(method => method.type === 'card');
    if (cardMethods.length >= 5) {
      return {
        success: false,
        error: 'Maximum number of cards reached (5). Please remove an existing card before adding a new one.'
      };
    }
    
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
    // Validate inputs
    if (!paymentMethodId) {
      throw new Error('Payment method ID is required');
    }
    
    if (!customerId) {
      throw new Error('Customer ID is required');
    }
    
    // Check for duplicate payment methods to avoid creating multiple identical bank accounts
    const existingMethods = await getPaymentMethods(customerId);
    const isDuplicate = existingMethods.some(method => 
      method.type === 'bank_account' && method.id === paymentMethodId
    );
    
    if (isDuplicate) {
      return {
        success: false,
        error: 'This bank account is already saved to your account'
      };
    }
    
    // Limit the number of bank accounts per customer (e.g., max 3 bank accounts)
    const bankMethods = existingMethods.filter(method => method.type === 'bank_account');
    if (bankMethods.length >= 3) {
      return {
        success: false,
        error: 'Maximum number of bank accounts reached (3). Please remove an existing bank account before adding a new one.'
      };
    }
    
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

// Update user's Stripe customer ID in their attributes
export async function updateUserStripeCustomerId(
  customerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Import here to avoid circular dependencies
    const { updateUserAttributes } = await import('aws-amplify/auth');
    
    await updateUserAttributes({
      userAttributes: {
        'custom:stripeCustomerId' : customerId
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user Stripe customer ID:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}