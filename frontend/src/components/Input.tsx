// src/components/Input.tsx
import React, { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { generateId } from '../utils/accessibility';
import './Input.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'filled' | 'outlined' | 'underlined';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  helperText?: string;
  error?: string | boolean;
  success?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  loading?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      label,
      helperText,
      error,
      success,
      leftIcon,
      rightIcon,
      leftAddon,
      rightAddon,
      loading = false,
      clearable = false,
      onClear,
      fullWidth = false,
      disabled,
      required,
      className = '',
      id,
      value,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation();
    const [isFocused, setIsFocused] = useState(false);
    
    const inputId = id || generateId('input');
    const errorId = error ? generateId('error') : undefined;
    const helperId = helperText ? generateId('helper') : undefined;
    
    const hasError = Boolean(error);
    const isDisabled = disabled || loading;
    const hasValue = Boolean(value);
    const showClearButton = clearable && hasValue && !isDisabled;

    const inputClasses = [
      'input-field',
      `input-field--${variant}`,
      `input-field--${size}`,
      hasError && 'input-field--error',
      success && 'input-field--success',
      isDisabled && 'input-field--disabled',
      isFocused && 'input-field--focused',
      hasValue && 'input-field--has-value',
      leftIcon && 'input-field--has-left-icon',
      rightIcon && 'input-field--has-right-icon',
      leftAddon && 'input-field--has-left-addon',
      rightAddon && 'input-field--has-right-addon',
      fullWidth && 'input-field--full-width',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleClear = () => {
      onClear?.();
      if (onChange) {
        const syntheticEvent = {
          target: { value: '' },
          currentTarget: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

    return (
      <div className={inputClasses}>
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className="input-field__label">
            {label}
            {required && <span className="input-field__required">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="input-field__container">
          {/* Left Addon */}
          {leftAddon && (
            <div className="input-field__addon input-field__addon--left">
              {leftAddon}
            </div>
          )}

          {/* Input Wrapper */}
          <div className="input-field__wrapper">
            {/* Left Icon */}
            {leftIcon && (
              <div className="input-field__icon input-field__icon--left" aria-hidden="true">
                {leftIcon}
              </div>
            )}

            {/* Input Element */}
            <input
              ref={ref}
              id={inputId}
              className="input-field__input"
              disabled={isDisabled}
              required={required}
              aria-invalid={hasError}
              aria-describedby={describedBy}
              value={value}
              onChange={onChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              {...props}
            />

            {/* Loading Spinner */}
            {loading && (
              <div className="input-field__icon input-field__icon--right" aria-hidden="true">
                <svg
                  className="input-field__spinner"
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
              </div>
            )}

            {/* Clear Button */}
            {showClearButton && (
              <button
                type="button"
                className="input-field__clear"
                onClick={handleClear}
                aria-label={t('app.clear')}
                tabIndex={-1}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            {/* Right Icon */}
            {rightIcon && !loading && !showClearButton && (
              <div className="input-field__icon input-field__icon--right" aria-hidden="true">
                {rightIcon}
              </div>
            )}
          </div>

          {/* Right Addon */}
          {rightAddon && (
            <div className="input-field__addon input-field__addon--right">
              {rightAddon}
            </div>
          )}
        </div>

        {/* Helper Text */}
        {helperText && !hasError && (
          <div id={helperId} className="input-field__helper">
            {helperText}
          </div>
        )}

        {/* Error Message */}
        {hasError && (
          <div id={errorId} className="input-field__error" role="alert">
            {typeof error === 'string' ? error : t('accessibility.error')}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;