'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getUserData, updateUserData, UserData } from '../../services/userService';
import StatusMessage from './StatusMessage';
import ChangePasswordForm from './ChangePasswordForm';

export default function MyAccountContent() {
  const { user, refreshUser } = useAuth();
  
  // Initialize with empty data that will be populated from auth context
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Fetch user data from Cognito when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          // Get user data from the userService
          const data = await getUserData();
          setUserData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
          });
        } catch (err) {
          console.error('Error fetching user data:', err);
          // Fallback to auth context data if API fails
          setUserData({
            firstName: user.attributes?.given_name || '',
            lastName: user.attributes?.family_name || '',
            email: user.email || '',
            phone: user.attributes?.phone_number || '',
          });
        }
      }
    };
    
    fetchData();
  }, [user]);

  // State for form editing
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    phone: userData.phone,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Update user data using the userService
      const updatedData = await updateUserData({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      
      // Update local state with the response
      setUserData({
        firstName: updatedData.firstName || '',
        lastName: updatedData.lastName || '',
        email: updatedData.email || '',
        phone: updatedData.phone || '',
      });
      
      setSuccessMessage('Profile updated successfully');
      setIsEditing(false);
      
      // Refresh the user data in the auth context
      refreshUser();
    } catch (err) {
      setError(`Failed to update profile: ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    setFormData({
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
    });
    setIsEditing(false);
  };

  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Account</h1>
      <p className="text-sm text-gray-600 mb-8">View and edit your personal info below.</p>
      
      <StatusMessage 
        success={successMessage} 
        error={error} 
        onDismiss={clearMessages} 
      />
      
      {/* Personal Info */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Personal Info</h2>
        <p className="text-sm text-gray-600 mb-4">Update your personal information.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">First name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-0 focus:border-transparent"
                disabled={!isEditing}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-0 focus:border-transparent"
                disabled={!isEditing}
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={userData.email}
              className="w-full border border-gray-300 rounded p-2 text-sm bg-gray-50 focus:outline-none"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">To change your email, please contact support.</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Phone number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-0 focus:border-transparent"
              disabled={!isEditing}
            />
          </div>
          
          {isEditing ? (
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50 transition-colors"
              >
                Discard
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50 transition-colors"
            >
              Edit
            </button>
          )}
        </form>
      </div>
      
      {/* Account Security */}
      <div>
        <h2 className="text-lg font-medium mb-4">Account Security</h2>
        <p className="text-sm text-gray-600 mb-4">Manage your password and account security.</p>
        
        {/* Password Change Form */}
        <ChangePasswordForm />
        
        <div className="border-t border-gray-200 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Two-factor authentication</h3>
              <p className="text-sm text-gray-600">Not enabled</p>
            </div>
            <button className="text-sm text-gray-600 hover:text-gray-900">Enable</button>
          </div>
        </div>
      </div>
    </>
  );
}