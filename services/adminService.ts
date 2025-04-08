/**
 * Service for handling admin operations
 */
import { generateClient } from 'aws-amplify/data';
import { fetchAuthSession } from 'aws-amplify/auth';
import { AdminGetUserCommand, AdminUpdateUserAttributesCommand, ListUsersCommand, AdminResetUserPasswordCommand, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import type { Schema } from '@/amplify/data/resource';
import { WallpaperData } from '@/types/wallpaper';
import { OrderData } from '@/types/order';
import outputs from "@/amplify_outputs.json";

// Initialize the Amplify data clients with different authentication modes
// const apiKeyClient = generateClient<Schema>({authMode: 'userPool'});
const userPoolClient = generateClient<Schema>({authMode: 'userPool'});
// For operations that need IAM auth but are failing, use API Key as fallback
const fallbackClient = generateClient<Schema>();

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

// Get all users from Cognito user pool with pagination and filtering support
export async function getAllUsers(options?: {
  filters?: {
    status?: string;
    role?: string;
  };
  limit?: number;
  nextToken?: string;
  searchTerm?: string;
}) {
  try {
    // Set default limit if not provided
    const limit = options?.limit || 20;
    
    // Prepare parameters for the listUsers Lambda function
    const params: any = {
      limit: limit
    };
    
    // Add nextToken for pagination if provided
    if (options?.nextToken) {
      params.nextToken = options.nextToken;
    }
    
    // Add search filter if provided
    if (options?.searchTerm) {
      params.filter = options.searchTerm;
    }
    
    // Use the listUsers Lambda function with userPool authentication
    const response = await userPoolClient.queries.listUsers(params);
    const data = JSON.parse(response?.data?.toString() || '');
    console.log('Users data:', data.Users?.length || 0, 'users fetched');
    
    if (data && data.Users) {
      let users = data.Users.map((user : any) => {
        // Extract user attributes
        const attributes: Record<string, string> = {};
        user.Attributes?.forEach((attr : any) => {
          if (attr.Name && attr.Value) {
            attributes[attr.Name] = attr.Value;
          }
        });
        
        // Format user data
        return {
          username: user.Username || '',
          userId: user.Username || '',
          email: attributes.email || '',
          name: `${attributes.given_name || ''} ${attributes.family_name || ''}`.trim(),
          status: user.UserStatus || 'UNKNOWN',
          createdAt: (new Date(user.UserCreateDate)).toISOString(),
          attributes: attributes,
          isAdmin: false // Will be updated below
        };
      });
      
      // Get users in ADMINS group
      try {
        const adminsResponse = await userPoolClient.queries.listUsersInGroup({
          groupName: 'ADMINS'
        });
        if (adminsResponse && adminsResponse.data) {
          const adminsData = JSON.parse(adminsResponse.data.toString() || '{}');
          const adminUsers = adminsData.users || [];
          
          // Mark users who are in the ADMINS group
          users.forEach((user : any) => {
            if (adminUsers.some((adminUser: any) => 
              adminUser.username === user.username || adminUser.userId === user.userId
            )) {
              user.isAdmin = true;
            }
          });
        }
      } catch (error) {
        console.error('Error getting admin users:', error);
      }
      
      // Apply client-side filters if provided
      if (options?.filters) {
        // Filter by status if provided
        if (options.filters.status && options.filters.status !== 'all') {
          users = users.filter((user : any) => user.status.toLowerCase() === options.filters?.status?.toLowerCase());
        }
        
        // Filter by role if provided
        if (options.filters.role && options.filters.role !== 'all') {
          const isAdmin = options.filters.role.toLowerCase() === 'admin';
          users = users.filter((user : any) => user.isAdmin === isAdmin);
        }
      }
      
      return {
        users,
        nextToken: data.NextToken || null
      };
    }
    
    return { users: [], nextToken: null };
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

// Get user by ID
export async function getUserById(userId: string) {
  try {
    // Use AdminGetUserCommand from Cognito
    // Get authenticated Cognito client
    const cognitoClient = await getCognitoClient();
    
    const command = new AdminGetUserCommand({
      UserPoolId: outputs.auth.user_pool_id,
      Username: userId,
    });
    
    const response = await cognitoClient.send(command);
    
    // Extract user attributes
    const attributes: Record<string, string> = {};
    response.UserAttributes?.forEach(attr => {
      if (attr.Name && attr.Value) {
        attributes[attr.Name] = attr.Value;
      }
    });
    
    // Format user data
    return {
      username: userId,
      userId: userId,
      email: attributes.email || '',
      name: `${attributes.given_name || ''} ${attributes.family_name || ''}`.trim(),
      status: response.UserStatus || 'UNKNOWN',
      createdAt: response.UserCreateDate?.toISOString() || new Date().toISOString(),
      attributes: attributes
    };
  } catch (error) {
    console.error(`Error getting user ${userId}:`, error);
    throw error;
  }
}

// Update user role - now only manages group membership, not custom:role attribute
export async function updateUserRole(userId: string, role: 'admin' | 'user') {
  try {
    console.log("----------------", {
      operation: 'updateUserRole',
      username: userId,
      role: role
    });
    
    // Instead of updating custom:role attribute, we'll manage group membership
    if (role === 'admin') {
      // Add user to ADMINS group
      await addUserToGroup(userId, 'ADMINS');
    } else {
      // Remove user from ADMINS group if they're in it
      try {
        await removeUserFromGroup(userId, 'ADMINS');
      } catch (error) {
        // Ignore error if user is not in the group
        console.log(`User ${userId} might not be in ADMINS group`);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating role for user ${userId}:`, error);
    throw error;
  }
}

// Update user attributes
export async function updateUserAttributes(userId: string, attributes: Record<string, string>) {
  try {
    // Instead of using AdminUpdateUserAttributesCommand directly, use the Lambda function
    // that has the necessary permissions to perform this operation
    const response = await userPoolClient.mutations.manageUsers({
      operation: 'updateUserAttributes',
      username: userId,
      userAttributes: JSON.stringify(attributes)
    });
    
    if (!response || !response.data) {
      throw new Error('Failed to update user attributes');
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating attributes for user ${userId}:`, error);
    throw error;
  }
}

// Reset user password
export async function resetUserPassword(userId: string) {
  try {
    // Use AdminResetUserPasswordCommand from Cognito
    // Get authenticated Cognito client
    const cognitoClient = await getCognitoClient();
    
    const command = new AdminResetUserPasswordCommand({
      UserPoolId: outputs.auth.user_pool_id,
      Username: userId,
    });
    
    await cognitoClient.send(command);
    return { success: true };
  } catch (error) {
    console.error(`Error resetting password for user ${userId}:`, error);
    throw error;
  }
}

// Get count of wallpapers that match the given filters (for pagination)
export async function getWallpapersCount(filters?: {
  primaryImagery?: string;
  priceMin?: number;
  priceMax?: number;
  searchTerm?: string;
}) {
  try {
    // Ensure we have valid credentials before making API calls
    await ensureCredentials();
    
    // Build filter conditions based on provided options
    const filterConditions: any = {};
    
    // Filter by primaryImagery if provided
    if (filters?.primaryImagery) {
      filterConditions.primaryImagery = { eq: filters.primaryImagery };
    }
    
    // Filter by price range if provided
    if (filters?.priceMin !== undefined || filters?.priceMax !== undefined) {
      filterConditions.price = {};
      
      if (filters.priceMin !== undefined) {
        filterConditions.price.ge = filters.priceMin;
      }
      
      if (filters.priceMax !== undefined) {
        filterConditions.price.le = filters.priceMax;
      }
    }
    
    // Search by description or primaryImagery if searchTerm is provided
    if (filters?.searchTerm) {
      // Use 'or' condition to search in multiple fields
      filterConditions.or = [
        { description: { contains: filters.searchTerm } },
        { primaryImagery: { contains: filters.searchTerm } }
      ];
    }
    
    // Get all wallpapers that match the filter to count them
    // We don't use pagination here since we need the total count
    const listParams: any = {};
    
    // Add filter conditions if any
    if (Object.keys(filterConditions).length > 0) {
      listParams.filter = filterConditions;
    }
    
    // Use userPoolClient for proper authentication
    const response = await userPoolClient.models.Wallpaper.list(listParams);
    
    // Return the total count of wallpapers that match the filters
    return response?.data?.length || 0;
  } catch (error) {
    console.error('Error getting wallpapers count:', error);
    return 0;
  }
}

// Get count of users that match the given filters (for pagination)
export async function getUsersCount(filters?: {
  status?: string;
  role?: string;
  searchTerm?: string;
}) {
  try {
    // Prepare parameters for the listUsers Lambda function
    const params: any = {
      // Set a high limit to get all users for counting
      limit: 1000
    };
    
    // Add search filter if provided
    if (filters?.searchTerm) {
      params.filter = filters.searchTerm;
    }
    
    // Use the listUsers Lambda function with userPool authentication
    const response = await userPoolClient.queries.listUsers(params);
    const data = JSON.parse(response?.data?.toString() || '');
    
    if (data && data.Users) {
      let users = data.Users.map((user : any) => {
        // Extract user attributes
        const attributes: Record<string, string> = {};
        user.Attributes?.forEach((attr : any) => {
          if (attr.Name && attr.Value) {
            attributes[attr.Name] = attr.Value;
          }
        });
        
        // Format user data
        return {
          username: user.Username || '',
          userId: user.Username || '',
          email: attributes.email || '',
          name: `${attributes.given_name || ''} ${attributes.family_name || ''}`.trim(),
          status: user.UserStatus || 'UNKNOWN',
          createdAt: (new Date(user.UserCreateDate)).toISOString(),
          attributes: attributes,
          isAdmin: false // Will be updated below
        };
      });
      
      // Get users in ADMINS group
      try {
        const adminsResponse = await userPoolClient.queries.listUsersInGroup({
          groupName: 'ADMINS'
        });
        if (adminsResponse && adminsResponse.data) {
          const adminsData = JSON.parse(adminsResponse.data.toString() || '{}');
          const adminUsers = adminsData.users || [];
          
          // Mark users who are in the ADMINS group
          users.forEach((user : any) => {
            if (adminUsers.some((adminUser: any) => 
              adminUser.username === user.username || adminUser.userId === user.userId
            )) {
              user.isAdmin = true;
            }
          });
        }
      } catch (error) {
        console.error('Error getting admin users:', error);
      }
      
      // Apply client-side filters if provided
      if (filters) {
        // Filter by status if provided
        if (filters.status && filters.status !== 'all') {
          users = users.filter((user : any) => user.status.toLowerCase() === filters.status?.toLowerCase());
        }
        
        // Filter by role if provided
        if (filters.role && filters.role !== 'all') {
          const isAdmin = filters.role.toLowerCase() === 'admin';
          users = users.filter((user : any) => user.isAdmin === isAdmin);
        }
      }
      
      return users.length;
    }
    
    return 0;
  } catch (error) {
    console.error('Error getting users count:', error);
    return 0;
  }
}

// Get count of orders that match the given filters (for pagination)
export async function getOrdersCount(filters?: { 
  userId?: string, 
  wallpaperId?: string, 
  status?: string, 
  paymentStatus?: string,
  dateFrom?: string,
  dateTo?: string,
  searchTerm?: string
}) {
  try {
    // Ensure we have valid credentials before making API calls
    await ensureCredentials();
    
    // Build filter based on provided parameters
    const filterConditions: any = {};
    
    if (filters?.userId) {
      filterConditions.userId = { eq: filters.userId };
    }
    
    if (filters?.status) {
      filterConditions.status = { eq: filters.status };
    }

    if (filters?.paymentStatus) {
      filterConditions.paymentStatus = { eq: filters.paymentStatus };
    }
    
    // Date range filtering
    if (filters?.dateFrom || filters?.dateTo) {
      filterConditions.orderDate = {};
      
      if (filters.dateFrom) {
        filterConditions.orderDate.ge = filters.dateFrom;
      }
      
      if (filters.dateTo) {
        filterConditions.orderDate.le = filters.dateTo;
      }
    }
    
    // Search term filtering - search in orderNumber or userId
    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filterConditions.or = [
        { orderNumber: { contains: searchTerm } },
        { userId: { contains: searchTerm } }
      ];
    }
    
    // Fetch all orders with filters to count them
    const response = await userPoolClient.models.CartOrder.list({
      filter: Object.keys(filterConditions).length > 0 ? filterConditions : undefined
    });
    
    // Return the total count of orders that match the filters
    return response?.data?.length || 0;
  } catch (error) {
    console.error('Error getting orders count:', error);
    return 0;
  }
}

// Get all wallpapers with ranking information, pagination and filtering support
export async function getAllWallpapersWithRanking(options?: {
  filters?: {
    primaryImagery?: string;
    priceMin?: number;
    priceMax?: number;
    searchTerm?: string;
  };
  limit?: number;
  nextToken?: string;
  sortBy?: 'ranking' | 'price' | 'date';
  sortOrder?: 'asc' | 'desc';
}) {
  try {
    // Ensure we have valid credentials before making API calls
    await ensureCredentials();
    
    // Build filter conditions based on provided options
    const filterConditions: any = {};
    const filters = options?.filters || {};
    
    // Filter by primaryImagery if provided
    if (filters.primaryImagery) {
      filterConditions.primaryImagery = { eq: filters.primaryImagery };
    }
    
    // Filter by price range if provided
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      filterConditions.price = {};
      
      if (filters.priceMin !== undefined) {
        filterConditions.price.ge = filters.priceMin;
      }
      
      if (filters.priceMax !== undefined) {
        filterConditions.price.le = filters.priceMax;
      }
    }
    
    // Search by description or primaryImagery if searchTerm is provided
    if (filters.searchTerm) {
      // Use 'or' condition to search in multiple fields
      filterConditions.or = [
        { description: { contains: filters.searchTerm } },
        { primaryImagery: { contains: filters.searchTerm } }
      ];
    }
    
    // Prepare list parameters
    const listParams: any = {
      limit: options?.limit || 20,
      nextToken: options?.nextToken
    };
    
    // Add filter conditions if any
    if (Object.keys(filterConditions).length > 0) {
      listParams.filter = filterConditions;
    }
    
    // Use userPoolClient instead of userPoolClient for proper authentication
    const response = await userPoolClient.models.Wallpaper.list(listParams);
    console.log("Wallpaper list", response?.data?.length || 0, "wallpapers fetched");
    
    if (response && response.data) {
      // First extract all wallpapers with their rankings
      const wallpapers = response.data.map(item => ({
        id: item.id,
        imageData: item.imageData || '',
        description: item.description || '',
        primaryImagery: item.primaryImagery || '',
        size: item.size || '',
        price: item.price || 0,
        userId: item.userId || '',
        ranking: item?.ranking ? Number(item.ranking) : null,
        createdAt: item.createdAt || new Date().toISOString()
      }));
      
      // Sort wallpapers based on provided sort criteria or default to ranking
      let sortedWallpapers = [...wallpapers];
      
      if (options?.sortBy === 'price') {
        sortedWallpapers.sort((a, b) => {
          return options.sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
        });
      } else if (options?.sortBy === 'date') {
        sortedWallpapers.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return options.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
      } else {
        // Default sort by ranking
        sortedWallpapers.sort((a, b) => {
          // If both have rankings, sort by ranking
          if (a.ranking !== null && b.ranking !== null) {
            return options?.sortOrder === 'desc' ? b.ranking - a.ranking : a.ranking - b.ranking;
          }
          // If only one has ranking, prioritize the one with ranking
          if (a.ranking !== null) return -1;
          if (b.ranking !== null) return 1;
          
          // Otherwise sort by creation date (newest first)
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
      }
      
      // Assign rankings to wallpapers that don't have them
      const wallpapersWithRanking = sortedWallpapers.map((wallpaper, index) => ({
        ...wallpaper,
        ranking: wallpaper.ranking !== null ? wallpaper.ranking : index + 1
      }));
      
      return {
        wallpapers: wallpapersWithRanking,
        nextToken: response.nextToken
      };
    }
    
    return { wallpapers: [], nextToken: null };
  } catch (error) {
    console.error('Error getting all wallpapers with ranking:', error);
    return { wallpapers: [], nextToken: null };
  }
}

// Update wallpaper ranking
export async function updateWallpaperRanking(wallpaperId: string, newRanking: number) {
  try {
    // Ensure we have valid credentials before making API calls
    await ensureCredentials();
    
    // First get the current wallpaper
    // Use userPoolClient instead of userPoolClient for proper authentication
    const currentWallpaper = await userPoolClient.models.Wallpaper.get({
      id: wallpaperId
    });
    
    if (!currentWallpaper || !currentWallpaper.data) {
      throw new Error('Wallpaper not found');
    }
    
    const oldRanking = currentWallpaper.data.ranking !== undefined ? 
      Number(currentWallpaper.data.ranking) : null;
    
    // Get all wallpapers to update their rankings
    const allWallpapers = await getAllWallpapersWithRanking();
    
    // Update the ranking of the current wallpaper
    // Use userPoolClient instead of userPoolClient for proper authentication
    await userPoolClient.models.Wallpaper.update({
      id: wallpaperId,
      ranking: newRanking
    });
    
    // Update other wallpapers' rankings if needed
    if (oldRanking !== null) {
      // If moving up in ranking (lower number = higher rank)
      if (newRanking < oldRanking) {
        // Shift down wallpapers that were between new and old ranking
        const wallpapersToUpdate = allWallpapers.wallpapers.filter(w => 
          w.id !== wallpaperId && 
          w.ranking >= newRanking && 
          w.ranking < oldRanking
        );
        
        for (const wallpaper of wallpapersToUpdate) {
          // Use userPoolClient instead of userPoolClient for proper authentication
          await userPoolClient.models.Wallpaper.update({
            id: wallpaper.id,
            ranking: (wallpaper.ranking || 0) + 1
          });
        }
      } 
      // If moving down in ranking (higher number = lower rank)
      else if (newRanking > oldRanking) {
        // Shift up wallpapers that were between old and new ranking
        const wallpapersToUpdate = allWallpapers.wallpapers.filter(w => 
          w.id !== wallpaperId && 
          w.ranking > oldRanking && 
          w.ranking <= newRanking
        );
        
        for (const wallpaper of wallpapersToUpdate) {
          // Use userPoolClient instead of userPoolClient for proper authentication
          await userPoolClient.models.Wallpaper.update({
            id: wallpaper.id,
            ranking: (wallpaper.ranking || 0) - 1
          });
        }
      }
    }
    
    console.log('Wallpaper ranking updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating wallpaper ranking:', error);
    return false;
  }
}

// Get all orders with pagination support
export async function getAllOrders(options?: { 
  filters?: { 
    userId?: string, 
    wallpaperId?: string, 
    status?: string, 
    paymentStatus?: string,
    dateFrom?: string,
    dateTo?: string,
    searchTerm?: string
  }, 
  limit?: number, 
  nextToken?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
}) {
  try {
    // Ensure we have valid credentials before making API calls
    await ensureCredentials();
    
    // Build filter based on provided parameters
    const filterConditions: any = {};
    const filters = options?.filters || {};
    
    if (filters.userId) {
      filterConditions.userId = { eq: filters.userId };
    }
    
    if (filters.status) {
      filterConditions.status = { eq: filters.status };
    }

    if (filters.paymentStatus) {
      filterConditions.paymentStatus = { eq: filters.paymentStatus };
    }
    
    // Date range filtering
    if (filters.dateFrom || filters.dateTo) {
      filterConditions.orderDate = {};
      
      if (filters.dateFrom) {
        filterConditions.orderDate.ge = filters.dateFrom;
      }
      
      if (filters.dateTo) {
        filterConditions.orderDate.le = filters.dateTo;
      }
    }
    
    // Search term filtering - search in orderNumber or userId
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filterConditions.or = [
        { orderNumber: { contains: searchTerm } },
        { userId: { contains: searchTerm } }
      ];
    }
    
    // Fetch orders with filters if provided
    const response = await userPoolClient.models.CartOrder.list({
      filter: Object.keys(filterConditions).length > 0 ? filterConditions : undefined,
      limit: options?.limit || 10,
      nextToken: options?.nextToken
    });
    
    if (response && response.data) {
      let orders = response.data.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        stripePaymentId: order.stripePaymentId,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        orderDate: order.orderDate,
        items: order.items,
        userId: order.userId
      }));
      
      // Filter by wallpaperId if provided (need to parse items JSON)
      if (filters.wallpaperId) {
        orders = orders.filter(order => {
          if (!order.items) return false;
          try {
            const items = JSON.parse(order.items);
            return items.some((item: any) => item.wallpaperId === filters.wallpaperId);
          } catch (e) {
            return false;
          }
        });
      }
      
      // Sort orders based on provided sort criteria or default to priority sorting
      if (options?.sortBy) {
        orders = orders.sort((a, b) => {
          if (options.sortBy === 'date') {
            const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
            const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
            return options.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
          } 
          
          if (options.sortBy === 'amount') {
            const amountA = a.totalAmount || 0;
            const amountB = b.totalAmount || 0;
            return options.sortOrder === 'asc' ? amountA - amountB : amountB - amountA;
          }
          
          if (options.sortBy === 'status') {
            // Define status priority
            const statusPriority: Record<string, number> = {
              'pending': 0,
              'processing': 1,
              'shipped': 2,
              'delivered': 3,
              'cancelled': 4
            };
            
            const priorityA = statusPriority[a.status as string] ?? 999;
            const priorityB = statusPriority[b.status as string] ?? 999;
            
            return options.sortOrder === 'asc' ? priorityA - priorityB : priorityB - priorityA;
          }
          
          // Default to date sorting
          const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
          const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
          return options.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
      } else {
        // Default sort: prioritize pending and processing orders
        orders = orders.sort((a, b) => {
          // First prioritize by status
          const priorityA = a.status === 'pending' ? 0 : a.status === 'processing' ? 1 : 2;
          const priorityB = b.status === 'pending' ? 0 : b.status === 'processing' ? 1 : 2;
          
          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }
          
          // Then sort by date (newest first)
          const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
          const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
          return dateB - dateA;
        });
      }
      
      // Return orders with pagination token
      return {
        orders,
        nextToken: response.nextToken
      };
    }
    
    return { orders: [], nextToken: null };
  } catch (error) {
    console.error('Error getting all orders:', error);
    return { orders: [], nextToken: null };
  }
}

// Get order statistics for admin dashboard
export async function getOrderStats(filters?: {
  status?: string,
  paymentStatus?: string,
  dateFrom?: string,
  dateTo?: string,
  searchTerm?: string
}) {
  try {
    // Ensure we have valid credentials before making API calls
    await ensureCredentials();
    
    // Build filter based on provided parameters
    const filterConditions: any = {};
    
    if (filters?.status) {
      filterConditions.status = { eq: filters.status };
    }

    if (filters?.paymentStatus) {
      filterConditions.paymentStatus = { eq: filters.paymentStatus };
    }
    
    // Date range filtering
    if (filters?.dateFrom || filters?.dateTo) {
      filterConditions.orderDate = {};
      
      if (filters.dateFrom) {
        filterConditions.orderDate.ge = filters.dateFrom;
      }
      
      if (filters.dateTo) {
        filterConditions.orderDate.le = filters.dateTo;
      }
    }
    
    // Search term filtering
    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filterConditions.or = [
        { orderNumber: { contains: searchTerm } },
        { userId: { contains: searchTerm } }
      ];
    }
    
    // Fetch all orders matching the filters
    const response = await userPoolClient.models.CartOrder.list({
      filter: Object.keys(filterConditions).length > 0 ? filterConditions : undefined
    });
    
    if (response && response.data) {
      const orders = response.data;
      
      // Calculate statistics
      const totalOrders = orders.length;
      
      const pendingOrders = orders.filter(
        order => order.status === 'pending' || order.status === 'processing'
      ).length;
      
      const totalRevenue = orders
        .filter(order => order.paymentStatus === 'paid')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      const averageOrderValue = totalOrders > 0 
        ? totalRevenue / totalOrders 
        : 0;
      
      // Get current month's orders
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const currentMonthOrders = orders.filter(order => {
        if (!order.orderDate) return false;
        const orderDate = new Date(order.orderDate);
        return orderDate.getMonth() === currentMonth && 
               orderDate.getFullYear() === currentYear;
      });
      
      const currentMonthRevenue = currentMonthOrders
        .filter(order => order.paymentStatus === 'paid')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      return {
        totalOrders,
        pendingOrders,
        totalRevenue,
        averageOrderValue,
        currentMonthRevenue
      };
    }
    
    return {
      totalOrders: 0,
      pendingOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      currentMonthRevenue: 0
    };
  } catch (error) {
    console.error('Error getting order statistics:', error);
    return {
      totalOrders: 0,
      pendingOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      currentMonthRevenue: 0
    };
  }
}

