import React from 'react';
import styles from './LoadingSkeleton.module.css';

export interface ILoadingSkeletonProps {
  rows?: number;
  height?: number;
}

export const LoadingSkeleton: React.FC<ILoadingSkeletonProps> = ({ rows = 3, height = 56 }) => {
  return (
    <div className={styles.skeletonGroup} aria-busy="true" aria-label="Loading content">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={`skel-${idx}`}
          className={styles.skeletonBar}
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
};
