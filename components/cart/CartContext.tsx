'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCartItems } from '@/services/wallpaperService';
import { useAuth } from '@/components/auth/AuthContext';
import { CartItem } from '@/types/order';

type CartContextType = {
  cartItems: CartItem[];
  cartCount: number;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType>({
  cartItems: [],
  cartCount: 0,
  isLoading: false,
  setIsLoading: () => {},
  refreshCart: async () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const refreshCart = async () => {
    if (!isAuthenticated || !user?.userId) {
      setCartItems([]);
      return;
    }

    try {
      const items = await getCartItems(user.userId);
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setCartItems([]);
    }
  };

  // Calculate cart count from cart items
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  // Fetch cart items when user authentication state changes
  useEffect(() => {
    refreshCart();
  }, [user?.userId, isAuthenticated]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        isLoading,
        setIsLoading,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};