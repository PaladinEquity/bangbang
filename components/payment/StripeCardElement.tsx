'use client';

import React, { useState } from 'react';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe-client';

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
      setCardError('Payment system is not ready. Please try again in a moment.');
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
        // Handle specific error types with more user-friendly messages
        let errorMessage = error.message || 'An error occurred with your card';
        
        if (error.type === 'validation_error') {
          errorMessage = 'Please check your card information and try again.';
        } else if (error.type === 'card_error') {
          errorMessage = `Card error: ${error.message}`;
        }
        
        const customError = new Error(errorMessage);
        customError.name = 'StripeError';
        setCardError(errorMessage);
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
      console.error('Stripe card processing error:', err);
      setCardError('An unexpected error occurred. Please try again later.');
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
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                '::placeholder': {
                  color: '#aab7c4',
                },
                ':-webkit-autofill': {
                  color: '#424770',
                },
              },
              invalid: {
                color: '#9e2146',
                iconColor: '#9e2146',
                '::placeholder': {
                  color: '#c02b5a',
                },
              },
            },
            hidePostalCode: true,
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
    <Elements stripe={getStripe()}>
      <StripeCardForm {...props} />
    </Elements>
  );
};