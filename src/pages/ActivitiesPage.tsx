import React, { useMemo, useState } from 'react';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { Badge, Card, SearchBar } from '../components/common';
import { useCRMData } from '../context/CRMDataContext';
import { ActivityType } from '../interfaces';
import styles from './ActivitiesPage.module.css';

const ACTIVITY_TYPES: ReadonlyArray<{ label: string; value: ActivityType | 'all' }> = [
  { label: 'Tất cả tương tác', value: 'all' },
  { label: 'Cập nhật thương vụ', value: 'deal_update' },
  { label: 'Họp cấp cao', value: 'meeting' },
  { label: 'Hợp đồng & Pháp lý', value: 'contract' },
  { label: 'Cuộc gọi tư vấn', value: 'call' },
];

export const ActivitiesPage: React.FC = () => {
  const { customers } = useCRMData();
  const [filterType, setFilterType] = useState<ActivityType | 'all'>('all');
  const [query, setQuery] = useState<string>('');

  const allActivities = useMemo(() => {
    return customers
      .flatMap((c) => c.activities)
      .filter((act) => {
        const matchType = filterType === 'all' || act.type === filterType;
        const q = query.trim().toLowerCase();
        const matchQuery =
          !q ||
          act.title.toLowerCase().includes(q) ||
          act.description.toLowerCase().includes(q) ||
          (act.companyName ?? '').toLowerCase().includes(q);
        return matchType && matchQuery;
      })
      .slice(0, 30);
  }, [customers, filterType, query]);

  return (
    <div className={styles.activitiesPage}>
      <header className={styles.header}>
        <div>
          <Badge tone="primary" dot>
            NHẬT KÝ KIỂM TOÁN THỜI GIAN THỰC
          </Badge>
          <h1 className={styles.title}>Nhật ký hoạt động toàn hệ thống</h1>
          <p className={styles.subtitle}>
            Dòng thời gian hợp nhất mọi cuộc gọi, buổi họp QBR, chỉnh sửa hợp đồng và cập nhật doanh
            thu ARR trên toàn bộ 50 khách hàng doanh nghiệp.
          </p>
        </div>
      </header>

      <Card padding="sm" className={styles.filterBar}>
        <div className={styles.chips}>
          {ACTIVITY_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setFilterType(t.value)}
              className={`${styles.chip} ${
                filterType === t.value ? styles['chip--active'] : ''
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.searchWrap}>
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Tìm kiếm nhật ký hoạt động..."
            shortcutHint=""
          />
        </div>
      </Card>

      <Card padding="lg">
        <ActivityFeed activities={allActivities} showCompanyLink />
      </Card>
    </div>
  );
};
