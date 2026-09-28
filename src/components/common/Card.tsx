import React from 'react';
import styles from './Card.module.css';

export interface ICardProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  glass?: boolean;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<ICardProps> = ({
  children,
  padding = 'md',
  glass = false,
  interactive = false,
  className = '',
  onClick,
}) => {
  const classes = [
    styles.card,
    styles[`card--pad-${padding}`],
    glass ? styles['card--glass'] : '',
    interactive ? styles['card--interactive'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
};
