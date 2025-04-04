'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { getAllUsers, updateUserRole, resetUserPassword } from '@/services/adminService';

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

// User attribute edit modal type
type EditAttributeModalProps = {
  user: User | null;
  onClose: () => void;
  onSave: (userId: string, attributes: Record<string, string>) => Promise<void>;
};

// Role change modal type
type ChangeRoleModalProps = {
  user: User | null;
  onClose: () => void;
  onSave: (userId: string, role: 'admin' | 'user') => Promise<void>;
};

// Reset password confirmation modal type
type ResetPasswordModalProps = {
  user: User | null;
  onClose: () => void;
  onConfirm: (userId: string) => Promise<void>;
};

// User status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles = {
    CONFIRMED: 'bg-green-100 text-green-800',
    UNCONFIRMED: 'bg-yellow-100 text-yellow-800',
    ARCHIVED: 'bg-gray-100 text-gray-800',
    COMPROMISED: 'bg-red-100 text-red-800',
    UNKNOWN: 'bg-gray-100 text-gray-800',
    RESET_REQUIRED: 'bg-blue-100 text-blue-800',
    FORCE_CHANGE_PASSWORD: 'bg-blue-100 text-blue-800',
    DISABLED: 'bg-red-100 text-red-800',
  };

  const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.UNKNOWN;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

// Role badge component
const RoleBadge = ({ role }: { role: string }) => {
  const roleStyles = {
    admin: 'bg-purple-100 text-purple-800',
    user: 'bg-blue-100 text-blue-800',
    editor: 'bg-indigo-100 text-indigo-800',
  };

  const style = roleStyles[role as keyof typeof roleStyles] || roleStyles.user;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
};

// Edit User Attributes Modal
const EditAttributeModal = ({ user, onClose, onSave }: EditAttributeModalProps) => {
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && user.attributes) {
      // Extract editable attributes
      const editableAttrs: Record<string, string> = {};
      Object.entries(user.attributes).forEach(([key, value]) => {
        // Skip role attribute as it's handled separately
        if (key !== 'custom:role' && value) {
          editableAttrs[key] = value;
        }
      });
      setAttributes(editableAttrs);
    }
  }, [user]);

  const handleChange = (key: string, value: string) => {
    setAttributes(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      await onSave(user.userId, attributes);
      onClose();
    } catch (error) {
      console.error('Error saving attributes:', error);
      toast.error('Failed to update user attributes');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit User Attributes</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {Object.entries(attributes).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700">
                  {key.replace('custom:', '')}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Change Role Modal
const ChangeRoleModal = ({ user, onClose, onSave }: ChangeRoleModalProps) => {
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && user.attributes && user.attributes['custom:role']) {
      setRole(user.attributes['custom:role'] as 'admin' | 'user');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      await onSave(user.userId, role);
      onClose();
    } catch (error) {
      console.error('Error changing role:', error);
      toast.error('Failed to update user role');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Change User Role</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reset Password Modal
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
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Reset User Password</h2>
        <p className="mb-4 text-gray-600">
          Are you sure you want to reset the password for {user.email || user.username}? 
          The user will receive an email with instructions to set a new password.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Reset Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const usersData = await getAllUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle user attribute update
  const handleUpdateAttributes = async (userId: string, attributes: Record<string, string>) => {
    try {
      // In a real implementation, you would call an API to update user attributes
      // For now, just show a success message
      toast.success('User attributes updated successfully');
      
      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.userId === userId 
            ? { ...user, attributes: { ...user.attributes, ...attributes } }
            : user
        )
      );
    } catch (error) {
      console.error('Error updating user attributes:', error);
      throw error;
    }
  };

  // Handle user role change
  const handleRoleChange = async (userId: string, role: 'admin' | 'user') => {
    try {
      await updateUserRole(userId, role);
      toast.success(`User role updated to ${role}`);
      
      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.userId === userId 
            ? { ...user, attributes: { ...user.attributes, 'custom:role': role } }
            : user
        )
      );
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  // Handle password reset
  const handleResetPassword = async (userId: string) => {
    try {
      await resetUserPassword(userId);
      toast.success('Password reset email sent to user');
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const userName = user.name || user.attributes?.given_name || user.username || '';
    const userEmail = user.email || user.attributes?.email || '';
    
    const matchesSearch = 
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.attributes?.['custom:role'] === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Get unique status values for filter
  const statusOptions = ['all', ...Array.from(new Set(users.map(user => user.status)))];
  
  // Get unique role values for filter
  const roleOptions = ['all', ...Array.from(new Set(users.map(user => user.attributes?.['custom:role'] || 'user')))];
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle user deletion
  const handleDeleteUser = (userId: string) => {
    // In a real application, call API to delete user
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.userId !== userId));
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Link href="/admin/users/create" className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700">
          Add New User
        </Link>
      </div>

      {/* Filters and search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full px-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full px-4 py-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full px-4 py-2 border rounded-md"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              {roleOptions.map(role => (
                <option key={role} value={role}>
                  {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No users found matching your filters.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.userId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-medium">
                          {(user.name || user.attributes?.given_name || user.username || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || `${user.attributes?.given_name || ''} ${user.attributes?.family_name || ''}`.trim() || user.username}
                        </div>
                        <div className="text-sm text-gray-500">{user.email || user.attributes?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RoleBadge role={user.attributes?.['custom:role'] || 'user'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRoleModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Role
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedUser(user);
                          setShowResetModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Reset
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditAttributeModal 
          user={selectedUser} 
          onClose={() => setShowEditModal(false)} 
          onSave={handleUpdateAttributes} 
        />
      )}

      {showRoleModal && (
        <ChangeRoleModal 
          user={selectedUser} 
          onClose={() => setShowRoleModal(false)} 
          onSave={handleRoleChange} 
        />
      )}

      {showResetModal && (
        <ResetPasswordModal 
          user={selectedUser} 
          onClose={() => setShowResetModal(false)} 
          onConfirm={handleResetPassword} 
        />
      )}
    </div>
  );
}