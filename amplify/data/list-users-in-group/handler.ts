import type { Schema } from "../resource";
import { env } from "$amplify/env/list-users-in-group";
import {
  ListUsersInGroupCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";

type Handler = Schema["listUsersInGroup"]["functionHandler"];
const client = new CognitoIdentityProviderClient();

export const handler: Handler = async (event) => {
  const { groupName, limit = 60, paginationToken } = event.arguments;
  
  const command = new ListUsersInGroupCommand({
    UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    GroupName: groupName,
    Limit: limit ?? undefined,
    NextToken: paginationToken ?? undefined,
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
    paginationToken: response.NextToken
  };
};