import Stripe from 'stripe';

// Check if the required environment variables are set
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY environment variable');
}

// Initialize Stripe with your secret key for server-side operations
export const stripe = new Stripe(STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia', // Use a stable API version
});