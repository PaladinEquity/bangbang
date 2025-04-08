'use client';

import { StatusBadgeProps } from '@/types/admin';

/**
 * Component for displaying user status with appropriate styling
 */
const StatusBadge = ({ status }: StatusBadgeProps) => {
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

export default StatusBadge;