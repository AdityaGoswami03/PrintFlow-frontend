import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Shop, PrintConfiguration } from '../../types';
import { shopService } from '../../services/shopService';
import { orderService, calculateSelectedPages } from '../../services/orderService';
import { FileUpload } from '../../components/customer/FileUpload';
import { PrintConfigForm, validatePageRangeSyntax } from '../../components/customer/PrintConfigForm';
import { OrderReviewCard } from '../../components/customer/OrderReviewCard';
import {
  Printer,
  AlertTriangle,
  ArrowRight,
  Store,
  ShieldCheck,
  RotateCw,
  WifiOff,
} from 'lucide-react';

const DEFAULT_CONFIG: PrintConfiguration = {
  copies: 1,
  paperSize: 'A4',
  printType: 'BW',
  side: 'SINGLE',
  pageSelection: { type: 'ALL' },
};

export const CustomerOrderFlowPage: React.FC = () => {
  const { shopPublicId } = useParams<{ shopPublicId: string }>();
  const navigate = useNavigate();

  // Network state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoadingShop, setIsLoadingShop] = useState(true);
  const [shopError, setShopError] = useState<string | null>(null);

  // Customer wizard step: 1 = upload, 2 = configure, 3 = review
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [config, setConfig] = useState<PrintConfiguration>(DEFAULT_CONFIG);

  // Estimation state
  const [estimatedPages, setEstimatedPages] = useState<number>(5);
  const [calculatedPages, setCalculatedPages] = useState<number>(5);
  const [estimatedTotal, setEstimatedTotal] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  // Load shop details from backend
  const loadShop = async () => {
    if (!shopPublicId) {
      setShopError('Invalid shop link. Please rescan the QR code at the counter.');
      setIsLoadingShop(false);
      return;
    }

    try {
      setIsLoadingShop(true);
      setShopError(null);
      const data = await shopService.getPublicShop(shopPublicId);
      setShop(data);
    } catch (err: unknown) {
      setShopError((err as Error).message || 'Unable to connect to the shop. Please try again.');
    } finally {
      setIsLoadingShop(false);
    }
  };

  useEffect(() => {
    loadShop();
  }, [shopPublicId]);

  // Handle file select
  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      // Immediate estimated page count based on binary file size heuristics
      const initialEstimate = Math.max(1, Math.min(100, Math.floor(file.size / 150000) || 5));
      setEstimatedPages(initialEstimate);
    }
  };

  // Recalculate price with backend /orders/calculate-price when config, file, or shop changes
  useEffect(() => {
    if (!shop || !selectedFile) return;

    const calcPages = calculateSelectedPages(estimatedPages, config);
    setCalculatedPages(calcPages);

    orderService
      .estimatePrice({
        shopPublicId: shop.publicId || shop.slug || shopPublicId || '',
        totalPages: estimatedPages,
        config,
      })
      .then((res) => {
        setEstimatedTotal(res.estimatedPrice);
        setCalculatedPages(res.calculatedPages);
      })
      .catch((err) => {
        console.warn('Backend price estimation fallback', err);
      });
  }, [shop, selectedFile, config, estimatedPages, shopPublicId]);

  // Proceed to Step 3 with validation
  const handleProceedToReview = () => {
    setConfigError(null);

    // Validate page range if range type selected
    if (
      config.pageSelection.type === 'RANGE' ||
      config.pageSelection.type === 'CUSTOM' ||
      config.pageSelection.type === 'SPECIFIC'
    ) {
      const err = validatePageRangeSyntax(config.pageSelection.range || '', estimatedPages);
      if (err) {
        setConfigError(err);
        return;
      }
    }

    if (config.copies < 1 || config.copies > 100) {
      setConfigError('Number of copies must be between 1 and 100.');
      return;
    }

    setStep(3);
  };

  const handleSubmitOrder = async () => {
    if (!shop || !selectedFile) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const targetShopId = shop.publicIdentifier || shop.slug || shop.publicId || shopPublicId || '';

      const newOrder = await orderService.submitOrder({
        shopPublicId: targetShopId,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        documentFile: selectedFile,
        config,
      });

      const token = newOrder.customerAccessToken || newOrder.accessToken || '';

      // Save to localStorage for quick restore
      localStorage.setItem(
        'printflow_last_order',
        JSON.stringify({
          orderNumber: newOrder.orderNumber,
          token,
          shopPublicId: targetShopId,
        })
      );

      // Navigate to dedicated tracking page
      navigate(`/shop/${targetShopId}/order/${newOrder.orderNumber}?token=${encodeURIComponent(token)}`);
    } catch (err: unknown) {
      setSubmitError((err as Error).message || 'Failed to submit print order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="customer-layout">
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="offline-banner">
          <WifiOff size={16} />
          <span>No internet connection. Reconnecting...</span>
        </div>
      )}

      {/* Loading Shop */}
      {isLoadingShop && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            <Printer size={38} className="animate-spin" />
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Connecting to shop...</p>
        </div>
      )}

      {/* Shop Load Error State */}
      {!isLoadingShop && (shopError || !shop) && (
        <div className="customer-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', marginTop: '2rem' }}>
            <AlertTriangle size={48} color="#dc2626" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Shop Not Found</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {shopError || 'The shop you are trying to reach does not exist or the link is invalid.'}
            </p>
            <button type="button" className="btn btn-primary" onClick={loadShop}>
              <RotateCw size={16} />
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Shop Loaded Successfully */}
      {!isLoadingShop && shop && (
        <>
          {/* Shop Header */}
          <header
            style={{
              padding: '1.25rem',
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              position: 'sticky',
              top: 0,
              zIndex: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Store size={22} />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                    {shop.name}
                  </h1>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Instant Self-Service Print Portal
                  </div>
                </div>
              </div>

              <div>
                {shop.isAcceptingOrders ? (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                      padding: '0.3rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    ● Open
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: '#fee2e2',
                      color: '#991b1b',
                      padding: '0.3rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    ● Paused
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="customer-content">
            {!shop.isAcceptingOrders ? (
              <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', marginTop: '1.5rem' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                  }}
                >
                  <AlertTriangle size={30} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Orders Currently Unavailable
                </h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {shop.name} has temporarily paused incoming print requests. Please wait a moment or speak with the store operator at the counter.
                </p>
                <button type="button" className="btn btn-secondary" onClick={loadShop} style={{ marginTop: '1.25rem' }}>
                  <RotateCw size={16} />
                  Check Status Again
                </button>
              </div>
            ) : (
              <div>
                {/* Step Progress Pills */}
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
                  {[
                    { s: 1, label: '1. Upload PDF' },
                    { s: 2, label: '2. Print Setup' },
                    { s: 3, label: '3. Review' },
                  ].map((item) => (
                    <div
                      key={item.s}
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        padding: '0.5rem 0.2rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        backgroundColor:
                          step === item.s
                            ? 'var(--color-primary)'
                            : step > item.s
                            ? '#dcfce7'
                            : '#f1f5f9',
                        color:
                          step === item.s
                            ? '#ffffff'
                            : step > item.s
                            ? '#15803d'
                            : 'var(--color-text-muted)',
                      }}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>

                {submitError && (
                  <div className="alert alert-danger" role="alert">
                    <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* STEP 1: Upload PDF */}
                {step === 1 && (
                  <div>
                    <div style={{ marginBottom: '1rem' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>
                        Select Document
                      </h2>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        Upload your PDF file to print at the counter.
                      </p>
                    </div>

                    <FileUpload
                      selectedFile={selectedFile}
                      onFileSelect={handleFileSelect}
                      maxSizeMB={25}
                    />

                    {/* Optional Customer Contact */}
                    <div className="card" style={{ marginTop: '1rem', padding: '1rem' }}>
                      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <label className="form-label" htmlFor="customer-name">
                          Your Name (Optional)
                        </label>
                        <input
                          id="customer-name"
                          type="text"
                          className="input-text"
                          placeholder="e.g. Rahul Sharma"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="customer-phone">
                          Phone Number (Optional)
                        </label>
                        <input
                          id="customer-phone"
                          type="tel"
                          className="input-text"
                          placeholder="For counter identification"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-lg"
                        disabled={!selectedFile}
                        onClick={() => setStep(2)}
                      >
                        Continue to Print Setup
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Configure Printing */}
                {step === 2 && selectedFile && (
                  <div>
                    <div style={{ marginBottom: '1rem' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>
                        Configure Print Job
                      </h2>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        {selectedFile.name}
                      </p>
                    </div>

                    {configError && (
                      <div className="alert alert-danger" role="alert">
                        <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                        <span>{configError}</span>
                      </div>
                    )}

                    <PrintConfigForm
                      config={config}
                      onChange={setConfig}
                      totalPages={estimatedPages}
                      calculatedPages={calculatedPages}
                    />

                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-lg"
                        onClick={handleProceedToReview}
                      >
                        Review Order (₹{estimatedTotal})
                        <ArrowRight size={18} />
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setStep(1)}
                      >
                        Back to File Selection
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Order Review */}
                {step === 3 && selectedFile && (
                  <div>
                    <OrderReviewCard
                      fileName={selectedFile.name}
                      config={config}
                      calculatedPages={calculatedPages}
                      estimatedTotal={estimatedTotal}
                      isSubmitting={isSubmitting}
                      onBack={() => setStep(2)}
                      onSubmit={handleSubmitOrder}
                    />
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Footer Info */}
          <footer
            style={{
              textAlign: 'center',
              padding: '1rem',
              fontSize: '0.75rem',
              color: 'var(--color-text-subtle)',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: '#fafafa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            <ShieldCheck size={14} />
            <span>No account required • Instant order processing</span>
          </footer>
        </>
      )}
    </div>
  );
};
