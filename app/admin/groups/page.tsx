'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

// Group type definition
type Group = {
  groupName: string;
  description: string;
  precedence?: number;
  creationDate: string;
  lastModifiedDate: string;
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

// Create/Edit Group Modal Props
type GroupModalProps = {
  group: Group | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: Omit<Group, 'creationDate' | 'lastModifiedDate'>) => Promise<void>;
};

// Add User to Group Modal Props
type AddUserToGroupModalProps = {
  groupName: string;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (userId: string, groupName: string) => Promise<void>;
};

// Group Users Modal Props
type GroupUsersModalProps = {
  groupName: string;
  isOpen: boolean;
  onClose: () => void;
  onRemoveUser: (userId: string, groupName: string) => Promise<void>;
};

// API functions for group management
async function listGroups() {
  try {
    const response = await fetch('/api/admin/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'listGroups'
      })
    });
    
    if (!response.ok) throw new Error('Failed to fetch groups');
    const data = await response.json();
    return data.groups || [];
  } catch (error) {
    console.error('Error listing groups:', error);
    throw error;
  }
}

async function getGroup(groupName: string) {
  try {
    const response = await fetch('/api/admin/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'getGroup',
        groupName
      })
    });
    
    if (!response.ok) throw new Error(`Failed to fetch group ${groupName}`);
    return await response.json();
  } catch (error) {
    console.error(`Error getting group ${groupName}:`, error);
    throw error;
  }
}

async function createGroup(group: Omit<Group, 'creationDate' | 'lastModifiedDate'>) {
  try {
    const response = await fetch('/api/admin/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'createGroup',
        ...group
      })
    });
    
    if (!response.ok) throw new Error('Failed to create group');
    return await response.json();
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
}

async function updateGroup(group: Omit<Group, 'creationDate' | 'lastModifiedDate'>) {
  try {
    const response = await fetch('/api/admin/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'updateGroup',
        ...group
      })
    });
    
    if (!response.ok) throw new Error(`Failed to update group ${group.groupName}`);
    return await response.json();
  } catch (error) {
    console.error(`Error updating group ${group.groupName}:`, error);
    throw error;
  }
}

async function deleteGroup(groupName: string) {
  try {
    const response = await fetch('/api/admin/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'deleteGroup',
        groupName
      })
    });
    
    if (!response.ok) throw new Error(`Failed to delete group ${groupName}`);
    return await response.json();
  } catch (error) {
    console.error(`Error deleting group ${groupName}:`, error);
    throw error;
  }
}

async function listUsersInGroup(groupName: string) {
  try {
    const response = await fetch('/api/admin/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'listUsersInGroup',
        groupName
      })
    });
    
    if (!response.ok) throw new Error(`Failed to fetch users in group ${groupName}`);
    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error(`Error listing users in group ${groupName}:`, error);
    throw error;
  }
}

async function addUserToGroup(userId: string, groupName: string) {
  try {
    const response = await fetch('/api/admin/groups/add-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        groupName
      })
    });
    
    if (!response.ok) throw new Error(`Failed to add user to group ${groupName}`);
    return await response.json();
  } catch (error) {
    console.error(`Error adding user to group ${groupName}:`, error);
    throw error;
  }
}

async function removeUserFromGroup(userId: string, groupName: string) {
  try {
    const response = await fetch('/api/admin/groups/remove-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        groupName
      })
    });
    
    if (!response.ok) throw new Error(`Failed to remove user from group ${groupName}`);
    return await response.json();
  } catch (error) {
    console.error(`Error removing user from group ${groupName}:`, error);
    throw error;
  }
}

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

