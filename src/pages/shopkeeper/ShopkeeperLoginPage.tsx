import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Printer, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const ShopkeeperLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your shopkeeper email or username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setIsLoading(true);
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('owner@quickprint.com');
    setPassword('printflow123');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        padding: '1.5rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2.25rem',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.85rem auto',
            }}
          >
            <Printer size={30} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--color-text-main)' }}>
            Shopkeeper Sign In
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Access incoming orders and shop management dashboard
          </p>
        </div>

        {errorMessage && (
          <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email / Username
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                className="input-text"
                placeholder="operator@shop.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="email"
              />
              <Mail
                size={18}
                color="var(--color-text-subtle)"
                style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                className="input-text"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="current-password"
              />
              <Lock
                size={18}
                color="var(--color-text-subtle)"
                style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isLoading}
            style={{ width: '100%', marginBottom: '1.25rem' }}
          >
            {isLoading ? 'Signing In...' : 'Sign In to Dashboard'}
            {!isLoading && <ArrowRight size={18} />}
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            Don't have a shop account?{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--color-primary)',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Register here
            </Link>
          </div>

          {/* V1 Helper fill button */}
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#f1f5f9',
              textAlign: 'center',
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
            }}
          >
            <span>Demo: </span>
            <button
              type="button"
              onClick={handleDemoFill}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Fill Sample Credentials
            </button>
          </div>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem' }}>
          <Link to="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            ← Back to PrintFlow Home
          </Link>
        </div>
      </div>
    </div>
  );
};
