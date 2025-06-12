// src/components/AccessibleButton.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import AccessibleButton from './AccessibleButton';

// Mock the accessibility utils
jest.mock('../utils/accessibility');

// Import mocked functions
import { createButtonAriaProps, isEnterOrSpace } from '../utils/accessibility';

// Cast to jest mocks
const mockCreateButtonAriaProps = createButtonAriaProps as jest.MockedFunction<typeof createButtonAriaProps>;
const mockIsEnterOrSpace = isEnterOrSpace as jest.MockedFunction<typeof isEnterOrSpace>;

// Setup i18n for testing
i18n.init({
  lng: 'th',
  fallbackLng: 'en',
  resources: {
    th: {
      translation: {
        accessibility: {
          loading: 'กำลังโหลด'
        }
      }
    },
    en: {
      translation: {
        accessibility: {
          loading: 'Loading'
        }
      }
    }
  }
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nextProvider i18n={i18n}>
    {children}
  </I18nextProvider>
);

describe('AccessibleButton Component', () => {
  // OPTIMIZATION: Add fake timers for consistency
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock implementations
    mockCreateButtonAriaProps.mockImplementation((isPressed, isExpanded, controls, describedBy) => ({
      'aria-pressed': isPressed,
      'aria-expanded': isExpanded,
      'aria-controls': controls,
      'aria-describedby': describedBy,
    }));
    
    mockIsEnterOrSpace.mockImplementation((event) => {
      return event.key === 'Enter' || event.key === ' ';
    });
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(
        <TestWrapper>
          <AccessibleButton>Click me</AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('accessible-button', 'btn-primary', 'btn-medium');
      expect(button).toHaveAttribute('type', 'button');
      expect(button).not.toBeDisabled();
    });

    it('renders button text correctly', () => {
      render(
        <TestWrapper>
          <AccessibleButton>Test Button</AccessibleButton>
        </TestWrapper>
      );

      expect(screen.getByText('Test Button')).toBeInTheDocument();
      expect(screen.getByText('Test Button')).toHaveClass('btn-content');
    });

    it('applies custom className', () => {
      render(
        <TestWrapper>
          <AccessibleButton className="custom-class">Button</AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('passes through HTML button attributes', () => {
      render(
        <TestWrapper>
          <AccessibleButton
            id="test-button"
            data-testid="custom-button"
            title="Tooltip text"
          >
            Button
          </AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('id', 'test-button');
      expect(button).toHaveAttribute('data-testid', 'custom-button');
      expect(button).toHaveAttribute('title', 'Tooltip text');
    });
  });

  describe('Variants', () => {
    const variants = ['primary', 'secondary', 'danger', 'ghost'] as const;

    variants.forEach(variant => {
      it(`renders ${variant} variant correctly`, () => {
        render(
          <TestWrapper>
            <AccessibleButton variant={variant}>Button</AccessibleButton>
          </TestWrapper>
        );

        const button = screen.getByRole('button');
        expect(button).toHaveClass(`btn-${variant}`);
      });
    });

    it('defaults to primary variant', () => {
      render(
        <TestWrapper>
          <AccessibleButton>Button</AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-primary');
    });
  });

  describe('Sizes', () => {
    const sizes = ['small', 'medium', 'large'] as const;

    sizes.forEach(size => {
      it(`renders ${size} size correctly`, () => {
        render(
          <TestWrapper>
            <AccessibleButton size={size}>Button</AccessibleButton>
          </TestWrapper>
        );

        const button = screen.getByRole('button');
        expect(button).toHaveClass(`btn-${size}`);
      });
    });

    it('defaults to medium size', () => {
      render(
        <TestWrapper>
          <AccessibleButton>Button</AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-medium');
    });
  });

  describe('Loading State', () => {
    it('renders loading state correctly', () => {
      render(
        <TestWrapper>
          <AccessibleButton isLoading>Loading Button</AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('btn-loading');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-label', 'กำลังโหลด');
    });

    it('shows loading spinner when loading', () => {
      render(
        <TestWrapper>
          <AccessibleButton isLoading>Loading Button</AccessibleButton>
        </TestWrapper>
      );

      const spinner = screen.getByRole('button').querySelector('.btn-spinner');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
      expect(spinner?.querySelector('svg')).toBeInTheDocument();
    });

    it('shows screen reader text when loading', () => {
      render(
        <TestWrapper>
          <AccessibleButton isLoading>Loading Button</AccessibleButton>
        </TestWrapper>
      );

      const srText = screen.getByText('กำลังโหลด');
      expect(srText).toHaveClass('sr-only');
    });

    it('hides icons when loading', () => {
      const TestIcon = () => <span data-testid="test-icon">Icon</span>;
      
      render(
        <TestWrapper>
          <AccessibleButton isLoading icon={<TestIcon />}>
            Loading Button
          </AccessibleButton>
        </TestWrapper>
      );

      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('renders disabled state correctly', () => {
      render(
        <TestWrapper>
          <AccessibleButton disabled>Disabled Button</AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('btn-disabled');
    });

    it('does not trigger click when disabled', () => {
      const handleClick = jest.fn();

      render(
        <TestWrapper>
          <AccessibleButton disabled onClick={handleClick}>
            Disabled Button
          </AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not trigger keyboard events when disabled', () => {
      const handleClick = jest.fn();

      render(
        <TestWrapper>
          <AccessibleButton disabled onClick={handleClick}>
            Disabled Button
          </AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Icons', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;

    it('renders left icon correctly', () => {
      render(
        <TestWrapper>
          <AccessibleButton icon={<TestIcon />} iconPosition="left">
            Button with Icon
          </AccessibleButton>
        </TestWrapper>
      );

      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
      
      const iconContainer = icon.parentElement;
      expect(iconContainer).toHaveClass('btn-icon', 'btn-icon-left');
      expect(iconContainer).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders right icon correctly', () => {
      render(
        <TestWrapper>
          <AccessibleButton icon={<TestIcon />} iconPosition="right">
            Button with Icon
          </AccessibleButton>
        </TestWrapper>
      );

      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
      
      const iconContainer = icon.parentElement;
      expect(iconContainer).toHaveClass('btn-icon', 'btn-icon-right');
    });

    it('defaults to left icon position', () => {
      render(
        <TestWrapper>
          <AccessibleButton icon={<TestIcon />}>
            Button with Icon
          </AccessibleButton>
        </TestWrapper>
      );

      const icon = screen.getByTestId('test-icon');
      const iconContainer = icon.parentElement;
      expect(iconContainer).toHaveClass('btn-icon-left');
    });

    it('does not render icon when not provided', () => {
      render(
        <TestWrapper>
          <AccessibleButton>Button without Icon</AccessibleButton>
        </TestWrapper>
      );

      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
      expect(screen.getByRole('button').querySelector('.btn-icon')).not.toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    it('handles click events correctly', () => {
      const handleClick = jest.fn();

      render(
        <TestWrapper>
          <AccessibleButton onClick={handleClick}>Clickable</AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not trigger click when loading', () => {
      const handleClick = jest.fn();

      render(
        <TestWrapper>
          <AccessibleButton isLoading onClick={handleClick}>
            Loading Button
          </AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles Enter key press', () => {
      const handleClick = jest.fn();
      mockIsEnterOrSpace.mockReturnValue(true);

      render(
        <TestWrapper>
          <AccessibleButton onClick={handleClick}>Button</AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(mockIsEnterOrSpace).toHaveBeenCalled();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles Space key press', () => {
      const handleClick = jest.fn();
      mockIsEnterOrSpace.mockReturnValue(true);

      render(
        <TestWrapper>
          <AccessibleButton onClick={handleClick}>Button</AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });

      expect(mockIsEnterOrSpace).toHaveBeenCalled();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not handle other keys', () => {
      const handleClick = jest.fn();
      mockIsEnterOrSpace.mockReturnValue(false);

      render(
        <TestWrapper>
          <AccessibleButton onClick={handleClick}>Button</AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'a' });

      expect(mockIsEnterOrSpace).toHaveBeenCalled();
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('calls custom onKeyDown handler', () => {
      const handleKeyDown = jest.fn();
      const handleClick = jest.fn();

      render(
        <TestWrapper>
          <AccessibleButton onClick={handleClick} onKeyDown={handleKeyDown}>
            Button
          </AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Tab' });

      expect(handleKeyDown).toHaveBeenCalled();
    });
  });

  describe('ARIA Attributes', () => {
    it('sets correct ARIA attributes from props', () => {
      mockCreateButtonAriaProps.mockReturnValue({
        'aria-pressed': true,
        'aria-expanded': false,
        'aria-controls': 'menu-123',
        'aria-describedby': 'description-123'
      });

      render(
        <TestWrapper>
          <AccessibleButton
            isPressed={true}
            isExpanded={false}
            controls="menu-123"
            describedBy="description-123"
          >
            Toggle Button
          </AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(mockCreateButtonAriaProps).toHaveBeenCalledWith(
        true,
        false,
        'menu-123',
        'description-123'
      );
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-controls', 'menu-123');
      expect(button).toHaveAttribute('aria-describedby', 'description-123');
    });

    it('handles undefined ARIA props gracefully', () => {
      mockCreateButtonAriaProps.mockReturnValue({
        'aria-pressed': undefined,
        'aria-expanded': undefined,
        'aria-controls': undefined,
        'aria-describedby': undefined
      });

      render(
        <TestWrapper>
          <AccessibleButton>Simple Button</AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('aria-pressed');
      expect(button).not.toHaveAttribute('aria-expanded');
      expect(button).not.toHaveAttribute('aria-controls');
      expect(button).not.toHaveAttribute('aria-describedby');
    });

    it('sets aria-busy when loading', () => {
      render(
        <TestWrapper>
          <AccessibleButton isLoading>Loading</AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('does not set aria-busy when not loading', () => {
      render(
        <TestWrapper>
          <AccessibleButton>Not Loading</AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'false');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();

      render(
        <TestWrapper>
          <AccessibleButton ref={ref}>Button with Ref</AccessibleButton>
        </TestWrapper>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toContain('Button with Ref');
    });

    it('allows ref to be used for focus management', () => {
      const ref = React.createRef<HTMLButtonElement>();

      render(
        <TestWrapper>
          <AccessibleButton ref={ref}>Focus Button</AccessibleButton>
        </TestWrapper>
      );

      expect(ref.current?.focus).toBeDefined();
      expect(typeof ref.current?.focus).toBe('function');
    });
  });

  describe('Complex Scenarios', () => {
    it('handles combination of loading and disabled states', () => {
      render(
        <TestWrapper>
          <AccessibleButton isLoading disabled>
            Complex Button
          </AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('btn-loading', 'btn-disabled');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('renders with all props combined', () => {
      const TestIcon = () => <span data-testid="complex-icon">Complex Icon</span>;
      const handleClick = jest.fn();

      mockCreateButtonAriaProps.mockReturnValue({
        'aria-pressed': true,
        'aria-expanded': true,
        'aria-controls': 'complex-menu',
        'aria-describedby': 'complex-description'
      });

      render(
        <TestWrapper>
          <AccessibleButton
            variant="danger"
            size="large"
            icon={<TestIcon />}
            iconPosition="right"
            isPressed={true}
            isExpanded={true}
            controls="complex-menu"
            describedBy="complex-description"
            className="complex-class"
            onClick={handleClick}
          >
            Complex Button
          </AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'accessible-button',
        'btn-danger',
        'btn-large',
        'complex-class'
      );
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(button).toHaveAttribute('aria-controls', 'complex-menu');
      expect(button).toHaveAttribute('aria-describedby', 'complex-description');
      
      const icon = screen.getByTestId('complex-icon');
      expect(icon.parentElement).toHaveClass('btn-icon-right');
    });

    it('maintains accessibility during state transitions', async () => {
      const TestComponent = () => {
        const [isLoading, setIsLoading] = React.useState(false);
        const [isPressed, setIsPressed] = React.useState(false);
        
        return (
          <TestWrapper>
            <AccessibleButton
              isLoading={isLoading}
              isPressed={isPressed}
              onClick={() => {
                setIsLoading(true);
                setIsPressed(!isPressed);
              }}
            >
              State Button
            </AccessibleButton>
            <button onClick={() => setIsLoading(false)}>Stop Loading</button>
          </TestWrapper>
        );
      };

      render(<TestComponent />);
      
      const button = screen.getByRole('button', { name: 'State Button' });
      const stopButton = screen.getByRole('button', { name: 'Stop Loading' });
      
      // Initial state
      expect(button).not.toBeDisabled();
      expect(button).not.toHaveAttribute('aria-busy', 'true');
      
      // Click to start loading
      fireEvent.click(button);
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
      
      // Stop loading
      fireEvent.click(stopButton);
      expect(button).not.toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'false');
    });
  });

  describe('Error Handling', () => {
    it('handles missing onClick gracefully', () => {
      expect(() => {
        render(
          <TestWrapper>
            <AccessibleButton>Button without onClick</AccessibleButton>
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('handles missing children gracefully', () => {
      expect(() => {
        render(
          <TestWrapper>
            <AccessibleButton>{undefined}</AccessibleButton>
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('handles empty string children', () => {
      render(
        <TestWrapper>
          <AccessibleButton>{''}</AccessibleButton>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Accessibility Compliance', () => {
    it('provides proper keyboard navigation', () => {
      const handleClick = jest.fn();

      render(
        <TestWrapper>
          <AccessibleButton onClick={handleClick}>Keyboard Button</AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      
      // Should be focusable
      button.focus();
      expect(button).toHaveFocus();
      
      // Should respond to Enter key
      mockIsEnterOrSpace.mockReturnValue(true);
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
    });

    it('provides proper screen reader support', () => {
      render(
        <TestWrapper>
          <AccessibleButton isLoading>Screen Reader Button</AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      
      // Should have proper aria-label when loading
      expect(button).toHaveAttribute('aria-label', 'กำลังโหลด');
      
      // Should have screen reader only text
      expect(screen.getByText('กำลังโหลด')).toHaveClass('sr-only');
      
      // Icons should be hidden from screen readers
      const spinner = button.querySelector('.btn-spinner');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });

    it('maintains semantic HTML structure', () => {
      render(
        <TestWrapper>
          <AccessibleButton>Semantic Button</AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveAttribute('type', 'button');
    });
  });
});