import React from 'react';
import type { OrderStatus } from '../../types';
import { Check, Clock, Printer, CheckCircle2, XCircle } from 'lucide-react';

interface StatusTimelineProps {
  currentStatus: OrderStatus;
  statusNotes?: string;
}

const STEPS = [
  {
    key: 'SUBMITTED',
    title: 'Waiting for shop confirmation',
    desc: 'Received by operator, awaiting acceptance',
    icon: Clock,
  },
  {
    key: 'ACCEPTED',
    title: 'Your order has been accepted',
    desc: 'Queued and ready for the printer',
    icon: Check,
  },
  {
    key: 'PRINTING',
    title: 'Your document is being printed',
    desc: 'Printing in progress at the counter',
    icon: Printer,
  },
  {
    key: 'COMPLETED',
    title: 'Printing completed — please collect your documents',
    desc: 'Ready for pickup at the counter',
    icon: CheckCircle2,
  },
];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ currentStatus, statusNotes }) => {
  if (currentStatus === 'REJECTED' || currentStatus === 'CANCELLED') {
    return (
      <div
        className="card"
        style={{
          borderLeft: '4px solid #dc2626',
          backgroundColor: '#fef2f2',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <XCircle size={26} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ color: '#991b1b', margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
              Order {currentStatus === 'REJECTED' ? 'Rejected' : 'Cancelled'}
            </h4>
            <p style={{ color: '#7f1d1d', margin: '0.35rem 0 0 0', fontSize: '0.9rem' }}>
              {statusNotes ||
                'This order could not be processed by the store. Please speak with the store operator at the counter.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const stepOrder = ['SUBMITTED', 'ACCEPTED', 'PRINTING', 'COMPLETED'];
  const currentIndex = stepOrder.indexOf(currentStatus);

  return (
    <div className="status-timeline" role="region" aria-label="Order Progress Timeline">
      {STEPS.map((step, idx) => {
        const isPast = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const IconComponent = step.icon;

        let statusClass = '';
        if (isPast) statusClass = 'completed';
        else if (isCurrent) statusClass = 'current';

        return (
          <div key={step.key} className={`timeline-step ${statusClass}`}>
            <div className="timeline-icon-box" aria-hidden="true">
              {isPast ? <Check size={18} strokeWidth={3} /> : <IconComponent size={18} />}
            </div>
            {idx < STEPS.length - 1 && <div className="timeline-line" aria-hidden="true" />}
            <div style={{ paddingBottom: '0.6rem' }}>
              <div
                style={{
                  fontWeight: isCurrent ? 800 : 600,
                  color: isCurrent
                    ? 'var(--color-primary)'
                    : isPast
                    ? 'var(--color-text-main)'
                    : 'var(--color-text-muted)',
                  fontSize: isCurrent ? '1rem' : '0.925rem',
                }}
              >
                {step.title}
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                {step.desc}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
