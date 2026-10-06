import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Printer,
  LayoutDashboard,
  IndianRupee,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export const ShopkeeperLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <Printer size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
              PrintFlow
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Operator Panel</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          <NavLink
            to="/dashboard"
            end
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive ? '#ffffff' : '#94a3b8',
              backgroundColor: isActive ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
            })}
          >
            <LayoutDashboard size={18} />
            <span>Orders Board</span>
          </NavLink>

          <NavLink
            to="/dashboard/pricing"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive ? '#ffffff' : '#94a3b8',
              backgroundColor: isActive ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
            })}
          >
            <IndianRupee size={18} />
            <span>Pricing Config</span>
          </NavLink>

          <NavLink
            to="/dashboard/settings"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive ? '#ffffff' : '#94a3b8',
              backgroundColor: isActive ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
            })}
          >
            <Settings size={18} />
            <span>Shop Settings</span>
          </NavLink>

          {user?.shopPublicId && (
            <a
              href={`/shop/${user.shopPublicId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: '#60a5fa',
                marginTop: '1rem',
                backgroundColor: 'rgba(96, 165, 250, 0.08)',
              }}
            >
              <ExternalLink size={16} />
              <span>Open Customer Page</span>
            </a>
          )}
        </nav>

        {/* User Footer */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.shopName || 'Print Shop'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email || 'admin'}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleLogout}
            title="Sign out"
            style={{ color: '#94a3b8', padding: '0.4rem' }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="dashboard-main">
        <Outlet />
      </div>
    </div>
  );
};
