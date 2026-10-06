import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <div className="card" style={{ maxWidth: '440px', textAlign: 'center', padding: '2.5rem' }}>
        <AlertCircle size={48} color="var(--color-primary)" style={{ margin: '0 auto 1rem auto' }} />
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>404 - Page Not Found</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          The requested page does not exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary" style={{ width: '100%' }}>
          <ArrowLeft size={16} />
          Return to PrintFlow Home
        </Link>
      </div>
    </div>
  );
};
