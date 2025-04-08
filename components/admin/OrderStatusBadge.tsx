'use client';

type OrderStatusBadgeProps = {
  status: string;
};

/**
 * Component for displaying order status with appropriate styling
 */
const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800',
  };

  const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.pending;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default OrderStatusBadge;