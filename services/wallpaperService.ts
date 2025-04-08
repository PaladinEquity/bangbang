/**
 * Service for handling wallpaper data and cart operations using Amplify models
 */
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { WallpaperData } from '@/types/wallpaper';
import { CartItem, OrderData } from '@/types/order';
import { toast } from 'react-hot-toast';

// Initialize the Amplify data client
const client = generateClient<Schema>({authMode: 'userPool'});

// Save wallpaper data and return the wallpaper ID
export async function saveWallpaperData(wallpaperData: WallpaperData): Promise<string> {
  try {
    // Validate required fields
    if (!wallpaperData.imageData) {
      throw new Error('Wallpaper image data is required');
    }
    
    if (!wallpaperData.price || wallpaperData.price <= 0) {
      throw new Error('Wallpaper price must be greater than zero');
    }
    
    // Check for duplicate wallpaper by imageData (if it's a URL)
    if (wallpaperData.imageData.startsWith('http')) {
      const existingWallpapers = await client.models.Wallpaper.list({
        filter: { imageData: { eq: wallpaperData.imageData } }
      });
      
      if (existingWallpapers && existingWallpapers.data && existingWallpapers.data.length > 0) {
        // Return existing wallpaper ID instead of creating a duplicate
        console.log('Wallpaper with this image URL already exists, returning existing ID');
        return existingWallpapers.data[0].id;
      }
    }
    
    // Save to Amplify DataStore
    const result = await client.models.Wallpaper.create({
      imageData: wallpaperData.imageData,
      description: wallpaperData.description,
      primaryImagery: wallpaperData.primaryImagery,
      size: wallpaperData.size,
      price: wallpaperData.price,
      ranking: wallpaperData.ranking || null, // Add ranking field with default null
      createdAt: new Date().toISOString(),
      userId: wallpaperData.userId
    });
    
    console.log('Wallpaper saved to Amplify successfully');
    return result.data?.id || '';
  } catch (error) {
    console.error('Error saving wallpaper data:', error);
    throw error;
  }
}

