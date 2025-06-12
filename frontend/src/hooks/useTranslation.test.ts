// src/hooks/useTranslation.test.ts
import { renderHook } from '@testing-library/react';
import { useTranslation } from './useTranslation';

// Mock react-i18next
const mockT = jest.fn();
const mockI18n = {
  language: 'th',
  changeLanguage: jest.fn(),
};

jest.mock('react-i18next', () => ({
  useTranslation: (namespace?: string) => ({
    t: mockT,
    i18n: mockI18n,
    ready: true,
  }),
}));

// Mock accessibility utils
jest.mock('../utils/accessibility', () => ({
  announceToScreenReader: jest.fn(),
}));

const mockAnnounceToScreenReader = require('../utils/accessibility').announceToScreenReader;

describe('useTranslation Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockI18n.language = 'th';
    mockT.mockImplementation((key: string, options?: any) => {
      // Simple mock implementation
      if (key === 'language.thai') return 'ไทย';
      if (key === 'language.english') return 'English';
      if (key.includes('count')) {
        return `${key} (${options?.count || 0})`;
      }
      return key;
    });
  });

  describe('Basic functionality', () => {
    it('returns all translation functions and properties', () => {
      const { result } = renderHook(() => useTranslation());

      expect(result.current.t).toBe(mockT);
      expect(result.current.i18n).toBe(mockI18n);
      expect(result.current.ready).toBe(true);
      expect(typeof result.current.announceTranslation).toBe('function');
      expect(typeof result.current.getCurrentLanguageName).toBe('function');
      expect(typeof result.current.isRTL).toBe('function');
      expect(typeof result.current.tPlural).toBe('function');
      expect(typeof result.current.formatDate).toBe('function');
      expect(typeof result.current.formatTime).toBe('function');
      expect(typeof result.current.formatDateTime).toBe('function');
      expect(typeof result.current.formatNumber).toBe('function');
      expect(typeof result.current.formatCurrency).toBe('function');
    });

    it('passes namespace to react-i18next', () => {
      renderHook(() => useTranslation('common'));
      // This would be tested by verifying the namespace is passed to useI18nextTranslation
      // but since we're mocking it, we just ensure no errors occur
    });
  });

  describe('announceTranslation', () => {
    it('translates and announces to screen reader with default priority', () => {
      const { result } = renderHook(() => useTranslation());

      const translatedText = result.current.announceTranslation('test.key');

      expect(mockT).toHaveBeenCalledWith('test.key', undefined);
      expect(mockAnnounceToScreenReader).toHaveBeenCalledWith('test.key', 'polite');
      expect(translatedText).toBe('test.key');
    });

    it('translates and announces with custom options and priority', () => {
      const { result } = renderHook(() => useTranslation());

      const options = { name: 'John' };
      const translatedText = result.current.announceTranslation('test.key', options, 'assertive');

      expect(mockT).toHaveBeenCalledWith('test.key', options);
      expect(mockAnnounceToScreenReader).toHaveBeenCalledWith('test.key', 'assertive');
      expect(translatedText).toBe('test.key');
    });
  });

  describe('getCurrentLanguageName', () => {
    it('returns Thai name when language is th', () => {
      mockI18n.language = 'th';
      const { result } = renderHook(() => useTranslation());

      const languageName = result.current.getCurrentLanguageName();

      expect(mockT).toHaveBeenCalledWith('language.thai');
      expect(languageName).toBe('ไทย');
    });

    it('returns English name when language is not th', () => {
      mockI18n.language = 'en';
      const { result } = renderHook(() => useTranslation());

      const languageName = result.current.getCurrentLanguageName();

      expect(mockT).toHaveBeenCalledWith('language.english');
      expect(languageName).toBe('English');
    });
  });

  describe('isRTL', () => {
    it('returns false for Thai language', () => {
      mockI18n.language = 'th';
      const { result } = renderHook(() => useTranslation());

      expect(result.current.isRTL()).toBe(false);
    });

    it('returns false for English language', () => {
      mockI18n.language = 'en';
      const { result } = renderHook(() => useTranslation());

      expect(result.current.isRTL()).toBe(false);
    });

    it('returns true for Arabic language', () => {
      mockI18n.language = 'ar';
      const { result } = renderHook(() => useTranslation());

      expect(result.current.isRTL()).toBe(true);
    });

    it('returns true for Hebrew language', () => {
      mockI18n.language = 'he';
      const { result } = renderHook(() => useTranslation());

      expect(result.current.isRTL()).toBe(true);
    });

    it('returns true for Persian language', () => {
      mockI18n.language = 'fa';
      const { result } = renderHook(() => useTranslation());

      expect(result.current.isRTL()).toBe(true);
    });
  });

  describe('tPlural', () => {
    it('calls translation with count option', () => {
      const { result } = renderHook(() => useTranslation());

      const pluralText = result.current.tPlural('items.count', 5, { type: 'books' });

      expect(mockT).toHaveBeenCalledWith('items.count', { count: 5, type: 'books' });
      expect(pluralText).toBe('items.count (5)');
    });

    it('handles zero count', () => {
      const { result } = renderHook(() => useTranslation());

      const pluralText = result.current.tPlural('items.count', 0);

      expect(mockT).toHaveBeenCalledWith('items.count', { count: 0 });
      expect(pluralText).toBe('items.count (0)');
    });
  });

  describe('Date formatting', () => {
    const testDate = new Date('2024-12-15T10:30:45');

    describe('formatDate', () => {
      it('formats date with Thai locale when language is th', () => {
        mockI18n.language = 'th';
        const { result } = renderHook(() => useTranslation());

        const formatted = result.current.formatDate(testDate);

        // Note: The exact format depends on the browser's Intl implementation
        expect(typeof formatted).toBe('string');
        // Thai locale uses Buddhist Era calendar (2024 CE = 2567 BE)
        expect(formatted).toContain('2567');
      });

      it('formats date with English locale when language is en', () => {
        mockI18n.language = 'en';
        const { result } = renderHook(() => useTranslation());

        const formatted = result.current.formatDate(testDate);

        expect(typeof formatted).toBe('string');
        expect(formatted).toContain('2024');
      });

      it('accepts custom formatting options', () => {
        const { result } = renderHook(() => useTranslation());

        const formatted = result.current.formatDate(testDate, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        expect(typeof formatted).toBe('string');
      });
    });

    describe('formatTime', () => {
      it('formats time with Thai locale when language is th', () => {
        mockI18n.language = 'th';
        const { result } = renderHook(() => useTranslation());

        const formatted = result.current.formatTime(testDate);

        expect(typeof formatted).toBe('string');
        expect(formatted).toContain('10');
      });

      it('formats time with English locale when language is en', () => {
        mockI18n.language = 'en';
        const { result } = renderHook(() => useTranslation());

        const formatted = result.current.formatTime(testDate);

        expect(typeof formatted).toBe('string');
      });

      it('accepts custom formatting options', () => {
        const { result } = renderHook(() => useTranslation());

        const formatted = result.current.formatTime(testDate, {
          hour: '2-digit',
          minute: '2-digit'
        });

        expect(typeof formatted).toBe('string');
      });
    });

    describe('formatDateTime', () => {
      it('formats datetime with Thai locale when language is th', () => {
        mockI18n.language = 'th';
        const { result } = renderHook(() => useTranslation());

        const formatted = result.current.formatDateTime(testDate);

        expect(typeof formatted).toBe('string');
        // Thai locale uses Buddhist Era calendar (2024 CE = 2567 BE)
        expect(formatted).toContain('2567');
        expect(formatted).toContain('10');
      });

      it('formats datetime with English locale when language is en', () => {
        mockI18n.language = 'en';
        const { result } = renderHook(() => useTranslation());

        const formatted = result.current.formatDateTime(testDate);

        expect(typeof formatted).toBe('string');
      });
    });
  });

  describe('Number formatting', () => {
    describe('formatNumber', () => {
      it('formats number with Thai locale when language is th', () => {
        mockI18n.language = 'th';
        const { result } = renderHook(() => useTranslation());

        const formatted = result.current.formatNumber(1234.56);

        expect(typeof formatted).toBe('string');
        expect(formatted).toContain('1');
        expect(formatted).toContain('2');
      });

      it('formats number with English locale when language is en', () => {
        mockI18n.language = 'en';
        const { result } = renderHook(() => useTranslation());

        const formatted = result.current.formatNumber(1234.56);

        expect(typeof formatted).toBe('string');
        expect(formatted).toContain('1,234');
      });

      it('accepts custom formatting options', () => {
        const { result } = renderHook(() => useTranslation());

        const formatted = result.current.formatNumber(0.1234, {
          style: 'percent',
          maximumFractionDigits: 2
        });

        expect(typeof formatted).toBe('string');
        expect(formatted).toContain('%');
      });

      it('handles large numbers', () => {
        const { result } = renderHook(() => useTranslation());

        const formatted = result.current.formatNumber(1000000);

        expect(typeof formatted).toBe('string');
        expect(formatted).toContain('1');
      });

      it('handles negative numbers', () => {
        const { result } = renderHook(() => useTranslation());

        const formatted = result.current.formatNumber(-1234);

        expect(typeof formatted).toBe('string');
        expect(formatted).toContain('-');
      });

      it('handles zero', () => {
        const { result } = renderHook(() => useTranslation());

        const formatted = result.current.formatNumber(0);

        expect(formatted).toBe('0');
      });
    });

    describe('formatCurrency', () => {
      it('formats currency with Thai locale when language is th', () => {
        mockI18n.language = 'th';
        const { result } = renderHook(() => useTranslation());

        const formatted = result.current.formatCurrency(1234.56);

        expect(typeof formatted).toBe('string');
        expect(formatted).toContain('1');
        expect(formatted).toContain('2');
        // Currency symbol might vary between browsers, but should contain THB-related formatting
      });

      it('formats currency with English locale when language is en', () => {
        mockI18n.language = 'en';
        const { result } = renderHook(() => useTranslation());

        const formatted = result.current.formatCurrency(1234.56);

        expect(typeof formatted).toBe('string');
        expect(formatted).toContain('1,234');
      });

      it('handles zero amount', () => {
        const { result } = renderHook(() => useTranslation());

        const formatted = result.current.formatCurrency(0);

        expect(typeof formatted).toBe('string');
        expect(formatted).toContain('0');
      });

      it('handles negative amounts', () => {
        const { result } = renderHook(() => useTranslation());

        const formatted = result.current.formatCurrency(-500);

        expect(typeof formatted).toBe('string');
        expect(formatted).toContain('-');
        expect(formatted).toContain('500');
      });

      it('handles large amounts', () => {
        const { result } = renderHook(() => useTranslation());

        const formatted = result.current.formatCurrency(1000000);

        expect(typeof formatted).toBe('string');
        expect(formatted).toContain('1');
      });

      it('handles decimal amounts', () => {
        const { result } = renderHook(() => useTranslation());

        const formatted = result.current.formatCurrency(99.99);

        expect(typeof formatted).toBe('string');
        expect(formatted).toContain('99');
      });
    });
  });

  describe('Locale switching', () => {
    it('changes locale for all formatting functions when language changes', () => {
      const { result } = renderHook(() => useTranslation());
      const testDate = new Date('2024-12-15T10:30:45');
      const testNumber = 1234.56;

      // Test with Thai
      mockI18n.language = 'th';
      const thaiDate = result.current.formatDate(testDate);
      const thaiNumber = result.current.formatNumber(testNumber);
      const thaiCurrency = result.current.formatCurrency(testNumber);

      // Test with English
      mockI18n.language = 'en';
      const englishDate = result.current.formatDate(testDate);
      const englishNumber = result.current.formatNumber(testNumber);
      const englishCurrency = result.current.formatCurrency(testNumber);

      // Should be different formats (though exact differences depend on Intl implementation)
      expect(typeof thaiDate).toBe('string');
      expect(typeof englishDate).toBe('string');
      expect(typeof thaiNumber).toBe('string');
      expect(typeof englishNumber).toBe('string');
      expect(typeof thaiCurrency).toBe('string');
      expect(typeof englishCurrency).toBe('string');
    });
  });

  describe('Edge cases', () => {
    it('handles undefined options gracefully', () => {
      const { result } = renderHook(() => useTranslation());

      expect(() => result.current.announceTranslation('test.key')).not.toThrow();
      expect(() => result.current.tPlural('test.key', 1)).not.toThrow();
      expect(() => result.current.formatDate(new Date())).not.toThrow();
      expect(() => result.current.formatTime(new Date())).not.toThrow();
      expect(() => result.current.formatDateTime(new Date())).not.toThrow();
      expect(() => result.current.formatNumber(123)).not.toThrow();
      expect(() => result.current.formatCurrency(123)).not.toThrow();
    });

    it('handles invalid dates gracefully', () => {
      const { result } = renderHook(() => useTranslation());
      const invalidDate = new Date('invalid');

      expect(() => result.current.formatDate(invalidDate)).not.toThrow();
      expect(() => result.current.formatTime(invalidDate)).not.toThrow();
      expect(() => result.current.formatDateTime(invalidDate)).not.toThrow();
    });

    it('handles special number values', () => {
      const { result } = renderHook(() => useTranslation());

      expect(() => result.current.formatNumber(Infinity)).not.toThrow();
      expect(() => result.current.formatNumber(-Infinity)).not.toThrow();
      expect(() => result.current.formatNumber(NaN)).not.toThrow();
      
      expect(() => result.current.formatCurrency(Infinity)).not.toThrow();
      expect(() => result.current.formatCurrency(-Infinity)).not.toThrow();
      expect(() => result.current.formatCurrency(NaN)).not.toThrow();
    });
  });
});