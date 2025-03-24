'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { updateUserAttributes } from 'aws-amplify/auth';
import { toast } from 'react-hot-toast';

export default function MyAccountContent() {
  const { user, refreshUser } = useAuth();
  // Initialize with empty data that will be populated from auth context
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  
  // State for phone verification
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');

  // Update user data when auth context changes
  useEffect(() => {
    if (user) {
      setUserData({
        firstName: user.attributes?.given_name || '',
        lastName: user.attributes?.family_name || '',
        email: user.email || '',
        phone: user.attributes?.phone_number || '',
      });
    }
  }, [user]);

  // State for form editing
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    phone: userData.phone,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneVerificationRequired, setPhoneVerificationRequired] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare attributes to update
      const attributesToUpdate: Record<string, string> = {
        'given_name': formData.firstName,
        'family_name': formData.lastName,
      };
      
      // Only update phone if it changed
      if (formData.phone !== userData.phone) {
        attributesToUpdate['phone_number'] = formData.phone;
      }
      
      // Update user attributes in AWS Cognito
      await updateUserAttributes({
        userAttributes: attributesToUpdate
      });
      
      // If phone number was updated, it might require verification
      if (formData.phone !== userData.phone && formData.phone) {
        setShowVerification(true);
        toast.success('Phone number updated. Please verify your new number.');
      } else {
        toast.success('Profile updated successfully');
        // Update local state
        setUserData({
          ...userData,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        });
        
        // Refresh user data from Cognito
        await refreshUser();
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
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

  // Handle phone verification
  const handleVerifyPhone = async () => {
    if (!verificationCode.trim()) {
      setVerificationError('Verification code is required');
      return;
    }
    
    setIsSubmitting(true);
    setVerificationError('');
    
    try {
      // Call AWS Amplify to verify the phone number
      await updateUserAttributes({
        userAttributes: {
          'phone_number_verified': 'true'
        },
        options: {
          authFlowType: 'CUSTOM_AUTH',
          clientMetadata: {
            verification_code: verificationCode
          }
        }
      });
      
      toast.success('Phone number verified successfully');
      
      // Update local state
      setUserData({
        ...userData,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      
      // Refresh user data from Cognito
      await refreshUser();
      
      // Reset verification state
      setShowVerification(false);
      setVerificationCode('');
      setIsEditing(false);
    } catch (error) {
      console.error('Error verifying phone number:', error);
      setVerificationError('Invalid verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Account</h1>
      <p className="text-sm text-gray-600 mb-8">View and edit your personal info below.</p>
      
      {/* Phone Verification Modal */}
      {showVerification && (
        <div className="mb-8 p-4 border border-blue-200 bg-blue-50 rounded">
          <h3 className="font-medium mb-2">Verify Your Phone Number</h3>
          <p className="text-sm text-gray-600 mb-4">A verification code has been sent to your new phone number. Please enter it below to verify.</p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Verification Code</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-0 focus:border-transparent"
              placeholder="Enter verification code"
            />
            {verificationError && <p className="text-xs text-red-500 mt-1">{verificationError}</p>}
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleVerifyPhone}
              className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Verifying...' : 'Verify'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowVerification(false);
                setVerificationCode('');
                setVerificationError('');
                handleDiscard();
              }}
              className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
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
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
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
        
        <div className="border-t border-gray-200 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Password</h3>
              <p className="text-sm text-gray-600">Last updated 3 months ago</p>
            </div>
            <button className="text-sm text-gray-600 hover:text-gray-900">Change</button>
          </div>
        </div>
        
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