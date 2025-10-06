import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import CategoryForm from "@/components/categories/CategoryForm";
import { toast } from "sonner";
import { Category } from "@/services/categoryService";
import { AppDispatch, RootState } from "@/store";
import {
  fetchCategoryById,
  updateCategory,
  clearCurrentCategory,
  fetchCategories,
} from "@/store/slices/categorySlice";

// Type for our category form data - matches the backend structure
type CategoryFormData = Omit<Category, "id" | "createdAt" | "updatedAt">;

export default function EditCategory() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();

  const { currentCategory, loading, error } = useSelector(
    (state: RootState) => state.categories
  );
  const { categories } = useSelector((state: RootState) => state.categories);

  useEffect(() => {
    // Load categories
    dispatch(fetchCategories());

    // Load category if ID is available
    if (id && typeof id === "string") {
      dispatch(fetchCategoryById(id));
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentCategory());
    };
  }, [id, dispatch]);

  // Handle Redux error states
  useEffect(() => {
    if (error) {
      toast.error(error);
      router.push("/dashboard/categories");
    }
  }, [error, router]);

  const handleSubmit = async (data: CategoryFormData | undefined) => {
    if (!data) return;
    if (!id || typeof id !== "string") return;

    try {
      // The data structure now matches the backend exactly
      const categoryData: Partial<Category> = {
        name: data.name,
        description: data.description,
        slug: data.slug,
        parentId: data.parentId,
        level: data.level,
        path: data.path,
        translations: data.translations || {},
        isActive: data.isActive,
      };

      // Update the category using Redux
      const resultAction = await dispatch(
        updateCategory({
          categoryId: id,
          categoryData,
        })
      );

      if (updateCategory.fulfilled.match(resultAction)) {
        toast.success("Category updated successfully");
        router.push("/dashboard/categories");
      } else {
        throw new Error("Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading category...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
          <p className="text-muted-foreground">
            Update the details of an existing category.
          </p>
        </div>

        {currentCategory && (
          <CategoryForm
            initialData={{
              ...currentCategory,
              translations: currentCategory.translations || {},
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
