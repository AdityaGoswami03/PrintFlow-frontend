import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X, AlertCircle, CheckCircle2, RotateCw } from 'lucide-react';

interface FileUploadProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  maxSizeMB?: number;
  uploadProgress?: number;
  isUploading?: boolean;
  uploadError?: string | null;
  onRetry?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  selectedFile,
  onFileSelect,
  maxSizeMB = 25,
  uploadProgress = 0,
  isUploading = false,
  uploadError = null,
  onRetry,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateAndSetFile = (file: File) => {
    setValidationError(null);

    // Validate type (must be PDF)
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      setValidationError('Only PDF documents are supported. Please select a valid .pdf file.');
      return;
    }

    // Validate size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setValidationError(
        `File is too large (${formatFileSize(file.size)}). Maximum allowed limit is ${maxSizeMB}MB.`
      );
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="application/pdf,.pdf"
        style={{ display: 'none' }}
        id="pdf-file-input"
      />

      {selectedFile ? (
        <div
          className="card"
          style={{
            border: uploadError
              ? '2px solid #fca5a5'
              : '2px solid var(--color-primary-border)',
            backgroundColor: uploadError ? '#fff5f5' : 'var(--color-primary-light)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', overflow: 'hidden' }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: uploadError ? '#dc2626' : 'var(--color-primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileText size={24} />
              </div>
              <div style={{ overflow: 'hidden', textAlign: 'left' }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '200px',
                  }}
                  title={selectedFile.name}
                >
                  {selectedFile.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {formatFileSize(selectedFile.size)} • Ready for print
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
                title="Replace with another file"
                disabled={isUploading}
              >
                Change
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleRemove}
                title="Remove document"
                disabled={isUploading}
                style={{ padding: '0.4rem 0.5rem' }}
                aria-label="Remove document"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Upload progress indicator if uploading */}
          {isUploading && (
            <div style={{ marginTop: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                <span>Uploading document to print queue...</span>
                <span>{uploadProgress || 100}%</span>
              </div>
              <div style={{ width: '100%', height: 6, backgroundColor: '#bfdbfe', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${uploadProgress || 100}%`,
                    height: '100%',
                    backgroundColor: 'var(--color-primary)',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>
            </div>
          )}

          {uploadError && (
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#991b1b', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={16} color="#dc2626" />
                <span>{uploadError}</span>
              </div>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="btn btn-danger btn-sm"
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                >
                  <RotateCw size={12} />
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div
          className={`dropzone ${isDragging ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click();
            }
          }}
          aria-label="Upload PDF Document"
        >
          <div
            style={{
              width: 58,
              height: 58,
              margin: '0 auto 0.85rem auto',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
            }}
          >
            <UploadCloud size={30} />
          </div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
            Tap or drop your PDF here
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Supports PDF files up to <strong>{maxSizeMB}MB</strong>
          </div>
        </div>
      )}

      {validationError && (
        <div className="alert alert-danger" style={{ marginTop: '0.75rem' }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};
