import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import styles from './Dropdown.module.css';

export interface IDropdownOption<T extends string> {
  label: string;
  value: T;
  description?: string;
}

export interface IDropdownProps<T extends string> {
  label?: string;
  value: T;
  options: ReadonlyArray<IDropdownOption<T>>;
  onChange: (value: T) => void;
  ariaLabel: string;
  icon?: React.ReactNode;
}

export function Dropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  ariaLabel,
  icon,
}: IDropdownProps<T>): React.ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((opt) => opt.value === value) ?? options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.dropdown} ref={rootRef}>
      <button
        type="button"
        className={styles.dropdown__trigger}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        {icon && <span className={styles.dropdown__icon}>{icon}</span>}
        {label && <span className={styles.dropdown__prefix}>{label}:</span>}
        <span className={styles.dropdown__value}>{selectedOption?.label}</span>
        <ChevronDown
          size={15}
          className={`${styles.dropdown__chevron} ${
            isOpen ? styles['dropdown__chevron--open'] : ''
          }`}
        />
      </button>

      {isOpen && (
        <ul className={styles.dropdown__menu} role="listbox" aria-label={ariaLabel}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  className={`${styles.dropdown__item} ${
                    isSelected ? styles['dropdown__item--selected'] : ''
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <div className={styles.dropdown__itemText}>
                    <span>{option.label}</span>
                    {option.description && (
                      <small className={styles.dropdown__itemDesc}>{option.description}</small>
                    )}
                  </div>
                  {isSelected && <Check size={14} className={styles.dropdown__check} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
