/**
 * Service for handling wallpaper data and cart operations using Amplify models
 */
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

type WallpaperData = {
  id?: string | null;
  imageData: string; // Base64 encoded image data
  description: string | null;
  primaryImagery: string | null;
  size: string | null;
  price: number;
  userId?: string | null; // Owner of the wallpaper
};

type CartItem = {
  id: string | null;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  imageData?: string | null; // For custom wallpapers
  options: {
    rollSize: string;
    patternSize?: string | null;
  };
  isCustom: boolean;
  wallpaperId: string;
};

// Generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Initialize the Amplify data client
const client = generateClient<Schema>();

// Save wallpaper data and return the wallpaper ID
export async function saveWallpaperData(wallpaperData: WallpaperData): Promise<string> {
  try {
    // Save to Amplify DataStore
    const result = await client.models.Wallpaper.create({
      imageData: wallpaperData.imageData,
      description: wallpaperData.description,
      primaryImagery: wallpaperData.primaryImagery,
      size: wallpaperData.size,
      price: wallpaperData.price,
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
    
    if (existingItems && existingItems.data && existingItems.data.length > 0) {
      // Update quantity if item exists
      const existingItem = existingItems.data[0];
      await client.models.CartItem.update({
        id: existingItem.id,
        quantity: existingItem.quantity + item.quantity
      });
    } else {
      // Add new item
      const cartItemId = generateId();
      await client.models.CartItem.create({
        id: cartItemId,
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

// Order type definition
type OrderData = {
  id?: string | null;
  orderNumber: string | null;
  totalAmount: number | null;
  status: string | null;
  paymentStatus: string | null;
  paymentMethod?: string | null;
  stripePaymentId?: string | null;
  shippingAddress?: string | null;
  billingAddress?: string | null;
  orderDate: string | null;
  items: string | null; // JSON string of cart items
  userId?: string | null;
};

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
    const orderId = generateId();
    
    // Save to Amplify DataStore
    await client.models.CartOrder.create({
      id: orderId,
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
    
    return orderId;
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