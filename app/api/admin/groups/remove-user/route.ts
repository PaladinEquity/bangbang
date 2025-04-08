import { NextRequest, NextResponse } from 'next/server';
import { generateClient } from 'aws-amplify/data';
import { fetchAuthSession } from 'aws-amplify/auth';
import { AdminRemoveUserFromGroupCommand, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import type { Schema } from '@/amplify/data/resource';
import outputs from "@/amplify_outputs.json";

// Initialize the Amplify data client
const client = generateClient<Schema>({authMode: 'userPool'});

// Function to ensure we have valid credentials before making API calls
async function ensureCredentials() {
  try {
    const session = await fetchAuthSession();
    
    if (!session.credentials) {
      throw new Error('No credentials available. Please log in again.');
    }
    
    return session.credentials;
  } catch (error) {
    console.error('Error getting credentials:', error);
    throw new Error('Authentication required. Please log in again.');
  }
}

// Initialize Cognito client with credentials
async function getCognitoClient() {
  try {
    // Get the current auth session
    const session = await fetchAuthSession();
    
    if (!session.credentials) {
      throw new Error('No credentials available. Please log in again.');
    }
    
    // Create Cognito client with credentials
    return new CognitoIdentityProviderClient({
      region: outputs.auth.aws_region,
      credentials: session.credentials
    });
  } catch (error) {
    console.error('Error getting authenticated Cognito client:', error);
    throw new Error('Authentication required. Please log in again.');
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure we have valid credentials
    await ensureCredentials();
    
    // Parse the request body
    const body = await request.json();
    const { userId, groupName } = body;
    
    if (!userId || !groupName) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId and groupName are required' },
        { status: 400 }
      );
    }
    
    // Get authenticated Cognito client
    const cognitoClient = await getCognitoClient();
    
    // Call the AdminRemoveUserFromGroupCommand
    const command = new AdminRemoveUserFromGroupCommand({
      UserPoolId: outputs.auth.user_pool_id,
      Username: userId,
      GroupName: groupName
    });
    
    await cognitoClient.send(command);
    
    return NextResponse.json({ 
      success: true,
      message: `User ${userId} removed from group ${groupName} successfully`
    });
  } catch (error: any) {
    console.error('Error removing user from group:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to remove user from group' },
      { status: 500 }
    );
  }
}