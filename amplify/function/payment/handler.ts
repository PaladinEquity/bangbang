import Stripe from 'stripe';
import type { Handler } from 'aws-lambda';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51R6bdvFpMNEVZL2GmEYx4uKwUZTgjaPa6R2LC9886HLArIxWeGcbxgbqZ1drXnSdF3PWqJiw38RpBB9KjtANNjW700czkwf2WJ', {
  apiVersion: '2025-02-24.acacia', // Updated to the correct version
});

export const handler: Handler = async (event, context) => {
  try {
    // Parse the incoming request body
    const body = JSON.parse(event.body || '{}');
    const { action, data } = body;
    // Route to the appropriate handler based on the action
    switch (action) {
      case 'createPaymentIntent':
        return await createPaymentIntent(data);
      case 'confirmPayment':
        return await confirmPayment(data);
      case 'createCustomer':
        return await createCustomer(data);
      case 'addPaymentMethod':
        return await addPaymentMethod(data);
      case 'listPaymentMethods':
        return await listPaymentMethods(data);
      case 'setDefaultPaymentMethod':
        return await setDefaultPaymentMethod(data);
      case 'processDeposit':
        return await processDeposit(data);
      case 'createBankAccount':
        return await createBankAccount(data);
      case 'verifyBankAccount':
        return await verifyBankAccount(data);
      case 'processACHPayment':
        return await processACHPayment(data);
      case 'saveTransaction':
        return await saveTransaction(data);
      default:
        return {
          statusCode: 400,
          headers: {
            "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
            "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
          },
          body: JSON.stringify({ error: 'Invalid action' }),
        };
    }
  } catch (error) {
    console.error('Error processing payment request:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
        "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

// Create a payment intent for a purchase
async function createPaymentIntent(data: any) {
  const { amount, currency = 'usd', customerId, paymentMethodId, metadata } = data;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      payment_method: paymentMethodId,
      metadata,
      confirmation_method: 'manual',
      confirm: false,
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
        "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
      },
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };
  } catch (error: any) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
        "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// Confirm a payment intent
async function confirmPayment(data: any) {
  const { paymentIntentId } = data;

  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
        "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
      },
      body: JSON.stringify({ paymentIntent }),
    };
  } catch (error: any) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
        "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// Create a new Stripe customer
async function createCustomer(data: any) {
  const { email, name, metadata } = data;

  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
        "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
      },
      body: JSON.stringify({ customer }),
    };
  } catch (error: any) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
        "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// Add a payment method to a customer
