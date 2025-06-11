// src/components/AccessibleForm.tsx
import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import { generateId, createAriaDescription, createErrorAriaProps } from '../utils/accessibility';

// Form Group Component
interface FormGroupProps {
  children: ReactNode;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({ children, className = '' }) => {
  return (
    <div className={`form-group ${className}`.trim()}>
      {children}
    </div>
  );
};

// Form Label Component
interface FormLabelProps {
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export const FormLabel: React.FC<FormLabelProps> = ({ 
  htmlFor, 
  required = false, 
  children, 
  className = '' 
}) => {
  return (
    <label 
      htmlFor={htmlFor} 
      className={`form-label ${required ? 'required' : ''} ${className}`.trim()}
    >
      {children}
      {required && <span className="sr-only">จำเป็น</span>}
    </label>
  );
};

// Form Input Component
interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  isRequired?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helpText, isRequired = false, className = '', id, ...props }, ref) => {
    const inputId = id || generateId('input');
    const errorId = error ? generateId('error') : undefined;
    const helpId = helpText ? generateId('help') : undefined;
    
    const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;

    return (
      <FormGroup>
        {label && (
          <FormLabel htmlFor={inputId} required={isRequired}>
            {label}
          </FormLabel>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`form-input ${error ? 'error' : ''} ${className}`.trim()}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          {...props}
        />
        {helpText && (
          <div id={helpId} className="form-help">
            {helpText}
          </div>
        )}
        {error && (
          <div id={errorId} className="form-error" role="alert">
            {error}
          </div>
        )}
      </FormGroup>
    );
  }
);

FormInput.displayName = 'FormInput';

// Form Textarea Component
interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
  isRequired?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, helpText, isRequired = false, className = '', id, ...props }, ref) => {
    const textareaId = id || generateId('textarea');
    const errorId = error ? generateId('error') : undefined;
    const helpId = helpText ? generateId('help') : undefined;
    
    const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;

    return (
      <FormGroup>
        {label && (
          <FormLabel htmlFor={textareaId} required={isRequired}>
            {label}
          </FormLabel>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`form-input form-textarea ${error ? 'error' : ''} ${className}`.trim()}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          {...props}
        />
        {helpText && (
          <div id={helpId} className="form-help">
            {helpText}
          </div>
        )}
        {error && (
          <div id={errorId} className="form-error" role="alert">
            {error}
          </div>
        )}
      </FormGroup>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

// Form Select Component
interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  isRequired?: boolean;
  children: ReactNode;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, helpText, isRequired = false, className = '', id, children, ...props }, ref) => {
    const selectId = id || generateId('select');
    const errorId = error ? generateId('error') : undefined;
    const helpId = helpText ? generateId('help') : undefined;
    
    const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;

    return (
      <FormGroup>
        {label && (
          <FormLabel htmlFor={selectId} required={isRequired}>
            {label}
          </FormLabel>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`form-input form-select ${error ? 'error' : ''} ${className}`.trim()}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          {...props}
        >
          {children}
        </select>
        {helpText && (
          <div id={helpId} className="form-help">
            {helpText}
          </div>
        )}
        {error && (
          <div id={errorId} className="form-error" role="alert">
            {error}
          </div>
        )}
      </FormGroup>
    );
  }
);

FormSelect.displayName = 'FormSelect';

// Form Checkbox Component
interface FormCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, helpText, className = '', id, ...props }, ref) => {
    const checkboxId = id || generateId('checkbox');
    const errorId = error ? generateId('error') : undefined;
    const helpId = helpText ? generateId('help') : undefined;
    
    const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;

    return (
      <FormGroup>
        <div className="form-checkbox-container">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={`form-checkbox ${error ? 'error' : ''} ${className}`.trim()}
            aria-describedby={describedBy}
            aria-invalid={!!error}
            {...props}
          />
          <FormLabel htmlFor={checkboxId}>
            {label}
          </FormLabel>
        </div>
        {helpText && (
          <div id={helpId} className="form-help">
            {helpText}
          </div>
        )}
        {error && (
          <div id={errorId} className="form-error" role="alert">
            {error}
          </div>
        )}
      </FormGroup>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';

// Form Radio Group Component
interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FormRadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  helpText?: string;
  isRequired?: boolean;
  className?: string;
}

export const FormRadioGroup: React.FC<FormRadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  label,
  error,
  helpText,
  isRequired = false,
  className = ''
}) => {
  const groupId = generateId('radio-group');
  const errorId = error ? generateId('error') : undefined;
  const helpId = helpText ? generateId('help') : undefined;
  
  const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;

  return (
    <FormGroup>
      {label && (
        <fieldset className="form-fieldset">
          <legend className={`form-legend ${isRequired ? 'required' : ''}`}>
            {label}
            {isRequired && <span className="sr-only">จำเป็น</span>}
          </legend>
          <div 
            className={`form-radio-group ${error ? 'error' : ''} ${className}`.trim()}
            role="radiogroup"
            aria-describedby={describedBy}
            aria-invalid={!!error}
          >
            {options.map((option, index) => {
              const radioId = `${groupId}-${index}`;
              return (
                <div key={option.value} className="form-radio-container">
                  <input
                    type="radio"
                    id={radioId}
                    name={name}
                    value={option.value}
                    checked={value === option.value}
                    disabled={option.disabled}
                    onChange={(e) => onChange?.(e.target.value)}
                    className="form-radio"
                  />
                  <label htmlFor={radioId} className="form-radio-label">
                    {option.label}
                  </label>
                </div>
              );
            })}
          </div>
        </fieldset>
      )}
      {helpText && (
        <div id={helpId} className="form-help">
          {helpText}
        </div>
      )}
      {error && (
        <div id={errorId} className="form-error" role="alert">
          {error}
        </div>
      )}
    </FormGroup>
  );
};

// Form Error Summary Component
interface FormErrorSummaryProps {
  errors: Array<{ field: string; message: string }>;
  title?: string;
}

export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({ 
  errors, 
  title = 'กรุณาแก้ไขข้อผิดพลาดต่อไปนี้:' 
}) => {
  if (errors.length === 0) return null;

  return (
    <div className="form-error-summary" role="alert" aria-labelledby="error-summary-title">
      <h3 id="error-summary-title" className="form-error-summary-title">
        {title}
      </h3>
      <ul className="form-error-summary-list">
        {errors.map((error, index) => (
          <li key={index}>
            <a href={`#${error.field}`} className="form-error-link">
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};