import api from "./axios";

export interface Translation {
  name: string;
  description: string;
}

export interface LocalizedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  images?: string[];
  categories: string[];
  stock_quantity: number;
  sku?: string;
  attributes?: Record<string, string | number | boolean>;
  translations?: Record<string, Translation>;
  created_at: string;
  updated_at: string;
}

export interface LocalizedCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  parent_id?: string;
  level: number;
  path: string[];
  translations?: Record<string, Translation>;
  children?: LocalizedCategory[];
  created_at: string;
  updated_at: string;
}

export type SupportedLanguage = "en" | "ar";

export interface LanguageResponse {
  languages: SupportedLanguage[];
  default_language: SupportedLanguage;
}

class LocalizationService {
  private currentLanguage: SupportedLanguage = "en";
  private supportedLanguages: SupportedLanguage[] = ["en", "ar"];
  private isInitialized: boolean = false;

  constructor() {
    // Don't initialize immediately - wait for client-side
  }

  private initializeLanguage() {
    // Only run on client-side
    if (typeof window === "undefined") {
      return;
    }

    // Try to get language from localStorage first
    const storedLang = localStorage.getItem(
      "preferred_language"
    ) as SupportedLanguage;
    if (storedLang && this.supportedLanguages.includes(storedLang)) {
      this.currentLanguage = storedLang;
    } else {
      // Fallback to browser language
      const browserLang = navigator.language.split("-")[0] as SupportedLanguage;
      if (this.supportedLanguages.includes(browserLang)) {
        this.currentLanguage = browserLang;
      }
    }
    this.isInitialized = true;
  }

  /**
   * Ensure language is initialized (call this before using the service)
   */
  private ensureInitialized() {
    if (!this.isInitialized) {
      this.initializeLanguage();
    }
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): SupportedLanguage {
    this.ensureInitialized();
    return this.currentLanguage;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): SupportedLanguage[] {
    return this.supportedLanguages;
  }

  /**
   * Switch language and persist preference
   */
  async switchLanguage(language: SupportedLanguage): Promise<void> {
    this.ensureInitialized();

    if (!this.supportedLanguages.includes(language)) {
      throw new Error(`Unsupported language: ${language}`);
    }

    try {
      // Call backend language switch endpoint
      await api.post("/languages/switch", { language });

      // Update local state
      this.currentLanguage = language;

      // Only set localStorage if we're in the browser
      if (typeof window !== "undefined") {
        localStorage.setItem("preferred_language", language);
      }

      // Update document direction for RTL languages
      this.updateDocumentDirection(language);
    } catch (error) {
      console.error("Failed to switch language:", error);
      throw error;
    }
  }

  /**
   * Get supported languages from backend
   */
  async getSupportedLanguagesFromAPI(): Promise<LanguageResponse> {
    try {
      const response = await api.get("/languages");
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch supported languages:", error);
      // Return default values
      return {
        languages: ["en", "ar"],
        default_language: "en",
      };
    }
  }

  /**
   * Update document direction based on language
   */
  private updateDocumentDirection(language: SupportedLanguage) {
    if (typeof document !== "undefined") {
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = language;
    }
  }

  /**
   * Get language parameter for API requests
   */
  getLanguageParam(): string {
    this.ensureInitialized();
    return `?lang=${this.currentLanguage}`;
  }

  /**
   * Get Accept-Language header value
   */
  getAcceptLanguageHeader(): string {
    this.ensureInitialized();
    return this.currentLanguage;
  }

  /**
   * Check if current language is RTL
   */
  isRTL(): boolean {
    this.ensureInitialized();
    return this.currentLanguage === "ar";
  }

  /**
   * Apply localization to product data
   */
  applyProductLocalization(
    product: Record<string, unknown>,
    language?: SupportedLanguage
  ): LocalizedProduct {
    this.ensureInitialized();
    const lang = language || this.currentLanguage;

    const translations = product.translations as
      | Record<string, Translation>
      | undefined;

    // If product has translations, apply the requested language
    if (translations && translations[lang]) {
      return {
        ...product,
        name: translations[lang].name || (product.name as string),
        description:
          translations[lang].description || (product.description as string),
      } as LocalizedProduct;
    }

    // Fallback to English translation if available
    if (translations && translations.en) {
      return {
        ...product,
        name: translations.en.name || (product.name as string),
        description:
          translations.en.description || (product.description as string),
      } as LocalizedProduct;
    }

    // Return original product if no translations available
    return product as unknown as LocalizedProduct;
  }

  /**
   * Apply localization to category data
   */
  applyCategoryLocalization(
    category: Record<string, unknown>,
    language?: SupportedLanguage
  ): LocalizedCategory {
    this.ensureInitialized();
    const lang = language || this.currentLanguage;

    const translations = category.translations as
      | Record<string, Translation>
      | undefined;

    // If category has translations, apply the requested language
    if (translations && translations[lang]) {
      return {
        ...category,
        name: translations[lang].name || (category.name as string),
        description:
          translations[lang].description || (category.description as string),
      } as LocalizedCategory;
    }

    // Fallback to English translation if available
    if (translations && translations.en) {
      return {
        ...category,
        name: translations.en.name || (category.name as string),
        description:
          translations.en.description || (category.description as string),
      } as LocalizedCategory;
    }

    // Return original category if no translations available
    return category as unknown as LocalizedCategory;
  }

  /**
   * Create translation object for a product or category
   */
  createTranslation(name: string, description: string): Translation {
    return { name, description };
  }

  /**
   * Update axios instance with language headers
   */
  updateAxiosLanguage() {
    this.ensureInitialized();
    api.defaults.headers.common["Accept-Language"] =
      this.getAcceptLanguageHeader();
  }
}

// Create singleton instance
const localizationService = new LocalizationService();

export default localizationService;
