import { NextRequest, NextResponse } from 'next/server';
import { updateUserAttributes, fetchUserAttributes } from 'aws-amplify/auth';

// Handler for GET requests - Fetch user data
export async function GET(request: NextRequest) {
  try {
    // Get user attributes from Cognito
    const attributes = await fetchUserAttributes();
    
    return NextResponse.json({
      success: true,
      data: attributes
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user data', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Handler for PUT requests - Update user data
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data) {
      return NextResponse.json(
        { success: false, message: 'No data provided' },
        { status: 400 }
      );
    }

    // Map frontend field names to Cognito attribute names
    const attributeMapping: Record<string, string> = {
      firstName: 'given_name',
      lastName: 'family_name',
      phone: 'phone_number',
      address: 'address',
      timezone: 'zoneinfo',
      profilePicture: 'picture'
    };

    // Create attributes object for Cognito
    const userAttributes: Record<string, string> = {};
    
    // Only include fields that are provided in the request
    Object.entries(data).forEach(([key, value]) => {
      const cognitoKey = attributeMapping[key];
      if (cognitoKey && value !== undefined && value !== null) {
        userAttributes[cognitoKey] = String(value);
      }
    });

    // Update user attributes in Cognito
    await updateUserAttributes({
      userAttributes
    });

    // Get updated attributes
    const updatedAttributes = await fetchUserAttributes();
    
    return NextResponse.json({
      success: true,
      message: 'User information updated successfully',
      data: updatedAttributes
    });
  } catch (error) {
    console.error('Error updating user data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update user data', error: (error as Error).message },
      { status: 500 }
    );
  }
}