// Get monthly revenue statistics
export async function getMonthlyRevenue() {
  try {
    // Ensure we have valid credentials before making API calls
    await ensureCredentials();
    
    const response = await userPoolClient.models.CartOrder.list({
      filter: {
        paymentStatus: { eq: 'paid' }
      }
    });
    
    if (response && response.data) {
      // Group orders by month and calculate total revenue
      const monthlyRevenue = response.data.reduce((acc, order) => {
        if (order.orderDate) {
          const date = new Date(order.orderDate);
          const month = date.getMonth();
          const year = date.getFullYear();
          const key = `${year}-${month + 1}`;
          
          if (!acc[key]) {
            acc[key] = 0;
          }
          
          acc[key] += order.totalAmount || 0;
        }
        return acc;
      }, {} as Record<string, number>);
      
      return monthlyRevenue;
    }
    
    return {};
  } catch (error) {
    console.error('Error getting monthly revenue:', error);
    return {};
  }
}

// Get dashboard statistics
export async function getDashboardStats(options?: {
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  recentActivityLimit?: number;
}) {
  try {
    // Ensure we have valid credentials before making API calls
    await ensureCredentials();
    
    // Set default values
    const recentActivityLimit = options?.recentActivityLimit || 5;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Prepare date filters
    const dateFrom = options?.dateRange?.startDate || new Date(currentYear, 0, 1).toISOString();
    const dateTo = options?.dateRange?.endDate || currentDate.toISOString();
    
    // Get counts instead of full data
    const [totalUsers, totalWallpapers, totalOrdersCount] = await Promise.all([
      getUsersCount(),
      getWallpapersCount(),
      getOrdersCount()
    ]);
    
    // Get pending orders count with specific filter
    const pendingOrdersCount = await getOrdersCount({
      status: 'pending'
    }) + await getOrdersCount({
      status: 'processing'
    });
    
    // Get current month's revenue using the getOrderStats function
    const orderStats = await getOrderStats({
      dateFrom: new Date(currentYear, currentMonth, 1).toISOString(),
      dateTo: new Date(currentYear, currentMonth + 1, 0).toISOString(),
      paymentStatus: 'paid'
    });
    const currentMonthRevenue = orderStats.currentMonthRevenue;
    
    // Calculate monthly statistics for the current year
    // Use a more efficient approach by fetching monthly revenue directly
    const monthlyRevenueData = await getMonthlyRevenue();
    const monthlyStats = Array(12).fill(0);
    
    // Process the monthly revenue data
    Object.entries(monthlyRevenueData).forEach(([key, value]) => {
      const [year, month] = key.split('-').map(Number);
      if (year === currentYear && month >= 1 && month <= 12) {
        monthlyStats[month - 1] = value;
      }
    });
    
    // Get only the most recent orders for the activity feed
    const recentOrdersResponse = await getAllOrders({
      limit: recentActivityLimit,
      sortBy: 'date',
      sortOrder: 'desc'
    });
    
    const recentActivity = recentOrdersResponse.orders.map(order => ({
      type: 'order',
      user: order.userId || 'Unknown',
      time: order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'Unknown',
      action: `Order #${order.orderNumber} - ${order.status} - $${order.totalAmount}`
    }));
    
    return {
      totalUsers,
      totalWallpapers,
      totalOrders: totalOrdersCount,
      pendingOrdersCount,
      currentMonthRevenue,
      monthlyStats,
      recentActivity
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      totalUsers: 0,
      totalWallpapers: 0,
      totalOrders: 0,
      pendingOrdersCount: 0,
      currentMonthRevenue: 0,
      monthlyStats: Array(12).fill(0),
      recentActivity: []
    };
  }
}

