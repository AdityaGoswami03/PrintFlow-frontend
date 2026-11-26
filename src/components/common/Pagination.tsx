import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isLoading?: boolean;
}

/**
 * Generates an array of page numbers and ellipses for pagination navigation.
 * E.g. [1, 2, 3, 4, 5, '...', 10] or [1, '...', 4, 5, 6, '...', 10]
 */
export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount = 1
): (number | '...')[] {
  const totalNumbers = siblingCount * 2 + 3;
  const totalBlocks = totalNumbers + 2;

  if (totalPages <= totalBlocks) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, '...', lastPageIndex];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + 1 + i
    );
    return [firstPageIndex, '...', ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1);
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}) => {
  // If no pages at all, don't render pagination bar
  if (totalPages <= 0) return null;

  const pageRange = getPaginationRange(currentPage, totalPages);

  const startItem = totalItems !== undefined && pageSize !== undefined
    ? Math.min((currentPage - 1) * pageSize + 1, totalItems)
    : undefined;
  const endItem = totalItems !== undefined && pageSize !== undefined
    ? Math.min(currentPage * pageSize, totalItems)
    : undefined;

  return (
    <div className="pagination-container" aria-label="Pagination Navigation">
      <div className="pagination-info">
        {totalItems !== undefined && startItem !== undefined && endItem !== undefined ? (
          <span className="pagination-total-text">
            Showing <strong>{totalItems === 0 ? 0 : startItem}–{endItem}</strong> of{' '}
            <strong>{totalItems}</strong> {totalItems === 1 ? 'order' : 'orders'}
          </span>
        ) : (
          <span className="pagination-total-text">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
        )}

        {pageSize !== undefined && onPageSizeChange && (
          <div className="pagination-size-selector">
            <span>Per page:</span>
            <select
              className="pagination-size-select"
              value={pageSize}
              disabled={isLoading}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Items per page"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <nav className="pagination-nav">
        {/* Previous page button */}
        <button
          type="button"
          className="pagination-btn pagination-arrow-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
          <span>Prev</span>
        </button>

        {/* Page numbers with ellipses */}
        {pageRange.map((pageItem, index) => {
          if (pageItem === '...') {
            return (
              <span key={`dots-${index}`} className="pagination-ellipsis" aria-hidden="true">
                •••
              </span>
            );
          }

          const isCurrent = pageItem === currentPage;

          return (
            <button
              key={`page-${pageItem}`}
              type="button"
              className={`pagination-btn ${isCurrent ? 'active' : ''}`}
              onClick={() => onPageChange(pageItem)}
              disabled={isLoading || isCurrent}
              aria-current={isCurrent ? 'page' : undefined}
              aria-label={`Page ${pageItem}`}
            >
              {pageItem}
            </button>
          );
        })}

        {/* Next page button */}
        <button
          type="button"
          className="pagination-btn pagination-arrow-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
};
