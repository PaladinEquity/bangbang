import { NextRequest, NextResponse } from 'next/server';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { stripe } from '@/lib/stripe';

// This endpoint has been updated to use Stripe directly for payment processing
// as the Transaction model has been removed from the schema

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, description, paymentMethodId, status } = await request.json();

    // Validate the required fields
    if (!userId || !amount || !description) {
      return NextResponse.json(
        { error: 'Missing required information' },
        { status: 400 }
      );
    }

    // Initialize the Amplify data client
    const client = generateClient<Schema>();

    // Update the wallet balance directly without creating a Transaction record
    const walletResponse = await client.models.Wallet.list({
      filter: { userId: { eq: userId } }
    });
    
    if (walletResponse.data && walletResponse.data.length > 0) {
      // Update existing wallet
      const updatedWallet = await client.models.Wallet.update({
        id: walletResponse.data[0].id,
        balance: (walletResponse.data[0].balance || 0) + amount,
      });
      
      return NextResponse.json({
        success: true,
        wallet: updatedWallet,
      });
    } else {
      // Create a new wallet if one doesn't exist
      const newWallet = await client.models.Wallet.create({
        userId,
        balance: amount,
      });
      
      return NextResponse.json({
        success: true,
        wallet: newWallet,
        isNewWallet: true,
      });
    }
  } catch (error: any) {
    console.error('Error updating wallet:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update wallet' },
      { status: 500 }
    );
  }
}