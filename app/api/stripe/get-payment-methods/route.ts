import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json();

    // Validate the required fields
    if (!customerId) {
      return NextResponse.json(
        { error: 'Missing customer ID' },
        { status: 400 }
      );
    }

    // Retrieve all payment methods for the customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    
    // Also get bank accounts if available
    const bankAccounts = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'us_bank_account',
    });
    
    // Format the payment methods for the frontend
    const formattedPaymentMethods = [
      ...paymentMethods.data.map(method => ({
        id: method.id,
        type: 'card',
        cardType: method.card?.brand || 'unknown',
        lastFour: method.card?.last4 || '****',
        expiryDate: method.card ? `${method.card.exp_month}/${method.card.exp_year}` : undefined,
        isDefault: method.metadata?.isDefault === 'true',
      })),
      ...bankAccounts.data.map(account => ({
        id: account.id,
        type: 'bank_account',
        bankName: account.us_bank_account?.bank_name || 'Bank Account',
        lastFour: account.us_bank_account?.last4 || '****',
        isDefault: account.metadata?.isDefault === 'true',
      }))
    ];

    return NextResponse.json({ paymentMethods: formattedPaymentMethods });
  } catch (error: any) {
    console.error('Error retrieving payment methods:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve payment methods' },
      { status: 500 }
    );
  }
}