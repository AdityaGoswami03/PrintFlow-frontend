import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import type { Order } from '../../types';
import { orderService } from '../../services/orderService';
import { StatusBadge } from '../../components/common/Badge';
import { StatusTimeline } from '../../components/common/StatusTimeline';
import {
  Store,
  RefreshCw,
  FileText,
  ArrowLeft,
  Info,
  CheckCircle,
  Download,
} from 'lucide-react';

export const CustomerTrackingPage: React.FC = () => {
  const { shopPublicId, orderAccessToken } = useParams<{
    shopPublicId: string;
    orderAccessToken: string;
  }>();
  const [searchParams] = useSearchParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingDoc, setIsDownloadingDoc] = useState(false);

  // Extract order identifier and token
  const queryToken = searchParams.get('token');

  const getResolvedCredentials = () => {
    let targetOrderNumber = orderAccessToken || '';
    let targetToken = queryToken || '';

    // If orderAccessToken is a token rather than an order number, check local storage
    if (!queryToken) {
      try {
        const lastOrder = localStorage.getItem('printflow_last_order');
        if (lastOrder) {
          const parsed = JSON.parse(lastOrder);
          if (parsed.orderNumber === orderAccessToken || parsed.token === orderAccessToken) {
            targetOrderNumber = parsed.orderNumber;
            targetToken = parsed.token;
          }
        }
      } catch {
        // Ignore JSON error
      }
    }

    // If targetOrderNumber is the token itself without orderNumber prefix
    if (!targetToken && targetOrderNumber) {
      targetToken = targetOrderNumber;
    }

    return { targetOrderNumber, targetToken };
  };

  const fetchOrder = async (isManualRefresh = false) => {
    const { targetOrderNumber, targetToken } = getResolvedCredentials();

    if (!targetOrderNumber) {
      setError('Invalid tracking link.');
      setIsLoading(false);
      return;
    }

    try {
      if (isManualRefresh) setIsRefreshing(true);
      setError(null);

      const data = await orderService.trackOrder(targetOrderNumber, targetToken);
      setOrder(data);
    } catch (err: unknown) {
      setError((err as Error).message || 'Unable to load order status.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Auto-refresh every 6 seconds while in active processing state
    const interval = setInterval(() => {
      if (order && !['COMPLETED', 'REJECTED', 'CANCELLED'].includes(order.status)) {
        fetchOrder();
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [orderAccessToken, queryToken, order?.status]);

  const handleDownloadDocument = async () => {
    if (!order) return;
    const { targetOrderNumber, targetToken } = getResolvedCredentials();
    try {
      setIsDownloadingDoc(true);
      const res = await orderService.getCustomerDocumentUrl(targetOrderNumber, targetToken);
      window.open(res.downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (err: unknown) {
      alert((err as Error).message || 'Unable to access document URL');
    } finally {
      setIsDownloadingDoc(false);
    }
  };

  if (isLoading) {
    return (
      <div className="customer-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <RefreshCw size={32} className="animate-spin" color="var(--color-primary)" />
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Fetching live order progress...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="customer-layout">
        <div className="customer-content">
          <div className="card" style={{ textAlign: 'center', padding: '2rem', marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#dc2626' }}>Order Not Found</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {error || 'Unable to retrieve tracking details for this token.'}
            </p>
            {shopPublicId && (
              <Link to={`/shop/${shopPublicId}`} className="btn btn-primary btn-sm">
                Place a New Order
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-layout">
      {/* Header */}
      <header
        style={{
          padding: '1.25rem',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Store size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
              {order.shopName || 'Print Shop'}
            </h1>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Live Order Tracker
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => fetchOrder(true)}
          disabled={isRefreshing}
          title="Refresh Status"
          style={{ padding: '0.4rem 0.6rem' }}
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          <span style={{ fontSize: '0.8rem' }}>Refresh</span>
        </button>
      </header>

      {/* Main Tracking Content */}
      <main className="customer-content">
        {/* Order Header Banner */}
        <div
          className="card"
          style={{
            marginBottom: '1.25rem',
            backgroundColor: order.status === 'COMPLETED' ? '#f0fdf4' : 'var(--color-surface)',
            border: order.status === 'COMPLETED' ? '1px solid #bbf7d0' : '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Order Number
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.1rem 0 0 0', color: 'var(--color-text-main)', wordBreak: 'break-all' }}>
                {order.orderNumber}
              </h2>
            </div>
            <StatusBadge status={order.status} />
          </div>

          {order.status === 'COMPLETED' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 600, fontSize: '0.9rem' }}>
              <CheckCircle size={18} />
              <span>Your print job is ready for pickup at the counter!</span>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--color-primary-light)',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-primary)',
                fontSize: '0.825rem',
                fontWeight: 600,
              }}
            >
              <Info size={16} style={{ flexShrink: 0 }} />
              <span>Keep this page open to track your live order progress.</span>
            </div>
          )}
        </div>

        {/* Live Timeline */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Progress Status
          </h3>
          <StatusTimeline currentStatus={order.status} statusNotes={order.statusNotes} />
        </div>

        {/* Print Configuration Details Card */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Print Job Details</h3>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleDownloadDocument}
              disabled={isDownloadingDoc}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem' }}
            >
              <Download size={14} />
              {isDownloadingDoc ? 'Loading...' : 'View PDF'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Document:</span>
              <span style={{ fontWeight: 600, maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>
                {order.document.originalName}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Pages to Print:</span>
              <span style={{ fontWeight: 600 }}>
                {order.calculatedPages} {order.calculatedPages === 1 ? 'page' : 'pages'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Copies:</span>
              <span style={{ fontWeight: 600 }}>{order.config.copies}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Format:</span>
              <span style={{ fontWeight: 600 }}>
                {order.config.paperSize} • {order.config.printType === 'BW' ? 'B&W' : 'Color'} • {order.config.side === 'SINGLE' ? 'Single-sided' : 'Double-sided'}
              </span>
            </div>

            <div
              style={{
                marginTop: '0.5rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Authoritative Total</span>
              <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--color-primary)' }}>
                ₹{order.estimatedPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Action Link to Print Another */}
        <Link
          to={`/shop/${shopPublicId || order.shopPublicId}`}
          className="btn btn-secondary"
          style={{ width: '100%' }}
        >
          <ArrowLeft size={16} />
          Place Another Print Request
        </Link>
      </main>
    </div>
  );
};
