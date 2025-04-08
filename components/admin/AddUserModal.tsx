'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Modal component for adding a new user
 * Handles user creation with proper validation
 */
type AddUserModalProps = {
  onClose: () => void;
  onSave: (userData: {
    username: string;
    email: string;
    temporaryPassword: string;
    userAttributes: Record<string, string>;
  }) => Promise<void>;
};

const AddUserModal = ({ onClose, onSave }: AddUserModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    temporaryPassword: '',
    given_name: '',
    family_name: '',
    address: '',
    phone_number: '',
    timezone: '',
  });

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error when user types
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.temporaryPassword.trim()) {
      newErrors.temporaryPassword = 'Temporary password is required';
    } else if (formData.temporaryPassword.length < 8) {
      newErrors.temporaryPassword = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Prepare user attributes
      const userAttributes: Record<string, string> = {};
      
      // Add non-empty attributes
      if (formData.given_name) userAttributes.given_name = formData.given_name;
      if (formData.family_name) userAttributes.family_name = formData.family_name;
      if (formData.address) userAttributes.address = formData.address;
      if (formData.phone_number) userAttributes.phone_number = formData.phone_number;
      if (formData.timezone) userAttributes.timezone = formData.timezone;

      await onSave({
        username: formData.username,
        email: formData.email,
        temporaryPassword: formData.temporaryPassword,
        userAttributes
      });
      
      toast.success('User created successfully');
      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Required Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className={`mt-1 block w-full px-4 py-2 rounded-md border ${errors.username ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-150 ease-in-out`}
                placeholder="Enter username"
              />
              {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`mt-1 block w-full px-4 py-2 rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-150 ease-in-out`}
                placeholder="Enter email"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Temporary Password</label>
              <input
                type="password"
                value={formData.temporaryPassword}
                onChange={(e) => handleChange('temporaryPassword', e.target.value)}
                className={`mt-1 block w-full px-4 py-2 rounded-md border ${errors.temporaryPassword ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-150 ease-in-out`}
                placeholder="Enter temporary password"
              />
              {errors.temporaryPassword && <p className="mt-1 text-sm text-red-500">{errors.temporaryPassword}</p>}
            </div>

            {/* Optional Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={formData.given_name}
                onChange={(e) => handleChange('given_name', e.target.value)}
                className="mt-1 block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-150 ease-in-out"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={formData.family_name}
                onChange={(e) => handleChange('family_name', e.target.value)}
                className="mt-1 block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-150 ease-in-out"
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="mt-1 block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-150 ease-in-out"
                placeholder="Enter address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) => handleChange('phone_number', e.target.value)}
                className="mt-1 block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-150 ease-in-out"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Timezone</label>
              <input
                type="text"
                value={formData.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="mt-1 block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-150 ease-in-out"
                placeholder="Enter timezone"
              />
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
              {isLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;