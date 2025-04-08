import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { amount, paymentMethodId, currency = 'usd', customerId } = await request.json();

    // Validate required fields
    if (!amount || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Missing required payment information' },
        { status: 400 }
      );
    }

    // Create payment intent options
    const paymentIntentOptions: any = {
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${request.headers.get('origin')}/cart`,
    };
    
    // Determine payment method type and set allowed payment methods
    // This is necessary for certain payment methods like us_bank_account
    if (paymentMethodId.startsWith('pm_')) {
      try {
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
        if (paymentMethod.type === 'us_bank_account') {
          paymentIntentOptions.payment_method_types = ['us_bank_account', 'card'];
        }
      } catch (retrieveError) {
        console.error('Error retrieving payment method:', retrieveError);
        // Continue with default payment method types if retrieval fails
      }
    }
    
    // If customerId is provided, include it in the payment intent
    // This is necessary when using a payment method that belongs to a customer
    if (customerId) {
      paymentIntentOptions.customer = customerId;
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentOptions);

    // Return the payment intent details
    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret,
      },
    });
  } catch (error: any) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: error.message || 'Payment processing failed' },
      { status: 500 }
    );
  }
}