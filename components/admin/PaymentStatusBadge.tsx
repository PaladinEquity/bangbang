'use client';

type PaymentStatusBadgeProps = {
  status: string;
};

/**
 * Component for displaying payment status with appropriate styling
 */
const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
  const statusStyles = {
    paid: 'bg-green-100 text-green-800',
    unpaid: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
    partial: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
  };

  const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.unpaid;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default PaymentStatusBadge;