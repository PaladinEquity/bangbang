import { defineFunction } from '@aws-amplify/backend';
import { handler } from './handler';

export const payment = defineFunction({
  name: 'payment',
  entry: './handler.ts',
  environment: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_51R6bdvFpMNEVZL2GmEYx4uKwUZTgjaPa6R2LC9886HLArIxWeGcbxgbqZ1drXnSdF3PWqJiw38RpBB9KjtANNjW700czkwf2WJ',
    TRANSACTIONS_TABLE_NAME: process.env.TRANSACTIONS_TABLE_NAME ||'Transaction',
    PAYMENT_METHODS_TABLE: process.env.PAYMENT_METHODS_TABLE ||'PaymentMethod',
    WALLETS_TABLE: process.env.WALLETS_TABLE ||'Wallet',
  },
});