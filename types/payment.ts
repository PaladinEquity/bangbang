/**
 * Payment related type definitions
 */

export type PaymentMethod = {
  id: string;
  userId: string;
  type: 'card' | 'bank_account';
  lastFour: string;
  isDefault: boolean;
  stripeTokenId: string;
  expiryDate?: string;
  cardType?: string;
  bankName?: string;
  name?: string;
};

export type BankAccountDetails = {
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
  country: string;
  currency: string;
};

export type BankAccount = {
  accountHolderName: string;
  lastFour: string;
  routingNumber: string;
  bankName: string;
  isVerified: boolean;
  stripeTokenId: string;
  userId: string;
};

export type PaymentResult = {
  success: boolean;
  error?: string;
  transactionId?: string;
  amount?: number;
};

export type StripeCustomer = {
  customerId: string;
  isNew: boolean;
};

export type PaymentMethodSelectorProps = {
  onCardSuccess: (paymentMethod: any) => void;
  onACHSuccess: (paymentMethod: any) => void;
  onError: (error: Error) => void;
  onDefaultChange?: (isDefault: boolean) => void;
  isDefault?: boolean;
  isSubmitting?: boolean;
};

export type StripeElementsProps = {
  onSuccess: (paymentMethod: any) => void;
  onError: (error: Error) => void;
  onDefaultChange?: (isDefault: boolean) => void;
  isSubmitting?: boolean;
  buttonText?: string;
  isDefault?: boolean;
  customerName?: string;
  customerEmail?: string;
};