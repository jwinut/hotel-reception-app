// src/components/AccessibleButton.tsx
import React, { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { createButtonAriaProps, isEnterOrSpace } from '../utils/accessibility';
import { useTranslation } from 'react-i18next';

export interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  isPressed?: boolean;
  isExpanded?: boolean;
  controls?: string;
  describedBy?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      isLoading = false,
      isPressed,
      isExpanded,
      controls,
      describedBy,
      icon,
      iconPosition = 'left',
      children,
      disabled,
      className = '',
      onKeyDown,
      onClick,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation();
    const ariaProps = createButtonAriaProps(isPressed, isExpanded, controls, describedBy);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      // Handle Enter and Space keys for accessibility
      if (isEnterOrSpace(event.nativeEvent) && !disabled && !isLoading) {
        event.preventDefault();
        onClick?.(event as any);
      }
      onKeyDown?.(event);
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !isLoading) {
        onClick?.(event);
      }
    };

    const getVariantClass = () => {
      switch (variant) {
        case 'primary':
          return 'btn-primary';
        case 'secondary':
          return 'btn-secondary';
        case 'danger':
          return 'btn-danger';
        case 'ghost':
          return 'btn-ghost';
        default:
          return 'btn-primary';
      }
    };

    const getSizeClass = () => {
      switch (size) {
        case 'small':
          return 'btn-small';
        case 'medium':
          return 'btn-medium';
        case 'large':
          return 'btn-large';
        default:
          return 'btn-medium';
      }
    };

    const buttonClasses = [
      'accessible-button',
      getVariantClass(),
      getSizeClass(),
      isLoading && 'btn-loading',
      disabled && 'btn-disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type="button"
        className={buttonClasses}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        aria-label={isLoading ? t('accessibility.loading') : undefined}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        {...ariaProps}
        {...props}
      >
        {isLoading && (
          <span className="btn-spinner" aria-hidden="true">
            <svg
              className="spinner"
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
        
        {!isLoading && icon && iconPosition === 'left' && (
          <span className="btn-icon btn-icon-left" aria-hidden="true">
            {icon}
          </span>
        )}
        
        <span className="btn-content">
          {children}
        </span>
        
        {!isLoading && icon && iconPosition === 'right' && (
          <span className="btn-icon btn-icon-right" aria-hidden="true">
            {icon}
          </span>
        )}
        
        {/* Screen reader text for loading state */}
        {isLoading && (
          <span className="sr-only">{t('accessibility.loading')}</span>
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;