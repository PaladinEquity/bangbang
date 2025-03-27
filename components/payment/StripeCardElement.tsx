'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Initialize Stripe with your publishable key
// In production, this should be an environment variable
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

type StripeCardFormProps = {
  onSuccess: (paymentMethod: { id: string; card: { brand: string; last4: string; exp_month: number; exp_year: number } }) => void;
  onError: (error: Error) => void;
  buttonText?: string;
  isDefault?: boolean;
  onDefaultChange?: (isDefault: boolean) => void;
};

const StripeCardForm: React.FC<StripeCardFormProps> = ({
  onSuccess,
  onError,
  buttonText = 'Save Card',
  isDefault = false,
  onDefaultChange,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [defaultCard, setDefaultCard] = useState(isDefault);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        const customError = new Error(error.message || 'An error occurred with your card');
        customError.name = 'StripeError';
        setCardError(customError.message);
        onError(customError);
      } else if (paymentMethod && paymentMethod.card) {
        // Pass the payment method to the parent component
        onSuccess({
          id: paymentMethod.id,
          card: {
            brand: paymentMethod.card.brand,
            last4: paymentMethod.card.last4,
            exp_month: paymentMethod.card.exp_month,
            exp_year: paymentMethod.card.exp_year,
          },
        });
        
        // If onDefaultChange is provided, call it with the current defaultCard value
        if (onDefaultChange) {
          onDefaultChange(defaultCard);
        }
      }
    } catch (err) {
      setCardError('An unexpected error occurred');
      onError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDefaultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDefaultCard(e.target.checked);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 border border-gray-300 rounded-md">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      
      {cardError && (
        <div className="text-red-500 text-sm mt-1">{cardError}</div>
      )}
      
      {onDefaultChange && (
        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            id="defaultCard"
            checked={defaultCard}
            onChange={handleDefaultChange}
            className="h-4 w-4 text-gray-800 focus:ring-0 border-gray-300 rounded"
          />
          <label htmlFor="defaultCard" className="ml-2 block text-sm text-gray-700">
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

type StripeCardElementProps = {
  onSuccess: (paymentMethod: { id: string; card: { brand: string; last4: string; exp_month: number; exp_year: number } }) => void;
  onError: (error: Error) => void;
  buttonText?: string;
  isDefault?: boolean;
  onDefaultChange?: (isDefault: boolean) => void;
};

export const StripeCardElement: React.FC<StripeCardElementProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <StripeCardForm {...props} />
    </Elements>
  );
};