// Get all wallpapers
export async function getAllWallpapers(): Promise<(WallpaperData & { userId?: string })[]> {
  try {
    const response = await client.models.Wallpaper.list({});
    
    if (response && response.data) {
      return response.data.map(item => ({
        id: item.id,
        imageData: item.imageData || '',
        description: item.description || '',
        primaryImagery: item.primaryImagery || '',
        size: item.size || '',
        price: item.price || 0,
        ranking: item?.ranking ? Number(item.ranking) : null,
        userId: item.userId || ''
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error getting wallpapers:', error);
    return [];
  }
}

// Get wallpaper by ID
export async function getWallpaperById(wallpaperId: string): Promise<WallpaperData | null> {
  try {
    const response = await client.models.Wallpaper.get({
      id: wallpaperId
    });
    
    if (response && response.data) {
      return {
        id: response.data.id,
        imageData: response.data.imageData || '',
        description: response.data.description || '',
        primaryImagery: response.data.primaryImagery || '',
        size: response.data.size || '',
        price: response.data.price || 0,
        ranking: response.data.ranking ? Number(response.data.ranking) : null,
        userId: response.data.userId || ''
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting wallpaper:', error);
    return null;
  }
}

// Add item to cart
export async function addToCart(item: CartItem, userId: string): Promise<void> {
  try {
    // Validate required fields
    if (!item.wallpaperId) {
      throw new Error('Wallpaper ID is required');
    }
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (!item.options || !item.options.rollSize) {
      throw new Error('Roll size is required');
    }
    
    if (item.quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }
    
    // Verify wallpaper exists before adding to cart
    const wallpaper = await client.models.Wallpaper.get({
      id: item.wallpaperId
    });
    
    if (!wallpaper || !wallpaper.data) {
      throw new Error('Wallpaper not found');
    }
    
    // Check if item already exists in cart with same wallpaperId and rollSize
    const existingItems = await client.models.CartItem.list({
      filter: {
        and: [
          { wallpaperId: { eq: item.wallpaperId } },
          { rollSize: { eq: item.options.rollSize } },
          { userId: { eq: userId } }
        ]
      }
    });
    
    // Get current cart count for this wallpaper to check limits
    const userCartItems = await client.models.CartItem.list({
      filter: { userId: { eq: userId } }
    });
    
    const totalCartItems = userCartItems?.data?.length || 0;
    if (totalCartItems >= 20 && existingItems?.data?.length === 0) {
      throw new Error('Cart limit reached (maximum 20 different items)');
    }
    
    if (existingItems && existingItems.data && existingItems.data.length > 0) {
      // Update quantity if item exists, with a maximum limit
      const existingItem = existingItems.data[0];
      const newQuantity = existingItem.quantity + item.quantity;
      
      // Set a reasonable maximum quantity per item (e.g., 10)
      if (newQuantity > 10) {
        throw new Error('Maximum quantity per item is 10');
      }
      
      await client.models.CartItem.update({
        id: existingItem.id,
        quantity: newQuantity
      });
      
      // Update wallpaper ranking when added to cart
      await updateWallpaperRankingByCart(item.wallpaperId, item.quantity);
    } else {
      // Add new item
      await client.models.CartItem.create({
        name: item.name,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        imageData: item.imageData,
        rollSize: item.options.rollSize,
        patternSize: item.options.patternSize,
        isCustom: item.isCustom,
        wallpaperId: item.wallpaperId,
        userId: userId
      });
      
      // Update wallpaper ranking when added to cart
      await updateWallpaperRankingByCart(item.wallpaperId, item.quantity);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

// Get cart items
export async function getCartItems(userId: string): Promise<CartItem[]> {
  try {
    const response = await client.models.CartItem.list({
      filter: { userId: { eq: userId } }
    });
    
    if (response && response.data) {
      return response.data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        imageData: item.imageData,
        options: {
          rollSize: item.rollSize,
          patternSize: item.patternSize
        },
        isCustom: item.isCustom,
        wallpaperId: item.wallpaperId
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error getting cart items:', error);
    return [];
  }
}

// Update cart item quantity
export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<void> {
  try {
    if (quantity < 1) return;
    
    await client.models.CartItem.update({
      id: itemId,
      quantity: quantity
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
}

// Remove item from cart
export async function removeCartItem(itemId: string): Promise<void> {
  try {
    // Delete the cart item from Amplify DataStore
    await client.models.CartItem.delete({
      id: itemId
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    throw error;
  }
}

// Clear cart
export async function clearCart(userId: string): Promise<void> {
  try {
    // Get all cart items for the user
    const response = await client.models.CartItem.list({
      filter: { userId: { eq: userId } }
    });
    
    // Delete each cart item
    if (response && response.data) {
      for (const item of response.data) {
        await client.models.CartItem.delete({
          id: item.id
        });
      }
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}

// Calculate cart total
export async function calculateCartTotal(userId: string): Promise<number> {
  try {
    const items = await getCartItems(userId);
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  } catch (error) {
    console.error('Error calculating cart total:', error);
    return 0;
  }
}

// Using OrderData type from types/order.ts

// No longer using localStorage for orders

// Generate order number
const generateOrderNumber = (): string => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${timestamp}-${random}`;
};

// Create cart order
export async function createCartOrder(userId: string, shippingAddress: string, billingAddress: string, paymentMethod?: string, stripePaymentId?: string): Promise<string> {
  try {
    // Get cart items
    const cartItems = await getCartItems(userId);
    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }
    
    // Calculate total
    const totalAmount = await calculateCartTotal(userId);
    
    // Generate order number
    const orderNumber = generateOrderNumber();
    
    // Save to Amplify DataStore
    const newOrder = await client.models.CartOrder.create({
      orderNumber,
      totalAmount,
      status: 'processing',
      paymentStatus: stripePaymentId ? 'paid' : 'unpaid',
      paymentMethod,
      stripePaymentId,
      shippingAddress,
      billingAddress,
      orderDate: new Date().toISOString(),
      items: JSON.stringify(cartItems),
      userId
    });
    console.log('Order saved to Amplify successfully');
    
    // Clear cart after successful order creation
    await clearCart(userId);
    
    return newOrder.data?.id || '';
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

// Get orders for a user
export async function getUserOrders(userId: string): Promise<OrderData[]> {
  try {
    const response = await client.models.CartOrder.list({
      filter: {
        userId: { eq: userId }
      }
    });
    
    if (response && response.data) {
      return response.data.map(order => ({
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
    }
    
    return [];
  } catch (error) {
    console.error('Error getting user orders:', error);
    return [];
  }
}

// Get order by ID
export async function getOrderById(orderId: string): Promise<OrderData | null> {
  try {
    const response = await client.models.CartOrder.get({
      id: orderId
    });
    
    if (response && response.data) {
      return {
        id: response.data.id,
        orderNumber: response.data.orderNumber,
        totalAmount: response.data.totalAmount,
        status: response.data.status,
        paymentStatus: response.data.paymentStatus,
        paymentMethod: response.data.paymentMethod,
        stripePaymentId: response.data.stripePaymentId,
        shippingAddress: response.data.shippingAddress,
        billingAddress: response.data.billingAddress,
        orderDate: response.data.orderDate,
        items: response.data.items,
        userId: response.data.userId
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting order:', error);
    return null;
  }
}

// Update order status
export async function updateOrderStatus(orderId: string, status: 'pending' | 'processing' | 'completed' | 'cancelled', paymentStatus?: 'unpaid' | 'paid' | 'refunded'): Promise<boolean> {
  try {
    // First get the current order
    const currentOrder = await client.models.CartOrder.get({
      id: orderId
    });
    
    if (!currentOrder || !currentOrder.data) {
      throw new Error('Order not found');
    }
    
    // Update the order
    const updateData: any = { status };
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    
    await client.models.CartOrder.update({
      id: orderId,
      ...updateData
    });
    
    console.log('Order status updated in Amplify successfully');
    
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
}

// User Preference Functions

// Toggle like/unlike for a wallpaper
export async function toggleWallpaperLike(wallpaperId: string, userId: string): Promise<boolean> {
  try {
    // Validate inputs
    if (!userId) {
      console.error('User ID is required to like/unlike a wallpaper');
      return false;
    }
    
    if (!wallpaperId) {
      console.error('Wallpaper ID is required');
      return false;
    }
    
    // Verify wallpaper exists
    const wallpaper = await client.models.Wallpaper.get({
      id: wallpaperId
    });
    
    if (!wallpaper || !wallpaper.data) {
      console.error('Wallpaper not found');
      return false;
    }

    // Check if user already has a preference for this wallpaper
    const existingPreference = await client.models.UserPreference.list({
      filter: {
        and: [
          { wallpaperId: { eq: wallpaperId } },
          { userId: { eq: userId } }
        ]
      }
    });

    let liked = true;
    
    // Implement rate limiting - check if user has made too many like/unlike actions recently
    const recentPreferences = await client.models.UserPreference.list({
      filter: {
        userId: { eq: userId }
      }
    });
    
    // Get preferences updated in the last minute
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const recentActions = recentPreferences?.data?.filter(pref => 
      pref.createdAt && pref.createdAt > oneMinuteAgo
    ) || [];
    
    // Limit to 10 actions per minute to prevent abuse
    if (recentActions.length > 10 && !existingPreference?.data?.length) {
      console.error('Rate limit exceeded for like/unlike actions');
      return false;
    }
    
    // If preference exists, toggle it (one user can only toggle once per wallpaper)
    if (existingPreference && existingPreference.data && existingPreference.data.length > 0) {
      const preference = existingPreference.data[0];
      liked = !preference.liked;
      
      // Update the preference
      await client.models.UserPreference.update({
        id: preference.id,
        liked: liked
      });
    } else {
      // Create new preference (default is liked=true)
      await client.models.UserPreference.create({
        userId: userId,
        wallpaperId: wallpaperId,
        liked: true,
        createdAt: new Date().toISOString()
      });
    }

    // Update wallpaper ranking based on like/unlike
    await updateWallpaperRankingByLike(wallpaperId, liked);
    
    return true;
  } catch (error) {
    console.error('Error toggling wallpaper like:', error);
    return false;
  }
}

// Check if user has liked a wallpaper
export async function hasUserLikedWallpaper(wallpaperId: string, userId: string): Promise<boolean> {
  try {
    if (!userId) return false;
    
    const preference = await client.models.UserPreference.list({
      filter: {
        and: [
          { wallpaperId: { eq: wallpaperId } },
          { userId: { eq: userId } },
          { liked: { eq: true } }
        ]
      }
    });
    
    return preference && preference.data && preference.data.length > 0;
  } catch (error) {
    console.error('Error checking if user liked wallpaper:', error);
    return false;
  }
}

// Update wallpaper ranking based on like/unlike
async function updateWallpaperRankingByLike(wallpaperId: string, liked: boolean): Promise<void> {
  try {
    // Get current wallpaper
    const wallpaper = await client.models.Wallpaper.get({
      id: wallpaperId
    });
    
    if (!wallpaper || !wallpaper.data) {
      throw new Error('Wallpaper not found');
    }
    
    // Get current ranking or default to a high number if null
    const currentRanking = wallpaper.data.ranking !== null ? Number(wallpaper.data.ranking) : 1000;
    
    // Adjust ranking: decrease (improve) if liked, increase (worsen) if unliked
    const newRanking = liked ? Math.max(1, currentRanking - 1) : currentRanking + 1;
    
    // Update the wallpaper ranking
    await client.models.Wallpaper.update({
      id: wallpaperId,
      ranking: newRanking
    });
  } catch (error) {
    console.error('Error updating wallpaper ranking by like:', error);
  }
}

// Update wallpaper ranking when added to cart
export async function updateWallpaperRankingByCart(wallpaperId: string, quantity: number): Promise<void> {
  try {
    // Get current wallpaper
    const wallpaper = await client.models.Wallpaper.get({
      id: wallpaperId
    });
    
    if (!wallpaper || !wallpaper.data) {
      throw new Error('Wallpaper not found');
    }
    
    // Get current ranking or default to a high number if null
    const currentRanking = wallpaper.data.ranking !== null ? Number(wallpaper.data.ranking) : 1000;
    
    // Improve ranking based on quantity added to cart (more items = better ranking)
    const newRanking = Math.max(1, currentRanking - quantity);
    
    // Update the wallpaper ranking
    await client.models.Wallpaper.update({
      id: wallpaperId,
      ranking: newRanking
    });
  } catch (error) {
    console.error('Error updating wallpaper ranking by cart:', error);
  }
}