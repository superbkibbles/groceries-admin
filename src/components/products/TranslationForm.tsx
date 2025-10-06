import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Translation } from "@/services/productService";
import { SupportedLanguage } from "@/lib/localization";
import { useTranslation } from "@/hooks/useTranslation";

interface TranslationFormProps {
  initialTranslations?: Record<string, Translation>;
  onTranslationChange: (
    language: string,
    field: keyof Translation,
    value: string
  ) => void;
  basicProductInfo: {
    name: string;
    description: string;
  };
}

export const TranslationForm: React.FC<TranslationFormProps> = ({
  initialTranslations = {},
  onTranslationChange,
  basicProductInfo,
}) => {
  const { t } = useTranslation();

  const languageOptions: {
    code: SupportedLanguage;
    name: string;
    nativeName: string;
  }[] = [
    { code: "en", name: t("language.english"), nativeName: "English" },
    { code: "ar", name: t("language.arabic"), nativeName: "العربية" },
  ];

  // Get current translation values, with fallback to basic product info for English
  const getTranslationValue = (
    language: string,
    field: keyof Translation
  ): string => {
    if (language === "en") {
      return basicProductInfo[field] || "";
    }
    return initialTranslations[language]?.[field] || "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Translations</CardTitle>
        <p className="text-sm text-muted-foreground">
          English translations are automatically synced with the basic product
          information. Add Arabic translations below.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Tabs defaultValue="ar" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              {languageOptions.map((option) => (
                <TabsTrigger key={option.code} value={option.code}>
                  {option.nativeName}
                </TabsTrigger>
              ))}
            </TabsList>

            {languageOptions.map((option) => (
              <TabsContent key={option.code} value={option.code}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{option.name}</h3>
                    {option.code === "en" && (
                      <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                        Auto-synced
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`name-${option.code}`}>Name</Label>
                    <Input
                      id={`name-${option.code}`}
                      value={getTranslationValue(option.code, "name")}
                      onChange={(e) =>
                        onTranslationChange(option.code, "name", e.target.value)
                      }
                      placeholder={`Enter ${option.name} name`}
                      disabled={option.code === "en"}
                      className={option.code === "en" ? "bg-muted" : ""}
                    />
                    {option.code === "en" && (
                      <p className="text-xs text-muted-foreground">
                        This field is automatically synced with the product name
                        above
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`description-${option.code}`}>
                      Description
                    </Label>
                    <Textarea
                      id={`description-${option.code}`}
                      value={getTranslationValue(option.code, "description")}
                      onChange={(e) =>
                        onTranslationChange(
                          option.code,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder={`Enter ${option.name} description`}
                      rows={4}
                      disabled={option.code === "en"}
                      className={option.code === "en" ? "bg-muted" : ""}
                    />
                    {option.code === "en" && (
                      <p className="text-xs text-muted-foreground">
                        This field is automatically synced with the product
                        description above
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};
