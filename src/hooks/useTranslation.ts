import { useLanguage } from "@/contexts/LanguageContext";
import { SupportedLanguage } from "@/lib/localization";

// Import translation files
import enTranslations from "@/locales/en.json";
import arTranslations from "@/locales/ar.json";

type TranslationKey = string;
type TranslationData = Record<string, unknown>;

const translations: Record<SupportedLanguage, TranslationData> = {
  en: enTranslations,
  ar: arTranslations,
};

/**
 * Hook for accessing translations based on current language
 */
export const useTranslation = () => {
  const { currentLanguage } = useLanguage();

  /**
   * Get a translated string by key path (e.g., 'products.title' or 'common.save')
   */
  const t = (key: TranslationKey): string => {
    const keys = key.split(".");
    let translation: unknown = translations[currentLanguage];

    // Navigate through nested keys
    for (const k of keys) {
      if (translation && typeof translation === "object" && k in translation) {
        translation = (translation as Record<string, unknown>)[k];
      } else {
        // Fallback to English if key not found in current language
        translation = translations.en;
        for (const fallbackKey of keys) {
          if (
            translation &&
            typeof translation === "object" &&
            fallbackKey in translation
          ) {
            translation = (translation as Record<string, unknown>)[fallbackKey];
          } else {
            // If still not found, return the key itself
            console.warn(`Translation key "${key}" not found`);
            return key;
          }
        }
        break;
      }
    }

    // Return the translation if it's a string, otherwise return the key
    return typeof translation === "string" ? translation : key;
  };

  /**
   * Get a translated string with dynamic values
   */
  const tWithData = (
    key: TranslationKey,
    data: Record<string, string | number>
  ): string => {
    let translation = t(key);

    // Replace placeholders like {{name}} with actual values
    Object.entries(data).forEach(([placeholder, value]) => {
      translation = translation.replace(
        new RegExp(`{{${placeholder}}}`, "g"),
        String(value)
      );
    });

    return translation;
  };

  /**
   * Check if a translation key exists
   */
  const hasTranslation = (key: TranslationKey): boolean => {
    const keys = key.split(".");
    let translation: unknown = translations[currentLanguage];

    for (const k of keys) {
      if (translation && typeof translation === "object" && k in translation) {
        translation = (translation as Record<string, unknown>)[k];
      } else {
        return false;
      }
    }

    return typeof translation === "string";
  };

  /**
   * Get all translations for a specific namespace (e.g., 'products')
   */
  const getNamespace = (namespace: string): Record<string, string> => {
    const currentLangTranslations = translations[currentLanguage] as Record<
      string,
      unknown
    >;
    const enTranslations = translations.en as Record<string, unknown>;

    const translation =
      (currentLangTranslations[namespace] as Record<string, unknown>) ||
      (enTranslations[namespace] as Record<string, unknown>) ||
      {};

    // Flatten nested objects into dot notation
    const flatten = (obj: unknown, prefix = ""): Record<string, string> => {
      const result: Record<string, string> = {};

      if (obj && typeof obj === "object") {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const newKey = prefix ? `${prefix}.${key}` : key;
            const value = (obj as Record<string, unknown>)[key];

            if (typeof value === "string") {
              result[newKey] = value;
            } else if (typeof value === "object") {
              Object.assign(result, flatten(value, newKey));
            }
          }
        }
      }

      return result;
    };

    return flatten(translation);
  };

  return {
    t,
    tWithData,
    hasTranslation,
    getNamespace,
    currentLanguage,
  };
};

export default useTranslation;
