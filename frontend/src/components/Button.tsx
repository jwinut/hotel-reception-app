// src/components/Button.tsx
import React, { forwardRef, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import './Button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'rectangle' | 'rounded' | 'pill' | 'circle';
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  iconOnly?: boolean;
  children?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      shape = 'rounded',
      fullWidth = false,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      iconOnly = false,
      disabled,
      className = '',
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation();

    const isDisabled = disabled || loading;

    const buttonClasses = [
      'btn',
      `btn--${variant}`,
      `btn--${size}`,
      `btn--${shape}`,
      fullWidth && 'btn--full-width',
      loading && 'btn--loading',
      iconOnly && 'btn--icon-only',
      isDisabled && 'btn--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled && onClick) {
        onClick(e);
      }
    };

    const buttonContent = (
      <>
        {/* Loading Spinner */}
        {loading && (
          <span className="btn__spinner" aria-hidden="true">
            <svg
              className="btn__spinner-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="32"
                strokeDashoffset="32"
              >
                <animate
                  attributeName="stroke-dasharray"
                  dur="2s"
                  values="0 32;16 16;0 32;0 32"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="stroke-dashoffset"
                  dur="2s"
                  values="0;-16;-32;-32"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </span>
        )}

        {/* Left Icon */}
        {!loading && leftIcon && (
          <span className="btn__icon btn__icon--left" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        {/* Button Content */}
        {!iconOnly && (
          <span className="btn__content">
            {loading && loadingText ? loadingText : children}
          </span>
        )}

        {/* Right Icon */}
        {!loading && rightIcon && (
          <span className="btn__icon btn__icon--right" aria-hidden="true">
            {rightIcon}
          </span>
        )}

        {/* Screen Reader Loading Text */}
        {loading && (
          <span className="sr-only">
            {loadingText || t('accessibility.loading')}
          </span>
        )}
      </>
    );

    return (
      <button
        ref={ref}
        type="button"
        className={buttonClasses}
        disabled={isDisabled}
        aria-busy={loading}
        aria-label={loading ? (loadingText || t('accessibility.loading')) : props['aria-label']}
        onClick={handleClick}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Button Group Component
export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  orientation?: 'horizontal' | 'vertical';
  attached?: boolean;
  children: ReactNode;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  size = 'md',
  orientation = 'horizontal',
  attached = false,
  className = '',
  children,
  ...props
}) => {
  const groupClasses = [
    'btn-group',
    `btn-group--${orientation}`,
    `btn-group--${size}`,
    attached && 'btn-group--attached',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={groupClasses} role="group" {...props}>
      {children}
    </div>
  );
};

export default Button;