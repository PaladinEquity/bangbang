import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { addUserToGroup } from "./add-user-to-group/resource";
import { removeUserFromGroup } from "./remove-user-from-group/resource";
import { manageUsers } from "./manage-users/resource";
import { manageUserGroups } from "./manage-user-groups/resource";
import { manageUserDevices } from "./manage-user-devices/resource";
import { listUsers } from "./list-users/resource";
import { listUsersInGroup } from "./list-users-in-group/resource";
/*
This schema defines the data models for the wallet functionality with Stripe integration,
as well as cart and order management.
It includes models for User, Wallet, and CartOrder with proper relationships and authorization rules.
Payment processing is handled directly through Stripe API.
*/
const schema = a.schema({
  Wallpaper: a
    .model({
      imageData: a.string().required(), // Base64 encoded image data or URL
      description: a.string(),
      primaryImagery: a.string(),
      size: a.string(),
      price: a.float().required(),
      ranking: a.integer(), // Added ranking field for display order
      createdAt: a.datetime(),
      userId: a.string(), // To associate with a user if needed
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),
    
  UserPreference: a
    .model({
      userId: a.string().required(),
      wallpaperId: a.string().required(),
      liked: a.boolean().required().default(true),
      createdAt: a.datetime().required(),
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
      userId: a.string(),
      // user: a.belongsTo('User', 'userId'),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),

  Wallet: a
    .model({
      balance: a.float().required().default(0),
      userId: a.string(),
      // user: a.belongsTo('User', 'userId'),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),
    addUserToGroup: a
    .mutation()
    .arguments({
      userId: a.string().required(),
      groupName: a.string().required(),
    })
    .authorization((allow) => [allow.group("ADMINS")])
    .handler(a.handler.function(addUserToGroup))
    .returns(a.json()),
    
    manageUsers: a
    .mutation()
    .arguments({
      operation: a.string().required(),
      username: a.string(),
      email: a.string(),
      temporaryPassword: a.string(),
      userAttributes: a.json(),
      limit: a.integer(),
      paginationToken: a.string()
    })
    .authorization((allow) => [allow.group("ADMINS")])
    .handler(a.handler.function(manageUsers))
    .returns(a.json()),
    
    manageUserGroups: a
    .mutation()
    .arguments({
      operation: a.string().required(),
      groupName: a.string(),
      description: a.string(),
      precedence: a.integer(),
      limit: a.integer(),
      paginationToken: a.string()
    })
    .authorization((allow) => [allow.group("ADMINS")])
    .handler(a.handler.function(manageUserGroups))
    .returns(a.json()),
    
    manageUserDevices: a
    .mutation()
    .arguments({
      operation: a.string().required(),
      username: a.string().required(),
      deviceKey: a.string(),
      deviceRememberedStatus: a.string(),
      limit: a.integer(),
      paginationToken: a.string()
    })
    .authorization((allow) => [allow.group("ADMINS")])
    .handler(a.handler.function(manageUserDevices))
    .returns(a.json()),
    
    listUsers: a
    .query()
    .arguments({
      limit: a.integer(),
      paginationToken: a.string()
    })
    .authorization((allow) => [allow.group("ADMINS")])
    .handler(a.handler.function(listUsers))
    .returns(a.json()),
    
    listUsersInGroup: a
    .query()
    .arguments({
      groupName: a.string().required(),
      limit: a.integer(),
      paginationToken: a.string()
    })
    .authorization((allow) => [allow.group("ADMINS")])
    .handler(a.handler.function(listUsersInGroup))
    .returns(a.json()),
    
    removeUserFromGroup: a
    .mutation()
    .arguments({
      userId: a.string().required(),
      groupName: a.string().required(),
    })
    .authorization((allow) => [allow.group("ADMINS")])
    .handler(a.handler.function(removeUserFromGroup))
    .returns(a.json())
  // Payment processing is handled directly through Stripe API
  // PaymentMethod, BankAccount, and Transaction models have been removed
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "iam",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
