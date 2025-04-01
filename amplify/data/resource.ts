import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*
This schema defines the data models for the wallet functionality with Stripe integration,
as well as cart and order management.
It includes models for User, PaymentMethod, BankAccount, Transaction, Wallet, and CartOrder with proper
relationships and authorization rules.
*/
const schema = a.schema({
  Wallpaper: a
    .model({
      imageData: a.string().required(), // Base64 encoded image data or URL
      description: a.string(),
      primaryImagery: a.string(),
      size: a.string(),
      price: a.float().required(),
      createdAt: a.datetime(),
      userId: a.string(), // To associate with a user if needed
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),
    
  CartItem: a
    .model({
      name: a.string().required(),
      description: a.string(),
      price: a.float().required(),
      quantity: a.integer().required().default(1),
      imageUrl: a.string(),
      imageData: a.string(),
      rollSize: a.string().required(),
      patternSize: a.string(),
      isCustom: a.boolean().required().default(false),
      wallpaperId: a.string().required(),
      userId: a.string().required(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),
    
  CartOrder: a
    .model({
      orderNumber: a.string().required(),
      totalAmount: a.float().required(),
      status: a.string().required().default('pending'),
      paymentStatus: a.string().default('unpaid'),
      paymentMethod: a.string(),
      stripePaymentId: a.string(),
      shippingAddress: a.string(),
      billingAddress: a.string(),
      orderDate: a.datetime().required(),
      items: a.string().required(), // JSON string containing order items
      userId: a.id(),
      user: a.belongsTo('User', 'userId'),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),
    
  User: a
    .model({
      email: a.string().required(),
      name: a.string(),
      stripeCustomerId: a.string(),
      wallet: a.hasOne('Wallet', 'userId'),
      paymentMethods: a.hasMany('PaymentMethod', 'userId'),
      BankAccounts: a.hasMany('BankAccount', 'userId'),
      transactions: a.hasMany('Transaction', 'userId'),
      orders: a.hasMany('CartOrder', 'userId'),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),

  Wallet: a
    .model({
      balance: a.float().required().default(0),
      userId: a.id(),
      user: a.belongsTo('User', 'userId'),
      transactions: a.hasMany('Transaction', 'userId'),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),

  PaymentMethod: a
    .model({
      type: a.enum(['card', 'bank_account']),
      lastFour: a.string().required(),
      isDefault: a.boolean().required().default(false),
      stripeTokenId: a.string(),
      expiryDate: a.string(),
      cardType: a.string(),
      userId: a.id(),
      user: a.belongsTo('User', 'userId'),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),

  BankAccount: a
    .model({
      accountHolderName: a.string().required(),
      lastFour: a.string().required(),
      routingNumber: a.string().required(),
      bankName: a.string(),
      isVerified: a.boolean().required().default(false),
      stripeTokenId: a.string(),
      userId: a.id(),
      user: a.belongsTo('User', 'userId'),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),

  Transaction: a
    .model({
      date: a.datetime().required(),
      description: a.string().required(),
      amount: a.float().required(),
      status: a.string().required().default('pending'),
      type: a.enum(['deposit', 'withdrawal', 'transfer', 'payment']),
      paymentMethodId: a.string(),
      stripePaymentId: a.string(),
      userId: a.id(),
      user: a.belongsTo('User', 'userId'),
      wallet: a.belongsTo('Wallet', 'userId'),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
