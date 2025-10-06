import { SupportedLanguage } from "@/lib/localization";

// Import translation files
import enTranslations from "@/locales/en.json";
import arTranslations from "@/locales/ar.json";

const translations: Record<SupportedLanguage, Record<string, unknown>> = {
  en: enTranslations,
  ar: arTranslations,
};

/**
 * Test function to verify translation files are working correctly
 */
export const testTranslations = () => {
  console.log("🧪 Testing Translation Files...");

  // Test basic navigation translations
  const testKeys = [
    "navigation.dashboard",
    "navigation.products",
    "navigation.categories",
    "products.title",
    "products.add_new",
    "categories.title",
    "categories.add_new",
    "common.loading",
    "common.save",
    "language.english",
    "language.arabic",
  ];

  console.log("✅ English Translations:");
  testKeys.forEach((key) => {
    const value = getNestedValue(translations.en, key);
    console.log(`  ${key}: "${value}"`);
  });

  console.log("✅ Arabic Translations:");
  testKeys.forEach((key) => {
    const value = getNestedValue(translations.ar, key);
    console.log(`  ${key}: "${value}"`);
  });

  // Test that all keys exist in both languages
  const missingKeys: string[] = [];
  testKeys.forEach((key) => {
    if (!getNestedValue(translations.en, key)) {
      missingKeys.push(`EN: ${key}`);
    }
    if (!getNestedValue(translations.ar, key)) {
      missingKeys.push(`AR: ${key}`);
    }
  });

  if (missingKeys.length > 0) {
    console.warn("⚠️ Missing translation keys:", missingKeys);
  } else {
    console.log("✅ All test keys have translations in both languages");
  }

  console.log("🎉 Translation test completed!");
};

/**
 * Helper function to get nested values from translation objects
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return "";
    }
  }

  return typeof current === "string" ? current : "";
}

// Run test in development
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  testTranslations();
}

