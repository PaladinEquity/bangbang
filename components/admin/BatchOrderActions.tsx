'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { updateMultipleOrderStatus } from '@/services/adminService';

type BatchOrderActionsProps = {
  selectedOrders: string[];
  onStatusUpdated: () => void;
  disabled?: boolean;
};

/**
 * Component for batch actions on multiple selected orders
 * Allows administrators to update status for multiple orders at once
 */
const BatchOrderActions = ({ selectedOrders, onStatusUpdated, disabled = false }: BatchOrderActionsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleBatchStatusUpdate = async (newStatus: string) => {
    if (selectedOrders.length === 0) {
      toast.error('No orders selected');
      return;
    }

    setIsUpdating(true);
    try {
      // Use the batch update function
      const result = await updateMultipleOrderStatus(selectedOrders, newStatus);
      
      if (result.success) {
        toast.success(`Updated ${result.totalUpdated} orders to ${newStatus}`);
        if (result.totalFailed > 0) {
          toast.error(`Failed to update ${result.totalFailed} orders`);
        }
      } else {
        toast.error('Failed to update orders');
      }
      
      onStatusUpdated();
      setShowDropdown(false);
    } catch (error) {
      console.error('Error updating order statuses:', error);
      toast.error('Failed to update orders');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={disabled || isUpdating || selectedOrders.length === 0}
        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
      >
        {isUpdating ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            Batch Actions ({selectedOrders.length})
            <svg className="ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {showDropdown && (
        <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={() => handleBatchStatusUpdate('pending')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Mark as Pending
            </button>
            <button
              onClick={() => handleBatchStatusUpdate('processing')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Mark as Processing
            </button>
            <button
              onClick={() => handleBatchStatusUpdate('shipped')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Mark as Shipped
            </button>
            <button
              onClick={() => handleBatchStatusUpdate('delivered')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Mark as Delivered
            </button>
            <button
              onClick={() => handleBatchStatusUpdate('cancelled')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Mark as Cancelled
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchOrderActions;