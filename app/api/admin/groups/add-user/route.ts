import { NextRequest, NextResponse } from 'next/server';
import { generateClient } from 'aws-amplify/data';
import { fetchAuthSession } from 'aws-amplify/auth';
import type { Schema } from '@/amplify/data/resource';

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
    
    // Call the addUserToGroup mutation
    const response = await client.mutations.addUserToGroup({
      userId,
      groupName
    });
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error adding user to group:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to add user to group' },
      { status: 500 }
    );
  }
}