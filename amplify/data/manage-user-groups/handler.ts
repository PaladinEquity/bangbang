import type { Schema } from "../resource";
import { env } from "$amplify/env/manage-user-groups";
import {
  CreateGroupCommand,
  DeleteGroupCommand,
  GetGroupCommand,
  ListGroupsCommand,
  UpdateGroupCommand,
  ListUsersInGroupCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";

type Handler = Schema["manageUserGroups"]["functionHandler"];
const client = new CognitoIdentityProviderClient();

export const handler: Handler = async (event) => {
  const { operation, ...params } = event.arguments;

  switch (operation) {
    case "listGroups":
      return await listGroups(params);
    case "getGroup":
      return await getGroup(params);
    case "createGroup":
      return await createGroup(params);
    case "updateGroup":
      return await updateGroup(params);
    case "deleteGroup":
      return await deleteGroup(params);
    case "listUsersInGroup":
      return await listUsersInGroup(params);
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
};

async function listGroups({ limit = 60, paginationToken }: any) {
  const command = new ListGroupsCommand({
    UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    Limit: limit,
    NextToken: paginationToken,
  });

  const response = await client.send(command);
  
  return {
    groups: response.Groups?.map(group => ({
      groupName: group.GroupName || '',
      description: group.Description || '',
      precedence: group.Precedence,
      creationDate: group.CreationDate?.toISOString() || '',
      lastModifiedDate: group.LastModifiedDate?.toISOString() || '',
    })) || [],
    paginationToken: response.NextToken
  };
}

async function getGroup({ groupName }: any) {
  const command = new GetGroupCommand({
    UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    GroupName: groupName,
  });

  const response = await client.send(command);
  const group = response.Group;
  
  return {
    groupName: group?.GroupName || '',
    description: group?.Description || '',
    precedence: group?.Precedence,
    creationDate: group?.CreationDate?.toISOString() || '',
    lastModifiedDate: group?.LastModifiedDate?.toISOString() || '',
  };
}

async function createGroup({ groupName, description, precedence }: any) {
  const command = new CreateGroupCommand({
    UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    GroupName: groupName,
    Description: description,
    Precedence: precedence,
  });

  const response = await client.send(command);
  const group = response.Group;
  
  return {
    groupName: group?.GroupName || '',
    description: group?.Description || '',
    precedence: group?.Precedence,
    creationDate: group?.CreationDate?.toISOString() || '',
    lastModifiedDate: group?.LastModifiedDate?.toISOString() || '',
  };
}

async function updateGroup({ groupName, description, precedence }: any) {
  const command = new UpdateGroupCommand({
    UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    GroupName: groupName,
    Description: description,
    Precedence: precedence,
  });

  const response = await client.send(command);
  const group = response.Group;
  
  return {
    groupName: group?.GroupName || '',
    description: group?.Description || '',
    precedence: group?.Precedence,
    creationDate: group?.CreationDate?.toISOString() || '',
    lastModifiedDate: group?.LastModifiedDate?.toISOString() || '',
  };
}

async function deleteGroup({ groupName }: any) {
  const command = new DeleteGroupCommand({
    UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    GroupName: groupName,
  });

  await client.send(command);
  
  return { success: true, groupName };
}

async function listUsersInGroup({ groupName, limit = 60, paginationToken }: any) {
  const command = new ListUsersInGroupCommand({
    UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    GroupName: groupName,
    Limit: limit,
    NextToken: paginationToken,
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
}