'use client';

import React, { useState } from 'react';
import { changePassword } from '../../services/authService';
import StatusMessage from './StatusMessage';

export default function ChangePasswordForm() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccessMessage('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
    } catch (err) {
      setError(`Failed to change password: ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="mt-8">
      <StatusMessage 
        success={successMessage} 
        error={error} 
        onDismiss={clearMessages} 
      />
      
      {isChangingPassword ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded p-2 text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded p-2 text-sm"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded p-2 text-sm"
              required
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Changing...' : 'Change Password'}
            </button>
            <button
              type="button"
              onClick={() => setIsChangingPassword(false)}
              className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="border-t border-gray-200 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Password</h3>
              <p className="text-sm text-gray-600">Change your account password</p>
            </div>
            <button 
              className="text-sm text-gray-600 hover:text-gray-900"
              onClick={() => setIsChangingPassword(true)}
            >
              Change
            </button>
          </div>
        </div>
      )}
    </div>
  );
}