// Group Modal Component
const GroupModal = ({ group, isOpen, onClose, onSave }: GroupModalProps) => {
  const [formData, setFormData] = useState<Omit<Group, 'creationDate' | 'lastModifiedDate'>>(
    group ? {
      groupName: group.groupName,
      description: group.description || '',
      precedence: group.precedence || 0
    } : {
      groupName: '',
      description: '',
      precedence: 0
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!group;

  useEffect(() => {
    if (group) {
      setFormData({
        groupName: group.groupName,
        description: group.description || '',
        precedence: group.precedence || 0
      });
    } else {
      setFormData({
        groupName: '',
        description: '',
        precedence: 0
      });
    }
  }, [group]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'precedence' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.groupName) {
      toast.error('Group name is required');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {isEditMode ? 'Edit Group' : 'Create New Group'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <input
                type="text"
                name="groupName"
                value={formData.groupName}
                onChange={handleChange}
                disabled={isEditMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precedence
              </label>
              <input
                type="number"
                name="precedence"
                value={formData.precedence}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers have higher precedence
              </p>
            </div>
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
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add User to Group Modal Component
const AddUserToGroupModal = ({ groupName, isOpen, onClose, onAdd }: AddUserToGroupModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const usersData = await listAllUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const filteredUsers = users.filter(user => {
    const userName = user.name || user.attributes?.given_name || user.username || '';
    const userEmail = user.email || user.attributes?.email || '';
    
    return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           userEmail.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    setIsLoading(true);
    try {
      await onAdd(selectedUserId, groupName);
      onClose();
    } catch (error) {
      console.error('Error adding user to group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          Add User to Group: {groupName}
        </h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md mb-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No users found
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <label
                    key={user.userId}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="userId"
                      value={user.userId}
                      checked={selectedUserId === user.userId}
                      onChange={() => setSelectedUserId(user.userId)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name || `${user.attributes?.given_name || ''} ${user.attributes?.family_name || ''}`.trim() || user.username}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.email || user.attributes?.email}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedUserId}
              className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Group Users Modal Component
const GroupUsersModal = ({ groupName, isOpen, onClose, onRemoveUser }: GroupUsersModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const usersData = await listUsersInGroup(groupName);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users in group:', error);
        toast.error('Failed to load users in group');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, groupName]);

  const filteredUsers = users.filter(user => {
    const userName = user.name || user.attributes?.given_name || user.username || '';
    const userEmail = user.email || user.attributes?.email || '';
    
    return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           userEmail.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleRemoveUser = async (userId: string) => {
    try {
      await onRemoveUser(userId, groupName);
      setUsers(users.filter(user => user.userId !== userId));
      toast.success('User removed from group');
    } catch (error) {
      console.error('Error removing user from group:', error);
      toast.error('Failed to remove user from group');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">
          Users in Group: {groupName}
        </h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md mb-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No users found in this group
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
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(user => (
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
                          <div className="text-sm text-gray-500">
                            {user.email || user.attributes?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        user.status === 'UNCONFIRMED' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveUser(user.userId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showGroupUsersModal, setShowGroupUsersModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedGroupName, setSelectedGroupName] = useState('');

  // Fetch groups on component mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true);
        const groupsData = await listGroups();
        setGroups(groupsData);
      } catch (error) {
        console.error('Error fetching groups:', error);
        toast.error('Failed to load groups');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Filter groups based on search term
  const filteredGroups = groups.filter(group =>
    group.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle group creation/update
  const handleSaveGroup = async (groupData: Omit<Group, 'creationDate' | 'lastModifiedDate'>) => {
    try {
      if (selectedGroup) {
        // Update existing group
        await updateGroup(groupData);
        toast.success(`Group ${groupData.groupName} updated successfully`);
        
        // Update the group in the local state
        setGroups(prevGroups =>
          prevGroups.map(group =>
            group.groupName === groupData.groupName
              ? { ...group, description: groupData.description, precedence: groupData.precedence }
              : group
          )
        );
      } else {
        // Create new group
        const newGroup = await createGroup(groupData);
        toast.success(`Group ${groupData.groupName} created successfully`);
        
        // Add the new group to the local state
        setGroups(prevGroups => [...prevGroups, newGroup]);
      }
    } catch (error) {
      console.error('Error saving group:', error);
      toast.error('Failed to save group');
      throw error;
    }
  };

  // Handle group deletion
  const handleDeleteGroup = async (groupName: string) => {
    // Show confirmation toast
    toast.custom(
      (t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex flex-col`}>
          <div className="p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">Delete Group</p>
                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to delete the group "{groupName}"? This action cannot be undone.
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
                  await deleteGroup(groupName);
                  setGroups(groups.filter(group => group.groupName !== groupName));
                  toast.dismiss(t.id);
                  toast.success(`Group ${groupName} deleted successfully`);
                } catch (error) {
                  console.error(`Error deleting group ${groupName}:`, error);
                  toast.error('Failed to delete group');
                }
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

  // Handle adding user to group
  const handleAddUserToGroup = async (userId: string, groupName: string) => {
    try {
      await addUserToGroup(userId, groupName);
      toast.success(`User added to group ${groupName} successfully`);
    } catch (error) {
      console.error(`Error adding user to group ${groupName}:`, error);
      toast.error('Failed to add user to group');
      throw error;
    }
  };

  // Handle removing user from group
  const handleRemoveUserFromGroup = async (userId: string, groupName: string) => {
    try {
      await removeUserFromGroup(userId, groupName);
      toast.success(`User removed from group ${groupName} successfully`);
    } catch (error) {
      console.error(`Error removing user from group ${groupName}:`, error);
      toast.error('Failed to remove user from group');
      throw error;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Group Management</h1>
        <button
          onClick={() => {
            setSelectedGroup(null);
            setShowGroupModal(true);
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700"
        >
          Create New Group
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex">
          <input
            type="text"
            placeholder="Search groups..."
            className="w-full px-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Groups table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No groups found.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precedence
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
              {filteredGroups.map((group) => (
                <tr key={group.groupName}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{group.groupName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{group.description || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{group.precedence !== undefined ? group.precedence : '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(group.creationDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedGroup(group);
                          setShowGroupModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedGroupName(group.groupName);
                          setShowAddUserModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        Add User
                      </button>
                      <button
                        onClick={() => {
                          setSelectedGroupName(group.groupName);
                          setShowGroupUsersModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Users
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.groupName)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
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
      <GroupModal
        group={selectedGroup}
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onSave={handleSaveGroup}
      />

      <AddUserToGroupModal
        groupName={selectedGroupName}
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onAdd={handleAddUserToGroup}
      />

      <GroupUsersModal
        groupName={selectedGroupName}
        isOpen={showGroupUsersModal}
        onClose={() => setShowGroupUsersModal(false)}
        onRemoveUser={handleRemoveUserFromGroup}
      />
    </div>
  );
}