// Add user to group
export async function addUserToGroup(userId: string, groupName: string) {
  try {
    // Call the addUserToGroup mutation using the userPool client
    const response = await userPoolClient.mutations.addUserToGroup({
      userId,
      groupName
    });
    
    if (!response || !response.data) {
      throw new Error(`Failed to add user to group ${groupName}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error adding user to group ${groupName}:`, error);
    throw error;
  }
}

// Remove user from group
export async function removeUserFromGroup(userId: string, groupName: string) {
  try {
    // Call the removeUserFromGroup mutation directly
    const response = await userPoolClient.mutations.removeUserFromGroup({
      userId,
      groupName
    });
    
    if (!response || !response.data) {
      throw new Error(`Failed to remove user from group ${groupName}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error removing user from group ${groupName}:`, error);
    throw error;
  }
}

// Check if user is in a specific group
export async function isUserInGroup(userId: string, groupName: string) {
  try {
    // Call the listUsersInGroup query directly
    const response = await userPoolClient.queries.listUsersInGroup({
      groupName
    });
    
    if (!response || !response.data) {
      return false;
    }
    
    // Parse the response data
    const data = JSON.parse(response.data.toString() || '{}');
    const users = data.users || [];
    
    // Check if the user is in the list
    return users.some((user: any) => user.username === userId || user.userId === userId);
  } catch (error) {
    console.error(`Error checking if user ${userId} is in group ${groupName}:`, error);
    return false;
  }
}

// Check if user is an admin (in ADMINS group)
export async function isUserAdmin(userId: string) {
  return await isUserInGroup(userId, 'ADMINS');
}

// Update order status
export async function updateOrderStatus(orderId: string, status: string, paymentStatus?: string) {
  try {
    // Ensure we have valid credentials before making API calls
    await ensureCredentials();
    
    // Get the current order
    const order = await userPoolClient.models.CartOrder.get({
      id: orderId
    });
    
    if (!order || !order.data) {
      throw new Error('Order not found');
    }
    
    // Prepare update data
    const updateData: any = {
      status
    };
    
    // Add payment status if provided
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    
    // Update the order
    const response = await userPoolClient.models.CartOrder.update({
      id: orderId,
      ...updateData
    });
    
    if (!response || !response.data) {
      throw new Error('Failed to update order status');
    }
    
    return {
      success: true,
      order: response.data
    };
  } catch (error) {
    console.error(`Error updating order status for ${orderId}:`, error);
    throw error;
  }
}

// Update multiple orders' status at once
export async function updateMultipleOrderStatus(orderIds: string[], status: string, paymentStatus?: string) {
  try {
    // Ensure we have valid credentials before making API calls
    await ensureCredentials();
    
    // Process orders in parallel
    const updatePromises = orderIds.map(async (orderId) => {
      try {
        // Prepare update data
        const updateData: any = {
          status
        };
        
        // Add payment status if provided
        if (paymentStatus) {
          updateData.paymentStatus = paymentStatus;
        }
        
        // Update the order
        const response = await userPoolClient.models.CartOrder.update({
          id: orderId,
          ...updateData
        });
        
        return response.data;
      } catch (error) {
        console.error(`Error updating order ${orderId}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(updatePromises);
    const successCount = results.filter(result => result !== null).length;
    
    return {
      success: successCount > 0,
      totalUpdated: successCount,
      totalFailed: orderIds.length - successCount
    };
  } catch (error) {
    console.error('Error in batch updating orders:', error);
    throw error;
  }
}

// Create a new user
export async function createUser(userData: {
  username: string;
  email: string;
  temporaryPassword: string;
  userAttributes: Record<string, string>;
}) {
  try {
    // Call the manageUsers mutation with createUser operation
    const response = await userPoolClient.mutations.manageUsers({
      operation: 'createUser',
      username: userData.username,
      email: userData.email,
      temporaryPassword: userData.temporaryPassword,
      userAttributes: JSON.stringify(userData.userAttributes)
    });
    
    if (!response || !response.data) {
      throw new Error('Failed to create user');
    }
    
    return JSON.parse(response.data.toString());
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}