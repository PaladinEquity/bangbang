import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { accountHolderName, accountNumber, routingNumber } = await request.json();

    // Validate the required fields
    if (!accountHolderName || !accountNumber || !routingNumber) {
      return NextResponse.json(
        { error: 'Missing required bank account information' },
        { status: 400 }
      );
    }

    // Create a bank account token with Stripe
    const bankAccountToken = await stripe.tokens.create({
      bank_account: {
        country: 'US',
        currency: 'usd',
        account_holder_name: accountHolderName,
        account_holder_type: 'individual',
        routing_number: routingNumber,
        account_number: accountNumber,
      },
    });

    return NextResponse.json({ token: bankAccountToken.id });
  } catch (error: any) {
    console.error('Error creating bank account token:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create bank account token' },
      { status: 500 }
    );
  }
}