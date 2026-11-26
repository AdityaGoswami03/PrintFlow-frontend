import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Order, OrderStatus } from '../../types';
import { shopkeeperService } from '../../services/shopkeeperService';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/Badge';
import { OrderActionButtons } from '../../components/shopkeeper/OrderActionButtons';
import { Pagination } from '../../components/common/Pagination';
import {
  Clock,
  Printer,
  CheckCircle2,
  RefreshCw,
  Search,
  FileText,
  AlertCircle,
  TrendingUp,
  X,
} from 'lucide-react';

export const ShopkeeperDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | OrderStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadOrders = async (
    targetPage = currentPage,
    tab = activeTab,
    search = searchQuery,
    size = pageSize,
    isManual = false
  ) => {
    try {
      if (isManual) setIsRefreshing(true);
      else setIsLoading(true);
      setErrorMessage(null);

      const res = await shopkeeperService.getOrders(
        user?.token,
        tab === 'ALL' ? undefined : tab,
        search,
        targetPage,
        size
      );

      setOrders(res.orders);
      setCurrentPage(res.pagination.page);
      setTotalPages(res.pagination.totalPages || 1);
      setTotalOrders(res.pagination.total);
    } catch (err: unknown) {
      console.error('Failed to load orders', err);
      setErrorMessage((err as Error).message || 'Failed to load orders from server');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch initial orders once on mount / token change - NO continuous polling interval
  useEffect(() => {
    if (user?.token) {
      loadOrders(1, activeTab, searchQuery, pageSize);
    }
  }, [user?.token]);

  // Handle page change - Only fetch when user clicks a page number or prev/next
  const handlePageChange = (newPage: number) => {
    if (newPage === currentPage || newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    loadOrders(newPage, activeTab, searchQuery, pageSize);
  };

  // Handle page size change (e.g. 10, 20, 50 per page)
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    loadOrders(1, activeTab, searchQuery, newSize);
  };

  // Handle status tab switch
  const handleTabChange = (newTab: 'ALL' | OrderStatus) => {
    setActiveTab(newTab);
    setCurrentPage(1);
    loadOrders(1, newTab, searchQuery, pageSize);
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadOrders(1, activeTab, searchQuery, pageSize);
  };

  // Handle clearing search
  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    loadOrders(1, activeTab, '', pageSize);
  };

  // Handle direct status updates
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setProcessingId(orderId);
      await shopkeeperService.updateOrderStatus(orderId, newStatus, undefined, user?.token);
      await loadOrders(currentPage, activeTab, searchQuery, pageSize);
    } catch (err) {
      alert((err as Error).message || 'Failed to update order status');
    } finally {
      setProcessingId(null);
    }
  };

  // Metrics summary based on visible page
  const metrics = useMemo(() => {
    const pending = orders.filter((o) => o.status === 'SUBMITTED').length;
    const printing = orders.filter((o) => o.status === 'PRINTING' || o.status === 'ACCEPTED').length;
    const completed = orders.filter((o) => o.status === 'COMPLETED').length;
    const revenue = orders
      .filter((o) => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + o.estimatedPrice, 0);

    return { pending, printing, completed, revenue };
  }, [orders]);

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
            onClick={() => loadOrders(currentPage, activeTab, searchQuery, pageSize, true)}
            disabled={isRefreshing || isLoading}
            title="Refresh current page"
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        {errorMessage && (
          <div
            style={{
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

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
                  Pending Requests
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
                  Completed
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
                  Page Revenue
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
              { key: 'ALL', label: 'All Orders' },
              { key: 'SUBMITTED', label: 'New' },
              { key: 'PRINTING', label: 'Printing' },
              { key: 'COMPLETED', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key as typeof activeTab)}
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
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box with submit and clear */}
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '280px', display: 'flex' }}>
            <input
              type="text"
              placeholder="Search #order or phone (press Enter)..."
              className="input-text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.3rem', paddingRight: searchQuery ? '2rem' : '0.75rem', fontSize: '0.85rem', height: '38px', width: '100%' }}
            />
            <Search
              size={16}
              color="var(--color-text-subtle)"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-subtle)',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </form>
        </div>

        {/* Orders Table */}
        {isLoading ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <RefreshCw size={28} className="animate-spin" color="var(--color-primary)" />
            <p style={{ marginTop: '0.75rem', color: 'var(--color-text-muted)' }}>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <FileText size={36} color="var(--color-text-subtle)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>No orders found</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              {searchQuery ? 'Try adjusting your search criteria.' : 'No orders in this category right now.'}
            </p>
          </div>
        ) : (
          <>
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
                  {orders.map((order) => (
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

            {/* Pagination Controls at Bottom */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalOrders}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              isLoading={isLoading || isRefreshing}
            />
          </>
        )}
      </main>
    </>
  );
};
