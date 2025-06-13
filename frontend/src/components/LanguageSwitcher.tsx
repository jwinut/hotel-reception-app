// src/components/LanguageSwitcher.tsx
import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import AccessibleButton from './AccessibleButton';
import './LanguageSwitcher.css';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'dropdown' | 'buttons' | 'text';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = memo(({ 
  className = '', 
  variant = 'text' 
}) => {
  const { i18n, t } = useTranslation();

  const changeLanguage = useCallback((lng: string) => {
    i18n.changeLanguage(lng);
    // Announce language change to screen readers
    const languageName = lng === 'th' ? t('language.thai') : t('language.english');
    const announcement = t('language.current', { language: languageName });
    
    // Use setTimeout to ensure the DOM is updated with new language before announcing
    setTimeout(() => {
      const liveRegion = document.getElementById('live-region');
      if (liveRegion) {
        liveRegion.textContent = announcement;
        setTimeout(() => {
          liveRegion.textContent = '';
        }, 1000);
      }
    }, 100);
  }, [i18n, t]);

  const currentLanguage = i18n.language;

  if (variant === 'dropdown') {
    return (
      <div className={`language-switcher dropdown ${className}`.trim()}>
        <label htmlFor="language-select" className="sr-only">
          {t('language.switch')}
        </label>
        <select
          id="language-select"
          value={currentLanguage}
          onChange={(e) => changeLanguage(e.target.value)}
          className="language-select"
          aria-label={t('language.switch')}
        >
          <option value="th">{t('language.thai')}</option>
          <option value="en">{t('language.english')}</option>
        </select>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div 
        className={`language-switcher text ${className}`.trim()}
        role="group"
        aria-label={t('language.switch')}
      >
        <span
          className={`language-text ${currentLanguage === 'th' ? 'active' : ''}`}
          onClick={() => changeLanguage('th')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              changeLanguage('th');
            }
          }}
          aria-label={`${t('language.thai')} ${currentLanguage === 'th' ? '(ปัจจุบัน)' : ''}`}
        >
          TH
        </span>
        <span className="language-divider">|</span>
        <span
          className={`language-text ${currentLanguage === 'en' ? 'active' : ''}`}
          onClick={() => changeLanguage('en')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              changeLanguage('en');
            }
          }}
          aria-label={`${t('language.english')} ${currentLanguage === 'en' ? '(Current)' : ''}`}
        >
          EN
        </span>
      </div>
    );
  }

  // Default buttons variant
  return (
    <div 
      className={`language-switcher buttons ${className}`.trim()}
      role="group"
      aria-label={t('language.switch')}
    >
      <AccessibleButton
        variant={currentLanguage === 'th' ? 'primary' : 'ghost'}
        size="small"
        onClick={() => changeLanguage('th')}
        aria-pressed={currentLanguage === 'th'}
        aria-label={`${t('language.thai')} ${currentLanguage === 'th' ? '(ปัจจุบัน)' : ''}`}
        className="language-button"
      >
        ไทย
      </AccessibleButton>
      <AccessibleButton
        variant={currentLanguage === 'en' ? 'primary' : 'ghost'}
        size="small"
        onClick={() => changeLanguage('en')}
        aria-pressed={currentLanguage === 'en'}
        aria-label={`${t('language.english')} ${currentLanguage === 'en' ? '(Current)' : ''}`}
        className="language-button"
      >
        EN
      </AccessibleButton>
    </div>
  );
});

LanguageSwitcher.displayName = 'LanguageSwitcher';

export default LanguageSwitcher;