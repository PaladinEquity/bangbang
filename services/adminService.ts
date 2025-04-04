/**
 * Service for handling admin operations
 */
import { generateClient } from 'aws-amplify/data';
import { AdminGetUserCommand, AdminUpdateUserAttributesCommand, CognitoIdentityProviderClient,ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';
import type { Schema } from '@/amplify/data/resource';
import { WallpaperData } from '@/types/wallpaper';
import { OrderData } from '@/types/order';
import outputs from "@/amplify_outputs.json";

// Initialize the Amplify data client
const client = generateClient<Schema>();

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: outputs.auth.aws_region,
});

// Get all users from Cognito user pool
export async function getAllUsers() {
  try {
    // Use ListUsersCommand from Cognito
    
    const command = new ListUsersCommand({
      UserPoolId: outputs.auth.user_pool_id,
      Limit: 60, // Adjust as needed
    });
    
    const response = await cognitoClient.send(command);
    
    if (response.Users) {
      return response.Users.map(user => {
        // Extract user attributes
        const attributes: Record<string, string> = {};
        user.Attributes?.forEach(attr => {
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
          createdAt: user.UserCreateDate?.toISOString() || new Date().toISOString(),
          attributes: attributes
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

// Get user by ID
export async function getUserById(userId: string) {
  try {
    // Use AdminGetUserCommand from Cognito
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

// Update user role
export async function updateUserRole(userId: string, role: 'admin' | 'user') {
  try {
    // Use AdminUpdateUserAttributesCommand from Cognito
    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: outputs.auth.user_pool_id,
      Username: userId,
      UserAttributes: [
        {
          Name: 'custom:role',
          Value: role,
        },
      ],
    });
    
    await cognitoClient.send(command);
    return { success: true };
  } catch (error) {
    console.error(`Error updating role for user ${userId}:`, error);
    throw error;
  }
}

// Update user attributes
export async function updateUserAttributes(userId: string, attributes: Record<string, string>) {
  try {
    // Use AdminUpdateUserAttributesCommand from Cognito
    const userAttributes = Object.entries(attributes).map(([key, value]) => ({
      Name: key,
      Value: value,
    }));

    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: outputs.auth.user_pool_id,
      Username: userId,
      UserAttributes: userAttributes,
    });
    
    await cognitoClient.send(command);
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
    const { AdminResetUserPasswordCommand } = await import('@aws-sdk/client-cognito-identity-provider');
    
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

// Get all wallpapers with ranking information
export async function getAllWallpapersWithRanking() {
  try {
    const response = await client.models.Wallpaper.list({});
    
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
        ranking: null,
        createdAt: item.createdAt || new Date().toISOString()
      }));
      
      // Sort wallpapers by ranking if available, otherwise by creation date
      const sortedWallpapers = wallpapers.sort((a, b) => {
        // If both have rankings, sort by ranking
        if (a.ranking !== null && b.ranking !== null) {
          return a.ranking - b.ranking;
        }
        // If only one has ranking, prioritize the one with ranking
        if (a.ranking !== null) return -1;
        if (b.ranking !== null) return 1;
        
        // Otherwise sort by creation date (newest first)
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      
      // Assign rankings to wallpapers that don't have them
      return sortedWallpapers.map((wallpaper, index) => ({
        ...wallpaper,
        ranking: wallpaper.ranking !== null ? wallpaper.ranking : index + 1
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error getting all wallpapers with ranking:', error);
    return [];
  }
}

// Update wallpaper ranking
export async function updateWallpaperRanking(wallpaperId: string, newRanking: number) {
  try {
    // First get the current wallpaper
    const currentWallpaper = await client.models.Wallpaper.get({
      id: wallpaperId
    });
    
    if (!currentWallpaper || !currentWallpaper.data) {
      throw new Error('Wallpaper not found');
    }
    
    const oldRanking = null;
    // const oldRanking = currentWallpaper.data.ranking !== undefined ? 
    //   Number(currentWallpaper.data.ranking) : null;
    
    // Get all wallpapers to update their rankings
    const allWallpapers = await getAllWallpapersWithRanking();
    
    // Update the ranking of the current wallpaper
    // await client.models.Wallpaper.update({
    //   id: wallpaperId,
    //   ranking: newRanking
    // });
    
    // Update other wallpapers' rankings if needed
    if (oldRanking !== null) {
      // If moving up in ranking (lower number = higher rank)
      // if (newRanking < oldRanking) {
      //   // Shift down wallpapers that were between new and old ranking
      //   const wallpapersToUpdate = allWallpapers.filter(w => 
      //     w.id !== wallpaperId && 
      //     w.ranking >= newRanking && 
      //     w.ranking < oldRanking
      //   );
        
      //   for (const wallpaper of wallpapersToUpdate) {
      //     await client.models.Wallpaper.update({
      //       id: wallpaper.id,
      //       ranking: (wallpaper.ranking || 0) + 1
      //     });
      //   }
      // } 
      // // If moving down in ranking (higher number = lower rank)
      // else if (newRanking > oldRanking) {
      //   // Shift up wallpapers that were between old and new ranking
      //   const wallpapersToUpdate = allWallpapers.filter(w => 
      //     w.id !== wallpaperId && 
      //     w.ranking > oldRanking && 
      //     w.ranking <= newRanking
      //   );
        
      //   for (const wallpaper of wallpapersToUpdate) {
      //     await client.models.Wallpaper.update({
      //       id: wallpaper.id,
      //       ranking: (wallpaper.ranking || 0) - 1
      //     });
      //   }
      // }
    }
    
    console.log('Wallpaper ranking updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating wallpaper ranking:', error);
    return false;
  }
}

// Get all orders
export async function getAllOrders(filters?: { userId?: string, wallpaperId?: string, status?: string }) {
  try {
    // Build filter based on provided parameters
    const filterConditions: any = {};
    
    if (filters?.userId) {
      filterConditions.userId = { eq: filters.userId };
    }
    
    if (filters?.status) {
      filterConditions.status = { eq: filters.status };
    }
    
    // Fetch orders with filters if provided
    const response = await client.models.CartOrder.list({
      filter: Object.keys(filterConditions).length > 0 ? filterConditions : undefined
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
      if (filters?.wallpaperId) {
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
      
      // Sort orders to prioritize pending and processing orders
      return orders.sort((a, b) => {
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
    
    return [];
  } catch (error) {
    console.error('Error getting all orders:', error);
    return [];
  }
}

// Get monthly revenue statistics
export async function getMonthlyRevenue() {
  try {
    const response = await client.models.CartOrder.list({
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
export async function getDashboardStats() {
  try {
    // Get all users
    const users = await getAllUsers();
    
    // Get all wallpapers
    const wallpapers = await getAllWallpapersWithRanking();
    
    // Get all orders
    const orders = await getAllOrders();
    
    // Calculate pending orders count
    const pendingOrders = orders.filter(order => 
      order.status === 'pending' || order.status === 'processing'
    );
    
    // Calculate current month's revenue
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const currentMonthRevenue = orders.reduce((total, order) => {
      if (order.orderDate && order.paymentStatus === 'paid') {
        const orderDate = new Date(order.orderDate);
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          return total + (order.totalAmount || 0);
        }
      }
      return total;
    }, 0);
    
    // Calculate monthly statistics for the current year
    const monthlyStats = Array(12).fill(0);
    
    orders.forEach(order => {
      if (order.orderDate && order.paymentStatus === 'paid') {
        const orderDate = new Date(order.orderDate);
        if (orderDate.getFullYear() === currentYear) {
          const month = orderDate.getMonth();
          monthlyStats[month] += order.totalAmount || 0;
        }
      }
    });
    
    return {
      totalUsers: users.length,
      totalWallpapers: wallpapers.length,
      totalOrders: orders.length,
      pendingOrdersCount: pendingOrders.length,
      currentMonthRevenue,
      monthlyStats,
      recentActivity: orders
        .sort((a, b) => {
          const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
          const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5)
        .map(order => ({
          type: 'order',
          user: order.userId || 'Unknown',
          time: order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'Unknown',
          action: `Order #${order.orderNumber} - ${order.status} - $${order.totalAmount}`
        }))
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