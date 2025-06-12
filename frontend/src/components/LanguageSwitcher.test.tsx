// src/components/LanguageSwitcher.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LanguageSwitcher from './LanguageSwitcher';

// Mock i18next with proper react-i18next structure
const mockChangeLanguage = jest.fn();

// Create a simple mock that just uses the translation keys directly
const mockT = jest.fn();

// Initialize with Thai language (matching the actual i18n files)
const mockI18n = {
  language: 'th',
  changeLanguage: mockChangeLanguage
};

// Set up the mock translation function to return the values expected by tests
beforeEach(() => {
  mockT.mockImplementation((key: string, options?: any) => {
    const translations: { [key: string]: string } = {
      'language.switch': 'Switch Language',
      'language.thai': 'Thai', 
      'language.english': 'English',
      'language.current': `Current language: ${options?.language || 'Thai'}`
    };
    return translations[key] || key;
  });
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: mockI18n,
    t: mockT
  })
}));

// Mock AccessibleButton
jest.mock('./AccessibleButton', () => {
  return function MockAccessibleButton({ children, onClick, variant, size, className, ...props }: any) {
    return (
      <button 
        onClick={onClick}
        className={`mock-accessible-button ${variant} ${size} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  };
});

// Mock live region
const mockLiveRegion = document.createElement('div');
mockLiveRegion.id = 'live-region';
document.body.appendChild(mockLiveRegion);

describe('LanguageSwitcher Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLiveRegion.textContent = '';
    // Reset language to Thai for each test
    mockI18n.language = 'th';
  });

  describe('Button Variant (Default)', () => {
    it('renders button variant by default', () => {
      render(<LanguageSwitcher />);
      
      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'Switch Language');
      expect(screen.getByText('ไทย')).toBeInTheDocument();
      expect(screen.getByText('EN')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<LanguageSwitcher className="custom-switcher" />);
      
      const container = screen.getByRole('group');
      expect(container).toHaveClass('language-switcher', 'buttons', 'custom-switcher');
    });

    it('shows Thai as active when current language is Thai', () => {
      render(<LanguageSwitcher />);
      
      const thaiButton = screen.getByText('ไทย');
      const enButton = screen.getByText('EN');
      
      expect(thaiButton).toHaveClass('primary');
      expect(thaiButton).toHaveAttribute('aria-pressed', 'true');
      expect(enButton).toHaveClass('ghost');
      expect(enButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('shows English as active when current language is English', () => {
      // Change the mock language to English
      mockI18n.language = 'en';
      
      render(<LanguageSwitcher />);
      
      const thaiButton = screen.getByText('ไทย');
      const enButton = screen.getByText('EN');
      
      expect(enButton).toHaveClass('primary');
      expect(enButton).toHaveAttribute('aria-pressed', 'true');
      expect(thaiButton).toHaveClass('ghost');
      expect(thaiButton).toHaveAttribute('aria-pressed', 'false');
      
      // Reset to Thai for other tests
      mockI18n.language = 'th';
    });

    it('changes language when Thai button is clicked', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);
      
      const thaiButton = screen.getByText('ไทย');
      await user.click(thaiButton);
      
      expect(mockChangeLanguage).toHaveBeenCalledWith('th');
    });

    it('changes language when English button is clicked', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);
      
      const enButton = screen.getByText('EN');
      await user.click(enButton);
      
      expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    });
  });

  describe('Dropdown Variant', () => {
    it('renders dropdown variant correctly', () => {
      render(<LanguageSwitcher variant="dropdown" />);
      
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-label', 'Switch Language');
      expect(screen.getByRole('option', { name: 'Thai' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
    });

    it('applies custom className to dropdown', () => {
      render(<LanguageSwitcher variant="dropdown" className="custom-dropdown" />);
      
      const container = screen.getByRole('combobox').parentElement;
      expect(container).toHaveClass('language-switcher', 'dropdown', 'custom-dropdown');
    });

    it('shows current language as selected in dropdown', () => {
      render(<LanguageSwitcher variant="dropdown" />);
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('th');
    });

    it('changes language when dropdown selection changes', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher variant="dropdown" />);
      
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'en');
      
      expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes for button variant', () => {
      render(<LanguageSwitcher />);
      
      const group = screen.getByRole('group');
      expect(group).toHaveAttribute('aria-label', 'Switch Language');
      
      const thaiButton = screen.getByText('ไทย');
      const enButton = screen.getByText('EN');
      
      expect(thaiButton).toHaveAttribute('aria-pressed', 'true');
      expect(enButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('has correct ARIA attributes for dropdown variant', () => {
      render(<LanguageSwitcher variant="dropdown" />);
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-label', 'Switch Language');
      
      // Check for hidden label - need to use a more specific query since the text is in a hidden element
      const label = document.querySelector('label.sr-only');
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('Switch Language');
    });
  });
});