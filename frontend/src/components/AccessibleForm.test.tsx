import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import {
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormRadioGroup,
  FormErrorSummary
} from './AccessibleForm';

// Mock the accessibility utils module
jest.mock('../utils/accessibility');

// Import mocked functions
import { generateId, createAriaDescription, createErrorAriaProps } from '../utils/accessibility';

// Cast to jest mocks
const mockGenerateId = generateId as jest.MockedFunction<typeof generateId>;
const mockCreateAriaDescription = createAriaDescription as jest.MockedFunction<typeof createAriaDescription>;
const mockCreateErrorAriaProps = createErrorAriaProps as jest.MockedFunction<typeof createErrorAriaProps>;

// Setup i18n for testing
i18n.init({
  lng: 'th',
  fallbackLng: 'en',
  resources: {
    th: {
      translation: {
        accessibility: {
          required: 'จำเป็น'
        },
        forms: {
          errorSummary: {
            title: 'กรุณาแก้ไขข้อผิดพลาดต่อไปนี้'
          }
        }
      }
    },
    en: {
      translation: {
        accessibility: {
          required: 'Required'
        },
        forms: {
          errorSummary: {
            title: 'Please fix the following errors'
          }
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

describe('AccessibleForm Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock implementations
    let mockIdCounter = 0;
    mockGenerateId.mockImplementation((prefix = 'id') => {
      mockIdCounter++;
      return `${prefix}-${mockIdCounter}`;
    });
    
    mockCreateAriaDescription.mockImplementation((fieldId, errors) => ({
      id: `${fieldId}-description`,
      text: errors.join('. ')
    }));
    
    mockCreateErrorAriaProps.mockImplementation((hasError, errorMessage) => ({
      'aria-invalid': hasError,
      'aria-describedby': hasError && errorMessage ? `error-123` : undefined
    }));
  });

  describe('FormGroup', () => {
    it('renders children with correct class', () => {
      render(
        <FormGroup>
          <div data-testid="child">Test content</div>
        </FormGroup>
      );

      const group = screen.getByTestId('child').parentElement;
      expect(group).toHaveClass('form-group');
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <FormGroup className="custom-class">
          <div data-testid="child">Test content</div>
        </FormGroup>
      );

      const group = screen.getByTestId('child').parentElement;
      expect(group).toHaveClass('form-group', 'custom-class');
    });

    it('handles empty className gracefully', () => {
      render(
        <FormGroup className="">
          <div data-testid="child">Test content</div>
        </FormGroup>
      );

      const group = screen.getByTestId('child').parentElement;
      expect(group).toHaveClass('form-group');
      expect(group?.className).toBe('form-group');
    });
  });

  describe('FormLabel', () => {
    it('renders label with correct htmlFor attribute', () => {
      render(
        <TestWrapper>
          <FormLabel htmlFor="test-input">Test Label</FormLabel>
        </TestWrapper>
      );

      const label = screen.getByText('Test Label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('for', 'test-input');
      expect(label).toHaveClass('form-label');
    });

    it('shows required indicator when required', () => {
      render(
        <TestWrapper>
          <FormLabel htmlFor="test-input" required>
            Required Field
          </FormLabel>
        </TestWrapper>
      );

      const label = screen.getByText('Required Field');
      expect(label).toHaveClass('form-label', 'required');
      expect(screen.getByText('จำเป็น')).toBeInTheDocument();
      expect(screen.getByText('จำเป็น')).toHaveClass('sr-only');
    });

    it('does not show required indicator when not required', () => {
      render(
        <TestWrapper>
          <FormLabel htmlFor="test-input">
            Optional Field
          </FormLabel>
        </TestWrapper>
      );

      const label = screen.getByText('Optional Field');
      expect(label).not.toHaveClass('required');
      expect(screen.queryByText('จำเป็น')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <TestWrapper>
          <FormLabel htmlFor="test-input" className="custom-label">
            Custom Label
          </FormLabel>
        </TestWrapper>
      );

      const label = screen.getByText('Custom Label');
      expect(label).toHaveClass('form-label', 'custom-label');
    });
  });

  describe('FormInput', () => {
    it('renders input with generated ID when no ID provided', () => {
      render(
        <TestWrapper>
          <FormInput placeholder="Test input" />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('Test input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('id');
      expect(input.id).toBeTruthy();
    });

    it('uses provided ID', () => {
      render(
        <TestWrapper>
          <FormInput id="custom-input" placeholder="Test input" />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('Test input');
      expect(input).toHaveAttribute('id', 'custom-input');
    });

    it('renders label when provided', () => {
      render(
        <TestWrapper>
          <FormInput label="Test Label" placeholder="Test input" />
        </TestWrapper>
      );

      expect(screen.getByText('Test Label')).toBeInTheDocument();
      const input = screen.getByPlaceholderText('Test input');
      const label = screen.getByText('Test Label');
      expect(input.id).toBeTruthy();
      expect(label).toHaveAttribute('for', input.id);
    });

    it('shows required indicator on label', () => {
      render(
        <TestWrapper>
          <FormInput label="Required Field" isRequired placeholder="Test input" />
        </TestWrapper>
      );

      const label = screen.getByText('Required Field');
      expect(label).toHaveClass('required');
      expect(screen.getByText('จำเป็น')).toBeInTheDocument();
    });

    it('displays help text with correct association', () => {
      render(
        <TestWrapper>
          <FormInput 
            label="Test Field" 
            helpText="This is help text" 
            placeholder="Test input" 
          />
        </TestWrapper>
      );

      const helpText = screen.getByText('This is help text');
      expect(helpText).toBeInTheDocument();
      expect(helpText).toHaveClass('form-help');
      expect(helpText).toHaveAttribute('id');
      expect(helpText.id).toBeTruthy();

      const input = screen.getByPlaceholderText('Test input');
      expect(input).toHaveAttribute('aria-describedby');
      expect(input.getAttribute('aria-describedby')).toContain(helpText.id);
    });

    it('displays error with correct ARIA attributes', () => {
      render(
        <TestWrapper>
          <FormInput 
            label="Test Field" 
            error="This field is required" 
            placeholder="Test input" 
          />
        </TestWrapper>
      );

      const errorElement = screen.getByText('This field is required');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveClass('form-error');
      expect(errorElement).toHaveAttribute('role', 'alert');
      expect(errorElement).toHaveAttribute('id');
      expect(errorElement.id).toBeTruthy();

      const input = screen.getByPlaceholderText('Test input');
      expect(input).toHaveClass('error');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby');
      expect(input.getAttribute('aria-describedby')).toContain(errorElement.id);
    });

    it('combines help text and error in aria-describedby', () => {
      render(
        <TestWrapper>
          <FormInput 
            label="Test Field" 
            helpText="Help text"
            error="Error message" 
            placeholder="Test input" 
          />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('Test input');
      const helpText = screen.getByText('Help text');
      const errorText = screen.getByText('Error message');
      
      expect(input).toHaveAttribute('aria-describedby');
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toContain(errorText.id);
      expect(describedBy).toContain(helpText.id);
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(
        <TestWrapper>
          <FormInput ref={ref} placeholder="Test input" />
        </TestWrapper>
      );

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current).toBe(screen.getByPlaceholderText('Test input'));
    });

    it('passes through HTML input attributes', () => {
      render(
        <TestWrapper>
          <FormInput 
            type="email"
            placeholder="Enter email"
            required
            maxLength={100}
          />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('Enter email');
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('required');
      expect(input).toHaveAttribute('maxLength', '100');
    });
  });

  describe('FormTextarea', () => {
    it('renders textarea with generated ID', () => {
      render(
        <TestWrapper>
          <FormTextarea placeholder="Enter description" />
        </TestWrapper>
      );

      const textarea = screen.getByPlaceholderText('Enter description');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
      expect(textarea).toHaveAttribute('id');
      expect(textarea.id).toBeTruthy();
    });

    it('renders with label and associations', () => {
      render(
        <TestWrapper>
          <FormTextarea 
            label="Description" 
            placeholder="Enter description"
            isRequired
          />
        </TestWrapper>
      );

      const label = screen.getByText('Description');
      const textarea = screen.getByPlaceholderText('Enter description');
      
      expect(label).toBeInTheDocument();
      expect(label).toHaveClass('required');
      expect(textarea.id).toBeTruthy();
      expect(label).toHaveAttribute('for', textarea.id);
      expect(screen.getByText('จำเป็น')).toBeInTheDocument();
    });

    it('handles error state correctly', () => {
      render(
        <TestWrapper>
          <FormTextarea 
            label="Description"
            error="Description is required"
            placeholder="Enter description"
          />
        </TestWrapper>
      );

      const textarea = screen.getByPlaceholderText('Enter description');
      const errorElement = screen.getByText('Description is required');
      
      expect(textarea).toHaveClass('form-input', 'form-textarea', 'error');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(errorElement).toHaveAttribute('role', 'alert');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(
        <TestWrapper>
          <FormTextarea ref={ref} placeholder="Test textarea" />
        </TestWrapper>
      );

      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });

    it('passes through textarea attributes', () => {
      render(
        <TestWrapper>
          <FormTextarea 
            placeholder="Enter text"
            rows={5}
            cols={40}
            maxLength={500}
          />
        </TestWrapper>
      );

      const textarea = screen.getByPlaceholderText('Enter text');
      expect(textarea).toHaveAttribute('rows', '5');
      expect(textarea).toHaveAttribute('cols', '40');
      expect(textarea).toHaveAttribute('maxLength', '500');
    });
  });

  describe('FormSelect', () => {
    it('renders select with options', () => {
      render(
        <TestWrapper>
          <FormSelect label="Choose option">
            <option value="">Select...</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
          </FormSelect>
        </TestWrapper>
      );

      const select = screen.getByRole('combobox');
      const label = screen.getByText('Choose option');
      
      expect(select).toBeInTheDocument();
      expect(select).toHaveClass('form-input', 'form-select');
      expect(select.id).toBeTruthy();
      expect(label).toHaveAttribute('for', select.id);
      expect(screen.getByText('Select...')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('handles selection changes', () => {
      const handleChange = jest.fn();
      render(
        <TestWrapper>
          <FormSelect label="Choose option" onChange={handleChange}>
            <option value="">Select...</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
          </FormSelect>
        </TestWrapper>
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'option1' } });
      
      expect(handleChange).toHaveBeenCalled();
    });

    it('shows error state correctly', () => {
      render(
        <TestWrapper>
          <FormSelect 
            label="Choose option"
            error="Please select an option"
          >
            <option value="">Select...</option>
            <option value="option1">Option 1</option>
          </FormSelect>
        </TestWrapper>
      );

      const select = screen.getByRole('combobox');
      const errorElement = screen.getByText('Please select an option');
      
      expect(select).toHaveClass('error');
      expect(select).toHaveAttribute('aria-invalid', 'true');
      expect(errorElement).toHaveAttribute('role', 'alert');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLSelectElement>();
      render(
        <TestWrapper>
          <FormSelect ref={ref} label="Test select">
            <option value="test">Test</option>
          </FormSelect>
        </TestWrapper>
      );

      expect(ref.current).toBeInstanceOf(HTMLSelectElement);
    });
  });

  describe('FormCheckbox', () => {
    it('renders checkbox with label', () => {
      render(
        <TestWrapper>
          <FormCheckbox label="Accept terms" />
        </TestWrapper>
      );

      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('Accept terms');
      
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('type', 'checkbox');
      expect(checkbox).toHaveClass('form-checkbox');
      expect(checkbox.id).toBeTruthy();
      expect(label).toHaveAttribute('for', checkbox.id);
    });

    it('handles checked state', () => {
      const handleChange = jest.fn();
      render(
        <TestWrapper>
          <FormCheckbox 
            label="Accept terms"
            checked={false}
            onChange={handleChange}
          />
        </TestWrapper>
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
      
      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalled();
    });

    it('shows error state', () => {
      render(
        <TestWrapper>
          <FormCheckbox 
            label="Accept terms"
            error="You must accept the terms"
          />
        </TestWrapper>
      );

      const checkbox = screen.getByRole('checkbox');
      const errorElement = screen.getByText('You must accept the terms');
      
      expect(checkbox).toHaveClass('error');
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
      expect(errorElement).toHaveAttribute('role', 'alert');
    });

    it('displays help text', () => {
      render(
        <TestWrapper>
          <FormCheckbox 
            label="Accept terms"
            helpText="Read the terms carefully"
          />
        </TestWrapper>
      );

      const helpText = screen.getByText('Read the terms carefully');
      const checkbox = screen.getByRole('checkbox');
      
      expect(helpText).toBeInTheDocument();
      expect(helpText).toHaveClass('form-help');
      expect(helpText.id).toBeTruthy();
      expect(checkbox).toHaveAttribute('aria-describedby');
      expect(checkbox.getAttribute('aria-describedby')).toContain(helpText.id);
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(
        <TestWrapper>
          <FormCheckbox ref={ref} label="Test checkbox" />
        </TestWrapper>
      );

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.type).toBe('checkbox');
    });
  });

  describe('FormRadioGroup', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3', disabled: true }
    ];

    it('renders radio group with options', () => {
      render(
        <TestWrapper>
          <FormRadioGroup 
            name="test-group"
            options={options}
            label="Choose an option"
          />
        </TestWrapper>
      );

      const radioGroup = screen.getByRole('radiogroup');
      const legend = screen.getByText('Choose an option');
      const radios = screen.getAllByRole('radio');
      
      expect(radioGroup).toBeInTheDocument();
      expect(legend.tagName).toBe('LEGEND');
      expect(radios).toHaveLength(3);
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('handles selection changes', () => {
      const handleChange = jest.fn();
      render(
        <TestWrapper>
          <FormRadioGroup 
            name="test-group"
            options={options}
            label="Choose an option"
            onChange={handleChange}
          />
        </TestWrapper>
      );

      const firstRadio = screen.getByDisplayValue('option1');
      fireEvent.click(firstRadio);
      
      expect(handleChange).toHaveBeenCalledWith('option1');
    });

    it('shows selected value', () => {
      render(
        <TestWrapper>
          <FormRadioGroup 
            name="test-group"
            options={options}
            label="Choose an option"
            value="option2"
          />
        </TestWrapper>
      );

      const selectedRadio = screen.getByDisplayValue('option2');
      expect(selectedRadio).toBeChecked();
    });

    it('disables specific options', () => {
      render(
        <TestWrapper>
          <FormRadioGroup 
            name="test-group"
            options={options}
            label="Choose an option"
          />
        </TestWrapper>
      );

      const disabledRadio = screen.getByDisplayValue('option3');
      expect(disabledRadio).toBeDisabled();
    });

    it('shows required indicator', () => {
      render(
        <TestWrapper>
          <FormRadioGroup 
            name="test-group"
            options={options}
            label="Choose an option"
            isRequired
          />
        </TestWrapper>
      );

      const legend = screen.getByText('Choose an option');
      expect(legend).toHaveClass('required');
      expect(screen.getByText('จำเป็น')).toBeInTheDocument();
    });

    it('shows error state', () => {
      render(
        <TestWrapper>
          <FormRadioGroup 
            name="test-group"
            options={options}
            label="Choose an option"
            error="Please select an option"
          />
        </TestWrapper>
      );

      const radioGroup = screen.getByRole('radiogroup');
      const errorElement = screen.getByText('Please select an option');
      
      expect(radioGroup).toHaveClass('error');
      expect(radioGroup).toHaveAttribute('aria-invalid', 'true');
      expect(errorElement).toHaveAttribute('role', 'alert');
    });

    it('associates help text correctly', () => {
      render(
        <TestWrapper>
          <FormRadioGroup 
            name="test-group"
            options={options}
            label="Choose an option"
            helpText="Select the best option for you"
          />
        </TestWrapper>
      );

      const helpText = screen.getByText('Select the best option for you');
      const radioGroup = screen.getByRole('radiogroup');
      
      expect(helpText).toBeInTheDocument();
      expect(helpText.id).toBeTruthy();
      expect(radioGroup).toHaveAttribute('aria-describedby');
      expect(radioGroup.getAttribute('aria-describedby')).toContain(helpText.id);
    });

    it('combines error and help text in aria-describedby', () => {
      render(
        <TestWrapper>
          <FormRadioGroup 
            name="test-group"
            options={options}
            label="Choose an option"
            helpText="Select an option"
            error="Selection required"
          />
        </TestWrapper>
      );

      const radioGroup = screen.getByRole('radiogroup');
      const helpText = screen.getByText('Select an option');
      const errorText = screen.getByText('Selection required');
      
      expect(radioGroup).toHaveAttribute('aria-describedby');
      const describedBy = radioGroup.getAttribute('aria-describedby');
      expect(describedBy).toContain(errorText.id);
      expect(describedBy).toContain(helpText.id);
    });
  });

  describe('FormErrorSummary', () => {
    const errors = [
      { field: 'name', message: 'Name is required' },
      { field: 'email', message: 'Email is invalid' },
      { field: 'phone', message: 'Phone number is required' }
    ];

    it('renders error summary with default title', () => {
      render(
        <TestWrapper>
          <FormErrorSummary errors={errors} />
        </TestWrapper>
      );

      const summary = screen.getByRole('alert');
      const title = screen.getByText('กรุณาแก้ไขข้อผิดพลาดต่อไปนี้');
      const errorList = screen.getByRole('list');
      
      expect(summary).toBeInTheDocument();
      expect(summary).toHaveClass('form-error-summary');
      expect(summary).toHaveAttribute('aria-labelledby', 'error-summary-title');
      expect(title).toHaveAttribute('id', 'error-summary-title');
      expect(errorList).toBeInTheDocument();
    });

    it('renders custom title', () => {
      render(
        <TestWrapper>
          <FormErrorSummary 
            errors={errors} 
            title="Fix these issues"
          />
        </TestWrapper>
      );

      expect(screen.getByText('Fix these issues')).toBeInTheDocument();
    });

    it('renders error links correctly', () => {
      render(
        <TestWrapper>
          <FormErrorSummary errors={errors} />
        </TestWrapper>
      );

      const nameLink = screen.getByText('Name is required');
      const emailLink = screen.getByText('Email is invalid');
      const phoneLink = screen.getByText('Phone number is required');
      
      expect(nameLink).toBeInTheDocument();
      expect(nameLink.tagName).toBe('A');
      expect(nameLink).toHaveAttribute('href', '#name');
      expect(nameLink).toHaveClass('form-error-link');
      
      expect(emailLink).toHaveAttribute('href', '#email');
      expect(phoneLink).toHaveAttribute('href', '#phone');
    });

    it('does not render when no errors', () => {
      const { container } = render(
        <TestWrapper>
          <FormErrorSummary errors={[]} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeNull();
    });

    it('handles single error', () => {
      const singleError = [{ field: 'name', message: 'Name is required' }];
      render(
        <TestWrapper>
          <FormErrorSummary errors={singleError} />
        </TestWrapper>
      );

      const summary = screen.getByRole('alert');
      const errorItems = screen.getAllByRole('listitem');
      
      expect(summary).toBeInTheDocument();
      expect(errorItems).toHaveLength(1);
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    it('handles many errors', () => {
      const manyErrors = Array.from({ length: 10 }, (_, i) => ({
        field: `field${i}`,
        message: `Error ${i + 1}`
      }));

      render(
        <TestWrapper>
          <FormErrorSummary errors={manyErrors} />
        </TestWrapper>
      );

      const errorItems = screen.getAllByRole('listitem');
      expect(errorItems).toHaveLength(10);
      expect(screen.getByText('Error 1')).toBeInTheDocument();
      expect(screen.getByText('Error 10')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('works together in a complete form', () => {
      const handleSubmit = jest.fn();
      render(
        <TestWrapper>
          <form onSubmit={handleSubmit}>
            <FormInput 
              label="Full Name"
              isRequired
              placeholder="Enter your name"
            />
            <FormTextarea 
              label="Description"
              helpText="Tell us about yourself"
            />
            <FormSelect label="Country">
              <option value="">Select country</option>
              <option value="th">Thailand</option>
              <option value="us">United States</option>
            </FormSelect>
            <FormCheckbox label="I agree to the terms" />
            <FormRadioGroup 
              name="gender"
              label="Gender"
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' }
              ]}
            />
          </form>
        </TestWrapper>
      );

      // Verify all components render
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('I agree to the terms')).toBeInTheDocument();
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
      expect(screen.getAllByRole('radio')).toHaveLength(3);
    });

    it('maintains accessibility relationships in complex form', () => {
      render(
        <TestWrapper>
          <FormInput 
            id="email"
            label="Email Address"
            type="email"
            isRequired
            helpText="We'll never share your email"
            error="Please enter a valid email"
          />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      const label = screen.getByText('Email Address');
      const helpText = screen.getByText("We'll never share your email");
      const errorText = screen.getByText('Please enter a valid email');
      
      // Verify accessibility relationships
      expect(label).toHaveAttribute('for', 'email');
      expect(input).toHaveAttribute('id', 'email');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(errorText).toHaveAttribute('role', 'alert');
      expect(helpText.id).toBeTruthy();
      expect(errorText.id).toBeTruthy();
      
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toContain(errorText.id);
      expect(describedBy).toContain(helpText.id);
    });
  });

  describe('Accessibility Features', () => {
    it('provides proper ARIA support for screen readers', () => {
      render(
        <TestWrapper>
          <FormRadioGroup 
            name="payment"
            label="Payment Method"
            options={[
              { value: 'card', label: 'Credit Card' },
              { value: 'cash', label: 'Cash' }
            ]}
            isRequired
            error="Please select a payment method"
          />
        </TestWrapper>
      );

      const radioGroup = screen.getByRole('radiogroup');
      const legend = screen.getByText('Payment Method');
      const errorElement = screen.getByText('Please select a payment method');
      
      expect(radioGroup).toHaveAttribute('aria-invalid', 'true');
      expect(legend).toHaveClass('required');
      expect(errorElement).toHaveAttribute('role', 'alert');
      expect(errorElement.id).toBeTruthy();
      
      const describedBy = radioGroup.getAttribute('aria-describedby');
      expect(describedBy).toContain(errorElement.id);
    });

    it('generates unique IDs for form elements', () => {
      render(
        <TestWrapper>
          <div>
            <FormInput label="First Name" />
            <FormInput label="Last Name" />
            <FormTextarea label="Bio" />
          </div>
        </TestWrapper>
      );

      const inputs = screen.getAllByRole('textbox');
      const ids = inputs.map(input => input.id).filter(Boolean);
      
      // All IDs should be unique and present
      expect(ids.length).toBeGreaterThan(0);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('provides keyboard navigation support', () => {
      render(
        <TestWrapper>
          <FormRadioGroup 
            name="rating"
            label="Rating"
            options={[
              { value: '1', label: '1 star' },
              { value: '2', label: '2 stars' },
              { value: '3', label: '3 stars' }
            ]}
          />
        </TestWrapper>
      );

      const radios = screen.getAllByRole('radio');
      
      // All radios should have the same name for keyboard navigation
      radios.forEach(radio => {
        expect(radio).toHaveAttribute('name', 'rating');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles undefined values gracefully', () => {
      expect(() => {
        render(
          <TestWrapper>
            <FormInput 
              label={undefined as any}
              error={undefined}
              helpText={undefined}
            />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('handles empty arrays in radio group', () => {
      render(
        <TestWrapper>
          <FormRadioGroup 
            name="empty"
            label="Empty Group"
            options={[]}
          />
        </TestWrapper>
      );

      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toBeInTheDocument();
      expect(screen.queryAllByRole('radio')).toHaveLength(0);
    });

    it('handles missing onChange handlers gracefully', () => {
      expect(() => {
        render(
          <TestWrapper>
            <FormRadioGroup 
              name="test"
              label="Test"
              options={[{ value: 'test', label: 'Test' }]}
            />
          </TestWrapper>
        );
        
        const radio = screen.getByRole('radio');
        fireEvent.click(radio);
      }).not.toThrow();
    });
  });
});