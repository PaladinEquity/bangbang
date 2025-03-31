import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*
This schema defines the data models for the wallet functionality with Stripe integration.
It includes models for User, PaymentMethod, BankAccount, Transaction, and Wallet with proper
relationships and authorization rules.
*/
const schema = a.schema({
  User: a
    .model({
      email: a.string().required(),
      name: a.string(),
      stripeCustomerId: a.string(),
      wallet: a.hasOne('Wallet', 'userId'),
      paymentMethods: a.hasMany('PaymentMethod', 'userId'),
      BankAccounts: a.hasMany('BankAccount', 'userId'),
      transactions: a.hasMany('Transaction', 'userId'),
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
