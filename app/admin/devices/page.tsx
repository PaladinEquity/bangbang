'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Device type definition
type Device = {
  deviceKey: string;
  deviceName: string;
  deviceStatus: string;
  lastModifiedDate: string;
  lastAuthenticatedDate: string;
  attributes: Record<string, string>;
};

// User type definition
type User = {
  username: string;
  userId: string;
  email?: string;
  name?: string;
  status: string;
  createdAt: string;
  attributes: {
    email?: string;
    given_name?: string;
    family_name?: string;
    'custom:role'?: string;
    [key: string]: any;
  };
};

// Device details modal props
type DeviceDetailsModalProps = {
  device: Device | null;
  isOpen: boolean;
  onClose: () => void;
};

// API functions for device management
async function listAllUsers() {
  try {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'listUsers'
      })
    });
    
    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Error listing users:', error);
    throw error;
  }
}

async function listUserDevices(username: string) {
  try {
    const response = await fetch('/api/admin/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'listDevices',
        username
      })
    });
    
    if (!response.ok) throw new Error(`Failed to fetch devices for user ${username}`);
    const data = await response.json();
    return data.devices || [];
  } catch (error) {
    console.error(`Error listing devices for user ${username}:`, error);
    throw error;
  }
}

async function getDevice(username: string, deviceKey: string) {
  try {
    const response = await fetch('/api/admin/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'getDevice',
        username,
        deviceKey
      })
    });
    
    if (!response.ok) throw new Error(`Failed to fetch device ${deviceKey}`);
    return await response.json();
  } catch (error) {
    console.error(`Error getting device ${deviceKey}:`, error);
    throw error;
  }
}

async function forgetDevice(username: string, deviceKey: string) {
  try {
    const response = await fetch('/api/admin/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'forgetDevice',
        username,
        deviceKey
      })
    });
    
    if (!response.ok) throw new Error(`Failed to forget device ${deviceKey}`);
    return await response.json();
  } catch (error) {
    console.error(`Error forgetting device ${deviceKey}:`, error);
    throw error;
  }
}

async function updateDeviceStatus(username: string, deviceKey: string, deviceRememberedStatus: string) {
  try {
    const response = await fetch('/api/admin/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'updateDeviceStatus',
        username,
        deviceKey,
        deviceRememberedStatus
      })
    });
    
    if (!response.ok) throw new Error(`Failed to update device status for ${deviceKey}`);
    return await response.json();
  } catch (error) {
    console.error(`Error updating device status for ${deviceKey}:`, error);
    throw error;
  }
}

// Device Details Modal Component
const DeviceDetailsModal = ({ device, isOpen, onClose }: DeviceDetailsModalProps) => {
  if (!isOpen || !device) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Device Details</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Device Key</h3>
            <p className="mt-1 text-sm text-gray-900">{device.deviceKey}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Device Name</h3>
            <p className="mt-1 text-sm text-gray-900">{device.deviceName || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="mt-1 text-sm text-gray-900">{device.deviceStatus}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Last Modified</h3>
            <p className="mt-1 text-sm text-gray-900">{new Date(device.lastModifiedDate).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Last Authenticated</h3>
            <p className="mt-1 text-sm text-gray-900">{new Date(device.lastAuthenticatedDate).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Attributes</h3>
            <div className="mt-1 bg-gray-50 p-2 rounded-md">
              {Object.entries(device.attributes).length > 0 ? (
                <ul className="text-sm text-gray-900 space-y-1">
                  {Object.entries(device.attributes).map(([key, value]) => (
                    <li key={key}>
                      <span className="font-medium">{key}:</span> {value}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No attributes</p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function DevicesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const usersData = await listAllUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch devices when a user is selected
  useEffect(() => {
    const fetchDevices = async () => {
      if (!selectedUser) {
        setDevices([]);
        return;
      }

      try {
        setIsLoadingDevices(true);
        const devicesData = await listUserDevices(selectedUser);
        setDevices(devicesData);
      } catch (error) {
        console.error('Error fetching devices:', error);
        toast.error('Failed to load devices');
      } finally {
        setIsLoadingDevices(false);
      }
    };

    fetchDevices();
  }, [selectedUser]);

  // Handle viewing device details
  const handleViewDevice = async (device: Device) => {
    setSelectedDevice(device);
    setShowDeviceModal(true);
  };

  // Handle forgetting a device
  const handleForgetDevice = async (deviceKey: string) => {
    if (!selectedUser) return;

    // Show confirmation toast
    toast.custom(
      (t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex flex-col`}>
          <div className="p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">Forget Device</p>
                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to forget this device? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 p-3 flex justify-end space-x-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                try {
                  await forgetDevice(selectedUser, deviceKey);
                  setDevices(devices.filter(device => device.deviceKey !== deviceKey));
                  toast.dismiss(t.id);
                  toast.success('Device forgotten successfully');
                } catch (error) {
                  console.error('Error forgetting device:', error);
                  toast.error('Failed to forget device');
                }
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium text-white transition-colors"
            >
              Forget
            </button>
          </div>
        </div>
      ),
      { duration: 5000 }
    );
  };

  // Handle updating device status
  const handleUpdateDeviceStatus = async (deviceKey: string, currentStatus: string) => {
    if (!selectedUser) return;

    const newStatus = currentStatus === 'REMEMBERED' ? 'NOT_REMEMBERED' : 'REMEMBERED';
    
    try {
      await updateDeviceStatus(selectedUser, deviceKey, newStatus);
      
      // Update the device in the local state
      setDevices(prevDevices =>
        prevDevices.map(device =>
          device.deviceKey === deviceKey
            ? { ...device, deviceStatus: newStatus }
            : device
        )
      );
      
      toast.success(`Device status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating device status:', error);
      toast.error('Failed to update device status');
    }
  };

  // Get user display name
  const getUserDisplayName = (username: string) => {
    const user = users.find(u => u.username === username);
    if (!user) return username;
    
    return user.name || 
           `${user.attributes?.given_name || ''} ${user.attributes?.family_name || ''}`.trim() || 
           user.email || 
           username;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Device Management</h1>
        <p className="text-gray-600 mt-1">Manage user devices and sessions</p>
      </div>

      {/* User selection */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select User
        </label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="">Select a user...</option>
          {users.map(user => (
            <option key={user.username} value={user.username}>
              {user.name || `${user.attributes?.given_name || ''} ${user.attributes?.family_name || ''}`.trim() || user.email || user.username}
            </option>
          ))}
        </select>
      </div>

      {/* Devices table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoadingUsers ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : !selectedUser ? (
          <div className="p-6 text-center text-gray-500">
            Please select a user to view their devices.
          </div>
        ) : isLoadingDevices ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : devices.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No devices found for this user.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Used
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {devices.map((device) => (
                <tr key={device.deviceKey}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {device.deviceName ? device.deviceName.charAt(0).toUpperCase() : 'D'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {device.deviceName || 'Unknown Device'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {device.deviceKey.substring(0, 12)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      device.deviceStatus === 'REMEMBERED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {device.deviceStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(device.lastAuthenticatedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewDevice(device)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleUpdateDeviceStatus(device.deviceKey, device.deviceStatus)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {device.deviceStatus === 'REMEMBERED' ? 'Forget Status' : 'Remember'}
                      </button>
                      <button
                        onClick={() => handleForgetDevice(device.deviceKey)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Forget
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Device Details Modal */}
      <DeviceDetailsModal
        device={selectedDevice}
        isOpen={showDeviceModal}
        onClose={() => setShowDeviceModal(false)}
      />
    </div>
  );
}