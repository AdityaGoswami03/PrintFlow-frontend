import React, { useEffect, useRef } from 'react';
import { PdfPreview } from './PdfPreview';
import { X, Printer, FileText } from 'lucide-react';

export interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl?: string | null;
  fileName?: string;
  orderNumber?: string;
  totalPages?: number;
  configInfo?: {
    copies?: number;
    printType?: string;
    paperSize?: string;
    side?: string;
  };
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  orderNumber,
  totalPages,
  configInfo,
}) => {
  const printActionRef = useRef<(() => void) | null>(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrintClick = () => {
    if (printActionRef.current) {
      printActionRef.current();
    } else {
      // Fallback: trigger native window print if available
      window.print();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '1150px',
          height: '92vh',
          maxHeight: '920px',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg, 14px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid var(--color-border, #e2e8f0)',
            backgroundColor: '#ffffff',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'var(--color-primary-light, #eff6ff)',
                color: 'var(--color-primary, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FileText size={20} />
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2
                  id="pdf-modal-title"
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {orderNumber ? `Order #${orderNumber} • Preview & Print` : 'PDF Preview & Print'}
                </h2>
                {configInfo && (
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {configInfo.copies && (
                      <span className="badge badge-submitted" style={{ textTransform: 'none' }}>
                        {configInfo.copies} {configInfo.copies === 1 ? 'copy' : 'copies'}
                      </span>
                    )}
                    {configInfo.printType && (
                      <span className="badge badge-accepted" style={{ textTransform: 'none' }}>
                        {configInfo.printType === 'COLOR' ? 'Color' : 'B&W'}
                      </span>
                    )}
                    {configInfo.paperSize && (
                      <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569', textTransform: 'none' }}>
                        {configInfo.paperSize}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-text-muted, #64748b)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '500px',
                }}
              >
                {fileName || 'Document preview'}
                {totalPages ? ` • ${totalPages} pages total` : ''}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handlePrintClick}
              title="Print PDF document (Ctrl+P)"
            >
              <Printer size={16} />
              <span>Print Document</span>
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
              title="Close Preview (Esc)"
              aria-label="Close Preview"
              style={{ padding: '0.4rem 0.5rem', borderRadius: 'var(--radius-sm, 6px)' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body: PDF Preview component */}
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <PdfPreview
            fileUrl={fileUrl}
            fileName={fileName}
            height="100%"
            onPrintReady={(printFn) => {
              printActionRef.current = printFn;
            }}
          />
        </div>
      </div>
    </div>
  );
};
