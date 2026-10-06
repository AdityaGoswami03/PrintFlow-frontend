import React, { useMemo } from 'react';
import type {
  PaperSize,
  PrintConfiguration,
  PrintSide,
  PrintType,
  PageSelectionType,
} from '../../types';
import { Minus, Plus, Layers, Copy, Palette, FileText, AlertCircle } from 'lucide-react';

interface PrintConfigFormProps {
  config: PrintConfiguration;
  onChange: (config: PrintConfiguration) => void;
  totalPages?: number;
  calculatedPages?: number;
}

export function validatePageRangeSyntax(rangeStr: string, totalPages: number): string | null {
  if (!rangeStr || !rangeStr.trim()) {
    return 'Please enter page numbers or a range (e.g. 1-5).';
  }
  const parts = rangeStr.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.includes('-')) {
      const sub = trimmed.split('-');
      if (sub.length !== 2) {
        return `Invalid range format '${trimmed}'. Use start-end format (e.g. 1-5).`;
      }
      const start = parseInt(sub[0].trim(), 10);
      const end = parseInt(sub[1].trim(), 10);
      if (isNaN(start) || isNaN(end)) {
        return `Invalid page numbers in range '${trimmed}'.`;
      }
      if (start <= 0 || end <= 0) {
        return 'Page numbers must be 1 or greater.';
      }
      if (start > end) {
        return `Start page (${start}) cannot be greater than end page (${end}).`;
      }
      if (totalPages > 0 && (start > totalPages || end > totalPages)) {
        return `Page range exceeds total document pages (${totalPages}).`;
      }
    } else {
      const p = parseInt(trimmed, 10);
      if (isNaN(p)) {
        return `Invalid page number '${trimmed}'.`;
      }
      if (p <= 0) {
        return 'Page number must be 1 or greater.';
      }
      if (totalPages > 0 && p > totalPages) {
        return `Page ${p} exceeds total document pages (${totalPages}).`;
      }
    }
  }
  return null;
}

export const PrintConfigForm: React.FC<PrintConfigFormProps> = ({
  config,
  onChange,
  totalPages = 0,
  calculatedPages = 0,
}) => {
  const updateField = <K extends keyof PrintConfiguration>(
    key: K,
    value: PrintConfiguration[K]
  ) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  const handleCopyChange = (delta: number) => {
    const next = Math.max(1, Math.min(100, config.copies + delta));
    updateField('copies', next);
  };

  const handlePageTypeChange = (type: PageSelectionType) => {
    onChange({
      ...config,
      pageSelection: {
        type,
        range: type === 'RANGE' || type === 'CUSTOM' ? (config.pageSelection.range || '1-5') : '',
      },
    });
  };

  const rangeError = useMemo(() => {
    if (config.pageSelection.type === 'RANGE' || config.pageSelection.type === 'CUSTOM' || config.pageSelection.type === 'SPECIFIC') {
      return validatePageRangeSyntax(config.pageSelection.range || '', totalPages);
    }
    return null;
  }, [config.pageSelection.type, config.pageSelection.range, totalPages]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Copies Stepper */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <Copy size={18} color="var(--color-primary)" />
              <span>Number of Copies</span>
            </div>
            <div className="form-helper">How many print sets do you need?</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ width: 42, height: 42, padding: 0, borderRadius: 'var(--radius-sm)' }}
              onClick={() => handleCopyChange(-1)}
              disabled={config.copies <= 1}
              aria-label="Decrease copies"
            >
              <Minus size={18} />
            </button>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', minWidth: '32px', textAlign: 'center' }}>
              {config.copies}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ width: 42, height: 42, padding: 0, borderRadius: 'var(--radius-sm)' }}
              onClick={() => handleCopyChange(1)}
              disabled={config.copies >= 100}
              aria-label="Increase copies"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Paper Size & Color Mode */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {/* Paper Size */}
        <div className="card" style={{ padding: '1rem' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
            <Layers size={16} color="var(--color-primary)" />
            Paper Size
          </label>
          <div className="segmented-control">
            {(['A4', 'A3'] as PaperSize[]).map((size) => (
              <button
                key={size}
                type="button"
                className={`segmented-option ${config.paperSize === size ? 'active' : ''}`}
                onClick={() => updateField('paperSize', size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Print Type */}
        <div className="card" style={{ padding: '1rem' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
            <Palette size={16} color="var(--color-primary)" />
            Print Color
          </label>
          <div className="segmented-control">
            <button
              type="button"
              className={`segmented-option ${config.printType === 'BW' || config.printType === 'BLACK_WHITE' ? 'active' : ''}`}
              onClick={() => updateField('printType', 'BW')}
            >
              B&W
            </button>
            <button
              type="button"
              className={`segmented-option ${config.printType === 'COLOR' ? 'active' : ''}`}
              onClick={() => updateField('printType', 'COLOR')}
            >
              Color
            </button>
          </div>
        </div>
      </div>

      {/* Sides (Single vs Double) */}
      <div className="card" style={{ padding: '1rem' }}>
        <label className="form-label" style={{ marginBottom: '0.5rem' }}>
          Printing Sides
        </label>
        <div className="segmented-control" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {(
            [
              { value: 'SINGLE', label: 'Single-sided (1-sided)' },
              { value: 'DOUBLE', label: 'Double-sided (Back-to-back)' },
            ] as const
          ).map((item) => (
            <button
              key={item.value}
              type="button"
              className={`segmented-option ${config.side === item.value ? 'active' : ''}`}
              onClick={() => updateField('side', item.value as PrintSide)}
              style={{ fontSize: '0.85rem', textAlign: 'center', padding: '0.7rem 0.4rem' }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Page Selection */}
      <div className="card" style={{ padding: '1rem' }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
          <FileText size={16} color="var(--color-primary)" />
          Pages to Print
        </label>

        {totalPages > 0 && (
          <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginBottom: '0.65rem' }}>
            Document has <strong>{totalPages}</strong> {totalPages === 1 ? 'page' : 'pages'}.
            {calculatedPages > 0 && calculatedPages !== totalPages && (
              <span> (<strong>{calculatedPages}</strong> selected)</span>
            )}
          </div>
        )}

        <div className="segmented-control" style={{ marginBottom: '0.75rem' }}>
          {(
            [
              { type: 'ALL', label: 'All Pages' },
              { type: 'RANGE', label: 'Range' },
              { type: 'ODD', label: 'Odd Only' },
              { type: 'EVEN', label: 'Even Only' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.type}
              type="button"
              className={`segmented-option ${config.pageSelection.type === opt.type ? 'active' : ''}`}
              onClick={() => handlePageTypeChange(opt.type as PageSelectionType)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {(config.pageSelection.type === 'RANGE' || config.pageSelection.type === 'CUSTOM' || config.pageSelection.type === 'SPECIFIC') && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input
              type="text"
              className={`input-text ${rangeError ? 'has-error' : ''}`}
              placeholder="e.g. 1-5, 8, 11-14"
              value={config.pageSelection.range || ''}
              onChange={(e) =>
                onChange({
                  ...config,
                  pageSelection: {
                    ...config.pageSelection,
                    range: e.target.value,
                  },
                })
              }
              aria-invalid={!!rangeError}
            />
            {rangeError ? (
              <div className="form-error" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.3rem' }}>
                <AlertCircle size={14} />
                <span>{rangeError}</span>
              </div>
            ) : (
              <span className="form-helper">Enter page numbers and/or ranges separated by commas.</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
