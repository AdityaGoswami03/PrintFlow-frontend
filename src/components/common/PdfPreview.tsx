import React, { useEffect } from 'react';
import { Viewer, Worker, SpecialZoomLevel, type LoadError } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin, type ToolbarSlot } from '@react-pdf-viewer/default-layout';
import { Printer, AlertTriangle, FileText, Loader2, ExternalLink } from 'lucide-react';

// Styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import './PdfPreview.css';

export interface PdfPreviewProps {
  /**
   * PDF document source: regular URL (http/https/relative) or Blob / Object URL
   */
  fileUrl?: string | null;

  /**
   * Optional file display name
   */
  fileName?: string;

  /**
   * Container height. Defaults to '100%'
   */
  height?: string | number;

  /**
   * Custom CSS class name
   */
  className?: string;

  /**
   * Custom inline container styles
   */
  style?: React.CSSProperties;

  /**
   * Optional worker URL override. Defaults to '/pdf.worker.min.js'
   */
  workerUrl?: string;

  /**
   * Callback exposed when print function is initialized
   */
  onPrintReady?: (printFn: () => void) => void;

  /**
   * Callback fired on successful document load
   */
  onDocumentLoad?: () => void;

  /**
   * Optional custom error callback
   */
  onError?: (error: Error) => void;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({
  fileUrl,
  fileName,
  height = '100%',
  className = '',
  style = {},
  workerUrl = '/pdf.worker.min.js',
  onPrintReady,
  onDocumentLoad,
  onError,
}) => {
  // Call plugin creator directly at top level of component function
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    // Start with sidebar closed so the main preview has maximum space
    setInitialTab: () => Promise.resolve(-1),
    renderToolbar: (Toolbar) => (
      <Toolbar>
        {(slots: ToolbarSlot) => {
          const {
            CurrentPageInput,
            Download,
            EnterFullScreen,
            GoToNextPage,
            GoToPreviousPage,
            NumberOfPages,
            Print,
            ShowSearchPopover,
            Zoom,
            ZoomIn,
            ZoomOut,
          } = slots;

          return (
            <div className="pdf-preview-custom-toolbar" role="toolbar" aria-label="PDF Controls">
              {/* Left Section: Page Navigation & Search */}
              <div className="pdf-preview-toolbar-section">
                <ShowSearchPopover />
                <div className="pdf-preview-toolbar-divider" />
                <GoToPreviousPage />
                <div className="pdf-preview-toolbar-pages">
                  <CurrentPageInput />
                  <span>/</span>
                  <NumberOfPages />
                </div>
                <GoToNextPage />
              </div>

              {/* Center Section: Zoom Controls */}
              <div className="pdf-preview-toolbar-section">
                <ZoomOut />
                <Zoom />
                <ZoomIn />
              </div>

              {/* Right Section: Print Action, Fullscreen & Download */}
              <div className="pdf-preview-toolbar-section">
                {/* Clearly visible Print button */}
                <Print>
                  {(printProps) => (
                    <button
                      type="button"
                      className="pdf-preview-toolbar-print-btn"
                      onClick={printProps.onClick}
                      title="Print Document (Ctrl+P)"
                      aria-label="Print Document"
                      id="pdf-preview-toolbar-print-btn"
                    >
                      <Printer size={16} />
                      <span>Print</span>
                    </button>
                  )}
                </Print>

                <div className="pdf-preview-toolbar-divider" />
                <EnterFullScreen />
                <Download />
              </div>
            </div>
          );
        }}
      </Toolbar>
    ),
  });

  // Provide print callback to parent if requested
  useEffect(() => {
    if (onPrintReady) {
      onPrintReady(() => {
        defaultLayoutPluginInstance.toolbarPluginInstance.printPluginInstance.print();
      });
    }
  }, [onPrintReady, defaultLayoutPluginInstance]);

  // Loading state renderer
  const renderLoader = (percentages: number) => (
    <div className="pdf-preview-loader-container">
      <Loader2 size={36} className="animate-spin" color="var(--color-primary, #2563eb)" />
      <p className="pdf-preview-loader-text">
        Loading document {percentages > 0 ? `(${Math.round(percentages)}%)` : ''}...
      </p>
    </div>
  );

  // Error state renderer
  const renderError = (loadError: LoadError) => {
    if (onError && loadError.message) {
      onError(new Error(loadError.message));
    }

    return (
      <div className="pdf-preview-error-container">
        <div className="pdf-preview-error-card">
          <AlertTriangle size={36} color="#dc2626" />
          <h4 className="pdf-preview-error-title">Unable to Load PDF</h4>
          <p className="pdf-preview-error-desc">
            {loadError.message ||
              `The document ${fileName ? `"${fileName}"` : ''} could not be loaded. The link may have expired or the document format is invalid.`}
          </p>
          <div className="pdf-preview-error-actions">
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <ExternalLink size={14} />
                Open Direct File Link
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`pdf-preview-root ${className}`}
      style={{ height, ...style }}
      data-testid="pdf-preview-container"
      data-filename={fileName}
    >
      {!fileUrl ? (
        <div className="pdf-preview-empty-container">
          <FileText size={44} color="var(--color-text-muted, #64748b)" />
          <h4 className="pdf-preview-empty-title">No Document to Display</h4>
          <p className="pdf-preview-empty-desc">
            Please provide a valid PDF URL or wait for the secure document link to be generated.
          </p>
        </div>
      ) : (
        <div className="pdf-preview-viewer-wrapper">
          <Worker workerUrl={workerUrl}>
            <Viewer
              fileUrl={fileUrl}
              plugins={[defaultLayoutPluginInstance]}
              defaultScale={SpecialZoomLevel.PageFit}
              renderLoader={renderLoader}
              renderError={renderError}
              onDocumentLoad={() => {
                if (onDocumentLoad) onDocumentLoad();
              }}
            />
          </Worker>
        </div>
      )}
    </div>
  );
};
