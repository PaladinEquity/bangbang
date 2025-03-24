import { updateUserAttributes, fetchUserAttributes } from 'aws-amplify/auth';

// Interface for user data
export interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  timezone?: string;
  profilePicture?: string;
  [key: string]: any;
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

// Map Cognito attribute names to frontend field names
const reverseAttributeMapping: Record<string, string> = {
  given_name: 'firstName',
  family_name: 'lastName',
  phone_number: 'phone',
  address: 'address',
  zoneinfo: 'timezone',
  picture: 'profilePicture'
};

/**
 * Fetch user data from AWS Cognito
 * @returns Promise with user data
 */
export async function getUserData(): Promise<UserData> {
  try {
    const attributes = await fetchUserAttributes();
    
    // Convert Cognito attributes to frontend format
    const userData: UserData = {};
    
    Object.entries(attributes).forEach(([key, value]) => {
      // Special handling for email which doesn't need mapping
      if (key === 'email') {
        userData.email = value;
      } else {
        // Map other attributes using the reverse mapping
        const frontendKey = reverseAttributeMapping[key];
        if (frontendKey) {
          userData[frontendKey] = value;
        }
      }
    });
    
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

/**
 * Update user data in AWS Cognito
 * @param data User data to update
 * @returns Promise with updated user data
 */
export async function updateUserData(data: UserData): Promise<UserData> {
  try {
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

    // Return the updated user data
    return await getUserData();
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
}