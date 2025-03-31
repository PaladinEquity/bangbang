import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { paymentMethodId, customerId, isDefault } = await request.json();

    // Validate the required fields
    if (!paymentMethodId || !customerId) {
      return NextResponse.json(
        { error: 'Missing required payment information' },
        { status: 400 }
      );
    }

    // Create a setup intent and confirm it with the payment method
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ['us_bank_account'],
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
      mandate_data: {
        customer_acceptance: {
          type: 'offline'
        }
      }
    });

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // If this is the default payment method, update the customer's default payment method
    if (isDefault) {
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Update the payment method metadata
      await stripe.paymentMethods.update(paymentMethodId, {
        metadata: { isDefault: 'true' },
      });

      // Remove default status from other payment methods
      const otherPaymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'us_bank_account',
      });

      for (const method of otherPaymentMethods.data) {
        if (method.id !== paymentMethodId && method.metadata?.isDefault === 'true') {
          await stripe.paymentMethods.update(method.id, {
            metadata: { isDefault: 'false' },
          });
        }
      }
    }

    // Get the bank account details
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    
    return NextResponse.json({
      success: true,
      setupIntent: setupIntent.id,
      paymentMethod: {
        id: paymentMethod.id,
        type: 'bank_account',
        bankName: paymentMethod.us_bank_account?.bank_name || 'Unknown Bank',
        lastFour: paymentMethod.us_bank_account?.last4 || '****',
        routingNumber: paymentMethod.us_bank_account?.routing_number || '******',
        isDefault: isDefault,
      },
    });
  } catch (error: any) {
    console.error('Error creating bank payment method:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create bank payment method' },
      { status: 500 }
    );
  }
}