import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import CategoryForm from "@/components/categories/CategoryForm";
import { toast } from "sonner";
import { Category } from "@/services/categoryService";
import { AppDispatch, RootState } from "@/store";
import { createCategory, fetchCategories } from "@/store/slices/categorySlice";

// Type for our category form data - matches the backend structure
type CategoryFormData = Omit<Category, "id" | "createdAt" | "updatedAt">;

export default function AddCategory() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector(
    (state: RootState) => state.categories
  );
  const { categories } = useSelector((state: RootState) => state.categories);

  // Load categories on component mount for parent category selection
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Handle Redux error states
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async (data: CategoryFormData | undefined) => {
    if (!data) return;
    try {
      // The data structure now matches the backend exactly
      const categoryData: Omit<Category, "id" | "createdAt" | "updatedAt"> = {
        name: data.name,
        description: data.description,
        slug: data.slug,
        parentId: data.parentId,
        level: data.level || 1,
        path: data.path || [],
        translations: data.translations || {},
        isActive: data.isActive !== false,
      };

      // Create the category using Redux
      const resultAction = await dispatch(createCategory(categoryData));

      if (createCategory.fulfilled.match(resultAction)) {
        toast.success("Category created successfully");
        router.push("/dashboard/categories");
      } else {
        throw new Error("Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Add New Category
          </h1>
          <p className="text-muted-foreground">
            Create a new category to organize your products.
          </p>
        </div>

        <CategoryForm
          onSubmit={handleSubmit}
          isSubmitting={loading}
          categories={categories}
        />
      </div>
    </DashboardLayout>
  );
}
