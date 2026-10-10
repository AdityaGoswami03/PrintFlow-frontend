import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Order, OrderStatus } from '../../types';
import { shopkeeperService } from '../../services/shopkeeperService';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/Badge';
import { OrderActionButtons } from '../../components/shopkeeper/OrderActionButtons';
import { PdfPreviewModal } from '../../components/common/PdfPreviewModal';
import {
  ArrowLeft,
  FileText,
  Download,
  Printer,
  AlertTriangle,
  Clock,
  User,
  Phone,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export const ShopkeeperOrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Document URL & Preview state
  const [isFetchingDocUrl, setIsFetchingDocUrl] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const loadOrder = async () => {
    if (!orderId) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await shopkeeperService.getOrderById(orderId, user?.token);
      setOrder(data);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const handleStatusChange = async (newStatus: OrderStatus, notes?: string) => {
    if (!order) return;
    try {
      setIsProcessing(true);
      const updated = await shopkeeperService.updateOrderStatus(order.id, newStatus, notes, user?.token);
      setOrder(updated);
      setShowRejectModal(false);
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to update order status');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenPreviewAndPrint = async () => {
    if (!order) return;
    if (previewDocUrl) {
      setIsPreviewModalOpen(true);
      return;
    }

    try {
      setIsFetchingDocUrl(true);
      const res = await shopkeeperService.getDocumentSignedUrl(order.id, user?.token);
      setPreviewDocUrl(res.downloadUrl);
      setIsPreviewModalOpen(true);
    } catch (err: unknown) {
      alert((err as Error).message || 'Unable to load document for preview and printing');
    } finally {
      setIsFetchingDocUrl(false);
    }
  };

  const handleFetchSecureDocUrl = async () => {
    if (!order) return;
    try {
      setIsFetchingDocUrl(true);
      const res = await shopkeeperService.getDocumentSignedUrl(order.id, user?.token);
      setPreviewDocUrl(res.downloadUrl);
      // Open in secure new tab
      window.open(res.downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (err: unknown) {
      alert((err as Error).message || 'Unable to generate secure document access link');
    } finally {
      setIsFetchingDocUrl(false);
    }
  };

  if (isLoading) {
    return (
      <main className="dashboard-content" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Clock size={32} className="animate-spin" color="var(--color-primary)" />
        <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Loading order details...</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="dashboard-content">
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <AlertTriangle size={36} color="#dc2626" style={{ margin: '0 auto 0.75rem auto' }} />
          <h3>Order Not Found</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            {error || 'This order could not be retrieved.'}
          </p>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/dashboard')}
            style={{ padding: '0.4rem 0.6rem' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                Order #{order.orderNumber}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Placed on {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Action Controls for Current Order State */}
        <div>
          <OrderActionButtons
            status={order.status}
            isProcessing={isProcessing}
            onAccept={() => handleStatusChange('ACCEPTED')}
            onReject={() => setShowRejectModal(true)}
            onStartPrinting={() => handleStatusChange('PRINTING')}
            onComplete={() => handleStatusChange('COMPLETED')}
          />
        </div>
      </header>

      <main className="dashboard-content">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Left Column: Document & Print Specs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Document Access Box */}
            <div className="card" style={{ border: '2px solid var(--color-primary-border)', backgroundColor: 'var(--color-primary-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileText size={26} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', wordBreak: 'break-all' }}>
                      {order.document.originalName}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                      {formatFileSize(order.document.fileSize || order.document.fileSizeBytes || 0)} • Total doc: {order.document.totalPages} pages
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleOpenPreviewAndPrint}
                    disabled={isFetchingDocUrl}
                    id="preview-and-print-button"
                  >
                    <Printer size={18} />
                    {isFetchingDocUrl ? 'Loading...' : 'Preview & Print'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleFetchSecureDocUrl}
                    disabled={isFetchingDocUrl}
                    title="Open or download PDF directly in a new tab"
                    id="view-download-pdf-button"
                  >
                    <Download size={18} />
                    View / Download
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '0.85rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-primary-border)', paddingTop: '0.65rem' }}>
                🔒 Secure temporary document access. Authenticated request token verified.
              </div>
            </div>

            {/* Print Specifications Grid */}
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.65rem' }}>
                Print Specifications
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    COPIES
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.2rem' }}>
                    {order.config.copies} {order.config.copies === 1 ? 'Copy' : 'Copies'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    PAPER SIZE
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.2rem' }}>
                    {order.config.paperSize} Standard
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    COLOR MODE
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.2rem', color: order.config.printType === 'COLOR' ? '#7c3aed' : '#0f172a' }}>
                    {order.config.printType === 'COLOR' ? 'Color' : 'Black & White'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    PRINT SIDES
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.2rem' }}>
                    {order.config.side === 'SINGLE' ? 'Single-sided (1-sided)' : 'Double-sided (Back-to-back)'}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Page Selection Range:</span>
                    <span style={{ marginLeft: '0.5rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                      {order.config.pageSelection.type === 'ALL'
                        ? 'All Pages'
                        : `${order.config.pageSelection.type}: ${order.config.pageSelection.range || ''}`}
                    </span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                    {order.calculatedPages} total {order.calculatedPages === 1 ? 'page' : 'pages'} to print
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Customer & Payment Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Pricing Summary */}
            <div className="card">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem' }}>Payment Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Calculation:</span>
                  <span style={{ fontWeight: 600 }}>
                    {order.calculatedPages} pages × {order.config.copies} sets
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.5rem',
                    paddingTop: '0.75rem',
                    borderTop: '2px dashed var(--color-border)',
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total To Collect</span>
                  <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--color-primary)' }}>
                    ₹{order.estimatedPrice}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="card">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem' }}>Customer Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={16} color="var(--color-text-muted)" />
                  <span style={{ fontWeight: 600 }}>{order.customerName || 'Walk-in / Anonymous'}</span>
                </div>
                {order.customerPhone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={16} color="var(--color-text-muted)" />
                    <span>{order.customerPhone}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  <Calendar size={14} />
                  <span>Received: {new Date(order.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Customer Tracking Link Preview */}
            <div className="card" style={{ backgroundColor: '#f8fafc' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                Customer Live URL
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', wordBreak: 'break-all', marginBottom: '0.6rem' }}>
                /shop/{order.shopPublicId}/order/{order.accessToken}
              </div>
              <a
                href={`/shop/${order.shopPublicId}/order/${order.accessToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', fontSize: '0.8rem' }}
              >
                <ExternalLink size={14} />
                Preview Customer Tracking View
              </a>
            </div>
          </div>
        </div>

        {/* Rejection Reason Modal */}
        {showRejectModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              zIndex: 100,
            }}
          >
            <div
              className="card"
              style={{
                width: '100%',
                maxWidth: '440px',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
              }}
            >
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.5rem' }}>
                Reject Order #{order.orderNumber}?
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                Please provide an optional reason. This status will be displayed to the customer on their live tracking screen.
              </p>

              <div className="form-group">
                <label className="form-label">Rejection Reason</label>
                <input
                  type="text"
                  className="input-text"
                  placeholder="e.g. Printer out of color toner, unreadable file format"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRejectModal(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleStatusChange('REJECTED', rejectReason)}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PDF Preview & Native Print Modal */}
        <PdfPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          fileUrl={previewDocUrl}
          fileName={order.document.originalName}
          orderNumber={order.orderNumber}
          totalPages={order.document.totalPages}
          configInfo={{
            copies: order.config.copies,
            printType: order.config.printType,
            paperSize: order.config.paperSize,
            side: order.config.side,
          }}
        />
      </main>
    </>
  );
};
