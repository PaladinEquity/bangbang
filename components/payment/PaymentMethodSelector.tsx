'use client';

import React, { useState } from 'react';
import { StripeCardElement } from './StripeCardElement';
import { StripeACHElement } from './StripeACHElement';

type PaymentMethodType = 'card' | 'ach';

type PaymentMethodSelectorProps = {
  onCardSuccess: (paymentMethod: { id: string; card: { brand: string; last4: string; exp_month: number; exp_year: number } }) => void;
  onACHSuccess: (paymentMethod: { id: string; bank_account: { bank_name: string; last4: string; routing_number: string } }) => void;
  onError: (error: Error) => void;
  isDefault?: boolean;
  onDefaultChange?: (isDefault: boolean) => void;
};

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onCardSuccess,
  onACHSuccess,
  onError,
  isDefault = false,
  onDefaultChange,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('card');

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-3">Select Payment Method</h2>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setSelectedMethod('card')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedMethod === 'card' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            Credit/Debit Card
          </button>
          <button
            type="button"
            onClick={() => setSelectedMethod('ach')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedMethod === 'ach' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            Bank Account (ACH)
          </button>
        </div>
      </div>

      {selectedMethod === 'card' ? (
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-3">Card Details</h3>
          <p className="text-sm text-gray-600 mb-4">
            Enter your card information securely. Your card details are encrypted and processed by Stripe.
          </p>
          <StripeCardElement
            onSuccess={onCardSuccess}
            onError={onError}
            buttonText="Save Card"
            isDefault={isDefault}
            onDefaultChange={onDefaultChange}
          />
        </div>
      ) : (
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-3">Bank Account Details</h3>
          <p className="text-sm text-gray-600 mb-4">
            Connect your bank account for ACH payments. This is typically more cost-effective for larger transactions and takes 1-2 business days to process.
          </p>
          <StripeACHElement
            onSuccess={onACHSuccess}
            onError={onError}
            buttonText="Save Bank Account"
            isDefault={isDefault}
            onDefaultChange={onDefaultChange}
          />
        </div>
      )}
    </div>
  );
};