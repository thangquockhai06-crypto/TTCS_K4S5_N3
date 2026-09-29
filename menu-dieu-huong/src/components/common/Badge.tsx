import React from 'react';
import styles from './Badge.module.css';

export type BadgeToneType =
  | 'success'
  | 'primary'
  | 'accent'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'info';

export interface IBadgeProps {
  children: React.ReactNode;
  tone?: BadgeToneType;
  dot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<IBadgeProps> = ({
  children,
  tone = 'neutral',
  dot = false,
  size = 'md',
  className = '',
}) => {
  const classes = [
    styles.badge,
    styles[`badge--${tone}`],
    styles[`badge--${size}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {dot && <span className={styles.badge__dot} aria-hidden="true" />}
      <span className={styles.badge__text}>{children}</span>
    </span>
  );
};
