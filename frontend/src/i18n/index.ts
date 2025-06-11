// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import thTranslations from './locales/th.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  th: {
    translation: thTranslations,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'th', // Default to Thai
    debug: process.env.NODE_ENV === 'development',

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Namespace configuration
    defaultNS: 'translation',
    ns: ['translation'],

    // React specific options
    react: {
      useSuspense: false, // Disable suspense to avoid loading issues
    },
  });

export default i18n;