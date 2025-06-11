// src/components/Badge.tsx
import React, { ReactNode } from 'react';
import './Badge.css';

export interface BadgeProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill' | 'square';
  outline?: boolean;
  dot?: boolean;
  children?: ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  outline = false,
  dot = false,
  children,
  className = '',
}) => {
  const badgeClasses = [
    'badge',
    `badge--${variant}`,
    `badge--${size}`,
    `badge--${shape}`,
    outline && 'badge--outline',
    dot && 'badge--dot',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (dot) {
    return <span className={badgeClasses} aria-hidden="true" />;
  }

  return (
    <span className={badgeClasses} role="status">
      {children}
    </span>
  );
};

// Badge with positioning for notifications
export interface NotificationBadgeProps extends BadgeProps {
  count?: number;
  max?: number;
  showZero?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  children: ReactNode;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count = 0,
  max = 99,
  showZero = false,
  position = 'top-right',
  children,
  ...badgeProps
}) => {
  const displayCount = count > max ? `${max}+` : count.toString();
  const shouldShow = count > 0 || showZero;

  return (
    <div className="notification-badge">
      {children}
      {shouldShow && (
        <Badge
          {...badgeProps}
          className={`notification-badge__badge notification-badge__badge--${position} ${badgeProps.className || ''}`}
        >
          {displayCount}
        </Badge>
      )}
    </div>
  );
};

export default Badge;