import React from 'react';
import styles from './Button.module.css';

export type ButtonVariantType = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
export type ButtonSizeType = 'sm' | 'md' | 'lg';

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariantType;
  size?: ButtonSizeType;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<IButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading = false,
  fullWidth = false,
  disabled,
  className = '',
  type = 'button',
  ...rest
}) => {
  const composedClassName = [
    styles.btn,
    styles[`btn--${variant}`],
    styles[`btn--${size}`],
    fullWidth ? styles['btn--full'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={composedClassName}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading ? (
        <span className={styles.btn__spinner} aria-hidden="true" />
      ) : (
        leftIcon && <span className={styles.btn__icon}>{leftIcon}</span>
      )}
      <span className={styles.btn__label}>{children}</span>
      {!isLoading && rightIcon && <span className={styles.btn__icon}>{rightIcon}</span>}
    </button>
  );
};
