import React from 'react';
import { Filter, RotateCcw, Search, X } from 'lucide-react';
import {
  AVAILABLE_GROUPS,
  IUserFilterState,
  USER_ROLES_CONFIG,
  USER_STATUS_CONFIG,
  UserRoleType,
  UserStatusType,
} from '../../interfaces/user-management.interface';
import styles from './UserFilterBar.module.css';

interface UserFilterBarProps {
  filter: IUserFilterState;
  onFilterChange: (newFilter: Partial<IUserFilterState>) => void;
  onReset: () => void;
  totalFiltered: number;
}

export const UserFilterBar: React.FC<UserFilterBarProps> = ({
  filter,
  onFilterChange,
  onReset,
  totalFiltered,
}) => {
  const hasActiveFilters = Boolean(
    filter.search.trim() ||
      filter.role !== 'all' ||
      filter.status !== 'all' ||
      filter.group !== 'all'
  );

  return (
    <div className={styles.filterContainer}>
      <div className={styles.topRow}>
        {/* Tìm kiếm theo tên, email, nhóm */}
        <div className={styles.searchWrap}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm theo tên, email, nhóm hoặc số điện thoại..."
            value={filter.search}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
          />
          {filter.search && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => onFilterChange({ search: '', page: 1 })}
              title="Xóa tìm kiếm"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Lọc theo Vai trò */}
        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={filter.role}
            onChange={(e) => onFilterChange({ role: e.target.value, page: 1 })}
            aria-label="Lọc theo vai trò"
          >
            <option value="all">Tất cả vai trò</option>
            {(Object.keys(USER_ROLES_CONFIG) as UserRoleType[]).map((r) => (
              <option key={r} value={r}>
                {USER_ROLES_CONFIG[r].label}
              </option>
            ))}
          </select>

          {/* Lọc theo Trạng thái */}
          <select
            className={styles.filterSelect}
            value={filter.status}
            onChange={(e) => onFilterChange({ status: e.target.value, page: 1 })}
            aria-label="Lọc theo trạng thái"
          >
            <option value="all">Tất cả trạng thái</option>
            {(Object.keys(USER_STATUS_CONFIG) as UserStatusType[]).map((s) => (
              <option key={s} value={s}>
                {USER_STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>

          {/* Lọc theo Nhóm / Địa bàn */}
          <select
            className={styles.filterSelect}
            value={filter.group}
            onChange={(e) => onFilterChange({ group: e.target.value, page: 1 })}
            aria-label="Lọc theo nhóm địa bàn"
          >
            <option value="all">Tất cả địa bàn</option>
            {AVAILABLE_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              className={styles.resetBtn}
              onClick={onReset}
              title="Đặt lại tất cả bộ lọc"
            >
              <RotateCcw size={14} />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      <div className={styles.activeFiltersBar}>
        <div className={styles.activeTags}>
          <Filter size={13} />
          <span>Bộ lọc đang áp dụng:</span>
          {filter.search && (
            <span className={styles.filterChip}>
              Từ khóa: "{filter.search}"
              <button
                type="button"
                onClick={() => onFilterChange({ search: '', page: 1 })}
              >
                ×
              </button>
            </span>
          )}
          {filter.role !== 'all' && (
            <span className={styles.filterChip}>
              Vai trò: {USER_ROLES_CONFIG[filter.role as UserRoleType]?.label || filter.role}
              <button
                type="button"
                onClick={() => onFilterChange({ role: 'all', page: 1 })}
              >
                ×
              </button>
            </span>
          )}
          {filter.status !== 'all' && (
            <span className={styles.filterChip}>
              Trạng thái: {USER_STATUS_CONFIG[filter.status as UserStatusType]?.label || filter.status}
              <button
                type="button"
                onClick={() => onFilterChange({ status: 'all', page: 1 })}
              >
                ×
              </button>
            </span>
          )}
          {filter.group !== 'all' && (
            <span className={styles.filterChip}>
              Địa bàn: {filter.group}
              <button
                type="button"
                onClick={() => onFilterChange({ group: 'all', page: 1 })}
              >
                ×
              </button>
            </span>
          )}
          {!hasActiveFilters && <span>Không có bộ lọc tùy chỉnh</span>}
        </div>

        <div>
          Tìm thấy <span className={styles.resultCount}>{totalFiltered}</span> người dùng
        </div>
      </div>
    </div>
  );
};
