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
import { toast } from "sonner";

interface ProductFormProps {
  initialData?: {
    id?: string;
    name: string;
    description: string;
    price: number;
    categories: string[];
    stock_quantity: number;
    images?: string[];
    sku?: string;
    attributes?: Record<string, string | number | boolean>;
  };
  onSubmit: (data: ProductFormProps["initialData"]) => void;
  isSubmitting?: boolean;
}

const categories = [
  { id: "electronics", name: "Electronics" },
  { id: "clothing", name: "Clothing" },
  { id: "home", name: "Home" },
  { id: "books", name: "Books" },
  { id: "accessories", name: "Accessories" },
];

const ProductForm: React.FC<ProductFormProps> = ({
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
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      categories: [value],
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    } else {
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
        <CardContent className="space-y-4">
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
              rows={4}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.categories[0] || ""}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger id="category" aria-invalid={!!errors.categories}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categories && (
              <p className="text-sm text-destructive">{errors.categories}</p>
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

          {/* Image upload functionality would go here */}
          <div className="space-y-2">
            <Label>Product Images</Label>
            <div className="border border-dashed border-border rounded-md p-6 text-center">
              <p className="text-muted-foreground">
                Image upload functionality coming soon
              </p>
            </div>
          </div>
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

export default ProductForm;
