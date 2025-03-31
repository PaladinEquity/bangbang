import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { cardToken, customerId, isDefault } = await request.json();

    // Validate the required fields
    if (!cardToken || !customerId) {
      return NextResponse.json(
        { error: 'Missing required payment information' },
        { status: 400 }
      );
    }

    // Attach the payment method to the customer
    const paymentMethod = await stripe.paymentMethods.attach(cardToken, {
      customer: customerId,
    });

    // If this is the default payment method, update the customer's default payment method
    if (isDefault) {
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });

      // Update the payment method metadata
      await stripe.paymentMethods.update(paymentMethod.id, {
        metadata: { isDefault: 'true' },
      });

      // Remove default status from other payment methods
      const otherPaymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      for (const method of otherPaymentMethods.data) {
        if (method.id !== paymentMethod.id && method.metadata?.isDefault === 'true') {
          await stripe.paymentMethods.update(method.id, {
            metadata: { isDefault: 'false' },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      paymentMethod: {
        id: paymentMethod.id,
        type: 'card',
        cardType: paymentMethod.card?.brand || 'unknown',
        lastFour: paymentMethod.card?.last4 || '****',
        expiryDate: paymentMethod.card ? `${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year}` : undefined,
        isDefault: isDefault,
      },
    });
  } catch (error: any) {
    console.error('Error creating card payment method:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create card payment method' },
      { status: 500 }
    );
  }
}