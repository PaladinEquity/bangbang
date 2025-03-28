import { defineFunction } from '@aws-amplify/backend';
import { handler } from './handler';

export const payment = defineFunction({
  name: 'payment',
  entry: './handler.ts',
  environment: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    TRANSACTIONS_TABLE_NAME: process.env.TRANSACTIONS_TABLE_NAME ||'Transaction',
    PAYMENT_METHODS_TABLE: process.env.PAYMENT_METHODS_TABLE ||'PaymentMethod',
    WALLETS_TABLE: process.env.WALLETS_TABLE ||'Wallet',
  },
});