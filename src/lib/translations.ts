import enTranslations from '@/locales/en.json';
import arTranslations from '@/locales/ar.json';

export type Language = 'en' | 'ar';

export const translations = {
  en: enTranslations,
  ar: arTranslations,
};

/**
 * Get a translation value by key path (e.g., 'auth.login')
 * @param key - Dot-separated key path
 * @param language - Target language
 * @returns Translated string or key if not found
 */
export const getTranslation = (key: string, language: Language = 'en'): string => {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to English if not found in target language
      let fallback: any = translations.en;
      for (const fk of keys) {
        fallback = fallback?.[fk];
      }
      return fallback || key;
    }
  }
  
  return value || key;
};

/**
 * Get all available languages
 */
export const getAvailableLanguages = () => [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
];
