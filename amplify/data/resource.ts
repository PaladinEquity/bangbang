import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates database tables for the application.
The authorization rules specify who can access each model.
=========================================================================*/
const schema = a.schema({
  // Original Todo model
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // Wallpaper data model
  WallpaperData: a.model({
    projectId: a.string().required(),
    storageKey: a.string().required(), // S3 object key
    mimeType: a.string().required(),
    generationDescription: a.json().required(), // Store generation parameters as JSON
    userId: a.string().required(),
    createdDate: a.datetime().required(),
    thumbnailKey: a.string(), // Optional thumbnail reference
    dimensions: a.json(), // { width: number, height: number }
    fileSize: a.integer(),
    status: a.enum(['active', 'deleted', 'archived'])
  })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.owner().to(['create', 'read', 'update', 'delete'])
    ]),

  // Cart/Order information model
  CartOrder: a
    .model({
      projectId: a.string().required(),
      customerId: a.string().required(),
      quantity: a.integer().required(),
      totalAmount: a.float().required(),
      createdDate: a.datetime().required(),
      status: a.enum(['pending', 'completed', 'cancelled']),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.owner().to(['create', 'read', 'update', 'delete']),
    ]),
    
  // Transaction model for storing payment transaction data
  Transaction: a
    .model({
      userId: a.string().required(),
      customerId: a.string().required(),
      amount: a.float().required(),
      currency: a.string().required().default('USD'),
      paymentMethodId: a.string(),
      bankAccountId: a.string(),
      paymentType: a.enum(['card', 'ach', 'wallet']),
      status: a.enum(['pending', 'completed', 'failed', 'refunded']),
      metadata: a.json(),
      createdDate: a.datetime().required(),
      updatedDate: a.datetime(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['create', 'read', 'update']),
      allow.owner().to(['create', 'read', 'update', 'delete']),
    ]),

  // Wallet model for storing user wallet information
  Wallet: a
    .model({
      userId: a.string().required(),
      balance: a.float().required().default(0),
      currency: a.string().required().default('USD'),
      lastUpdated: a.datetime().required(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['create', 'read', 'update']),
      allow.owner().to(['create', 'read', 'update', 'delete']),
    ]),

  // PaymentMethod model for storing saved payment methods
  PaymentMethod: a
    .model({
      userId: a.string().required(),
      customerId: a.string().required(),
      paymentMethodId: a.string().required(),
      type: a.enum(['card', 'ach']),
      last4: a.string(),
      brand: a.string(),
      isDefault: a.boolean().default(false),
      metadata: a.json(),
      createdDate: a.datetime().required(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.owner().to(['create', 'read', 'update', 'delete']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
