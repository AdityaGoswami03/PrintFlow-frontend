import React, { useEffect, useState } from 'react';
import type { Shop } from '../../types';
import { shopkeeperService } from '../../services/shopkeeperService';
import { useAuth } from '../../context/AuthContext';
import {
  Store,
  QrCode,
  Copy,
  Check,
  Power,
  ExternalLink,
  MapPin,
  Phone,
} from 'lucide-react';

export const ShopkeeperSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    async function loadShop() {
      try {
        setIsLoading(true);
        const data = await shopkeeperService.getShopDetails(user?.token);
        setShop(data);
      } catch (err) {
        console.error('Failed to load shop settings', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadShop();
  }, [user?.token]);

  const handleToggleStatus = async () => {
    if (!shop) return;
    try {
      setIsToggling(true);
      const updated = await shopkeeperService.toggleAcceptingOrders(
        !shop.isAcceptingOrders,
        user?.token
      );
      setShop((prev) =>
        prev
          ? {
              ...prev,
              isOpen: updated.isOpen,
              isAcceptingOrders: updated.isOpen,
            }
          : null
      );
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to update store status');
    } finally {
      setIsToggling(false);
    }
  };

  const getCustomerUrl = () => {
    if (!shop) return '';
    const origin = window.location.origin;
    return `${origin}/shop/${shop.publicId}`;
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(getCustomerUrl());
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  if (isLoading || !shop) {
    return (
      <main className="dashboard-content" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading shop settings...</p>
      </main>
    );
  }

  const customerUrl = getCustomerUrl();

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Shop Settings & Status</h1>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Manage store availability, public links & QR code
          </div>
        </div>
      </header>

      <main className="dashboard-content" style={{ maxWidth: '800px' }}>
        {/* Availability Toggle Box */}
        <div
          className="card"
          style={{
            marginBottom: '1.5rem',
            border: shop.isAcceptingOrders ? '2px solid #bbf7d0' : '2px solid #fecaca',
            backgroundColor: shop.isAcceptingOrders ? '#f0fdf4' : '#fef2f2',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: shop.isAcceptingOrders ? '#16a34a' : '#dc2626',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Power size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: shop.isAcceptingOrders ? '#166534' : '#991b1b' }}>
                  {shop.isAcceptingOrders ? 'Accepting Orders' : 'Orders Paused'}
                </div>
                <p style={{ fontSize: '0.85rem', color: shop.isAcceptingOrders ? '#15803d' : '#7f1d1d', margin: 0 }}>
                  {shop.isAcceptingOrders
                    ? 'Customers can scan your QR code and submit print jobs.'
                    : 'Customer portal will show orders temporarily unavailable.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              className={`btn ${shop.isAcceptingOrders ? 'btn-danger' : 'btn-success'}`}
              onClick={handleToggleStatus}
              disabled={isToggling}
            >
              <Power size={16} />
              {isToggling ? 'Updating...' : shop.isAcceptingOrders ? 'Pause Incoming Orders' : 'Resume Accepting Orders'}
            </button>
          </div>
        </div>

        {/* Customer Access Link & QR Code */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
            <QrCode size={20} color="var(--color-primary)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
              Customer QR & Direct URL
            </h2>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Place this link or QR code at your shop counter. Customers do not need an app or account.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <input
              type="text"
              readOnly
              className="input-text"
              value={customerUrl}
              style={{ backgroundColor: '#f8fafc', fontWeight: 600 }}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCopyUrl}
              style={{ flexShrink: 0 }}
            >
              {copiedUrl ? <Check size={16} /> : <Copy size={16} />}
              {copiedUrl ? 'Copied!' : 'Copy Link'}
            </button>
            <a
              href={customerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              title="Open customer view"
              style={{ flexShrink: 0 }}
            >
              <ExternalLink size={16} />
            </a>
          </div>

          {/* Quick Counter QR Mock preview */}
          <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px dashed var(--color-border)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
              Counter Display QR Preview
            </div>
            <div
              style={{
                width: 140,
                height: 140,
                margin: '0.5rem auto',
                backgroundColor: '#ffffff',
                border: '2px solid #0f172a',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <QrCode size={80} color="#0f172a" />
              <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>SCAN TO PRINT</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Shop Identifier: <strong>{shop.publicId}</strong>
            </div>
          </div>
        </div>

        {/* Shop Details Info */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
            <Store size={20} color="var(--color-primary)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Shop Information</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                SHOP NAME
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{shop.name}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                PUBLIC SLUG / IDENTIFIER
              </span>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                {shop.publicId}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  CONTACT NUMBER
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <Phone size={14} color="var(--color-text-muted)" />
                  <span>{shop.contactNumber || 'Not set'}</span>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: '200px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  ADDRESS
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <MapPin size={14} color="var(--color-text-muted)" />
                  <span>
                    {typeof shop.address === 'object'
                      ? [shop.address.street, shop.address.landmark, shop.address.city].filter(Boolean).join(', ') || 'Not specified'
                      : shop.address || 'Campus Arcade'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
