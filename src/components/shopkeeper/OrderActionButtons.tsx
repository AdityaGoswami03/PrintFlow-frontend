import React from 'react';
import type { OrderStatus } from '../../types';
import { Check, X, Printer, CheckCircle2 } from 'lucide-react';

interface OrderActionButtonsProps {
  status: OrderStatus;
  isProcessing?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onStartPrinting?: () => void;
  onComplete?: () => void;
  size?: 'sm' | 'md';
}

export const OrderActionButtons: React.FC<OrderActionButtonsProps> = ({
  status,
  isProcessing = false,
  onAccept,
  onReject,
  onStartPrinting,
  onComplete,
  size = 'md',
}) => {
  const btnClass = size === 'sm' ? 'btn-sm' : '';

  switch (status) {
    case 'SUBMITTED':
      return (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {onAccept && (
            <button
              type="button"
              className={`btn btn-success ${btnClass}`}
              onClick={(e) => {
                e.stopPropagation();
                onAccept();
              }}
              disabled={isProcessing}
            >
              <Check size={16} />
              Accept
            </button>
          )}
          {onReject && (
            <button
              type="button"
              className={`btn btn-danger ${btnClass}`}
              onClick={(e) => {
                e.stopPropagation();
                onReject();
              }}
              disabled={isProcessing}
            >
              <X size={16} />
              Reject
            </button>
          )}
        </div>
      );

    case 'ACCEPTED':
      return onStartPrinting ? (
        <button
          type="button"
          className={`btn btn-primary ${btnClass}`}
          onClick={(e) => {
            e.stopPropagation();
            onStartPrinting();
          }}
          disabled={isProcessing}
        >
          <Printer size={16} />
          Start Printing
        </button>
      ) : null;

    case 'PRINTING':
      return onComplete ? (
        <button
          type="button"
          className={`btn btn-success ${btnClass}`}
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
          disabled={isProcessing}
        >
          <CheckCircle2 size={16} />
          Mark Completed
        </button>
      ) : null;

    case 'COMPLETED':
    case 'REJECTED':
    case 'CANCELLED':
    default:
      return null;
  }
};
