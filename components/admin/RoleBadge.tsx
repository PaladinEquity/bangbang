'use client';

import { RoleBadgeProps } from '@/types/admin';

/**
 * Component for displaying user role with appropriate styling
 */
const RoleBadge = ({ role }: RoleBadgeProps) => {
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

export default RoleBadge;