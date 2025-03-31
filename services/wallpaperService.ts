/**
 * Service for handling wallpaper data and cart operations
 */

type WallpaperData = {
  id?: string;
  imageData: string; // Base64 encoded image data
  description: string;
  primaryImagery: string;
  size: string;
  price: number;
};

type CartItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  imageData?: string; // For custom wallpapers
  options: {
    rollSize: string;
    patternSize?: string;
  };
  isCustom: boolean;
  wallpaperId: string;
};

// Local storage keys
const CART_STORAGE_KEY = 'bangbang_cart';
const WALLPAPER_STORAGE_KEY = 'bangbang_wallpapers';

// Generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Save wallpaper data and return the wallpaper ID
export async function saveWallpaperData(wallpaperData: WallpaperData): Promise<string> {
  try {
    // In a production environment, this would be an API call to save to a database
    // For now, we'll use local storage as a simple solution
    const wallpaperId = generateId();
    const wallpaper = {
      ...wallpaperData,
      id: wallpaperId,
      createdAt: new Date().toISOString()
    };
    
    // Get existing wallpapers from storage
    const existingWallpapersJson = localStorage.getItem(WALLPAPER_STORAGE_KEY);
    const existingWallpapers = existingWallpapersJson ? JSON.parse(existingWallpapersJson) : [];
    
    // Add new wallpaper
    existingWallpapers.push(wallpaper);
    
    // Save back to storage
    localStorage.setItem(WALLPAPER_STORAGE_KEY, JSON.stringify(existingWallpapers));
    
    return wallpaperId;
  } catch (error) {
    console.error('Error saving wallpaper data:', error);
    throw error;
  }
}

// Get wallpaper by ID
export function getWallpaperById(wallpaperId: string): WallpaperData | null {
  try {
    const wallpapersJson = localStorage.getItem(WALLPAPER_STORAGE_KEY);
    if (!wallpapersJson) return null;
    
    const wallpapers = JSON.parse(wallpapersJson);
    return wallpapers.find((w: WallpaperData) => w.id === wallpaperId) || null;
  } catch (error) {
    console.error('Error getting wallpaper:', error);
    return null;
  }
}

// Add item to cart
export function addToCart(item: CartItem): void {
  try {
    // Get existing cart
    const cartJson = localStorage.getItem(CART_STORAGE_KEY);
    const cart = cartJson ? JSON.parse(cartJson) : [];
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex((cartItem: CartItem) => 
      cartItem.wallpaperId === item.wallpaperId && 
      cartItem.options.rollSize === item.options.rollSize
    );
    
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      cart[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item
      cart.push({
        ...item,
        id: generateId() // Generate a unique cart item ID
      });
    }
    
    // Save cart
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

// Get cart items
export function getCartItems(): CartItem[] {
  try {
    const cartJson = localStorage.getItem(CART_STORAGE_KEY);
    return cartJson ? JSON.parse(cartJson) : [];
  } catch (error) {
    console.error('Error getting cart items:', error);
    return [];
  }
}

// Update cart item quantity
export function updateCartItemQuantity(itemId: string, quantity: number): void {
  try {
    if (quantity < 1) return;
    
    const cartJson = localStorage.getItem(CART_STORAGE_KEY);
    if (!cartJson) return;
    
    const cart = JSON.parse(cartJson);
    const itemIndex = cart.findIndex((item: CartItem) => item.id === itemId);
    
    if (itemIndex >= 0) {
      cart[itemIndex].quantity = quantity;
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
}

// Remove item from cart
export function removeCartItem(itemId: string): void {
  try {
    const cartJson = localStorage.getItem(CART_STORAGE_KEY);
    if (!cartJson) return;
    
    const cart = JSON.parse(cartJson);
    const updatedCart = cart.filter((item: CartItem) => item.id !== itemId);
    
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
  } catch (error) {
    console.error('Error removing cart item:', error);
    throw error;
  }
}

// Clear cart
export function clearCart(): void {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}

// Calculate cart total
export function calculateCartTotal(): number {
  try {
    const items = getCartItems();
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  } catch (error) {
    console.error('Error calculating cart total:', error);
    return 0;
  }
}