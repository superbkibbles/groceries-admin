import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";
import { TranslationForm } from "./TranslationForm";
import { Category } from "@/services/categoryService";
import { Translation } from "@/services/productService";
import { useTranslation } from "@/hooks/useTranslation";
import { useFormik } from "formik";
import * as Yup from "yup";

interface EnhancedProductFormProps {
  initialData?: {
    id?: string;
    name: string;
    description: string;
    price: number;
    categories: string[]; // Array of category IDs
    stock_quantity: number; // Renamed to match backend
    images: string[];
    sku?: string;
    attributes?: Record<string, string | number | boolean>; // Generic attributes for variations
    translations?: Record<string, Translation>; // Embedded translations
  };
  onSubmit: (data: EnhancedProductFormProps["initialData"]) => void;
  isSubmitting?: boolean;
  categories?: Category[]; // Categories from Redux
}

type FormValues = {
  id?: string;
  name: string;
  description: string;
  price: number;
  categories: string[];
  stock_quantity: number;
  images: string[];
  sku?: string;
  attributes?: Record<string, string | number | boolean>;
  translations?: Record<string, Translation>;
};

const EnhancedProductForm: React.FC<EnhancedProductFormProps> = ({
  initialData = {
    name: "",
    description: "",
    price: 0,
    categories: [],
    stock_quantity: 0,
    images: [],
    sku: "",
    attributes: {},
  },
  onSubmit,
  isSubmitting = false,
  categories: availableCategories = [],
}) => {
  const router = useRouter();
  // Legacy local state removed; using Formik
  const [activeTab, setActiveTab] = useState("basic");
  // Translations are managed via Formik; no separate local state
  const { t } = useTranslation();

  const validationSchema = Yup.object({
    name: Yup.string().trim().required(t("products.name_required")),
    description: Yup.string()
      .trim()
      .required(t("products.description_required")),
    price: Yup.number()
      .typeError(t("products.price_required"))
      .moreThan(0, t("products.price_required")),
    categories: Yup.array()
      .of(Yup.string().required())
      .min(1, t("products.category_required")),
    stock_quantity: Yup.number()
      .typeError(t("products.stock_required"))
      .min(0, t("products.stock_required")),
    images: Yup.array().of(Yup.string()).min(1, t("products.image_required")),
    sku: Yup.string().nullable(),
    attributes: Yup.object().nullable(),
    translations: Yup.mixed().nullable(),
  });

  const formik = useFormik<FormValues>({
    initialValues: {
      id: initialData.id,
      name: initialData.name,
      description: initialData.description,
      price: initialData.price,
      categories: initialData.categories,
      stock_quantity: initialData.stock_quantity,
      images: initialData.images || [],
      sku: initialData.sku,
      attributes: initialData.attributes || {},
      translations: initialData.translations || {},
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      const valuesWithEn = {
        ...values,
        translations: {
          ...(values?.translations || {}),
          ...(values?.name || values?.description
            ? {
                en: {
                  name: values.name,
                  description: values.description,
                },
              }
            : {}),
        },
      };
      onSubmit(valuesWithEn);
    },
  });

  // No local sync needed; Formik enableReinitialize handles re-population

  const handleBasicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const parsed =
      name === "price" || name === "stock_quantity"
        ? parseFloat(value) || 0
        : value;
    formik.setFieldValue(
      name as keyof NonNullable<typeof formik.initialValues>,
      parsed
    );
    formik.setFieldTouched(
      name as keyof NonNullable<typeof formik.initialValues>,
      true,
      false
    );
  };

  const handleCategoryChange = (value: string) => {
    formik.setFieldValue("categories", [value]);
    formik.setFieldTouched("categories", true, false);
  };

  const handleImagesChange = (images: string[]) => {
    formik.setFieldValue("images", images);
    formik.setFieldTouched("images", true, false);
  };

  const handleAttributeChange = (
    key: string,
    value: string | number | boolean
  ) => {
    const next = { ...(formik.values?.attributes || {}) } as Record<
      string,
      string | number | boolean
    >;
    next[key] = value;
    formik.setFieldValue("attributes", next);
  };

  // Validation handled by Yup schema

  // Translations handled via setFieldValue in TranslationForm handler

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    formik.handleSubmit();
    const fErrors = formik.errors as Record<string, unknown>;
    if (fErrors.name || fErrors.description || fErrors.categories) {
      setActiveTab("basic");
    } else if (fErrors.price || fErrors.stock_quantity) {
      setActiveTab("pricing");
    } else if (fErrors.images) {
      setActiveTab("images");
    }
    if (Object.keys(fErrors).length) {
      toast.error("Please fix the errors in the form");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {initialData.id ? "Edit Product" : "Add New Product"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="basic">
                {t("products.basic_info")}
              </TabsTrigger>
              <TabsTrigger value="translations">
                {t("products.translations")}
              </TabsTrigger>
              <TabsTrigger value="images">{t("products.images")}</TabsTrigger>
              <TabsTrigger value="pricing">
                {t("products.pricing_inventory")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {t("products.product_name")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formik.values?.name || ""}
                  onChange={handleBasicChange}
                  onBlur={formik.handleBlur}
                  placeholder={t("products.enter_name")}
                  aria-invalid={!!(formik.touched.name && formik.errors.name)}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-sm text-destructive">
                    {formik.errors.name as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  {t("products.product_description")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formik.values?.description || ""}
                  onChange={handleBasicChange}
                  onBlur={formik.handleBlur}
                  placeholder={t("products.enter_description")}
                  rows={6}
                  aria-invalid={
                    !!(formik.touched.description && formik.errors.description)
                  }
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="text-sm text-destructive">
                    {formik.errors.description as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={
                    (formik.values?.categories &&
                      formik.values.categories[0]) ||
                    ""
                  }
                  onValueChange={(val) => {
                    handleCategoryChange(val);
                  }}
                >
                  <SelectTrigger
                    id="category"
                    aria-invalid={
                      !!(formik.touched.categories && formik.errors.categories)
                    }
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.touched.categories && formik.errors.categories && (
                  <p className="text-sm text-destructive">
                    {(formik.errors.categories as unknown as string) ||
                      t("products.category_required")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formik.values?.sku || ""}
                  onChange={handleBasicChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter product SKU"
                />
              </div>

              <div className="space-y-4">
                <Label>Product Attributes (Optional)</Label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="attributeType">Attribute Type</Label>
                    <Input
                      id="attributeType"
                      placeholder="e.g., Size, Color, Weight"
                      onChange={(e) => {
                        const value = e.target.value;
                        const attrVal = (
                          formik.values?.attributes as
                            | Record<string, unknown>
                            | undefined
                        )?.attributeValue as string | undefined;
                        if (value && attrVal) {
                          handleAttributeChange(value, attrVal);
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attributeValue">Attribute Value</Label>
                    <Input
                      id="attributeValue"
                      placeholder="e.g., Large, Red, 500g"
                      onChange={(e) => {
                        const value = e.target.value;
                        const typeElement = document.getElementById(
                          "attributeType"
                        ) as HTMLInputElement;
                        const type = typeElement?.value;
                        if (type && value) {
                          handleAttributeChange(type, value);
                        }
                      }}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add custom attributes to describe product variations or
                  properties.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="translations" className="space-y-4">
              <TranslationForm
                initialTranslations={
                  (formik.values?.translations || {}) as Record<
                    string,
                    Translation
                  >
                }
                onTranslationChange={(language, field, value) => {
                  const next = {
                    ...(formik.values?.translations || {}),
                    [language]: {
                      ...((formik.values?.translations || {})[language] || {}),
                      [field]: value,
                    },
                  } as Record<string, Translation>;
                  formik.setFieldValue("translations", next);
                }}
                basicProductInfo={{
                  name: formik.values?.name || "",
                  description: formik.values?.description || "",
                }}
              />
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <ImageUpload
                images={formik.values?.images || []}
                onChange={(imgs) => {
                  handleImagesChange(imgs);
                }}
              />
              {formik.touched.images && formik.errors.images && (
                <p className="text-sm text-destructive mt-2">
                  {(formik.errors.images as unknown as string) ||
                    t("products.image_required")}
                </p>
              )}
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price ($) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formik.values?.price ?? 0}
                    onChange={handleBasicChange}
                    onBlur={formik.handleBlur}
                    placeholder="0.00"
                    aria-invalid={
                      !!(formik.touched.price && formik.errors.price)
                    }
                  />
                  {formik.touched.price && formik.errors.price && (
                    <p className="text-sm text-destructive">
                      {formik.errors.price as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">
                    Stock Quantity <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={formik.values?.stock_quantity ?? 0}
                    onChange={handleBasicChange}
                    onBlur={formik.handleBlur}
                    placeholder="0"
                    aria-invalid={
                      !!(
                        formik.touched.stock_quantity &&
                        formik.errors.stock_quantity
                      )
                    }
                  />
                  {formik.touched.stock_quantity &&
                    formik.errors.stock_quantity && (
                      <p className="text-sm text-destructive">
                        {formik.errors.stock_quantity as string}
                      </p>
                    )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || formik.isSubmitting}>
            {isSubmitting || formik.isSubmitting
              ? "Saving..."
              : formik.values?.id
              ? "Update Product"
              : "Create Product"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default EnhancedProductForm;
