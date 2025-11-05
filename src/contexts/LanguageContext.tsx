import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import localizationService, { SupportedLanguage } from "@/lib/localization";

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  supportedLanguages: SupportedLanguage[];
  switchLanguage: (language: SupportedLanguage) => Promise<void>;
  isRTL: boolean;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  // Initialize with a stable default to avoid SSR/CSR hydration mismatch.
  // We'll sync with stored/browser preference after mount.
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>("en");
  const [supportedLanguages] = useState<SupportedLanguage[]>(
    localizationService.getSupportedLanguages()
  );
  const [isLoading, setIsLoading] = useState(false);

  // After mount, read the real preferred language from the client and update state.
  useEffect(() => {
    const lang = localizationService.getCurrentLanguage();
    if (lang !== currentLanguage) {
      setCurrentLanguage(lang);
    }
  // We intentionally want this to run only once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize document direction on mount
  useEffect(() => {
    const updateDocumentDirection = (language: SupportedLanguage) => {
      if (typeof document !== "undefined") {
        document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = language;
      }
    };

    updateDocumentDirection(currentLanguage);
    localizationService.updateAxiosLanguage();
  }, [currentLanguage]);

  const switchLanguage = async (language: SupportedLanguage) => {
    setIsLoading(true);
    try {
      await localizationService.switchLanguage(language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error("Failed to switch language:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    supportedLanguages,
    switchLanguage,
    isRTL: currentLanguage === "ar",
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
