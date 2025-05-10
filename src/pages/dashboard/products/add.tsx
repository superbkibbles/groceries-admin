import { useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import EnhancedProductForm from '@/components/products/EnhancedProductForm';
import { toast } from 'sonner';
import { productService } from '@/services';
import { Product } from '@/services/productService';

// Type for our product with variations
interface ProductWithVariations extends Product {
  options?: {
    id: string;
    name: string;
    values: string[];
  }[];
  variants?: {
    id: string;
    attributes: Record<string, string>;
    price: number;
    stock: number;
    sku: string;
  }[];
}

export default function AddProduct() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ProductWithVariations) => {
    setIsSubmitting(true);
    try {
      // Prepare the data for the API
      const productData = {
        name: data.name,
        description: data.description,
        price: data.price,
        categoryId: data.category, // Assuming category maps to categoryId
        stock: data.stock,
        sku: data.sku || '',
        isActive: true,
        // Handle other fields as needed
      };
      
      // Create the product
      const createdProduct = await productService.createProduct(productData);
      
      // Handle image uploads if there are images
      if (data.images && data.images.length > 0) {
        for (const imageUrl of data.images) {
          // Check if this is a File object (new upload) or a string URL
          if (imageUrl instanceof File) {
            await productService.uploadProductImage(createdProduct.id, imageUrl);
          }
        }
      }
      
      // Handle variants if they exist
      if (data.variants && data.variants.length > 0) {
        // In a real app, you would have API endpoints to manage variants
        // This is just a placeholder for demonstration
        console.log('Creating variants for product:', createdProduct.id, data.variants);
      }
      
      toast.success('Product created successfully');
      router.push('/dashboard/products');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground">
            Create a new product to add to your store inventory.
          </p>
        </div>

        <EnhancedProductForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </DashboardLayout>
  );
}