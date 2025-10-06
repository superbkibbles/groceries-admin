import React, { useState } from "react";
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
import { TranslationForm } from "@/components/products/TranslationForm";
import { Category } from "@/services/categoryService";
import { Translation } from "@/services/categoryService";

interface CategoryFormProps {
  initialData?: {
    id?: string;
    name: string;
    description: string;
    slug: string;
    parentId?: string;
    level?: number;
    path?: string[];
    translations?: Record<string, Translation>;
    isActive?: boolean;
  };
  onSubmit: (data: CategoryFormProps["initialData"]) => void;
  isSubmitting?: boolean;
  categories?: Category[]; // Available parent categories
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData = {
    name: "",
    description: "",
    slug: "",
    parentId: "",
    level: 1,
    path: [],
    translations: {},
    isActive: true,
  },
  onSubmit,
  isSubmitting = false,
  categories: availableCategories = [],
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("basic");
  const [translations, setTranslations] = useState<Record<string, Translation>>(
    initialData.translations || {}
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from name
    if (name === "name") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({
        ...prev,
        slug,
      }));
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleParentCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      parentId: value || undefined,
    }));

    // Clear parent category error
    if (errors.parentId) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.parentId;
        return newErrors;
      });
    }
  };

  const handleTranslationsSubmit = (
    newTranslations: Record<string, Translation>
  ) => {
    setTranslations(newTranslations);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Category description is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Category slug is required";
    }

    // Validate slug format
    if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const dataWithTranslations = {
        ...formData,
        translations,
      };
      onSubmit(dataWithTranslations);
    } else {
      toast.error("Please fix the errors in the form");
      // Switch to the tab with errors
      if (errors.name || errors.description || errors.slug) {
        setActiveTab("basic");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {initialData.id ? "Edit Category" : "Add New Category"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="translations">Translations</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Category Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter category name"
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter category description"
                  rows={4}
                  aria-invalid={!!errors.description}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="category-slug"
                  aria-invalid={!!errors.slug}
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  URL-friendly version of the name. Auto-generated from name but
                  can be customized.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentId">Parent Category (Optional)</Label>
                <Select
                  value={formData.parentId || ""}
                  onValueChange={handleParentCategoryChange}
                >
                  <SelectTrigger id="parentId">
                    <SelectValue placeholder="Select a parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Parent (Root Category)</SelectItem>
                    {availableCategories
                      .filter((cat) => !cat.parentId) // Only show root categories as potential parents
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="translations" className="space-y-4">
              <TranslationForm
                initialTranslations={translations}
                onSubmit={handleTranslationsSubmit}
                isLoading={isSubmitting}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : initialData.id
              ? "Update Category"
              : "Create Category"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default CategoryForm;
