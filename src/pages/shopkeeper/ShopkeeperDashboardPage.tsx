import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Order, OrderStatus } from '../../types';
import { shopkeeperService } from '../../services/shopkeeperService';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/Badge';
import { OrderActionButtons } from '../../components/shopkeeper/OrderActionButtons';
import {
  Clock,
  Printer,
  CheckCircle2,
  RefreshCw,
  Search,
  FileText,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export const ShopkeeperDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | OrderStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadOrders = async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      setErrorMessage(null);
      const res = await shopkeeperService.getOrders(
        user?.token,
        activeTab === 'ALL' ? undefined : activeTab,
        searchQuery
      );
      setOrders(res.orders);
    } catch (err: unknown) {
      console.error('Failed to load orders', err);
      setErrorMessage((err as Error).message || 'Failed to load orders from server');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => {
      loadOrders();
    }, 6000); // Polling every 6s for new incoming orders
    return () => clearInterval(interval);
  }, [user?.token]);

  // Handle direct status updates
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setProcessingId(orderId);
      await shopkeeperService.updateOrderStatus(orderId, newStatus, undefined, user?.token);
      await loadOrders();
    } catch (err) {
      alert((err as Error).message || 'Failed to update order status');
    } finally {
      setProcessingId(null);
    }
  };

  // Metrics summary
  const metrics = useMemo(() => {
    const pending = orders.filter((o) => o.status === 'SUBMITTED').length;
    const printing = orders.filter((o) => o.status === 'PRINTING' || o.status === 'ACCEPTED').length;
    const completed = orders.filter((o) => o.status === 'COMPLETED').length;
    const revenue = orders
      .filter((o) => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + o.estimatedPrice, 0);

    return { pending, printing, completed, revenue };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesTab = activeTab === 'ALL' || order.status === activeTab;
      const matchesSearch =
        order.orderNumber.includes(searchQuery) ||
        order.document.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTab && matchesSearch;
    });
  }, [orders, activeTab, searchQuery]);

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Top Header */}
      <header className="dashboard-header">
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Print Orders Board</h1>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Real-time incoming customer requests
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => loadOrders(true)}
            disabled={isRefreshing}
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Top Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div
            className="card"
            style={{
              borderLeft: '4px solid #f59e0b',
              backgroundColor: metrics.pending > 0 ? '#fffbeb' : '#ffffff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 700, textTransform: 'uppercase' }}>
                  New / Incoming
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.2rem', color: '#78350f' }}>
                  {metrics.pending}
                </div>
              </div>
              <Clock size={28} color="#f59e0b" />
            </div>
          </div>

          <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Active Printing
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.2rem' }}>
                  {metrics.printing}
                </div>
              </div>
              <Printer size={28} color="#8b5cf6" />
            </div>
          </div>

          <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Completed Today
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.2rem' }}>
                  {metrics.completed}
                </div>
              </div>
              <CheckCircle2 size={28} color="#16a34a" />
            </div>
          </div>

          <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Revenue Today
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--color-primary)' }}>
                  ₹{metrics.revenue}
                </div>
              </div>
              <TrendingUp size={28} color="var(--color-primary)" />
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: '#e2e8f0', padding: '0.3rem', borderRadius: 'var(--radius-md)' }}>
            {[
              { key: 'ALL', label: `All (${orders.length})` },
              { key: 'SUBMITTED', label: `New (${orders.filter((o) => o.status === 'SUBMITTED').length})` },
              { key: 'PRINTING', label: `Printing (${orders.filter((o) => o.status === 'PRINTING' || o.status === 'ACCEPTED').length})` },
              { key: 'COMPLETED', label: `Done (${orders.filter((o) => o.status === 'COMPLETED').length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === tab.key ? 'var(--color-surface)' : 'transparent',
                  color: activeTab === tab.key ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                  boxShadow: activeTab === tab.key ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', width: '260px' }}>
            <input
              type="text"
              placeholder="Search #order, file or name..."
              className="input-text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.3rem', fontSize: '0.85rem', height: '38px' }}
            />
            <Search
              size={16}
              color="var(--color-text-subtle)"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>
        </div>

        {/* Orders Table */}
        {isLoading ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <RefreshCw size={28} className="animate-spin" color="var(--color-primary)" />
            <p style={{ marginTop: '0.75rem', color: 'var(--color-text-muted)' }}>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <FileText size={36} color="var(--color-text-subtle)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>No orders found</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              {searchQuery ? 'Try adjusting your search criteria.' : 'No orders in this category right now.'}
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Document</th>
                  <th>Specs</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Time</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary)' }}>
                        #{order.orderNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.customerName || 'Anonymous'}</div>
                      {order.customerPhone && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {order.customerPhone}
                        </div>
                      )}
                    </td>
                    <td>
                      <div
                        style={{
                          fontWeight: 600,
                          maxWidth: '200px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={order.document.originalName}
                      >
                        {order.document.originalName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {order.calculatedPages} {order.calculatedPages === 1 ? 'page' : 'pages'}
                        {order.config.pageSelection.type !== 'ALL' && ` (${order.config.pageSelection.type})`}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {order.config.copies} × {order.config.paperSize} ({order.config.printType})
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {order.config.side === 'SINGLE' ? 'Single-sided' : 'Double-sided'}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '1rem' }}>₹{order.estimatedPrice}</span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {formatTime(order.createdAt)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <OrderActionButtons
                        status={order.status}
                        size="sm"
                        isProcessing={processingId === order.id}
                        onAccept={() => handleStatusChange(order.id, 'ACCEPTED')}
                        onReject={() => handleStatusChange(order.id, 'REJECTED')}
                        onStartPrinting={() => handleStatusChange(order.id, 'PRINTING')}
                        onComplete={() => handleStatusChange(order.id, 'COMPLETED')}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
};
