// src/components/Input.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';

// Mock the useTranslation hook
jest.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'app.clear': 'Clear',
        'accessibility.error': 'Error'
      };
      return translations[key] || key;
    }
  })
}));

// Mock the accessibility utils
jest.mock('../utils/accessibility', () => ({
  generateId: (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}));

describe('Input Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Input />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass('input-field__input');
      expect(input.closest('.input-field')).toHaveClass(
        'input-field',
        'input-field--default',
        'input-field--md'
      );
    });

    it('renders with custom value', () => {
      render(<Input value="test value" onChange={() => {}} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('test value');
    });

    it('applies custom className', () => {
      render(<Input className="custom-input" />);
      
      const container = screen.getByRole('textbox').closest('.input-field');
      expect(container).toHaveClass('custom-input');
    });

    it('generates unique IDs when not provided', () => {
      render(<Input label="Test Label" />);
      
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Test Label');
      
      expect(input).toHaveAttribute('id');
      expect(label).toHaveAttribute('for', input.getAttribute('id'));
    });

    it('uses provided ID', () => {
      render(<Input id="custom-id" label="Test Label" />);
      
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Test Label');
      
      expect(input).toHaveAttribute('id', 'custom-id');
      expect(label).toHaveAttribute('for', 'custom-id');
    });
  });

  describe('Variants', () => {
    const variants = ['default', 'filled', 'outlined', 'underlined'] as const;
    
    variants.forEach(variant => {
      it(`renders ${variant} variant correctly`, () => {
        render(<Input variant={variant} />);
        
        const container = screen.getByRole('textbox').closest('.input-field');
        expect(container).toHaveClass(`input-field--${variant}`);
      });
    });
  });

  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    
    sizes.forEach(size => {
      it(`renders ${size} size correctly`, () => {
        render(<Input size={size} />);
        
        const container = screen.getByRole('textbox').closest('.input-field');
        expect(container).toHaveClass(`input-field--${size}`);
      });
    });
  });

  describe('Label and Required', () => {
    it('renders label correctly', () => {
      render(<Input label="Email Address" />);
      
      expect(screen.getByText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    });

    it('renders required indicator', () => {
      render(<Input label="Email" required />);
      
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByText('*')).toHaveClass('input-field__required');
    });

    it('associates label with input correctly', () => {
      render(<Input label="Username" id="username-field" />);
      
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Username');
      
      expect(label.tagName).toBe('LABEL');
      expect(label).toHaveAttribute('for', 'username-field');
      expect(input).toHaveAttribute('id', 'username-field');
    });
  });

  describe('States', () => {
    it('renders disabled state correctly', () => {
      render(<Input disabled />);
      
      const input = screen.getByRole('textbox');
      const container = input.closest('.input-field');
      
      expect(input).toBeDisabled();
      expect(container).toHaveClass('input-field--disabled');
    });

    it('renders loading state correctly', () => {
      render(<Input loading />);
      
      const input = screen.getByRole('textbox');
      const container = input.closest('.input-field');
      
      expect(input).toBeDisabled();
      expect(container).toHaveClass('input-field--disabled');
      expect(container?.querySelector('.input-field__spinner')).toBeInTheDocument();
    });

    it('renders error state correctly', () => {
      render(<Input error="This field is required" />);
      
      const input = screen.getByRole('textbox');
      const container = input.closest('.input-field');
      
      expect(container).toHaveClass('input-field--error');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders error state with boolean error', () => {
      render(<Input error={true} />);
      
      const input = screen.getByRole('textbox');
      const container = input.closest('.input-field');
      
      expect(container).toHaveClass('input-field--error');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('renders success state correctly', () => {
      render(<Input success />);
      
      const container = screen.getByRole('textbox').closest('.input-field');
      expect(container).toHaveClass('input-field--success');
    });

    it('renders full width correctly', () => {
      render(<Input fullWidth />);
      
      const container = screen.getByRole('textbox').closest('.input-field');
      expect(container).toHaveClass('input-field--full-width');
    });
  });

  describe('Helper Text', () => {
    it('renders helper text correctly', () => {
      render(<Input helperText="Enter your email address" />);
      
      const helperText = screen.getByText('Enter your email address');
      const input = screen.getByRole('textbox');
      
      expect(helperText).toBeInTheDocument();
      expect(helperText).toHaveClass('input-field__helper');
      expect(input).toHaveAttribute('aria-describedby', helperText.getAttribute('id'));
    });

    it('hides helper text when error is present', () => {
      render(
        <Input 
          helperText="This is helpful" 
          error="This is an error" 
        />
      );
      
      expect(screen.queryByText('This is helpful')).not.toBeInTheDocument();
      expect(screen.getByText('This is an error')).toBeInTheDocument();
    });

    it('associates helper text with input via aria-describedby', () => {
      render(<Input helperText="Helper text" />);
      
      const input = screen.getByRole('textbox');
      const helperText = screen.getByText('Helper text');
      
      expect(input).toHaveAttribute('aria-describedby', helperText.getAttribute('id'));
    });
  });

  describe('Icons and Addons', () => {
    const MockIcon = () => <span data-testid="mock-icon">Icon</span>;
    const MockAddon = () => <span data-testid="mock-addon">Addon</span>;

    it('renders left icon correctly', () => {
      render(<Input leftIcon={<MockIcon />} />);
      
      const container = screen.getByRole('textbox').closest('.input-field');
      expect(container).toHaveClass('input-field--has-left-icon');
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
      
      const iconContainer = screen.getByTestId('mock-icon').parentElement;
      expect(iconContainer).toHaveClass('input-field__icon', 'input-field__icon--left');
      expect(iconContainer).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders right icon correctly', () => {
      render(<Input rightIcon={<MockIcon />} />);
      
      const container = screen.getByRole('textbox').closest('.input-field');
      expect(container).toHaveClass('input-field--has-right-icon');
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
      
      const iconContainer = screen.getByTestId('mock-icon').parentElement;
      expect(iconContainer).toHaveClass('input-field__icon', 'input-field__icon--right');
    });

    it('renders left addon correctly', () => {
      render(<Input leftAddon={<MockAddon />} />);
      
      const container = screen.getByRole('textbox').closest('.input-field');
      expect(container).toHaveClass('input-field--has-left-addon');
      expect(screen.getByTestId('mock-addon')).toBeInTheDocument();
      
      const addonContainer = screen.getByTestId('mock-addon').parentElement;
      expect(addonContainer).toHaveClass('input-field__addon', 'input-field__addon--left');
    });

    it('renders right addon correctly', () => {
      render(<Input rightAddon={<MockAddon />} />);
      
      const container = screen.getByRole('textbox').closest('.input-field');
      expect(container).toHaveClass('input-field--has-right-addon');
      expect(screen.getByTestId('mock-addon')).toBeInTheDocument();
      
      const addonContainer = screen.getByTestId('mock-addon').parentElement;
      expect(addonContainer).toHaveClass('input-field__addon', 'input-field__addon--right');
    });

    it('hides right icon when loading', () => {
      render(<Input rightIcon={<MockIcon />} loading />);
      
      expect(screen.queryByTestId('mock-icon')).not.toBeInTheDocument();
      expect(screen.getByRole('textbox').closest('.input-field')?.querySelector('.input-field__spinner')).toBeInTheDocument();
    });
  });

  describe('Clear Functionality', () => {
    it('shows clear button when clearable and has value', () => {
      render(<Input clearable value="test" onChange={() => {}} />);
      
      const clearButton = screen.getByRole('button', { name: 'Clear' });
      expect(clearButton).toBeInTheDocument();
      expect(clearButton).toHaveClass('input-field__clear');
    });

    it('does not show clear button when no value', () => {
      render(<Input clearable value="" onChange={() => {}} />);
      
      expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
    });

    it('does not show clear button when disabled', () => {
      render(<Input clearable value="test" disabled onChange={() => {}} />);
      
      expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
    });

    it('calls onClear when clear button is clicked', async () => {
      const onClear = jest.fn();
      const onChange = jest.fn();
      const user = userEvent.setup();
      
      render(<Input clearable value="test" onClear={onClear} onChange={onChange} />);
      
      const clearButton = screen.getByRole('button', { name: 'Clear' });
      await user.click(clearButton);
      
      expect(onClear).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: '' }),
          currentTarget: expect.objectContaining({ value: '' })
        })
      );
    });

    it('hides right icon when clear button is shown', () => {
      const MockIcon = () => <span data-testid="mock-icon">Icon</span>;
      
      render(
        <Input 
          rightIcon={<MockIcon />} 
          clearable 
          value="test" 
          onChange={() => {}} 
        />
      );
      
      expect(screen.queryByTestId('mock-icon')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('handles focus events correctly', async () => {
      const onFocus = jest.fn();
      const user = userEvent.setup();
      
      render(<Input onFocus={onFocus} />);
      
      const input = screen.getByRole('textbox');
      await user.click(input);
      
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(input.closest('.input-field')).toHaveClass('input-field--focused');
    });

    it('handles blur events correctly', async () => {
      const onBlur = jest.fn();
      const user = userEvent.setup();
      
      render(<Input onBlur={onBlur} />);
      
      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab(); // Move focus away
      
      expect(onBlur).toHaveBeenCalledTimes(1);
      expect(input.closest('.input-field')).not.toHaveClass('input-field--focused');
    });

    it('adds focused class when input is focused', async () => {
      const user = userEvent.setup();
      
      render(<Input />);
      
      const input = screen.getByRole('textbox');
      const container = input.closest('.input-field');
      
      expect(container).not.toHaveClass('input-field--focused');
      
      await user.click(input);
      expect(container).toHaveClass('input-field--focused');
      
      await user.tab();
      expect(container).not.toHaveClass('input-field--focused');
    });
  });

  describe('Value States', () => {
    it('adds has-value class when input has value', () => {
      render(<Input value="test" onChange={() => {}} />);
      
      const container = screen.getByRole('textbox').closest('.input-field');
      expect(container).toHaveClass('input-field--has-value');
    });

    it('does not add has-value class when input is empty', () => {
      render(<Input value="" onChange={() => {}} />);
      
      const container = screen.getByRole('textbox').closest('.input-field');
      expect(container).not.toHaveClass('input-field--has-value');
    });
  });

  describe('Event Handling', () => {
    it('handles onChange events', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      
      render(<Input onChange={onChange} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'hello');
      
      expect(onChange).toHaveBeenCalled();
    });

    it('handles keyboard events', async () => {
      const onKeyDown = jest.fn();
      const user = userEvent.setup();
      
      render(<Input onKeyDown={onKeyDown} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'a');
      
      expect(onKeyDown).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<Input required />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('required');
    });

    it('associates error message with input', () => {
      render(<Input error="Error message" />);
      
      const input = screen.getByRole('textbox');
      const errorMessage = screen.getByRole('alert');
      
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', errorMessage.getAttribute('id'));
    });

    it('associates both helper text and error with input', () => {
      render(<Input helperText="Help" error="Error" />);
      
      const input = screen.getByRole('textbox');
      const errorMessage = screen.getByRole('alert');
      
      // Should include error ID in aria-describedby (helper text is hidden when error is present)
      expect(input.getAttribute('aria-describedby')).toContain(errorMessage.getAttribute('id'));
    });

    it('clear button has correct accessibility attributes', () => {
      render(<Input clearable value="test" onChange={() => {}} />);
      
      const clearButton = screen.getByRole('button', { name: 'Clear' });
      expect(clearButton).toHaveAttribute('aria-label', 'Clear');
      expect(clearButton).toHaveAttribute('tabIndex', '-1');
      expect(clearButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      
      render(<Input ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current).toHaveClass('input-field__input');
    });
  });

  describe('HTML Attributes', () => {
    it('passes through additional HTML attributes', () => {
      render(
        <Input 
          placeholder="Enter text"
          maxLength={50}
          data-testid="custom-input"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Enter text');
      expect(input).toHaveAttribute('maxLength', '50');
      expect(input).toHaveAttribute('data-testid', 'custom-input');
    });

    it('supports different input types', () => {
      render(<Input type="email" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('supports password input type', () => {
      render(<Input type="password" data-testid="password-input" />);
      
      // Password inputs don't have the textbox role, query by test id
      const input = screen.getByTestId('password-input');
      expect(input).toHaveAttribute('type', 'password');
    });
  });
});