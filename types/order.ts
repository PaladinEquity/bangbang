/**
 * Order related type definitions
 */

import { Wallpaper } from './ui';

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  productName: string;
  productImage?: string;
  customOptions?: Record<string, any>;
};

export type Order = {
  id: string;
  userId: string;
  orderDate: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  shippingAddress?: string;
  paymentMethodId?: string;
  trackingNumber?: string;
};

export type CartItem = {
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

export type OrderData = {
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