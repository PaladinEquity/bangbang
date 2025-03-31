import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { bankAccountToken } = await request.json();

    // Validate the required fields
    if (!bankAccountToken) {
      return NextResponse.json(
        { error: 'Missing bank account token' },
        { status: 400 }
      );
    }

    // Retrieve the bank account details from Stripe
    const token = await stripe.tokens.retrieve(bankAccountToken);
    
    if (!token.bank_account) {
      return NextResponse.json(
        { error: 'Invalid bank account token' },
        { status: 400 }
      );
    }

    // Return the bank account details
    return NextResponse.json({
      last4: token.bank_account.last4,
      bank_name: token.bank_account.bank_name,
      country: token.bank_account.country,
      currency: token.bank_account.currency,
      status: token.bank_account.status
    });
  } catch (error: any) {
    console.error('Error retrieving bank account details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve bank account details' },
      { status: 500 }
    );
  }
}