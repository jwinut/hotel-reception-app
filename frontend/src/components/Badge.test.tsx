// src/components/Badge.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Badge, { NotificationBadge } from './Badge';

describe('Badge Component', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Badge>Badge Text</Badge>);
      
      const badge = screen.getByText('Badge Text');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass(
        'badge',
        'badge--default',
        'badge--md',
        'badge--rounded'
      );
      expect(badge).toHaveAttribute('role', 'status');
    });

    it('renders with custom content', () => {
      render(<Badge>Custom Content</Badge>);
      
      expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Badge className="custom-badge">Text</Badge>);
      
      const badge = screen.getByText('Text');
      expect(badge).toHaveClass('custom-badge');
    });
  });

  describe('Variants', () => {
    const variants = ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info'] as const;
    
    variants.forEach(variant => {
      it(`renders ${variant} variant correctly`, () => {
        render(<Badge variant={variant}>Text</Badge>);
        
        const badge = screen.getByText('Text');
        expect(badge).toHaveClass(`badge--${variant}`);
      });
    });
  });

  describe('Sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg'] as const;
    
    sizes.forEach(size => {
      it(`renders ${size} size correctly`, () => {
        render(<Badge size={size}>Text</Badge>);
        
        const badge = screen.getByText('Text');
        expect(badge).toHaveClass(`badge--${size}`);
      });
    });
  });

  describe('Shapes', () => {
    const shapes = ['rounded', 'pill', 'square'] as const;
    
    shapes.forEach(shape => {
      it(`renders ${shape} shape correctly`, () => {
        render(<Badge shape={shape}>Text</Badge>);
        
        const badge = screen.getByText('Text');
        expect(badge).toHaveClass(`badge--${shape}`);
      });
    });
  });

  describe('Outline Variant', () => {
    it('renders outline badge correctly', () => {
      render(<Badge outline>Outline Badge</Badge>);
      
      const badge = screen.getByText('Outline Badge');
      expect(badge).toHaveClass('badge--outline');
    });

    it('renders filled badge by default', () => {
      render(<Badge>Filled Badge</Badge>);
      
      const badge = screen.getByText('Filled Badge');
      expect(badge).not.toHaveClass('badge--outline');
    });
  });

  describe('Dot Badge', () => {
    it('renders dot badge correctly', () => {
      render(<Badge dot />);
      
      const badge = document.querySelector('.badge--dot');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('badge--dot');
      expect(badge).toHaveAttribute('aria-hidden', 'true');
      expect(badge).not.toHaveAttribute('role');
    });

    it('ignores children when dot is true', () => {
      render(<Badge dot>Ignored Text</Badge>);
      
      expect(screen.queryByText('Ignored Text')).not.toBeInTheDocument();
      const badge = document.querySelector('.badge--dot');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Complex Props Combination', () => {
    it('renders with multiple props correctly', () => {
      render(
        <Badge 
          variant="success" 
          size="lg" 
          shape="pill" 
          outline 
          className="custom-class"
        >
          Success Badge
        </Badge>
      );
      
      const badge = screen.getByText('Success Badge');
      expect(badge).toHaveClass(
        'badge',
        'badge--success',
        'badge--lg',
        'badge--pill',
        'badge--outline',
        'custom-class'
      );
    });
  });
});

describe('NotificationBadge Component', () => {
  describe('Basic Rendering', () => {
    it('renders children correctly', () => {
      render(
        <NotificationBadge count={5}>
          <button>Button</button>
        </NotificationBadge>
      );
      
      expect(screen.getByRole('button', { name: 'Button' })).toBeInTheDocument();
    });

    it('renders badge with count', () => {
      render(
        <NotificationBadge count={5}>
          <button>Button</button>
        </NotificationBadge>
      );
      
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('applies container class', () => {
      render(
        <NotificationBadge count={5}>
          <div>Content</div>
        </NotificationBadge>
      );
      
      const container = screen.getByText('Content').parentElement;
      expect(container).toHaveClass('notification-badge');
    });
  });

  describe('Count Display', () => {
    it('shows count when greater than 0', () => {
      render(
        <NotificationBadge count={3}>
          <div>Content</div>
        </NotificationBadge>
      );
      
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('does not show badge when count is 0 by default', () => {
      render(
        <NotificationBadge count={0}>
          <div>Content</div>
        </NotificationBadge>
      );
      
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('shows badge when count is 0 and showZero is true', () => {
      render(
        <NotificationBadge count={0} showZero>
          <div>Content</div>
        </NotificationBadge>
      );
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('shows max+ when count exceeds max', () => {
      render(
        <NotificationBadge count={150} max={99}>
          <div>Content</div>
        </NotificationBadge>
      );
      
      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('shows exact count when within max', () => {
      render(
        <NotificationBadge count={50} max={99}>
          <div>Content</div>
        </NotificationBadge>
      );
      
      expect(screen.getByText('50')).toBeInTheDocument();
    });
  });

  describe('Positioning', () => {
    const positions = ['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const;
    
    positions.forEach(position => {
      it(`renders ${position} position correctly`, () => {
        render(
          <NotificationBadge count={5} position={position}>
            <div>Content</div>
          </NotificationBadge>
        );
        
        const badge = screen.getByText('5');
        expect(badge).toHaveClass(`notification-badge__badge--${position}`);
      });
    });

    it('uses top-right as default position', () => {
      render(
        <NotificationBadge count={5}>
          <div>Content</div>
        </NotificationBadge>
      );
      
      const badge = screen.getByText('5');
      expect(badge).toHaveClass('notification-badge__badge--top-right');
    });
  });

  describe('Badge Props Inheritance', () => {
    it('passes through badge props correctly', () => {
      render(
        <NotificationBadge 
          count={5} 
          variant="error" 
          size="lg" 
          className="custom-notification"
        >
          <div>Content</div>
        </NotificationBadge>
      );
      
      const badge = screen.getByText('5');
      expect(badge).toHaveClass(
        'badge--error',
        'badge--lg',
        'notification-badge__badge',
        'custom-notification'
      );
    });

    it('combines custom className with position class', () => {
      render(
        <NotificationBadge 
          count={5} 
          position="bottom-left"
          className="custom-class"
        >
          <div>Content</div>
        </NotificationBadge>
      );
      
      const badge = screen.getByText('5');
      expect(badge).toHaveClass(
        'notification-badge__badge--bottom-left',
        'custom-class'
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined className gracefully', () => {
      render(
        <NotificationBadge count={5}>
          <div>Content</div>
        </NotificationBadge>
      );
      
      const badge = screen.getByText('5');
      expect(badge).toHaveClass('notification-badge__badge');
    });

    it('handles zero max value', () => {
      render(
        <NotificationBadge count={5} max={0}>
          <div>Content</div>
        </NotificationBadge>
      );
      
      expect(screen.getByText('0+')).toBeInTheDocument();
    });

    it('handles negative count', () => {
      render(
        <NotificationBadge count={-5}>
          <div>Content</div>
        </NotificationBadge>
      );
      
      expect(screen.queryByText('-5')).not.toBeInTheDocument();
    });
  });
});