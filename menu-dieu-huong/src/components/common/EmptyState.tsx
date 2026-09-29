import React from 'react';
import { FolderSearch } from 'lucide-react';
import styles from './EmptyState.module.css';

export interface IEmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<IEmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyState__icon} aria-hidden="true">
        {icon ?? <FolderSearch size={28} />}
      </div>
      <h3 className={styles.emptyState__title}>{title}</h3>
      <p className={styles.emptyState__desc}>{description}</p>
      {action && <div className={styles.emptyState__action}>{action}</div>}
    </div>
  );
};
