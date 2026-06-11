import { useEffect, useSyncExternalStore } from 'react';
import enTranslations from '@/locales/en.json';
import arTranslations from '@/locales/ar.json';

type Language = 'en' | 'ar';
type TranslationTree = typeof enTranslations;

const translations: Record<Language, TranslationTree> = {
  en: enTranslations,
  ar: arTranslations,
};

const STORAGE_KEY = 'palrec_language';
const LANGUAGE_EVENT = 'palrec_language_change';

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'ar') return stored;

  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'ar' ? 'ar' : 'en';
};

let currentLanguage: Language = getInitialLanguage();

const subscribe = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(LANGUAGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(LANGUAGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
};

const getSnapshot = () => currentLanguage;
const getServerSnapshot = () => 'en' as Language;

const readPath = <T,>(source: unknown, key: string): T | undefined => {
  const keys = key.split('.');
  let value: any = source;
  for (const item of keys) {
    value = value?.[item];
    if (value === undefined) return undefined;
  }
  return value as T;
};

const applyDocumentLanguage = (language: Language) => {
  if (typeof document === 'undefined') return;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
};

const setGlobalLanguage = (language: Language) => {
  currentLanguage = language;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, language);
    applyDocumentLanguage(language);
    window.dispatchEvent(new Event(LANGUAGE_EVENT));
  }
};

export const useTranslation = () => {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    applyDocumentLanguage(language);
  }, [language]);

  const t = (key: string): string => {
    const value = readPath<unknown>(translations[language], key);
    if (typeof value === 'string') return value;

    const fallback = readPath<unknown>(translations.en, key);
    if (typeof fallback === 'string') return fallback;

    return key;
  };

  const get = <T,>(key: string): T => {
    const value = readPath<T>(translations[language], key);
    if (value !== undefined) return value;

    const fallback = readPath<T>(translations.en, key);
    if (fallback !== undefined) return fallback;

    return key as T;
  };

  const switchLanguage = (lang: Language) => {
    setGlobalLanguage(lang);
  };

  return {
    t,
    get,
    language,
    switchLanguage,
    isRTL: language === 'ar',
  };
};
