import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/store";
import { fetchCategories, deleteCategory } from "@/store/slices/categorySlice";
import { useTranslation } from "@/hooks/useTranslation";
import { Category } from "@/services/categoryService";
import { Plus, Edit, Trash2, Eye } from "lucide-react";

export default function CategoriesPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading, error } = useSelector(
    (state: RootState) => state.categories
  );
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Handle Redux error states
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (
      window.confirm(
        `${t("categories.confirm_delete")} "${categoryName}"? ${t(
          "categories.delete_warning"
        )}`
      )
    ) {
      try {
        await dispatch(deleteCategory(categoryId));
        toast.success(t("categories.category_deleted"));
      } catch (deleteError) {
        console.error("Error deleting category:", deleteError);
        toast.error("Failed to delete category");
      }
    }
  };

  const handleEdit = (categoryId: string) => {
    router.push(`/dashboard/categories/edit/${categoryId}`);
  };

  const handleView = (categoryId: string) => {
    router.push(`/dashboard/categories/${categoryId}`);
  };

  const getCategoryLevel = (category: Category) => {
    if (!category.parentId) return 0;
    return category.level || 1;
  };

  const getIndentStyle = (level: number) => {
    return { paddingLeft: `${level * 20}px` };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>{t("common.loading")}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("categories.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("categories.manage_hierarchy")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Categories</CardTitle>
              <Button onClick={() => router.push("/dashboard/categories/add")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No categories found. Create your first category to get
                  started.
                </p>
                <Button
                  onClick={() => router.push("/dashboard/categories/add")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category: Category) => {
                    const level = getCategoryLevel(category);
                    return (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div style={getIndentStyle(level)}>
                            <div className="font-medium">{category.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {category.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {category.slug}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={level === 0 ? "default" : "secondary"}
                          >
                            Level {level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              category.isActive !== false
                                ? "default"
                                : "destructive"
                            }
                          >
                            {category.isActive !== false
                              ? "Active"
                              : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(category.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(category.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(category.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDelete(category.id, category.name)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
