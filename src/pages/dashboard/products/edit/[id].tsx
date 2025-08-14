import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import EnhancedProductForm from "@/components/products/EnhancedProductForm";
import { toast } from "sonner";
import { productService } from "@/services";
import { Product } from "@/services/productService";

// Type for our product form data - matches the backend structure
type ProductFormData = Omit<Product, "id" | "created_at" | "updated_at">;

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<ProductFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id && typeof id === "string") {
      const fetchProduct = async () => {
        try {
          setIsLoading(true);
          const productData = await productService.getProductById(id);

          // The product data from backend already matches our form structure
          const formData: ProductFormData = {
            ...productData,
          };

          setProduct(formData);
        } catch (error) {
          console.error("Error fetching product:", error);
          toast.error("Failed to load product");
          router.push("/dashboard/products");
        } finally {
          setIsLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, router]);

  const handleSubmit = async (data: ProductFormData) => {
    if (!id || typeof id !== "string") return;

    setIsSubmitting(true);
    try {
      // The data structure now matches the backend exactly
      const productData: Partial<Product> = {
        name: data.name,
        description: data.description,
        price: data.price,
        categories: data.categories,
        stock_quantity: data.stock_quantity,
        sku: data.sku || "",
        attributes: data.attributes || {},
        images: data.images || [],
      };

      // Update the product
      await productService.updateProduct(id, productData);

      // Handle image uploads if there are new images (if using separate upload endpoint)
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

      toast.success("Product updated successfully");
      router.push("/dashboard/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
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
