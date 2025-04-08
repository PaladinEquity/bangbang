'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { EditAttributeModalProps } from '@/types/admin';

/**
 * Modal component for editing user attributes
 * Handles display and editing of user attributes with proper validation
 */
const EditAttributeModal = ({ user, onClose, onSave }: EditAttributeModalProps) => {
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');

  // List of immutable attributes that should be displayed but not editable
  const immutableAttributes = ['sub', 'email_verified', 'phone_number_verified'];
  
  // Define the required attributes to display in specific order
  const attributeOrder = [
    'given_name',
    'family_name',
    'address',
    'email',
    'phone_number',
    'timezone',
  ];
  
  // Custom labels for the attributes
  const attributeLabels: Record<string, string> = {
    'given_name': 'FirstName',
    'family_name': 'LastName',
    'address': 'Address',
    'email': 'Email',
    'phone_number': 'phoneNumber',
    'timezone': 'timezone'
  };

  useEffect(() => {
    if (user && user.attributes) {
      // Extract all attributes including empty ones
      const editableAttrs: Record<string, string> = {};
      Object.entries(user.attributes).forEach(([key, value]) => {
        // Skip system attributes but include empty values
        if (!key.startsWith('cognito:')) {
          editableAttrs[key] = value || '';
        }
      });
      setAttributes(editableAttrs);
      
      // Set profile picture URL if available
      if (user.attributes.profilePicture) {
        setProfilePictureUrl(user.attributes.profilePicture);
      } else if (user.attributes.picture) {
        setProfilePictureUrl(user.attributes.picture);
      }
    }
  }, [user]);

  const handleChange = (key: string, value: string) => {
    // Only allow changes to editable attributes
    if (!immutableAttributes.includes(key)) {
      setAttributes(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Filter out immutable attributes before saving
      const updatedAttributes = Object.entries(attributes)
        .filter(([key]) => !immutableAttributes.includes(key))
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {} as Record<string, string>);

      await onSave(user.userId, updatedAttributes);
      onClose();
    } catch (error) {
      console.error('Error saving attributes:', error);
      toast.error('Failed to update user attributes');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  // Helper function to display verification badge
  const renderVerificationBadge = (key: string) => {
    if (key === 'email' && user.attributes.email_verified === 'true') {
      return (
        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
          Verified
        </span>
      );
    }
    if (key === 'phone_number' && user.attributes.phone_number_verified === 'true') {
      return (
        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
          Verified
        </span>
      );
    }
    return null;
  };

  // Get attribute label
  const getAttributeLabel = (key: string) => {
    return attributeLabels[key] || key;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Edit User Attributes</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="space-y-4">
            {/* Required Attributes */}
            {attributeOrder.map(key => {
              // Skip profilePicture as it's handled separately
              if (key === 'profilePicture' || key === 'picture') return null;
              
              return (
                <div key={key}>
                  <div className="flex items-center">
                    <label className="block text-sm font-medium text-gray-700">
                      {getAttributeLabel(key)}
                    </label>
                    {renderVerificationBadge(key)}
                  </div>
                  <input
                    type="text"
                    value={attributes[key] || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    disabled={immutableAttributes.includes(key)}
                    className={`mt-1 block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-150 ease-in-out ${immutableAttributes.includes(key) ? 'bg-gray-100' : ''}`}
                    placeholder={immutableAttributes.includes(key) ? 'Not editable' : `Enter ${getAttributeLabel(key)}`}
                  />
                </div>
              );
            })}
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

export default EditAttributeModal;