import { useState, useEffect } from 'react';
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

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<ProductWithVariations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      const fetchProduct = async () => {
        try {
          setIsLoading(true);
          const productData = await productService.getProductById(id);
          
          // Transform the product data to include options and variants if they exist
          const productWithVariations: ProductWithVariations = {
            ...productData,
            // If the API doesn't return these fields, initialize them as empty arrays
            options: productData.options || [],
            variants: productData.variants || []
          };
          
          setProduct(productWithVariations);
        } catch (error) {
          console.error('Error fetching product:', error);
          toast.error('Failed to load product');
          router.push('/dashboard/products');
        } finally {
          setIsLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, router]);

  const handleSubmit = async (data: ProductWithVariations) => {
    if (!id || typeof id !== 'string') return;
    
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
        // Handle other fields as needed
      };
      
      // Update the product
      await productService.updateProduct(id, productData);
      
      // Handle image uploads if there are new images
      if (data.images && data.images.length > 0) {
        // This is a simplified example - in a real app, you'd need to track which images are new
        // and only upload those, and also handle image deletions
        for (const imageUrl of data.images) {
          // Check if this is a File object (new upload) or a string URL (existing image)
          if (imageUrl instanceof File) {
            await productService.uploadProductImage(id, imageUrl);
          }
        }
      }
      
      // Handle variants if they exist
      if (data.variants && data.variants.length > 0) {
        // In a real app, you would have API endpoints to manage variants
        // This is just a placeholder for demonstration
        console.log('Updating variants:', data.variants);
      }
      
      toast.success('Product updated successfully');
      router.push('/dashboard/products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading product...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">
            Update the details of an existing product.
          </p>
        </div>

        {product && (
          <EnhancedProductForm 
            initialData={product} 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
          />
        )}
      </div>
    </DashboardLayout>
  );
}