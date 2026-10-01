import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Briefcase, Sparkles, TrendingUp, Users } from 'lucide-react';
import { IStatCard } from '../../interfaces';
import styles from './StatCard.module.css';

export interface IStatCardProps {
  stat: IStatCard;
  index?: number;
}

export const StatCard: React.FC<IStatCardProps> = ({ stat, index = 0 }) => {
  const renderIcon = (): React.ReactNode => {
    switch (stat.iconName) {
      case 'users':
        return <Users size={20} />;
      case 'sparkles':
        return <Sparkles size={20} />;
      case 'briefcase':
        return <Briefcase size={20} />;
      case 'trending-up':
        return <TrendingUp size={20} />;
    }
  };

  const maxSpark = Math.max(...stat.sparkline, 1);
  const minSpark = Math.min(...stat.sparkline, 0);
  const sparkPoints = stat.sparkline
    .map((val, idx) => {
      const x = (idx / (stat.sparkline.length - 1)) * 88;
      const y = 28 - ((val - minSpark) / Math.max(1, maxSpark - minSpark)) * 22;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <motion.article
      className={`${styles.statCard} ${styles[`statCard--${stat.tone}`]}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.06 }}
      whileHover={{ y: -3 }}
    >
      <div className={styles.statCard__glow} aria-hidden="true" />
      <div className={styles.statCard__top}>
        <span className={styles.statCard__label}>{stat.label}</span>
        <div className={styles.statCard__iconBox} aria-hidden="true">
          {renderIcon()}
        </div>
      </div>

      <div className={styles.statCard__middle}>
        <strong className={`${styles.statCard__value} tabular-nums`}>{stat.value}</strong>
        <svg
          width="90"
          height="32"
          viewBox="0 0 90 32"
          className={styles.statCard__sparkline}
          aria-hidden="true"
        >
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={sparkPoints}
          />
        </svg>
      </div>

      <div className={styles.statCard__footer}>
        <span
          className={`${styles.statCard__delta} ${
            stat.changeDirection === 'up'
              ? styles['statCard__delta--up']
              : styles['statCard__delta--down']
          }`}
        >
          {stat.changeDirection === 'up' ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}
          {stat.changePercent}%
        </span>
        <span className={styles.statCard__comparison}>{stat.comparisonLabel}</span>
      </div>
    </motion.article>
  );
};
