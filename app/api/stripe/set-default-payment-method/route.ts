import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { customerId, paymentMethodId, type } = await request.json();

    // Validate the required fields
    if (!customerId || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Missing required information' },
        { status: 400 }
      );
    }

    // Update the customer's default payment method based on type
    if (type === 'card') {
      // For cards, we need to update the customer's default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Also update the metadata to mark this as default
      await stripe.paymentMethods.update(paymentMethodId, {
        metadata: { isDefault: 'true' },
      });

      // Remove default status from other payment methods
      const otherPaymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      for (const method of otherPaymentMethods.data) {
        if (method.id !== paymentMethodId && method.metadata?.isDefault === 'true') {
          await stripe.paymentMethods.update(method.id, {
            metadata: { isDefault: 'false' },
          });
        }
      }
    } else if (type === 'bank_account') {
      // For bank accounts, we need to update the source
      const bankAccounts = await stripe.customers.listSources(
        customerId,
        { object: 'bank_account' }
      );

      // Update the selected bank account to be default
      await stripe.customers.updateSource(customerId, paymentMethodId, {
        metadata: { isDefault: 'true' },
      });

      // Remove default status from other bank accounts
      for (const account of bankAccounts.data) {
        if (account.id !== paymentMethodId && account.metadata?.isDefault === 'true') {
          await stripe.customers.updateSource(customerId, account.id, {
            metadata: { isDefault: 'false' },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error setting default payment method:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to set default payment method' },
      { status: 500 }
    );
  }
}