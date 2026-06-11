import enTranslations from "@/locales/en.json";
import arTranslations from "@/locales/ar.json";

export type Language = "en" | "ar";

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
export const getTranslation = (key: string, language: Language = "en"): string => {
  const keys = key.split(".");
  let value: unknown = translations[language];

  for (const k of keys) {
    value =
      typeof value === "object" && value !== null
        ? (value as Record<string, unknown>)[k]
        : undefined;
    if (value === undefined) {
      // Fallback to English if not found in target language
      let fallback: unknown = translations.en;
      for (const fk of keys) {
        fallback =
          typeof fallback === "object" && fallback !== null
            ? (fallback as Record<string, unknown>)[fk]
            : undefined;
      }
      return typeof fallback === "string" ? fallback : key;
    }
  }

  return typeof value === "string" ? value : key;
};

/**
 * Get all available languages
 */
export const getAvailableLanguages = () => [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
];
