import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import styles from './UserPagination.module.css';

interface UserPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export const UserPagination: React.FC<UserPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [1];

    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    pages.push(totalPages);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={styles.paginationContainer}>
      <div className={styles.leftControls}>
        <div className={styles.limitSelector}>
          <span>Hiển thị</span>
          <select
            className={styles.limitSelect}
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            aria-label="Chọn số dòng mỗi trang (mặc định 20 dòng)"
          >
            <option value={10}>10 dòng</option>
            <option value={20}>20 dòng (mặc định)</option>
            <option value={50}>50 dòng</option>
            <option value={100}>100 dòng</option>
          </select>
          <span>mỗi trang</span>
        </div>

        <div className={styles.pageInfo}>
          Hiển thị{' '}
          <span className={styles.pageInfoHighlight}>
            {startItem} - {endItem}
          </span>{' '}
          trên tổng số{' '}
          <span className={styles.pageInfoHighlight}>{totalItems}</span> người dùng
        </div>
      </div>

      <div className={styles.rightControls}>
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          title="Trang đầu"
          aria-label="Trang đầu"
        >
          <ChevronsLeft size={16} />
        </button>

        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          title="Trang trước"
          aria-label="Trang trước"
        >
          <ChevronLeft size={16} />
        </button>

        {pageNumbers.map((p, idx) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className={styles.ellipsis}>
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`${styles.pageBtn} ${
                p === currentPage ? styles.pageBtnActive : ''
              }`}
              onClick={() => onPageChange(p)}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          title="Trang sau"
          aria-label="Trang sau"
        >
          <ChevronRight size={16} />
        </button>

        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          title="Trang cuối"
          aria-label="Trang cuối"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};
