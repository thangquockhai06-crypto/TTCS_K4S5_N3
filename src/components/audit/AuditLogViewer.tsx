import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  RefreshCw,
  ShieldAlert,
  UserCheck,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { IAuditLog, AuditTargetType } from '../../interfaces/audit.interface';
import { INITIAL_MOCK_AUDIT_LOGS } from '../../mock/audit.mock';
import styles from './AuditLogViewer.module.css';

interface IAuditLogViewerProps {
  initialLogs?: IAuditLog[];
}

const TARGET_TYPES: ReadonlyArray<{ label: string; value: AuditTargetType }> = [
  { label: 'Tất cả đối tượng', value: 'all' },
  { label: 'Chiết khấu & Deals', value: 'deals' },
  { label: 'Chỉ tiêu Doanh thu', value: 'quota' },
  { label: 'Quyền sở hữu Khách hàng', value: 'customers' },
  { label: 'Vai trò Người dùng', value: 'users' },
];

export const AuditLogViewer: React.FC<IAuditLogViewerProps> = ({
  initialLogs = INITIAL_MOCK_AUDIT_LOGS,
}) => {
  const [logs, setLogs] = useState<IAuditLog[]>(initialLogs);
  const [performedByQuery, setPerformedByQuery] = useState<string>('');
  const [selectedTargetType, setSelectedTargetType] = useState<AuditTargetType>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch real audit logs from backend if available, fallback to mock state
  const fetchAuditLogs = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (performedByQuery.trim()) queryParams.append('performed_by', performedByQuery.trim());
      if (selectedTargetType !== 'all') queryParams.append('target_type', selectedTargetType);
      if (startDate) queryParams.append('start_date', new Date(startDate).toISOString());
      if (endDate) queryParams.append('end_date', new Date(endDate).toISOString());

      const res = await fetch(`/api/audit-logs?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setLogs(json.data);
        }
      }
    } catch {
      // Keep static client filtering on initial logs if backend endpoint is offline in local dev mode
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchAuditLogs();
  }, [selectedTargetType, startDate, endDate]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Filter by performed_by (User ID, name, email)
      if (performedByQuery.trim()) {
        const q = performedByQuery.toLowerCase().trim();
        const matchUser =
          log.performed_by.toLowerCase().includes(q) ||
          (log.user_name ?? '').toLowerCase().includes(q) ||
          (log.user_email ?? '').toLowerCase().includes(q);
        if (!matchUser) return false;
      }

      // 2. Filter by target_type
      if (selectedTargetType !== 'all') {
        if (selectedTargetType === 'quota') {
          if (log.field_name !== 'quota') return false;
        } else if (log.target_type !== selectedTargetType) {
          return false;
        }
      }

      // 3. Filter by Date range
      const logDate = new Date(log.created_at).getTime();
      if (startDate) {
        const startTimestamp = new Date(startDate).getTime();
        if (logDate < startTimestamp) return false;
      }
      if (endDate) {
        const endTimestamp = new Date(endDate).getTime() + 86400000; // End of selected day
        if (logDate > endTimestamp) return false;
      }

      return true;
    });
  }, [logs, performedByQuery, selectedTargetType, startDate, endDate]);

  const getFieldBadgeClass = (fieldName: string): string => {
    switch (fieldName) {
      case 'discount':
        return styles['fieldBadge--discount'];
      case 'quota':
        return styles['fieldBadge--quota'];
      case 'owner':
        return styles['fieldBadge--owner'];
      case 'role':
        return styles['fieldBadge--role'];
      default:
        return '';
    }
  };

  const getFieldLabel = (fieldName: string): string => {
    switch (fieldName) {
      case 'discount':
        return 'Chiết khấu (%)';
      case 'quota':
        return 'Chỉ tiêu (Quota)';
      case 'owner':
        return 'Quyền sở hữu dữ liệu';
      case 'role':
        return 'Vai trò người dùng';
      default:
        return fieldName;
    }
  };

  return (
    <div className={styles.container}>
      {/* Filter Toolbar */}
      <div className={styles.filterHeader}>
        <div className={styles.typeChips}>
          {TARGET_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`${styles.chipBtn} ${
                selectedTargetType === t.value ? styles.chipBtnActive : ''
              }`}
              onClick={() => setSelectedTargetType(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.filterRow}>
          {/* Performer Search Filter */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              <UserCheck size={14} />
              Lọc theo người dùng thực hiện
            </label>
            <input
              type="text"
              className={styles.textInput}
              placeholder="Nhập ID, Tên hoặc Email người dùng..."
              value={performedByQuery}
              onChange={(e) => setPerformedByQuery(e.target.value)}
            />
          </div>

          {/* Start Date Filter */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              <Calendar size={14} />
              Từ thời điểm (Start Date)
            </label>
            <input
              type="date"
              className={styles.dateInput}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* End Date Filter */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              <Calendar size={14} />
              Đến thời điểm (End Date)
            </label>
            <input
              type="date"
              className={styles.dateInput}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button
            type="button"
            className={styles.chipBtn}
            onClick={() => void fetchAuditLogs()}
            disabled={isLoading}
            style={{ height: '40px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
            {isLoading ? 'Đang tải...' : 'Làm mới nhật ký'}
          </button>
        </div>
      </div>

      {/* Audit Log Records Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Thời điểm</th>
              <th>Người thực hiện</th>
              <th>Loại & ID Đối tượng</th>
              <th>Trường nhạy cảm thay đổi</th>
              <th>Snapshot Giá trị (Trước ➔ Sau)</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  <ShieldAlert size={32} style={{ marginBottom: '8px', color: '#94a3b8' }} />
                  <div>Không tìm thấy nhật ký thay đổi nào khớp với bộ lọc.</div>
                </td>
              </tr>
            ) : (
              filteredLogs.map((item) => (
                <tr key={item.id}>
                  <td className={styles.timeCell}>
                    {new Date(item.created_at).toLocaleString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td>
                    <div className={styles.performerCell}>
                      <span className={styles.performerName}>
                        {item.user_name || item.performed_by}
                      </span>
                      <span className={styles.performerEmail}>
                        {item.user_email || `ID: ${item.performed_by}`}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {item.target_type}
                    </span>{' '}
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                      (#{item.target_id})
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.fieldBadge} ${getFieldBadgeClass(item.field_name)}`}>
                      <Tag size={12} />
                      {getFieldLabel(item.field_name)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.deltaBox}>
                      <span className={styles.oldVal}>{item.old_value ?? 'N/A'}</span>
                      <ArrowRight size={14} className={styles.arrow} />
                      <span className={styles.newVal}>{item.new_value ?? 'N/A'}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
