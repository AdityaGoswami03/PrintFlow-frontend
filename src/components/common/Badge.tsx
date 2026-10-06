import React from 'react';
import type { OrderStatus } from '../../types';

interface BadgeProps {
  status: OrderStatus;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  SUBMITTED: { label: 'Submitted', className: 'badge-submitted' },
  ACCEPTED: { label: 'Accepted', className: 'badge-accepted' },
  PRINTING: { label: 'Printing', className: 'badge-printing' },
  COMPLETED: { label: 'Completed', className: 'badge-completed' },
  REJECTED: { label: 'Rejected', className: 'badge-rejected' },
  CANCELLED: { label: 'Cancelled', className: 'badge-cancelled' },
};

export const StatusBadge: React.FC<BadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status] || { label: status, className: 'badge-submitted' };
  return <span className={`badge ${config.className}`}>{config.label}</span>;
};
