import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import EnhancedProductForm from "@/components/products/EnhancedProductForm";
import { toast } from "sonner";
import { Product } from "@/services/productService";
import { AppDispatch, RootState } from "@/store";
import { createProduct } from "@/store/slices/productSlice";
import { fetchCategories } from "@/store/slices/categorySlice";

// Type for our product form data - matches the backend structure
type ProductFormData = Omit<Product, "id" | "created_at" | "updated_at">;

export default function AddProduct() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.products);
  const { categories } = useSelector((state: RootState) => state.categories);

  // Load categories on component mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Handle Redux error states
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async (data: ProductFormData | undefined) => {
    if (!data) return;
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
        // Images now come as UploadThing URLs from ImageUpload
        images: data.images || [],
        translations: data.translations || {},
      };

      // Create the product using Redux
      const resultAction = await dispatch(createProduct(productData));

      if (createProduct.fulfilled.match(resultAction)) {
        toast.success("Product created successfully");
        router.push("/dashboard/products");
      } else {
        throw new Error("Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
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
          isSubmitting={loading}
          categories={categories}
        />
      </div>
    </DashboardLayout>
  );
}
