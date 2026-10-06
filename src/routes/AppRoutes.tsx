import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HomePage } from '../pages/HomePage';
import { CustomerOrderFlowPage } from '../pages/customer/CustomerOrderFlowPage';
import { CustomerTrackingPage } from '../pages/customer/CustomerTrackingPage';
import { ShopkeeperLoginPage } from '../pages/shopkeeper/ShopkeeperLoginPage';
import { ShopkeeperRegisterPage } from '../pages/shopkeeper/ShopkeeperRegisterPage';
import { ShopkeeperLayout } from '../components/shopkeeper/ShopkeeperLayout';
import { ShopkeeperDashboardPage } from '../pages/shopkeeper/ShopkeeperDashboardPage';
import { ShopkeeperOrderDetailsPage } from '../pages/shopkeeper/ShopkeeperOrderDetailsPage';
import { ShopkeeperPricingPage } from '../pages/shopkeeper/ShopkeeperPricingPage';
import { ShopkeeperSettingsPage } from '../pages/shopkeeper/ShopkeeperSettingsPage';
import { NotFoundPage } from '../pages/NotFoundPage';

/**
 * Protected Route wrapper for shopkeeper operator panel
 */
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Authenticating session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Home / Demo Portal */}
      <Route path="/" element={<HomePage />} />

      {/* Customer Routes (No authentication required) */}
      <Route path="/shop/:shopPublicId" element={<CustomerOrderFlowPage />} />
      <Route
        path="/shop/:shopPublicId/order/:orderAccessToken"
        element={<CustomerTrackingPage />}
      />

      {/* Shopkeeper Authentication & Registration */}
      <Route path="/login" element={<ShopkeeperLoginPage />} />
      <Route path="/admin/login" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<ShopkeeperRegisterPage />} />
      <Route path="/admin/register" element={<Navigate to="/register" replace />} />

      {/* Protected Shopkeeper Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ShopkeeperLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ShopkeeperDashboardPage />} />
        <Route path="orders/:orderId" element={<ShopkeeperOrderDetailsPage />} />
        <Route path="pricing" element={<ShopkeeperPricingPage />} />
        <Route path="settings" element={<ShopkeeperSettingsPage />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
