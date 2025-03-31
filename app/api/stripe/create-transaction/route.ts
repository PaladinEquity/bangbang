import { NextRequest, NextResponse } from 'next/server';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, description, paymentMethodId, status } = await request.json();

    // Validate the required fields
    if (!userId || !amount || !description) {
      return NextResponse.json(
        { error: 'Missing required transaction information' },
        { status: 400 }
      );
    }

    // Initialize the Amplify data client
    const client = generateClient<Schema>();

    // Create a new transaction
    const transaction = await client.models.Transaction.create({
      userId,
      amount,
      description,
      paymentMethodId: paymentMethodId || undefined,
      date: new Date().toISOString(),
      status: status || 'completed',
    });

    // Update the wallet balance
    const walletResponse = await client.models.Wallet.list({
      filter: { id: { eq: userId } }
    });
    
    if (walletResponse.data && walletResponse.data.length > 0) {
      // Update existing wallet
      const updatedWallet = await client.models.Wallet.update({
        id: walletResponse.data[0].id,
        balance: (walletResponse.data[0].balance || 0) + amount,
      });
      
      return NextResponse.json({
        success: true,
        transaction,
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
        transaction,
        wallet: newWallet,
        isNewWallet: true,
      });
    }
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create transaction' },
      { status: 500 }
    );
  }
}