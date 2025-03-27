import { defineFunction } from '@aws-amplify/backend';
import { handler } from './handler';

export const payment = defineFunction({
  name: 'payment',
  entry: './handler.ts',
  environment: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    TRANSACTIONS_TABLE_NAME: 'transactions',
  },
});