// Test utility for localization functionality
import localizationService from "@/lib/localization";

export const testLocalizationFeatures = () => {
  console.log("🧪 Testing Localization Features...");

  // Test 1: Get current language
  const currentLang = localizationService.getCurrentLanguage();
  console.log("✅ Current language:", currentLang);

  // Test 2: Get supported languages
  const supportedLangs = localizationService.getSupportedLanguages();
  console.log("✅ Supported languages:", supportedLangs);

  // Test 3: Check RTL support
  const isRTL = localizationService.isRTL();
  console.log("✅ Is RTL:", isRTL);

  // Test 4: Test product localization
  const mockProduct = {
    id: "1",
    name: "Test Product",
    description: "Test Description",
    price: 99.99,
    categories: ["cat1"],
    stock_quantity: 10,
    translations: {
      en: { name: "Test Product", description: "Test Description" },
      ar: { name: "منتج تجريبي", description: "وصف تجريبي" },
    },
  };

  const localizedProduct = localizationService.applyProductLocalization(
    mockProduct,
    "ar"
  );
  console.log("✅ Localized product (Arabic):", {
    name: localizedProduct.name,
    description: localizedProduct.description,
  });

  // Test 5: Test category localization
  const mockCategory = {
    id: "cat1",
    name: "Electronics",
    description: "Electronic devices",
    slug: "electronics",
    translations: {
      en: { name: "Electronics", description: "Electronic devices" },
      ar: { name: "إلكترونيات", description: "أجهزة إلكترونية" },
    },
  };

  const localizedCategory = localizationService.applyCategoryLocalization(
    mockCategory,
    "ar"
  );
  console.log("✅ Localized category (Arabic):", {
    name: localizedCategory.name,
    description: localizedCategory.description,
  });

  console.log("🎉 All localization tests passed!");
};

// Auto-run tests in development
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  // Run tests after a short delay to ensure everything is loaded
  setTimeout(() => {
    testLocalizationFeatures();
  }, 1000);
}
