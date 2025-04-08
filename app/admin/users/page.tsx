'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getAllUsers, updateUserRole, resetUserPassword, updateUserAttributes, createUser, getUsersCount } from '@/services/adminService';

// Import types
import { AdminUser } from '@/types/admin';

// Import components
import StatusBadge from '@/components/admin/StatusBadge';
import RoleBadge from '@/components/admin/RoleBadge';
import EditAttributeModal from '@/components/admin/EditAttributeModal';
import ChangeRoleModal from '@/components/admin/ChangeRoleModal';
import ResetPasswordModal from '@/components/admin/ResetPasswordModal';
import AddUserModal from '@/components/admin/AddUserModal';
import ActionMenu from '@/components/admin/ActionMenu';
import PaginationControls from '@/components/admin/PaginationControls';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [prevTokens, setPrevTokens] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const usersPerPage = 10;

  // Function to fetch users with pagination and filters
  const fetchUsers = async (token: string | null = null, isNewSearch: boolean = false) => {
    try {
      setIsLoading(true);
      
      // Prepare filters for the API call
      const filters: any = {};
      
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      
      if (roleFilter !== 'all') {
        filters.role = roleFilter;
      }
      
      // Call the API with pagination parameters
      const result = await getAllUsers({
        filters,
        limit: usersPerPage,
        nextToken: token || undefined,
        searchTerm: searchTerm.length > 0 ? searchTerm : undefined
      });
      
      // If this is a new search/filter, reset pagination state and get total count
      if (isNewSearch) {
        setUsers(result.users || []);
        setPrevTokens([]);
        setNextToken(result.nextToken);
        setCurrentPage(1);
        
        // Get total count of users that match the filters
        try {
          const count = await getUsersCount(filters);
          setTotalItems(count);
        } catch (countError) {
          console.error('Error fetching users count:', countError);
        }
      } else {
        setUsers(result.users || []);
        setNextToken(result.nextToken);
      }
      
      // Update hasMore flag
      setHasMore(!!result.nextToken);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle next page
  const handleNextPage = () => {
    if (nextToken) {
      // Save current token to prevTokens for back navigation
      setPrevTokens([...prevTokens, nextToken]);
      fetchUsers(nextToken);
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Function to handle previous page
  const handlePrevPage = () => {
    if (prevTokens.length > 0) {
      // Get the previous token
      const newPrevTokens = [...prevTokens];
      const prevToken = newPrevTokens.pop();
      setPrevTokens(newPrevTokens);
      
      // If we're going back to the first page, use null as token
      fetchUsers(newPrevTokens.length > 0 ? newPrevTokens[newPrevTokens.length - 1] : null);
      setCurrentPage(currentPage - 1);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers(null, true);
  }, []);
  
  // Handle filter changes
  useEffect(() => {
    fetchUsers(null, true);
  }, [statusFilter, roleFilter]);
  
  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(null, true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle user attribute update
  const handleUpdateAttributes = async (userId: string, attributes: Record<string, string>) => {
    try {
      // Call the API to update user attributes
      await updateUserAttributes(userId, attributes);
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
      // Update user role by managing group membership
      await updateUserRole(userId, role);
      
      toast.success(`User role updated to ${role}`);
      
      // Refresh the users list to get updated group information
      const usersData = await getAllUsers({
        filters: {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          role: roleFilter !== 'all' ? roleFilter : undefined
        },
        limit: usersPerPage,
        searchTerm: searchTerm.length > 0 ? searchTerm : undefined
      });
      setUsers(usersData.users || []);
      setNextToken(usersData.nextToken);
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

  // Handle user creation
  const handleCreateUser = async (userData: {
    username: string;
    email: string;
    temporaryPassword: string;
    userAttributes: Record<string, string>;
  }) => {
    try {
      await createUser(userData);
      
      // Refresh the users list to include the new user
      const usersData = await getAllUsers({
        filters: {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          role: roleFilter !== 'all' ? roleFilter : undefined
        },
        limit: usersPerPage,
        searchTerm: searchTerm.length > 0 ? searchTerm : undefined
      });
      setUsers(usersData.users || []);
      setNextToken(usersData.nextToken);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error creating user:', error);
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
    const matchesRole = roleFilter === 'all' || (roleFilter === 'admin' ? user.isAdmin : !user.isAdmin);
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Get unique status values for filter
  const statusOptions = ['all', ...Array.from(new Set(users.map(user => user.status)))];
  
  // Get unique role values for filter
  const roleOptions = ['all', 'admin', 'user'];
  
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
    // Show a toast confirmation instead of using window.confirm
    toast.custom(
      (t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex flex-col`}>
          <div className="p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">Delete User</p>
                <p className="mt-1 text-sm text-gray-500">Are you sure you want to delete this user? This action cannot be undone.</p>
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
              onClick={() => {
                // In a real application, call API to delete user
                setUsers(users.filter(user => user.userId !== userId));
                toast.dismiss(t.id);
                toast.success('User deleted successfully');
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium text-white transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: 5000 }
    );
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700"
        >
          Add New User
        </button>
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
                    <RoleBadge role={user.isAdmin ? 'admin' : 'user'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <ActionMenu 
                      user={user}
                      onEdit={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                      }}
                      onChangeRole={() => {
                        setSelectedUser(user);
                        setShowRoleModal(true);
                      }}
                      onResetPassword={() => {
                        setSelectedUser(user);
                        setShowResetModal(true);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination controls */}
      {!isLoading && filteredUsers.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          hasMore={hasMore}
          isLoading={isLoading}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          totalItems={totalItems}
        />
      )}

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

      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onSave={handleCreateUser}
        />
      )}
    </div>
  );
}