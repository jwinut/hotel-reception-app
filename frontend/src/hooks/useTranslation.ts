// src/hooks/useTranslation.ts
import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { announceToScreenReader } from '../utils/accessibility';

// Enhanced translation hook with accessibility features
export const useTranslation = (namespace?: string) => {
  const { t, i18n, ready } = useI18nextTranslation(namespace);

  // Helper to translate and announce to screen readers
  const announceTranslation = (
    key: string, 
    options?: any, 
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    const translatedText = t(key, options);
    announceToScreenReader(String(translatedText), priority);
    return translatedText;
  };

  // Helper to get current language display name
  const getCurrentLanguageName = () => {
    return i18n.language === 'th' ? t('language.thai') : t('language.english');
  };

  // Helper to check if current language is RTL (for future Arabic support)
  const isRTL = () => {
    const rtlLanguages = ['ar', 'he', 'fa'];
    return rtlLanguages.includes(i18n.language);
  };

  // Helper for pluralization with fallback
  const tPlural = (key: string, count: number, options?: any) => {
    return t(key, { count, ...options });
  };

  // Helper for date/time formatting based on locale
  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => {
    const locale = i18n.language === 'th' ? 'th-TH' : 'en-US';
    return date.toLocaleDateString(locale, options);
  };

  const formatTime = (date: Date, options?: Intl.DateTimeFormatOptions) => {
    const locale = i18n.language === 'th' ? 'th-TH' : 'en-US';
    return date.toLocaleTimeString(locale, options);
  };

  const formatDateTime = (date: Date, options?: Intl.DateTimeFormatOptions) => {
    const locale = i18n.language === 'th' ? 'th-TH' : 'en-US';
    return date.toLocaleString(locale, options);
  };

  // Helper for number formatting
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    const locale = i18n.language === 'th' ? 'th-TH' : 'en-US';
    return number.toLocaleString(locale, options);
  };

  // Helper for currency formatting (Thai Baht)
  const formatCurrency = (amount: number) => {
    const locale = i18n.language === 'th' ? 'th-TH' : 'en-US';
    return amount.toLocaleString(locale, {
      style: 'currency',
      currency: 'THB',
    });
  };

  return {
    t,
    i18n,
    ready,
    announceTranslation,
    getCurrentLanguageName,
    isRTL,
    tPlural,
    formatDate,
    formatTime,
    formatDateTime,
    formatNumber,
    formatCurrency,
  };
};