async function addPaymentMethod(data: any) {

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    },
    body: JSON.stringify({ success: true }),
  };

  const { customerId, paymentMethodId } = data;

  try {
    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Get payment method details
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Save payment method to DynamoDB
    const AWS = require('aws-sdk');
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    
    await dynamodb.put({
      TableName: process.env.PAYMENT_METHODS_TABLE,
      Item: {
        userId: customerId,
        customerId,
        paymentMethodId,
        type: 'card',
        last4: paymentMethod.card?.last4 || '',
        brand: paymentMethod.card?.brand || 'unknown',
        isDefault: true,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({ success: true, paymentMethod }),
    };
  } catch (error: any) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// List payment methods for a customer
async function listPaymentMethods(data: any) {
  const { customerId, type = 'card' } = data;

  try {
    const paymentMethods = await stripe.customers.listPaymentMethods(
      customerId,
      { type }
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
        "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
      },
      body: JSON.stringify({ paymentMethods: paymentMethods.data }),
    };
  } catch (error: any) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
        "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// Set a payment method as default for a customer
async function setDefaultPaymentMethod(data: any) {
  const { customerId, paymentMethodId } = data;

  try {
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Update default payment method in DynamoDB
    const AWS = require('aws-sdk');
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    
    // First reset all payment methods to non-default
    await dynamodb.update({
      TableName: process.env.PAYMENT_METHODS_TABLE,
      Key: { userId: customerId },
      UpdateExpression: 'SET isDefault = :false, updatedAt = :now',
      ExpressionAttributeValues: {
        ':false': false,
        ':now': new Date().toISOString()
      }
    }).promise();
    
    // Then set the specified method as default
    await dynamodb.update({
      TableName: process.env.PAYMENT_METHODS_TABLE,
      Key: { userId: customerId, paymentMethodId },
      UpdateExpression: 'SET isDefault = :true, updatedAt = :now',
      ExpressionAttributeValues: {
        ':true': true,
        ':now': new Date().toISOString()
      }
    }).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (error: any) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// Process a deposit to the user's wallet
async function processDeposit(data: any) {
  const { amount, currency = 'usd', customerId, paymentMethodId, metadata } = data;

  try {
    // Create and confirm the payment intent in one step
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      payment_method: paymentMethodId,
      metadata: {
        ...metadata,
        type: 'wallet_deposit',
      },
      confirm: true,
      off_session: true,
    });

    // Record transaction in DynamoDB
    const AWS = require('aws-sdk');
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    
    await dynamodb.put({
      TableName: process.env.TRANSACTIONS_TABLE,
      Item: {
        transactionId: paymentIntent.id,
        userId: customerId,
        customerId,
        amount,
        currency,
        paymentMethodId,
        paymentType: 'card',
        status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending',
        metadata: { ...metadata, type: 'wallet_deposit' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }).promise();
    
    // Update wallet balance
    await dynamodb.update({
      TableName: process.env.WALLETS_TABLE,
      Key: { userId: customerId },
      UpdateExpression: 'SET balance = if_not_exists(balance, :zero) + :amount, updatedAt = :now',
      ExpressionAttributeValues: {
        ':amount': amount,
        ':zero': 0,
        ':now': new Date().toISOString()
      }
    }).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({ paymentIntent }),
    };
  } catch (error: any) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// Create a bank account for ACH payments
async function createBankAccount(data: any) {
  const {
    customerId,
    accountHolderName,
    accountHolderType,
    routingNumber,
    accountNumber,
    accountType = 'checking',
    metadata
  } = data;

  try {
    // Create a bank account token
    const bankAccountToken = await stripe.tokens.create({
      bank_account: {
        country: 'US',
        currency: 'usd',
        account_holder_name: accountHolderName,
        account_holder_type: accountHolderType,
        routing_number: routingNumber,
        account_number: accountNumber,
        account_type: accountType,
      },
    });

    // Attach the bank account to the customer
    const bankAccount = await stripe.customers.createSource(customerId, {
      source: bankAccountToken.id,
      metadata,
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
        "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
      },
      body: JSON.stringify({ bankAccount }),
    };
  } catch (error: any) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
        "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// Verify a bank account with micro-deposits
async function verifyBankAccount(data: any) {
  const { bankAccountId, amounts } = data;

  try {
    // Verify the bank account with the provided amounts
    const bankAccount = await stripe.customers.verifySource(
      bankAccountId.split('_')[0], // Extract customer ID from bank account ID
      bankAccountId.split('_')[1], // Extract source ID from bank account ID
      { amounts: amounts.map((amount: number) => Math.round(amount * 100)) } // Convert to cents
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
        "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
      },
      body: JSON.stringify({ bankAccount }),
    };
  } catch (error: any) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
        "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// Process an ACH payment
async function processACHPayment(data: any) {
  const { amount, currency = 'usd', customerId, bankAccountId, metadata } = data;

  try {
    // Create a payment intent with ACH payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      payment_method_types: ['us_bank_account'],
      payment_method: bankAccountId,
      metadata: {
        ...metadata,
        payment_type: 'ach',
      },
      confirm: true,
      off_session: true,
    });

    // Create transaction record
    const transaction = {
      id: paymentIntent.id,
      userId: customerId, // Using customerId as userId for simplicity
      customerId: customerId,
      amount: amount,
      currency: currency,
      bankAccountId: bankAccountId,
      paymentType: 'ach',
      status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending',
      metadata: {
        ...metadata,
        payment_type: 'ach',
        stripe_payment_intent_id: paymentIntent.id,
        stripe_payment_intent_status: paymentIntent.status
      },
      createdDate: new Date().toISOString()
    };

    // Call saveTransaction function to store the transaction
    await saveTransaction(transaction);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
        "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
      },
      body: JSON.stringify({ paymentIntent }),
    };
  } catch (error: any) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
        "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// Save a transaction record to the database
async function saveTransaction(data: any) {
  const {
    userId,
    customerId,
    amount,
    currency = 'usd',
    paymentMethodId,
    bankAccountId,
    paymentType,
    status,
    metadata,
    createdDate = new Date().toISOString()
  } = data;

  try {
    // Create DynamoDB client
    const AWS = require('aws-sdk');
    const dynamoDB = new AWS.DynamoDB.DocumentClient();

    // Prepare transaction record for DynamoDB
    const transactionItem = {
      userId,
      customerId,
      amount,
      currency,
      paymentMethodId: paymentMethodId || null,
      bankAccountId: bankAccountId || null,
      paymentType,
      status,
      metadata,
      createdDate,
      updatedDate: createdDate
    };

    // Save to DynamoDB
    await dynamoDB.put({
      TableName: process.env.TRANSACTIONS_TABLE_NAME || 'transactions',
      Item: transactionItem
    }).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
        "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
      },
      body: JSON.stringify({ transaction: transactionItem }),
    };
  } catch (error: any) {
    console.error('Error saving transaction:', error);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
        "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
}