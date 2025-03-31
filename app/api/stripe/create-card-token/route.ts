import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { cardNumber, expiryDate, cvv, nameOnCard } = await request.json();

    // Validate the required fields
    if (!cardNumber || !expiryDate || !cvv || !nameOnCard) {
      return NextResponse.json(
        { error: 'Missing required card information' },
        { status: 400 }
      );
    }

    // Parse expiry date (MM/YY format)
    const [expMonth, expYear] = expiryDate.split('/');
    
    if (!expMonth || !expYear) {
      return NextResponse.json(
        { error: 'Invalid expiry date format. Use MM/YY' },
        { status: 400 }
      );
    }

    // Create a card token with Stripe
    const cardToken = await stripe.tokens.create({
      card: {
        number: cardNumber.replace(/\s+/g, ''),
        exp_month: parseInt(expMonth, 10),
        exp_year: parseInt(`20${expYear}`, 10), // Convert YY to 20YY
        cvc: cvv,
        name: nameOnCard,
      },
    } as any);

    // Create a payment method from the token
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: cardToken.id,
      },
    });

    return NextResponse.json({
      token: paymentMethod.id,
      last4: cardToken.card?.last4,
      brand: cardToken.card?.brand,
    });
  } catch (error: any) {
    console.error('Error creating card token:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create card token' },
      { status: 500 }
    );
  }
}