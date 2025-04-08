'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ResetPasswordModalProps } from '@/types/admin';

/**
 * Modal component for resetting user password
 * Allows administrators to send password reset emails to users
 */
const ResetPasswordModal = ({ user, onClose, onConfirm }: ResetPasswordModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await onConfirm(user.userId);
      onClose();
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset user password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Reset User Password</h2>
        <p className="mb-6 text-gray-600 leading-relaxed">
          Are you sure you want to reset the password for {user.email || user.username}? 
          The user will receive an email with instructions to set a new password.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-150 ease-in-out shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-5 py-2.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition duration-150 ease-in-out shadow-sm"
          >
            {isLoading ? 'Processing...' : 'Reset Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;