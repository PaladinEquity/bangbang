'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { getAllOrders } from '@/services/adminService';
import { OrderData } from '@/types/order';


// Order status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.pending;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Payment status badge component
const PaymentBadge = ({ status }: { status: string }) => {
  const statusStyles = {
    paid: 'bg-green-100 text-green-800',
    unpaid: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
    partial: 'bg-yellow-100 text-yellow-800',
  };

  const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.unpaid;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Order detail modal component
type OrderDetailModalProps = {
  order: OrderData;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: string) => void;
};

const OrderDetailModal = ({ order, onClose, onUpdateStatus }: OrderDetailModalProps) => {
  const [newStatus, setNewStatus] = useState(order.status || '');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Parse items from JSON string
  const items = order.items ? JSON.parse(order.items) : [];
  
  const handleStatusUpdate = async () => {
    if (!order.id || newStatus === order.status) return;
    
    setIsUpdating(true);
    try {
      // In a real implementation, call API to update order status
      // For now, just update locally
      onUpdateStatus(order.id, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      onClose();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold">Order #{order.orderNumber}</h2>
            <p className="text-gray-500 text-sm">
              Placed on {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'Unknown date'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-medium mb-2">Order Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">Status:</div>
                <div><StatusBadge status={order.status || 'pending'} /></div>
                
                <div className="text-gray-600">Payment:</div>
                <div><PaymentBadge status={order.paymentStatus || 'unpaid'} /></div>
                
                <div className="text-gray-600">Payment Method:</div>
                <div>{order.paymentMethod || 'Not specified'}</div>
                
                <div className="text-gray-600">Total Amount:</div>
                <div className="font-medium">${order.totalAmount?.toFixed(2) || '0.00'}</div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Customer Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">User ID: </span>
                  {order.userId || 'Guest'}
                </div>
                
                <div>
                  <span className="text-gray-600">Shipping Address: </span>
                  {order.shippingAddress || 'Not provided'}
                </div>
                
                <div>
                  <span className="text-gray-600">Billing Address: </span>
                  {order.billingAddress || 'Same as shipping'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <h3 className="font-medium mb-2">Order Items</h3>
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          {items.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {items.map((item: any, index: number) => (
                <div key={index} className="py-3 flex items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden mr-4">
                    {item.imageData && (
                      <img 
                        src={item.imageData} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.options?.rollSize && `Size: ${item.options.rollSize}`}
                      {item.isCustom && ' (Custom Design)'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No items found in this order</p>
          )}
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Update Order Status</h3>
          <div className="flex items-center space-x-4">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="p-2 border border-gray-300 rounded-md flex-1"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={isUpdating || newStatus === order.status}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const orderData = await getAllOrders();
        // Sort by date, with newest first
        orderData.sort((a, b) => {
          const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
          const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
          return dateB - dateA;
        });
        setOrders(orderData);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on search term and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (order.userId?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    
    // Date filtering
    let matchesDate = true;
    if (order.orderDate) {
      const orderDate = new Date(order.orderDate);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      if (dateFilter === 'today') {
        matchesDate = orderDate.toDateString() === today.toDateString();
      } else if (dateFilter === 'yesterday') {
        matchesDate = orderDate.toDateString() === yesterday.toDateString();
      } else if (dateFilter === 'last7days') {
        matchesDate = orderDate >= lastWeek;
      } else if (dateFilter === 'last30days') {
        matchesDate = orderDate >= lastMonth;
      }
    }
    
    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  // Prioritize pending and processing orders
  const prioritizedOrders = [...filteredOrders].sort((a, b) => {
    // First sort by priority status
    const priorityOrder = { 'pending': 0, 'processing': 1 };
    const aStatus = a.status as keyof typeof priorityOrder;
    const bStatus = b.status as keyof typeof priorityOrder;
    
    if (priorityOrder[aStatus] !== undefined && priorityOrder[bStatus] !== undefined) {
      return priorityOrder[aStatus] - priorityOrder[bStatus];
    } else if (priorityOrder[aStatus] !== undefined) {
      return -1; // a is priority, b is not
    } else if (priorityOrder[bStatus] !== undefined) {
      return 1; // b is priority, a is not
    }
    
    // If neither is priority or both have same priority, sort by date
    const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
    const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
    return dateB - dateA; // newest first
  });

  // Handle order status update
  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    // In a real application, call API to update order status
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return { ...order, status: newStatus };
      }
      return order;
    }));
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
          <p className="text-gray-600 mt-1">Track and manage customer orders</p>
        </div>
        <div className="flex space-x-2">
          <button 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={() => window.print()}
          >
            Export Orders
          </button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Search by order # or customer"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
            <select
              id="status"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label htmlFor="payment" className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select
              id="payment"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="refunded">Refunded</option>
              <option value="partial">Partially Paid</option>
            </select>
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              id="date"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : prioritizedOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prioritizedOrders.map((order) => (
                  <tr key={order.id} className={order.status === 'pending' ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderNumber || `Order ${order.id?.substring(0, 8)}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.userId ? `User: ${order.userId.substring(0, 8)}...` : 'Guest'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status || 'pending'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PaymentBadge status={order.paymentStatus || 'unpaid'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      ${order.totalAmount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No orders found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}