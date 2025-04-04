/**
 * Wallet related type definitions
 */

import { PaymentMethod } from './payment';

export type Transaction = {
  id: string | number | null;
  date: string | null;
  description: string | null;
  amount: number | null;
  status: string | null;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | null;
  paymentMethodId?: string | null;
  stripePaymentId?: string | null;
  userId?: string | null;
};

export type WalletData = {
  balance: number;
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
};