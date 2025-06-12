// src/components/Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button, { ButtonGroup } from './Button';

// Mock the useTranslation hook
jest.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'accessibility.loading': 'Loading'
      };
      return translations[key] || key;
    }
  })
}));

describe('Button Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>);
      
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('btn', 'btn--primary', 'btn--md', 'btn--rounded');
      expect(button).not.toBeDisabled();
    });

    it('renders button text correctly', () => {
      render(<Button>Test Button</Button>);
      
      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Button className="custom-class">Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    const variants = ['primary', 'secondary', 'tertiary', 'ghost', 'danger', 'success', 'warning'] as const;
    
    variants.forEach(variant => {
      it(`renders ${variant} variant correctly`, () => {
        render(<Button variant={variant}>Button</Button>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass(`btn--${variant}`);
      });
    });
  });

  describe('Sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    
    sizes.forEach(size => {
      it(`renders ${size} size correctly`, () => {
        render(<Button size={size}>Button</Button>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass(`btn--${size}`);
      });
    });
  });

  describe('Shapes', () => {
    const shapes = ['rectangle', 'rounded', 'pill', 'circle'] as const;
    
    shapes.forEach(shape => {
      it(`renders ${shape} shape correctly`, () => {
        render(<Button shape={shape}>Button</Button>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass(`btn--${shape}`);
      });
    });
  });

  describe('States', () => {
    it('renders disabled state correctly', () => {
      render(<Button disabled>Disabled Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('btn--disabled');
    });

    it('renders loading state correctly', () => {
      render(<Button loading>Loading Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('btn--loading');
      expect(button).toHaveAttribute('aria-busy', 'true');
      
      // Check for loading spinner
      expect(screen.getByText('Loading')).toBeInTheDocument();
      expect(button.querySelector('.btn__spinner')).toBeInTheDocument();
    });

    it('renders loading state with custom loading text', () => {
      render(<Button loading loadingText="Saving...">Save</Button>);
      
      const button = screen.getByRole('button');
      expect(screen.getAllByText('Saving...')).toHaveLength(2); // Content and sr-only
      expect(button).toHaveAttribute('aria-label', 'Saving...');
    });

    it('renders full width correctly', () => {
      render(<Button fullWidth>Full Width</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn--full-width');
    });
  });

  describe('Icons', () => {
    const MockIcon = () => <span data-testid="mock-icon">Icon</span>;

    it('renders left icon correctly', () => {
      render(<Button leftIcon={<MockIcon />}>Button with Icon</Button>);
      
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
      expect(screen.getByText('Button with Icon')).toBeInTheDocument();
      
      const iconContainer = screen.getByTestId('mock-icon').parentElement;
      expect(iconContainer).toHaveClass('btn__icon', 'btn__icon--left');
    });

    it('renders right icon correctly', () => {
      render(<Button rightIcon={<MockIcon />}>Button with Icon</Button>);
      
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
      
      const iconContainer = screen.getByTestId('mock-icon').parentElement;
      expect(iconContainer).toHaveClass('btn__icon', 'btn__icon--right');
    });

    it('renders icon-only button correctly', () => {
      render(<Button iconOnly leftIcon={<MockIcon />}>Hidden Text</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn--icon-only');
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
      
      // Text should not be visible in icon-only mode
      expect(screen.queryByText('Hidden Text')).not.toBeInTheDocument();
    });

    it('hides icons when loading', () => {
      render(
        <Button 
          loading 
          leftIcon={<MockIcon />} 
          rightIcon={<MockIcon />}
        >
          Loading Button
        </Button>
      );
      
      // Icons should not be visible when loading
      expect(screen.queryByTestId('mock-icon')).not.toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    it('handles click events', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Clickable</Button>);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not trigger click when disabled', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not trigger click when loading', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(<Button loading onClick={handleClick}>Loading</Button>);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles keyboard events', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Keyboard</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<Button aria-label="Custom Label">Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom Label');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('has correct ARIA attributes when loading', () => {
      render(<Button loading>Loading Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-label', 'Loading');
    });

    it('provides screen reader text for loading state', () => {
      render(<Button loading>Button</Button>);
      
      const srText = screen.getByText('Loading');
      expect(srText).toHaveClass('sr-only');
    });

    it('marks icons as decorative', () => {
      const MockIcon = () => <span data-testid="mock-icon">Icon</span>;
      
      render(<Button leftIcon={<MockIcon />}>Button</Button>);
      
      const iconContainer = screen.getByTestId('mock-icon').parentElement;
      expect(iconContainer).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      
      render(<Button ref={ref}>Button</Button>);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toContain('Button');
    });
  });

  describe('HTML Attributes', () => {
    it('passes through additional HTML attributes', () => {
      render(
        <Button 
          id="test-button" 
          data-testid="custom-button"
          title="Tooltip text"
        >
          Button
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('id', 'test-button');
      expect(button).toHaveAttribute('data-testid', 'custom-button');
      expect(button).toHaveAttribute('title', 'Tooltip text');
    });

    it('supports different button types', () => {
      render(<Button type="submit">Submit</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });
});

describe('ButtonGroup Component', () => {
  it('renders with default props', () => {
    render(
      <ButtonGroup>
        <Button>Button 1</Button>
        <Button>Button 2</Button>
      </ButtonGroup>
    );
    
    const group = screen.getByRole('group');
    expect(group).toBeInTheDocument();
    expect(group).toHaveClass('btn-group', 'btn-group--horizontal', 'btn-group--md');
  });

  it('renders all size variants', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    
    sizes.forEach(size => {
      const { container } = render(
        <ButtonGroup size={size}>
          <Button>Button</Button>
        </ButtonGroup>
      );
      
      const group = container.querySelector('.btn-group');
      expect(group).toHaveClass(`btn-group--${size}`);
    });
  });

  it('renders vertical orientation', () => {
    render(
      <ButtonGroup orientation="vertical">
        <Button>Button 1</Button>
        <Button>Button 2</Button>
      </ButtonGroup>
    );
    
    const group = screen.getByRole('group');
    expect(group).toHaveClass('btn-group--vertical');
  });

  it('renders attached style', () => {
    render(
      <ButtonGroup attached>
        <Button>Button 1</Button>
        <Button>Button 2</Button>
      </ButtonGroup>
    );
    
    const group = screen.getByRole('group');
    expect(group).toHaveClass('btn-group--attached');
  });

  it('applies custom className', () => {
    render(
      <ButtonGroup className="custom-group">
        <Button>Button</Button>
      </ButtonGroup>
    );
    
    const group = screen.getByRole('group');
    expect(group).toHaveClass('custom-group');
  });

  it('passes through additional HTML attributes', () => {
    render(
      <ButtonGroup id="test-group" data-testid="button-group">
        <Button>Button</Button>
      </ButtonGroup>
    );
    
    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('id', 'test-group');
    expect(group).toHaveAttribute('data-testid', 'button-group');
  });

  it('renders multiple buttons correctly', () => {
    render(
      <ButtonGroup>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </ButtonGroup>
    );
    
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });
});