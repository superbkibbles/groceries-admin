import React, { useEffect, useState } from "react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Globe, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SupportedLanguage } from "@/lib/localization";
import { useTranslation } from "@/hooks/useTranslation";

interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, switchLanguage, isLoading } = useLanguage();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const languageOptions: LanguageOption[] = [
    {
      code: "en",
      name: t("language.english"),
      nativeName: "English",
      flag: "🇺🇸",
    },
    {
      code: "ar",
      name: t("language.arabic"),
      nativeName: "العربية",
      flag: "🇸🇦",
    },
  ];

  const handleLanguageChange = async (language: SupportedLanguage) => {
    try {
      await switchLanguage(language);
    } catch (error) {
      console.error("Failed to switch language:", error);
    }
  };

  const currentLanguageOption = languageOptions.find(
    (option) => option.code === currentLanguage
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <Globe className="h-4 w-4 mr-2" />
          <span suppressHydrationWarning>
            {mounted
              ? `${currentLanguageOption?.flag} ${currentLanguageOption?.nativeName}`
              : ""}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languageOptions.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => handleLanguageChange(option.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{option.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{option.nativeName}</span>
                <span className="text-xs text-muted-foreground">
                  {option.name}
                </span>
              </div>
            </div>
            {currentLanguage === option.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
