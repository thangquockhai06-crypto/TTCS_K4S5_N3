import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Layers } from 'lucide-react';
import {
  MONTHLY_REVENUE_SERIES,
  PIPELINE_VELOCITY_METRICS,
} from '../../mock/dashboard.mock';
import { formatCompactCurrency } from '../../utils/formatters';
import { Badge, Card } from '../common';
import styles from './MiniCharts.module.css';

export const MiniCharts: React.FC = () => {
  const [hoveredMonth, setHoveredMonth] = useState<string>('Th9');

  const maxRevenue = Math.max(...MONTHLY_REVENUE_SERIES.map((d) => d.actualArr), 1);
  const activePoint =
    MONTHLY_REVENUE_SERIES.find((d) => d.month === hoveredMonth) ??
    MONTHLY_REVENUE_SERIES[MONTHLY_REVENUE_SERIES.length - 1];

  return (
    <div className={styles.chartsGrid}>
      {/* Biểu đồ Tăng trưởng Doanh thu ARR */}
      <Card padding="md" className={styles.chartCard}>
        <div className={styles.chartCard__header}>
          <div>
            <div className={styles.chartCard__titleRow}>
              <BarChart2 size={17} className={styles.chartCard__iconPrimary} />
              <h3 className={styles.chartCard__title}>Biểu đồ Tăng trưởng Doanh thu ARR</h3>
            </div>
            <p className={styles.chartCard__subtitle}>
              So sánh Doanh thu thực tế so với Chỉ tiêu Kế hoạch ($K)
            </p>
          </div>

          <Badge tone="success" dot>
            Đạt 121.9% Chỉ tiêu
          </Badge>
        </div>

        <div className={styles.chartHighlight}>
          <div>
            <span className={styles.chartHighlight__label}>
              Thực đạt {activePoint.month}/2026
            </span>
            <strong className={`${styles.chartHighlight__val} tabular-nums`}>
              ${activePoint.actualArr}K
            </strong>
          </div>
          <div>
            <span className={styles.chartHighlight__label}>Chỉ tiêu kế hoạch</span>
            <strong className={`${styles.chartHighlight__target} tabular-nums`}>
              ${activePoint.targetArr}K
            </strong>
          </div>
          <div>
            <span className={styles.chartHighlight__label}>Hợp đồng ký mới</span>
            <strong className={`${styles.chartHighlight__deals} tabular-nums`}>
              {activePoint.newDealsCount} hợp đồng
            </strong>
          </div>
        </div>

        <div className={styles.barChart} role="img" aria-label="Biểu đồ cột doanh thu theo tháng">
          {MONTHLY_REVENUE_SERIES.map((point, idx) => {
            const actualHeight = Math.round((point.actualArr / maxRevenue) * 100);
            const targetHeight = Math.round((point.targetArr / maxRevenue) * 100);
            const isSelected = point.month === hoveredMonth;

            return (
              <button
                key={point.month}
                type="button"
                className={`${styles.barChart__column} ${
                  isSelected ? styles['barChart__column--active'] : ''
                }`}
                onMouseEnter={() => setHoveredMonth(point.month)}
                onFocus={() => setHoveredMonth(point.month)}
              >
                <div className={styles.barChart__barsWrap}>
                  <div
                    className={styles.barChart__barTarget}
                    style={{ height: `${targetHeight}%` }}
                    title={`Chỉ tiêu: $${point.targetArr}K`}
                  />
                  <motion.div
                    className={styles.barChart__barActual}
                    initial={{ height: 0 }}
                    animate={{ height: `${actualHeight}%` }}
                    transition={{ duration: 0.45, delay: idx * 0.05 }}
                    title={`Thực tế: $${point.actualArr}K`}
                  />
                </div>
                <span className={styles.barChart__label}>{point.month}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Phễu tốc độ chuyển đổi cơ hội */}
      <Card padding="md" className={styles.chartCard}>
        <div className={styles.chartCard__header}>
          <div>
            <div className={styles.chartCard__titleRow}>
              <Layers size={17} className={styles.chartCard__iconAccent} />
              <h3 className={styles.chartCard__title}>Tốc độ Chuyển đổi Phễu Bán hàng</h3>
            </div>
            <p className={styles.chartCard__subtitle}>
              Tỷ lệ chuyển đổi qua từng giai đoạn của các cơ hội Enterprise
            </p>
          </div>
          <Badge tone="accent">Quý 3 Trực tiếp</Badge>
        </div>

        <div className={styles.funnelList}>
          {PIPELINE_VELOCITY_METRICS.map((item, idx) => (
            <div key={item.stage} className={styles.funnelItem}>
              <div className={styles.funnelItem__top}>
                <span className={styles.funnelItem__stage}>{item.stage}</span>
                <div className={styles.funnelItem__stats}>
                  <span className={styles.funnelItem__count}>{item.count} cơ hội</span>
                  <strong className="tabular-nums">
                    {formatCompactCurrency(item.totalValue)}
                  </strong>
                </div>
              </div>

              <div className={styles.funnelItem__track}>
                <motion.div
                  className={styles.funnelItem__fill}
                  style={{ backgroundColor: item.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.conversionRate}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                />
              </div>

              <div className={styles.funnelItem__Sub}>
                <span>Tỷ lệ chuyển đổi giai đoạn</span>
                <strong className="tabular-nums">{item.conversionRate}%</strong>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
