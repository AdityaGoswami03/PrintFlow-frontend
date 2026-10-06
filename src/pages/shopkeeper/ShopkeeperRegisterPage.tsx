import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Printer,
  Lock,
  Mail,
  User,
  Store,
  Phone,
  MapPin,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const ShopkeeperRegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [landmark, setLandmark] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form validations
    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!shopName.trim() || shopName.trim().length < 2) {
      setErrorMessage('Please enter your shop name (at least 2 characters).');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setIsLoading(true);
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        shopName: shopName.trim(),
        contactNumber: contactNumber.trim() || undefined,
        address:
          street.trim() || city.trim() || landmark.trim()
            ? {
                street: street.trim(),
                city: city.trim(),
                landmark: landmark.trim(),
              }
            : undefined,
      });

      // Redirect immediately to operator dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        padding: '2rem 1rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '520px',
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
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--color-text-main)' }}>
            Register Your Print Shop
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Create your store profile and start accepting digital QR print jobs
          </p>
        </div>

        {errorMessage && (
          <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Shopkeeper Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">
                Your Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-name"
                  type="text"
                  className="input-text"
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '2.3rem' }}
                  required
                />
                <User
                  size={16}
                  color="var(--color-text-subtle)"
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">
                Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-email"
                  type="email"
                  className="input-text"
                  placeholder="owner@shop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.3rem' }}
                  required
                  autoComplete="email"
                />
                <Mail
                  size={16}
                  color="var(--color-text-subtle)"
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Shop Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-shop-name">
                Shop Name *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-shop-name"
                  type="text"
                  className="input-text"
                  placeholder="QuickPrint Arcade"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  style={{ paddingLeft: '2.3rem' }}
                  required
                />
                <Store
                  size={16}
                  color="var(--color-text-subtle)"
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">
                Contact Number (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-phone"
                  type="tel"
                  className="input-text"
                  placeholder="9876543210"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  style={{ paddingLeft: '2.3rem' }}
                />
                <Phone
                  size={16}
                  color="var(--color-text-subtle)"
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Password */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">
                Password * (min 6 chars)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password"
                  type="password"
                  className="input-text"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.3rem' }}
                  required
                  autoComplete="new-password"
                />
                <Lock
                  size={16}
                  color="var(--color-text-subtle)"
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm-password">
                Confirm Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-confirm-password"
                  type="password"
                  className="input-text"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '2.3rem' }}
                  required
                  autoComplete="new-password"
                />
                <Lock
                  size={16}
                  color="var(--color-text-subtle)"
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Address (Optional) */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="reg-street">
              Shop Address (Optional)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                id="reg-street"
                type="text"
                className="input-text"
                placeholder="Street / Shop No."
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
              <input
                type="text"
                className="input-text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <input
              type="text"
              className="input-text"
              placeholder="Landmark (e.g. Near University Gate)"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isLoading}
            style={{ width: '100%', marginBottom: '1.25rem' }}
          >
            {isLoading ? 'Creating Store Account...' : 'Complete Registration & Open Dashboard'}
            {!isLoading && <ArrowRight size={18} />}
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Already have a registered shop?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--color-primary)',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Sign In here
            </Link>
          </div>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
          <Link to="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            ← Back to PrintFlow Home
          </Link>
        </div>
      </div>
    </div>
  );
};
