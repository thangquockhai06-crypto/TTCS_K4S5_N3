import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import styles from './Drawer.module.css';

export interface IDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  position?: 'right' | 'left';
  children: React.ReactNode;
}

export const Drawer: React.FC<IDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  position = 'right',
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const xOffset = position === 'right' ? 380 : -380;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.drawerRoot} role="dialog" aria-modal="true" aria-label={title}>
          <motion.div
            className={styles.drawerBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className={`${styles.drawerPanel} ${styles[`drawerPanel--${position}`]}`}
            initial={{ x: xOffset }}
            animate={{ x: 0 }}
            exit={{ x: xOffset }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            <header className={styles.drawer__header}>
              <div>
                <h2 className={styles.drawer__title}>{title}</h2>
                {subtitle && <p className={styles.drawer__subtitle}>{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                className={styles.drawer__closeBtn}
                aria-label="Đóng ngăn trượt"
              >
                <X size={18} />
              </button>
            </header>
            <div className={styles.drawer__body}>{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
