import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe for client-side operations
let stripePromise: Promise<any> | null = null;
export const getStripe = () => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    console.error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
    return Promise.reject(new Error('Stripe publishable key is missing'));
  }
  
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};