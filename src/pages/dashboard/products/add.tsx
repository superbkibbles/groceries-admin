import { useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import EnhancedProductForm from "@/components/products/EnhancedProductForm";
import { toast } from "sonner";
import { productService } from "@/services";
import { Product } from "@/services/productService";

// Type for our product form data - matches the backend structure
type ProductFormData = Omit<Product, "id" | "created_at" | "updated_at">;

export default function AddProduct() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      // The data structure now matches the backend exactly
      const productData: Omit<Product, "id" | "created_at" | "updated_at"> = {
        name: data.name,
        description: data.description,
        price: data.price,
        categories: data.categories,
        stock_quantity: data.stock_quantity,
        sku: data.sku || "",
        attributes: data.attributes || {},
        images: [],
      };

      // Create the product
      const createdProduct = await productService.createProduct(productData);

      // Handle image uploads if there are images (if using separate upload endpoint)
      if (data.images && data.images.length > 0) {
        for (const imageUrl of data.images) {
          // Check if this is a File object (new upload) or a string URL
          if (imageUrl instanceof File) {
            await productService.uploadProductImage(
              createdProduct.id,
              imageUrl
            );
          }
        }
      }

      toast.success("Product created successfully");
      router.push("/dashboard/products");
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
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

        <EnhancedProductForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </DashboardLayout>
  );
}
