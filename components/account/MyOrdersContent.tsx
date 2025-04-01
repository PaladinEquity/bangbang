'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../auth/AuthContext';
import { getUserOrders } from '@/services/wallpaperService';
import { toast } from 'react-hot-toast';

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  options: {
    rollSize: string;
    patternSize?: string | null;
  };
  isCustom: boolean;
};

type Order = {
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

export default function MyOrdersContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const userOrders = await getUserOrders(user.userId);
        setOrders(userOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load your orders');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [user]);

  // Parse order items from JSON string
  const parseOrderItems = (itemsJson: string | null): OrderItem[] => {
    if (!itemsJson) return [];
    try {
      return JSON.parse(itemsJson);
    } catch (error) {
      console.error('Error parsing order items:', error);
      return [];
    }
  };

  // Format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-gray-600 mb-8">View your order history or check the status of a recent order.</p>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg mb-6">You haven't placed any orders yet.</p>
          <Link 
            href="/image-creation" 
            className="bg-black text-white px-6 py-3 rounded text-sm hover:bg-gray-800 transition-colors inline-block"
          >
            Start Browsing
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const orderItems = parseOrderItems(order.items);
            return (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-lg">Order #{order.orderNumber}</h3>
                      <p className="text-sm text-gray-600">Placed on {formatDate(order.orderDate)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        order.paymentStatus === 'unpaid' ? 'bg-yellow-100 text-yellow-800' :
                        order.paymentStatus === 'refunded' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.paymentStatus ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1) : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border-b">
                  <h4 className="font-medium mb-4">Order Items</h4>
                  <div className="space-y-4">
                    {orderItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex-grow">
                          <p className="font-medium">{item.name} {item.isCustom && '(Custom)'}</p>
                          <p className="text-sm text-gray-600">
                            Roll Size: {item.options.rollSize}
                            {item.options.patternSize && `, Pattern Size: ${item.options.patternSize}`}
                          </p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-6 border-b">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Shipping Address</h4>
                      <p className="text-sm whitespace-pre-line">{order.shippingAddress || 'Not provided'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Payment Method</h4>
                      <p className="text-sm">{order.paymentMethod || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}