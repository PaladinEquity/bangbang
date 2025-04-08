import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

export async function POST(request: NextRequest) {
  try {
    const { amount, bankAccountToken, userId, description } = await request.json();

    // Validate the required fields
    if (!amount || !bankAccountToken || !userId) {
      return NextResponse.json(
        { error: 'Missing required payment information' },
        { status: 400 }
      );
    }

    // Create a customer if one doesn't exist
    // In a real app, you would store and retrieve the customer ID from your database
    const customerSearch = await stripe.customers.search({
      query: `metadata['userId']:'${userId}'`,
    });

    let customerId;
    if (customerSearch.data.length > 0) {
      customerId = customerSearch.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        metadata: { userId },
      });
      customerId = customer.id;
    }

    // Attach the bank account to the customer
    const bankAccount = await stripe.customers.createSource(customerId, {
      source: bankAccountToken,
    });

    // Create an ACH payment (this is a simplified example)
    // In production, you would use Stripe's ACH Direct Debit or similar
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      payment_method: bankAccount.id,
      payment_method_types: ['us_bank_account'],
      confirm: true,
      description: description || 'Wallet deposit via ACH',
      metadata: {
        userId,
        type: 'wallet_deposit',
      },
    });

    // Update the user's wallet balance in the database
    const client = generateClient<Schema>({authMode: 'userPool'});
    
    // Transaction model has been removed, so we're not creating a transaction record anymore
    // Instead, we'll just update the wallet balance directly
    
    // Update the wallet balance
    const walletResponse = await client.models.Wallet.list({
      filter: { userId: { eq: userId } }
    });
    
    let wallet;
    if (walletResponse.data && walletResponse.data.length > 0) {
      // Update existing wallet
      wallet = await client.models.Wallet.update({
        id: walletResponse.data[0].id,
        balance: (walletResponse.data[0].balance || 0) + amount,
      });
    } else {
      // Create a new wallet if one doesn't exist
      wallet = await client.models.Wallet.create({
        userId,
        balance: amount,
      });
    }

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: amount,
      },
      wallet,
    });
  } catch (error: any) {
    console.error('Error processing ACH deposit:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process ACH deposit' },
      { status: 500 }
    );
  }
}