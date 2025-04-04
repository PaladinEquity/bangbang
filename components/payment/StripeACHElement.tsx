'use client';

import React, { useState } from 'react';
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe-client';
import { StripeElementsProps } from '@/types/payment';

import type { StripeElementsOptions } from '@stripe/stripe-js';

// Remove duplicate type definitions since we're importing from centralized types

const StripeACHForm: React.FC<StripeElementsProps> = ({
  onSuccess,
  onError,
  buttonText = 'Save Bank Account',
  isDefault = false,
  onDefaultChange,
  customerName = '',
  customerEmail = '',
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [achError, setAchError] = useState<string | null>(null);
  const [defaultAccount, setDefaultAccount] = useState(isDefault);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setAchError('Payment system is not ready. Please try again in a moment.');
      return;
    }

    setIsProcessing(true);
    setAchError(null);

    try {
      // Submit the form data to Stripe first
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        let errorMessage = submitError.message || 'Failed to submit payment information';
        if (submitError.type === 'validation_error') {
          errorMessage = 'Please check your bank account information and try again.';
        }
        throw new Error(errorMessage);
      }
      
      // Then create the payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        elements,
        params: {
          billing_details: {
            name: customerName,
            email: customerEmail,
          },
        },
      });

      if (error) {
        let errorMessage = error.message || 'Failed to create payment method';
        if (error.type === 'validation_error') {
          errorMessage = 'Please check your bank account information and try again.';
        }
        throw new Error(errorMessage);
      }

      if (!paymentMethod?.us_bank_account) {
        throw new Error('Bank account information not found. Please try again.');
      }
      console.log("here everything is good");
      onSuccess({
        id: paymentMethod.id,
        bank_account: {
          bank_name: paymentMethod.us_bank_account.bank_name || 'Unknown Bank',
          last4: paymentMethod.us_bank_account.last4 || '****',
          routing_number: paymentMethod.us_bank_account.routing_number || '******',
        },
      });

      if (onDefaultChange) {
        onDefaultChange(defaultAccount);
      }
    } catch (err) {
      console.error('Stripe ACH processing error:', err);
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setAchError(error.message);
      onError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDefaultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setDefaultAccount(isChecked);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 border border-gray-300 rounded-md">
        <PaymentElement
          options={{
            fields: {
              billingDetails: {
                name: 'auto',
                email: 'auto',
              },
            },
          }}
        />
      </div>

      {achError && (
        <div className="text-red-500 text-sm mt-1">{achError}</div>
      )}

      {onDefaultChange && (
        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            id="defaultAccount"
            checked={defaultAccount}
            onChange={handleDefaultChange}
            className="h-4 w-4 text-gray-800 focus:ring-0 border-gray-300 rounded"
          />
          <label htmlFor="defaultAccount" className="ml-2 block text-sm text-gray-700">
            Set as default payment method
          </label>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full px-4 py-2 bg-gray-800 text-white rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-0 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : buttonText}
      </button>
    </form>
  );
};

type StripeACHElementProps = StripeElementsProps & {
  clientSecret?: string;
  appearance?: any;
};

export const StripeACHElement: React.FC<StripeACHElementProps> = ({
  clientSecret,
  appearance,
  ...props
}) => {
  const options: StripeElementsOptions = clientSecret
  ? {
    clientSecret: clientSecret,
    appearance: appearance,
  } : {
    mode: 'setup', // Use 'setup' when saving payment methods for future use
    currency: 'usd',
    paymentMethodTypes: ['us_bank_account'], // Configure payment methods here
    appearance,
    paymentMethodCreation: 'manual', // Required to fix the IntegrationError
  };

  return (
    <Elements stripe={getStripe()} options={options}>
      <StripeACHForm {...props} />
    </Elements>
  );
};