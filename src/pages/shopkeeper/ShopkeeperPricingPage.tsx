import React, { useEffect, useState } from 'react';
import type { PricingConfig } from '../../types';
import { shopkeeperService } from '../../services/shopkeeperService';
import { useAuth } from '../../context/AuthContext';
import { IndianRupee, Save, Check, AlertCircle } from 'lucide-react';

const DEFAULT_PRICING: PricingConfig = {
  a4: { bwSingle: 2, bwDouble: 3, colorSingle: 10, colorDouble: 15 },
  a3: { bwSingle: 5, bwDouble: 8, colorSingle: 20, colorDouble: 30 },
};

function normalizePricingToFlat(raw: any): PricingConfig {
  if (!raw) return DEFAULT_PRICING;

  // If already flat
  if (raw.a4 && typeof raw.a4.bwSingle === 'number') {
    return raw as PricingConfig;
  }

  // If backend structure: { A4: { BLACK_WHITE: { single, double }, COLOR: { single, double } }, A3: ... }
  const a4 = raw.A4 || raw.a4 || {};
  const a3 = raw.A3 || raw.a3 || {};

  const a4Bw = a4.BLACK_WHITE || a4.blackWhite || a4.bw || {};
  const a4Color = a4.COLOR || a4.color || {};
  const a3Bw = a3.BLACK_WHITE || a3.blackWhite || a3.bw || {};
  const a3Color = a3.COLOR || a3.color || {};

  return {
    a4: {
      bwSingle: a4Bw.single ?? a4.bwSingle ?? 2,
      bwDouble: a4Bw.double ?? a4.bwDouble ?? 3,
      colorSingle: a4Color.single ?? a4.colorSingle ?? 10,
      colorDouble: a4Color.double ?? a4.colorDouble ?? 15,
    },
    a3: {
      bwSingle: a3Bw.single ?? a3.bwSingle ?? 5,
      bwDouble: a3Bw.double ?? a3.bwDouble ?? 8,
      colorSingle: a3Color.single ?? a3.colorSingle ?? 20,
      colorDouble: a3Color.double ?? a3.colorDouble ?? 30,
    },
  };
}

export const ShopkeeperPricingPage: React.FC = () => {
  const { user } = useAuth();
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadShopDetails() {
      try {
        setIsLoading(true);
        const shop = await shopkeeperService.getShopDetails(user?.token);
        setPricing(normalizePricingToFlat(shop.pricing));
      } catch (err: unknown) {
        setErrorMessage((err as Error).message || 'Failed to load pricing');
      } finally {
        setIsLoading(false);
      }
    }
    loadShopDetails();
  }, [user?.token]);

  const handlePriceChange = (
    paperSize: 'a4' | 'a3',
    field: keyof PricingConfig['a4'],
    value: string
  ) => {
    if (!pricing) return;
    const num = parseFloat(value) || 0;
    setPricing({
      ...pricing,
      [paperSize]: {
        ...pricing[paperSize],
        [field]: num,
      },
    });
    setSaveSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricing) return;

    try {
      setIsSaving(true);
      setErrorMessage(null);
      await shopkeeperService.updatePricing(pricing, user?.token);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to save pricing');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !pricing) {
    return (
      <main className="dashboard-content" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading pricing configuration...</p>
      </main>
    );
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Pricing Configuration</h1>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Configure standard per-sheet rate rules (₹)
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <form onSubmit={handleSave} style={{ maxWidth: '800px' }}>
          {saveSuccess && (
            <div className="alert alert-info" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
              <Check size={18} />
              <span>Pricing configuration updated successfully!</span>
            </div>
          )}

          {errorMessage && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* A4 Pricing Card */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
              <IndianRupee size={20} color="var(--color-primary)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>A4 Paper Rates</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {/* B&W A4 */}
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Black & White (A4)
                </h4>

                <div className="form-group">
                  <label className="form-label">Single-Sided Rate (₹ / sheet)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="input-text"
                    value={pricing.a4.bwSingle}
                    onChange={(e) => handlePriceChange('a4', 'bwSingle', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Double-Sided Rate (₹ / sheet)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="input-text"
                    value={pricing.a4.bwDouble}
                    onChange={(e) => handlePriceChange('a4', 'bwDouble', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Color A4 */}
              <div style={{ padding: '1rem', backgroundColor: '#fdf4ff', borderRadius: 'var(--radius-sm)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#86198f', marginBottom: '0.75rem' }}>
                  Color Print (A4)
                </h4>

                <div className="form-group">
                  <label className="form-label">Single-Sided Rate (₹ / sheet)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="input-text"
                    value={pricing.a4.colorSingle}
                    onChange={(e) => handlePriceChange('a4', 'colorSingle', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Double-Sided Rate (₹ / sheet)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="input-text"
                    value={pricing.a4.colorDouble}
                    onChange={(e) => handlePriceChange('a4', 'colorDouble', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* A3 Pricing Card */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
              <IndianRupee size={20} color="var(--color-primary)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>A3 Paper Rates (Large Format)</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {/* B&W A3 */}
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Black & White (A3)
                </h4>

                <div className="form-group">
                  <label className="form-label">Single-Sided Rate (₹ / sheet)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="input-text"
                    value={pricing.a3.bwSingle}
                    onChange={(e) => handlePriceChange('a3', 'bwSingle', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Double-Sided Rate (₹ / sheet)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="input-text"
                    value={pricing.a3.bwDouble}
                    onChange={(e) => handlePriceChange('a3', 'bwDouble', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Color A3 */}
              <div style={{ padding: '1rem', backgroundColor: '#fdf4ff', borderRadius: 'var(--radius-sm)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#86198f', marginBottom: '0.75rem' }}>
                  Color Print (A3)
                </h4>

                <div className="form-group">
                  <label className="form-label">Single-Sided Rate (₹ / sheet)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="input-text"
                    value={pricing.a3.colorSingle}
                    onChange={(e) => handlePriceChange('a3', 'colorSingle', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Double-Sided Rate (₹ / sheet)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="input-text"
                    value={pricing.a3.colorDouble}
                    onChange={(e) => handlePriceChange('a3', 'colorDouble', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isSaving}
              style={{ minWidth: '200px', width: 'auto' }}
            >
              <Save size={18} />
              {isSaving ? 'Saving Changes...' : 'Save Pricing Rates'}
            </button>
          </div>
        </form>
      </main>
    </>
  );
};
