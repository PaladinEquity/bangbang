'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { OrderData } from '@/types/order';

type UpdateOrderStatusModalProps = {
  order: OrderData | null;
  onClose: () => void;
  onSave: (orderId: string, status: string, paymentStatus?: string) => Promise<void>;
};

/**
 * Modal component for updating order status
 * Allows administrators to change an order's status and payment status
 */
const UpdateOrderStatusModal = ({ order, onClose, onSave }: UpdateOrderStatusModalProps) => {
  const [orderStatus, setOrderStatus] = useState<string>('pending');
  const [paymentStatus, setPaymentStatus] = useState<string>('unpaid');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setOrderStatus(order.status || 'pending');
      setPaymentStatus(order.paymentStatus || 'unpaid');
    }
  }, [order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order?.id) return;
    
    setIsLoading(true);
    try {
      await onSave(order.id, orderStatus, paymentStatus);
      onClose();
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsLoading(false);
    }
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Update Order Status</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-150 ease-in-out"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-150 ease-in-out"
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
                <option value="partial">Partially Paid</option>
              </select>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-150 ease-in-out shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition duration-150 ease-in-out shadow-sm"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateOrderStatusModal;