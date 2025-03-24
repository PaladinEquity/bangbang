'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../auth/AuthContext';
import { updateUserAttributes } from 'aws-amplify/auth';
import { toast } from 'react-hot-toast';

// Define interface for address object
interface Address {
  id: number;
  name: string;
  recipient: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

// Define interface for form data
interface AddressFormData {
  name: string;
  recipient: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export default function MyAddressesContent() {
  const { user, refreshUser } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for new/edit address form
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressFormData>({
    name: '',
    recipient: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    isDefault: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAddAddress = () => {
    setIsAddingAddress(true);
    setIsEditingAddress(false);
    setFormData({
      name: '',
      recipient: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phone: '',
      isDefault: false,
    });
  };

  const handleEditAddress = (address: Address) => {
    setIsEditingAddress(true);
    setIsAddingAddress(false);
    setCurrentAddress(address);
    setFormData({
      name: address.name,
      recipient: address.recipient,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
    });
  };

  // Load addresses from user attributes when component mounts
  useEffect(() => {
    if (user) {
      loadAddressesFromUserAttributes();
    } else {
      setAddresses([]);
      setIsLoading(false);
    }
  }, [user]);

  // Function to load addresses from user attributes
  const loadAddressesFromUserAttributes = () => {
    setIsLoading(true);
    try {
      // Check if user has address attribute
      if (user?.attributes?.address) {
        try {
          // Parse the JSON string from the address attribute
          const addressesData = JSON.parse(user.attributes.address);
          if (Array.isArray(addressesData)) {
            setAddresses(addressesData);
          }
        } catch (error) {
          console.error('Error parsing address data:', error);
          setAddresses([]);
        }
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save addresses to user attributes
  const saveAddressesToUserAttributes = async (updatedAddresses: Address[]) => {
    if (!user) return;
    
    try {
      // Convert addresses array to JSON string
      const addressesJson = JSON.stringify(updatedAddresses);
      
      // Update the address attribute in Cognito
      await updateUserAttributes({
        userAttributes: {
          'address': addressesJson
        }
      });
      
      // Refresh user data to get updated attributes
      await refreshUser();
      
      return true;
    } catch (error) {
      console.error('Error saving addresses:', error);
      toast.error('Failed to save address. Please try again.');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let updatedAddresses: Address[] = [];
      
      if (isAddingAddress) {
        // Add new address
        const newAddress: Address = {
          id: Date.now(), // Use timestamp as a simple ID
          ...formData,
        };
        
        // If this is the first address or marked as default, update other addresses
        if (formData.isDefault || addresses.length === 0) {
          updatedAddresses = addresses.map(addr => ({
            ...addr,
            isDefault: false,
          }));
          
          updatedAddresses = [...updatedAddresses, newAddress];
        } else {
          updatedAddresses = [...addresses, newAddress];
        }
      } else if (isEditingAddress && currentAddress) {
        // Edit existing address
        updatedAddresses = addresses.map(addr => {
          if (addr.id === currentAddress.id) {
            return {
              ...addr,
              ...formData,
            };
          }
          
          // If the edited address is now default, remove default from others
          if (formData.isDefault) {
            return {
              ...addr,
              isDefault: addr.id === currentAddress.id,
            };
          }
          
          return addr;
        });
      }
      
      // Save to Cognito
      const success = await saveAddressesToUserAttributes(updatedAddresses);
      
      if (success) {
        setAddresses(updatedAddresses);
        toast.success(isAddingAddress ? 'Address added successfully' : 'Address updated successfully');
        
        // Reset form
        setIsAddingAddress(false);
        setIsEditingAddress(false);
        setCurrentAddress(null);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsAddingAddress(false);
    setIsEditingAddress(false);
    setCurrentAddress(null);
  };

  const handleDeleteAddress = async (id: number) => {
    setIsSubmitting(true);
    try {
      const updatedAddresses = addresses.filter(addr => addr.id !== id);
      
      // If we're deleting the default address and there are other addresses,
      // make the first one the default
      if (addresses.find(addr => addr.id === id)?.isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }
      
      // Save to Cognito
      const success = await saveAddressesToUserAttributes(updatedAddresses);
      
      if (success) {
        setAddresses(updatedAddresses);
        toast.success('Address deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    setIsSubmitting(true);
    try {
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === id,
      }));
      
      // Save to Cognito
      const success = await saveAddressesToUserAttributes(updatedAddresses);
      
      if (success) {
        setAddresses(updatedAddresses);
        toast.success('Default address updated successfully');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to update default address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">My Addresses</h1>
      <p className="text-sm text-gray-600 mb-8">Manage your shipping and billing addresses.</p>
      
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-lg mb-6">Loading addresses...</p>
        </div>
      ) : addresses.length === 0 && !isAddingAddress ? (
        <div className="text-center py-12">
          <p className="text-lg mb-6">You haven't added any addresses yet.</p>
          <button
            onClick={handleAddAddress}
            className="bg-black text-white px-6 py-3 rounded text-sm hover:bg-gray-800 transition-colors inline-block"
          >
            Add New Address
          </button>
        </div>
      ) : (
        <div>
          {!isAddingAddress && !isEditingAddress && (
            <div className="mb-6">
              <button
                onClick={handleAddAddress}
                className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition-colors"
              >
                Add New Address
              </button>
            </div>
          )}
          
          {(isAddingAddress || isEditingAddress) && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-lg font-medium mb-4">
                {isAddingAddress ? 'Add New Address' : 'Edit Address'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Address Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Home, Work, etc."
                    className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-0 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Recipient Name</label>
                  <input
                    type="text"
                    name="recipient"
                    value={formData.recipient}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-0 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-0 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-0 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State/Province</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-0 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Postal/ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-0 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-0 focus:border-transparent"
                      required
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      {/* Add more countries as needed */}
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-0 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-black focus:ring-0 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm">Set as default address</span>
                  </label>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition-colors"
                  >
                    {isSubmitting ? 'Saving...' : isAddingAddress ? 'Add Address' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Address List */}
          {addresses.length > 0 && !isAddingAddress && !isEditingAddress && (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{address.name}</h3>
                      {address.isDefault && (
                        <span className="inline-block bg-gray-200 text-xs px-2 py-1 rounded mt-1">Default</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditAddress(address)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-sm text-gray-600 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>{address.recipient}</p>
                    <p>{address.street}</p>
                    <p>{address.city}, {address.state} {address.zipCode}</p>
                    <p>{address.country}</p>
                    <p className="mt-1">{address.phone}</p>
                  </div>
                  
                  {!address.isDefault && (
                    <button 
                      onClick={() => handleSetDefault(address.id)}
                      className="mt-3 text-sm text-gray-600 hover:text-gray-900 underline"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}