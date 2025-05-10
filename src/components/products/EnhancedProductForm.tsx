import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';
import ProductVariations, { VariationOption, ProductVariant } from './ProductVariations';

interface EnhancedProductFormProps {
  initialData?: {
    id?: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    images: string[];
    sku?: string;
    options?: VariationOption[];
    variants?: ProductVariant[];
  };
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

const categories = [
  { id: 'electronics', name: 'Electronics' },
  { id: 'clothing', name: 'Clothing' },
  { id: 'home', name: 'Home' },
  { id: 'books', name: 'Books' },
  { id: 'accessories', name: 'Accessories' },
];

const EnhancedProductForm: React.FC<EnhancedProductFormProps> = ({
  initialData = {
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    images: [],
    sku: '',
    options: [],
    variants: [],
  },
  onSubmit,
  isSubmitting = false,
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value,
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

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));

    // Clear category error
    if (errors.category) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.category;
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

  const handleVariationsChange = (options: VariationOption[], variants: ProductVariant[]) => {
    setFormData((prev) => ({
      ...prev,
      options,
      variants,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }
    
    // If we have variants, make sure they have prices
    if (formData.variants && formData.variants.length > 0) {
      const invalidVariants = formData.variants.filter(v => v.price <= 0);
      if (invalidVariants.length > 0) {
        newErrors.variants = 'All variants must have a price greater than 0';
      }
    }
    
    // Validate at least one image is uploaded for the product
    if (formData.images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    } else {
      toast.error('Please fix the errors in the form');
      // Switch to the tab with errors
      if (errors.name || errors.description || errors.category) {
        setActiveTab('basic');
      } else if (errors.price || errors.stock) {
        setActiveTab('pricing');
      } else if (errors.images) {
        setActiveTab('images');
      } else if (errors.variants) {
        setActiveTab('variations');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{initialData.id ? 'Edit Product' : 'Add New Product'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="variations">Variations</TabsTrigger>
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
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
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
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.category} onValueChange={handleSelectChange}>
                  <SelectTrigger id="category" aria-invalid={!!errors.category}>
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
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category}</p>
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

            <TabsContent value="variations" className="space-y-4">
              <ProductVariations
                options={formData.options || []}
                variants={formData.variants || []}
                onChange={handleVariationsChange}
              />
              {errors.variants && (
                <p className="text-sm text-destructive mt-2">{errors.variants}</p>
              )}
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              {formData.variants && formData.variants.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This product has variations. Please set prices and inventory in the Variations tab.
                  </p>
                </div>
              ) : (
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
                    {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">
                      Stock <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="0"
                      aria-invalid={!!errors.stock}
                    />
                    {errors.stock && <p className="text-sm text-destructive">{errors.stock}</p>}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData.id ? 'Update Product' : 'Create Product'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default EnhancedProductForm;