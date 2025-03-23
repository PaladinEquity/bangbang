'use client';

import React, { useState } from 'react';
import Link from 'next/link';

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
  // Empty addresses state to match the design
  const [addresses, setAddresses] = useState<Address[]>([]);

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isAddingAddress) {
      // Add new address
      const newAddress: Address = {
        id: Date.now(), // Use timestamp as a simple ID
        ...formData,
      };
      
      // If this is the first address or marked as default, update other addresses
      if (formData.isDefault || addresses.length === 0) {
        const updatedAddresses = addresses.map(addr => ({
          ...addr,
          isDefault: false,
        }));
        
        setAddresses([...updatedAddresses, newAddress]);
      } else {
        setAddresses([...addresses, newAddress]);
      }
    } else if (isEditingAddress && currentAddress) {
      // Edit existing address
      const updatedAddresses = addresses.map(addr => {
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
      
      setAddresses(updatedAddresses);
    }
    
    // Reset form
    setIsAddingAddress(false);
    setIsEditingAddress(false);
    setCurrentAddress(null);
  };

  const handleCancel = () => {
    setIsAddingAddress(false);
    setIsEditingAddress(false);
    setCurrentAddress(null);
  };

  const handleDeleteAddress = (id: number) => {
    const updatedAddresses = addresses.filter(addr => addr.id !== id);
    setAddresses(updatedAddresses);
  };

  const handleSetDefault = (id: number) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    
    setAddresses(updatedAddresses);
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">My Addresses</h1>
      <p className="text-sm text-gray-600 mb-8">Manage your shipping and billing addresses.</p>
      
      {addresses.length === 0 && !isAddingAddress ? (
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
                    {isAddingAddress ? 'Add Address' : 'Save Changes'}
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