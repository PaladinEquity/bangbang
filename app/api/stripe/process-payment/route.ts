import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { amount, paymentMethodId, currency = 'usd' } = await request.json();

    // Validate required fields
    if (!amount || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Missing required payment information' },
        { status: 400 }
      );
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${request.headers.get('origin')}/cart`,
    });

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