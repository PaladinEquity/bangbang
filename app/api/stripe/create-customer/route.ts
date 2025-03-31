import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, name } = await request.json();

    // Validate the required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      );
    }

    // Check if a customer already exists for this user
    const customerSearch = await stripe.customers.search({
      query: `metadata['userId']:'${userId}'`,
    });

    if (customerSearch.data.length > 0) {
      // Customer already exists, return the existing customer
      return NextResponse.json({
        customerId: customerSearch.data[0].id,
        isNew: false
      });
    }

    // Create a new customer
    const customer = await stripe.customers.create({
      email: email || undefined,
      name: name || undefined,
      metadata: { userId },
    });

    return NextResponse.json({
      customerId: customer.id,
      isNew: true
    });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create customer' },
      { status: 500 }
    );
  }
}