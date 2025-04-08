import type { Schema } from "../resource";
import { env } from "$amplify/env/manage-users";
import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  ListUsersCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";

type Handler = Schema["manageUsers"]["functionHandler"];
const client = new CognitoIdentityProviderClient();

export const handler: Handler = async (event) => {
  const { operation, ...params } = event.arguments;

  switch (operation) {
    case "listUsers":
      return await listUsers(params);
    case "getUser":
      return await getUser(params);
    case "createUser":
      return await createUser(params);
    case "updateUserAttributes":
      return await updateUserAttributes(params);
    case "deleteUser":
      return await deleteUser(params);
    case "disableUser":
      return await disableUser(params);
    case "enableUser":
      return await enableUser(params);
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
};

async function listUsers({ limit = 60, paginationToken }: any) {
  const command = new ListUsersCommand({
    UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    Limit: limit,
    PaginationToken: paginationToken,
  });

  const response = await client.send(command);
  
  return {
    users: response.Users?.map(user => {
      const attributes: Record<string, string> = {};
      user.Attributes?.forEach(attr => {
        if (attr.Name && attr.Value) {
          attributes[attr.Name] = attr.Value;
        }
      });
      
      return {
        username: user.Username || '',
        userId: user.Username || '',
        email: attributes.email || '',
        name: `${attributes.given_name || ''} ${attributes.family_name || ''}`.trim(),
        status: user.UserStatus || 'UNKNOWN',
        createdAt: user.UserCreateDate?.toISOString() || '',
        attributes: attributes
      };
    }) || [],
    paginationToken: response.PaginationToken
  };
}

async function getUser({ username }: any) {
  const command = new AdminGetUserCommand({
    UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    Username: username,
  });

  const response = await client.send(command);
  
  const attributes: Record<string, string> = {};
  response.UserAttributes?.forEach(attr => {
    if (attr.Name && attr.Value) {
      attributes[attr.Name] = attr.Value;
    }
  });
  
  return {
    username: response.Username || '',
    userId: response.Username || '',
    email: attributes.email || '',
    name: `${attributes.given_name || ''} ${attributes.family_name || ''}`.trim(),
    status: response.UserStatus || 'UNKNOWN',
    createdAt: response.UserCreateDate?.toISOString() || '',
    attributes: attributes
  };
}

async function createUser({ username, email, temporaryPassword, userAttributes }: any) {
  const attributes = [
    { Name: "email", Value: email },
    { Name: "email_verified", Value: "true" },
  ];

  // Add additional user attributes if provided
  if (userAttributes) {
    for (const [key, value] of Object.entries(userAttributes)) {
      if (value) {
        attributes.push({ Name: key, Value: value as string });
      }
    }
  }

  const command = new AdminCreateUserCommand({
    UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    Username: username,
    TemporaryPassword: temporaryPassword,
    UserAttributes: attributes,
    MessageAction: "SUPPRESS", // Don't send welcome email, we'll handle this separately if needed
  });

  const response = await client.send(command);
  
  return {
    username: response.User?.Username || '',
    userId: response.User?.Username || '',
    status: response.User?.UserStatus || 'UNKNOWN',
    createdAt: response.User?.UserCreateDate?.toISOString() || '',
  };
}

async function updateUserAttributes({ username, userAttributes }: any) {
  const attributes = [];
  
  // List of immutable attributes that cannot be modified
  const immutableAttributes = [
    'sub',              // User's unique identifier
    'email_verified',   // Email verification status
    'phone_number_verified', // Phone verification status
    'identities'        // Federated identities
  ];

  for (const [key, value] of Object.entries(userAttributes)) {
    // Skip immutable attributes
    if (immutableAttributes.includes(key)) {
      continue;
    }
    
    if (value !== undefined) {
      // Convert value to string to ensure compatibility
      const stringValue = typeof value === 'string' ? value : String(value);
      attributes.push({ Name: key, Value: stringValue });
    }
  }

  const command = new AdminUpdateUserAttributesCommand({
    UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    Username: username,
    UserAttributes: attributes,
  });

  await client.send(command);
  
  return { success: true };
}

async function deleteUser({ username }: any) {
  const command = new AdminDeleteUserCommand({
    UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    Username: username,
  });

  await client.send(command);
  
  return { success: true, username };
}

async function disableUser({ username }: any) {
  const command = new AdminDisableUserCommand({
    UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    Username: username,
  });

  await client.send(command);
  
  return { success: true, username };
}

async function enableUser({ username }: any) {
  const command = new AdminEnableUserCommand({
    UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    Username: username,
  });

  await client.send(command);
  
  return { success: true, username };
}