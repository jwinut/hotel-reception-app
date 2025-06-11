// src/components/Card.tsx
import React, { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import './Card.css';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
  interactive?: boolean;
  loading?: boolean;
  children: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      size = 'md',
      padding = 'md',
      radius = 'md',
      shadow = 'sm',
      hoverable = false,
      interactive = false,
      loading = false,
      className = '',
      children,
      onClick,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation();

    const cardClasses = [
      'card',
      `card--${variant}`,
      `card--size-${size}`,
      `card--padding-${padding}`,
      `card--radius-${radius}`,
      `card--shadow-${shadow}`,
      hoverable && 'card--hoverable',
      interactive && 'card--interactive',
      loading && 'card--loading',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (interactive && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick?.(e as any);
      }
      onKeyDown?.(e);
    };

    const cardProps = {
      ...props,
      ref,
      className: cardClasses,
      onClick: interactive ? onClick : undefined,
      onKeyDown: interactive ? handleKeyDown : undefined,
      role: interactive ? 'button' : props.role,
      tabIndex: interactive ? 0 : props.tabIndex,
      'aria-busy': loading,
      'aria-label': loading ? t('accessibility.loading') : props['aria-label'],
    };

    return (
      <div {...cardProps}>
        {loading && (
          <div className="card__loading-overlay" aria-hidden="true">
            <div className="card__spinner">
              <svg
                className="card__spinner-icon"
                width="20"
                height="20"
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
            </div>
          </div>
        )}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`card__header ${className}`.trim()} {...props}>
      {(title || subtitle) && (
        <div className="card__header-content">
          {title && (
            <h3 className="card__title">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="card__subtitle">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {action && (
        <div className="card__header-action">
          {action}
        </div>
      )}
      {children}
    </div>
  );
};

// Card Body Component
export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`card__body ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

// Card Footer Component
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  align = 'right',
  className = '',
  ...props
}) => {
  return (
    <div 
      className={`card__footer card__footer--${align} ${className}`.trim()} 
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;