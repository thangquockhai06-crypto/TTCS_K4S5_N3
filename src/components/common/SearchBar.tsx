import React, { useEffect, useRef } from 'react';
import { Search, Sparkles, X } from 'lucide-react';
import styles from './SearchBar.module.css';

export interface ISearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  shortcutHint?: string;
  ariaLabel?: string;
  enableGlobalShortcut?: boolean;
  className?: string;
}

export const SearchBar: React.FC<ISearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Tìm kiếm khách hàng, công ty, tên miền, thẻ tag...',
  shortcutHint = 'Ctrl K',
  ariaLabel = 'Tìm kiếm',
  enableGlobalShortcut = false,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!enableGlobalShortcut) return undefined;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableGlobalShortcut]);

  return (
    <div className={`${styles.searchBar} ${value ? styles['searchBar--hasValue'] : ''} ${className}`}>
      <span className={styles.searchBar__iconBadge} aria-hidden="true">
        <Search size={15} className={styles.searchBar__icon} />
      </span>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={styles.searchBar__input}
      />

      <div className={styles.searchBar__right}>
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            aria-label="Xóa từ khóa tìm kiếm"
            className={styles.searchBar__clearBtn}
          >
            <X size={13} />
            <span>Xóa</span>
          </button>
        ) : (
          shortcutHint && (
            <span className={styles.searchBar__shortcutWrap} aria-hidden="true">
              <Sparkles size={11} className={styles.searchBar__sparkle} />
              <kbd className={styles.searchBar__kbd}>{shortcutHint}</kbd>
            </span>
          )
        )}
      </div>
    </div>
  );
};
