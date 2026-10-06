import React from 'react';
import { Link } from 'react-router-dom';
import { Printer, Smartphone, LayoutDashboard, ArrowRight, CheckCircle2 } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header
        style={{
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: '#ffffff',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Printer size={22} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>PrintFlow</span>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <Link to="/register" className="btn btn-ghost btn-sm">
            Register Shop
          </Link>
          <Link to="/login" className="btn btn-secondary btn-sm">
            Shopkeeper Sign In
          </Link>
          <Link to="/shop/quickprint-central" className="btn btn-primary btn-sm">
            Customer Demo
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, maxWidth: '1000px', margin: '0 auto', padding: '3rem 1.5rem', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.8rem',
              fontWeight: 700,
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              marginBottom: '1rem',
              border: '1px solid var(--color-primary-border)',
            }}
          >
            V1 Photocopy & Print Store System
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, margin: '0 0 1rem 0' }}>
            Instant QR Print Orders for Customers & Shopkeepers
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', maxWidth: '640px', margin: '0 auto' }}>
            Customers scan a counter QR code, upload documents, and track orders with zero friction. Shopkeepers manage orders in real time.
          </p>
        </div>

        {/* Two Experiences Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Customer Card */}
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#eff6ff',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Smartphone size={26} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Customer Experience
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                No account needed. Mobile-first workflow: scan QR, upload PDF, configure copies & paper size, review price, and track live status.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.75rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>Instant PDF upload & validation</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>A4 / A3, B&W or Color, Page range</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>Real-time status timeline tracker</span>
                </div>
              </div>
            </div>

            <Link to="/shop/quickprint-central" className="btn btn-primary">
              Launch Customer Flow
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Shopkeeper Card */}
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <LayoutDashboard size={26} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Shopkeeper Dashboard
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                Desktop/tablet operator dashboard for accepting jobs, viewing secure files, updating order stages, and managing pricing rules.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.75rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>Incoming order queue & metrics</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>Secure signed document access</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>Custom pricing & order pause toggle</span>
                </div>
              </div>
            </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <Link to="/login" className="btn btn-secondary" style={{ flex: 1 }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ flex: 1 }}>
                  Register Shop
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  };
