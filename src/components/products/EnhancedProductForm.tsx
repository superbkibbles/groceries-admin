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
import { Category } from "@/services/categoryService";

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
  };
  onSubmit: (data: EnhancedProductFormProps["initialData"]) => void;
  isSubmitting?: boolean;
  categories?: Category[]; // Categories from Redux
}

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
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("basic");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "stock_quantity"
          ? parseFloat(value) || 0
          : value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: [value], // For now, single category selection
    }));

    // Clear category error
    if (errors.categories) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.categories;
        return newErrors;
      });
    }
  };

  const handleImagesChange = (images: string[]) => {
    setFormData((prev) => ({
      ...prev,
      images,
    }));

    // Clear any image-related errors
    if (errors.images) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });
    }
  };

  const handleAttributeChange = (
    key: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [key]: value,
      },
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Product description is required";
    }

    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (!formData.categories || formData.categories.length === 0) {
      newErrors.categories = "At least one category is required";
    }

    if (formData.stock_quantity < 0) {
      newErrors.stock_quantity = "Stock cannot be negative";
    }

    // Validate at least one image is uploaded for the product
    if (formData.images.length === 0) {
      newErrors.images = "At least one product image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    } else {
      toast.error("Please fix the errors in the form");
      // Switch to the tab with errors
      if (errors.name || errors.description || errors.categories) {
        setActiveTab("basic");
      } else if (errors.price || errors.stock_quantity) {
        setActiveTab("pricing");
      } else if (errors.images) {
        setActiveTab("images");
      }
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
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="pricing">Pricing & Inventory</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
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
                  placeholder="Enter product description"
                  rows={6}
                  aria-invalid={!!errors.description}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.categories[0] || ""}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger
                    id="category"
                    aria-invalid={!!errors.categories}
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
                {errors.categories && (
                  <p className="text-sm text-destructive">
                    {errors.categories}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
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
                        if (value && formData.attributes?.attributeValue) {
                          handleAttributeChange(
                            value,
                            formData.attributes.attributeValue
                          );
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

            <TabsContent value="images" className="space-y-4">
              <ImageUpload
                images={formData.images}
                onChange={handleImagesChange}
              />
              {errors.images && (
                <p className="text-sm text-destructive mt-2">{errors.images}</p>
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
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    aria-invalid={!!errors.price}
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price}</p>
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
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    placeholder="0"
                    aria-invalid={!!errors.stock_quantity}
                  />
                  {errors.stock_quantity && (
                    <p className="text-sm text-destructive">
                      {errors.stock_quantity}
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : initialData.id
              ? "Update Product"
              : "Create Product"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default EnhancedProductForm;
