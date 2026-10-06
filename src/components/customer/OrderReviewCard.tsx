import React from 'react';
import type { PrintConfiguration } from '../../types';
import { FileText, ArrowLeft, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

interface OrderReviewCardProps {
  fileName: string;
  config: PrintConfiguration;
  calculatedPages: number;
  estimatedTotal: number;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export const OrderReviewCard: React.FC<OrderReviewCardProps> = ({
  fileName,
  config,
  calculatedPages,
  estimatedTotal,
  isSubmitting,
  onBack,
  onSubmit,
}) => {
  const getPageLabel = () => {
    if (config.pageSelection.type === 'ALL') return 'All pages';
    if (config.pageSelection.type === 'ODD') return 'Odd pages only';
    if (config.pageSelection.type === 'EVEN') return 'Even pages only';
    return `Pages ${config.pageSelection.range || 'Custom selection'}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="card" style={{ padding: '1.35rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '1rem',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '0.75rem',
          }}
        >
          <FileText size={22} color="var(--color-primary)" />
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Review Order Details</h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Verify print job specifications before submitting
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.925rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Document:</span>
            <span style={{ fontWeight: 700, maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>
              {fileName}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Pages to Print:</span>
            <span style={{ fontWeight: 700 }}>
              {getPageLabel()} ({calculatedPages} {calculatedPages === 1 ? 'page' : 'pages'})
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Copies:</span>
            <span style={{ fontWeight: 700 }}>{config.copies} {config.copies === 1 ? 'set' : 'sets'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Paper Size:</span>
            <span style={{ fontWeight: 700 }}>{config.paperSize}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Print Color:</span>
            <span style={{ fontWeight: 700, color: config.printType === 'COLOR' ? '#7c3aed' : 'inherit' }}>
              {config.printType === 'COLOR' ? 'Full Color' : 'Black & White'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Sides:</span>
            <span style={{ fontWeight: 700 }}>
              {config.side === 'SINGLE' ? 'Single-sided (1-sided)' : 'Double-sided (Back-to-back)'}
            </span>
          </div>

          <div
            style={{
              marginTop: '0.5rem',
              paddingTop: '1rem',
              borderTop: '2px dashed var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Total Amount</span>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Payable at shop counter
              </div>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.6rem', color: 'var(--color-primary)' }}>
              ₹{estimatedTotal}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={onSubmit}
          disabled={isSubmitting}
          style={{ width: '100%' }}
        >
          {isSubmitting ? (
            'Submitting Order...'
          ) : (
            <>
              <Send size={18} />
              Submit Print Request (₹{estimatedTotal})
            </>
          )}
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onBack}
          disabled={isSubmitting}
          style={{ width: '100%' }}
        >
          <ArrowLeft size={16} />
          Change Printing Options
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          fontSize: '0.775rem',
          color: 'var(--color-text-subtle)',
          textAlign: 'center',
        }}
      >
        <ShieldCheck size={14} />
        <span>Your request is queued immediately without requiring an account.</span>
      </div>
    </div>
  );
};
