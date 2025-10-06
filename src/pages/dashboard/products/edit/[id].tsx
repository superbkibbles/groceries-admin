import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import EnhancedProductForm from "@/components/products/EnhancedProductForm";
import { toast } from "sonner";
import { Product } from "@/services/productService";
import { AppDispatch, RootState } from "@/store";
import {
  fetchProductById,
  updateProduct,
  uploadProductImage,
  clearCurrentProduct,
} from "@/store/slices/productSlice";
import { fetchCategories } from "@/store/slices/categorySlice";

// Type for our product form data - matches the backend structure
type ProductFormData = Omit<Product, "id" | "created_at" | "updated_at">;

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();

  const { currentProduct, loading, error } = useSelector(
    (state: RootState) => state.products
  );
  const { categories } = useSelector((state: RootState) => state.categories);
  console.log("currentProduct", currentProduct);
  useEffect(() => {
    // Load categories
    dispatch(fetchCategories());

    // Load product if ID is available
    if (id && typeof id === "string") {
      dispatch(fetchProductById(id));
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [id, dispatch]);

  // Handle Redux error states
  useEffect(() => {
    if (error) {
      toast.error(error);
      router.push("/dashboard/products");
    }
  }, [error, router]);

  // Helper function to check if item is a File
  const isFile = (item: unknown): item is File => {
    return item instanceof File;
  };

  const handleSubmit = async (data: ProductFormData | undefined) => {
    if (!data) return;
    if (!id || typeof id !== "string") return;

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
        translations: data.translations || {},
      };

      // Update the product using Redux
      const resultAction = await dispatch(
        updateProduct({
          productId: id,
          productData,
        })
      );

      if (updateProduct.fulfilled.match(resultAction)) {
        // Handle image uploads if there are new images (if using separate upload endpoint)
        if (data.images && data.images.length > 0) {
          // This is a simplified example - in a real app, you'd need to track which images are new
          // and only upload those, and also handle image deletions
          for (const imageItem of data.images) {
            // Check if this is a File object (new upload) or a string URL (existing image)
            if (isFile(imageItem)) {
              await dispatch(
                uploadProductImage({
                  productId: id,
                  imageFile: imageItem,
                })
              );
            }
          }
        }

        toast.success("Product updated successfully");
        router.push("/dashboard/products");
      } else {
        throw new Error("Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  if (loading) {
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

        {currentProduct && (
          <EnhancedProductForm
            initialData={{
              ...currentProduct,
              images: currentProduct.images || [],
            }}
            onSubmit={handleSubmit}
            isSubmitting={loading}
            categories={categories}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
