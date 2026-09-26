import React from 'react';
import { getInitials } from '../../utils/formatters';
import styles from './Avatar.module.css';

export interface IAvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'busy' | 'offline';
  shape?: 'circle' | 'rounded';
}

export const Avatar: React.FC<IAvatarProps> = ({
  src,
  name,
  size = 'md',
  status,
  shape = 'rounded',
}) => {
  const wrapperClass = [
    styles.avatar,
    styles[`avatar--${size}`],
    styles[`avatar--${shape}`],
  ].join(' ');

  return (
    <div className={wrapperClass} title={name}>
      {src ? (
        <img src={src} alt={name} className={styles.avatar__img} loading="lazy" />
      ) : (
        <span className={styles.avatar__fallback}>{getInitials(name)}</span>
      )}
      {status && (
        <span
          className={`${styles.avatar__status} ${styles[`avatar__status--${status}`]}`}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};
