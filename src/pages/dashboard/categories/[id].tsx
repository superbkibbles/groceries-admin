import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/store";
import {
  fetchCategoryById,
  clearCurrentCategory,
} from "@/store/slices/categorySlice";
import { Edit, ArrowLeft, Globe } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function ViewCategory() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();

  const { currentCategory, loading, error } = useSelector(
    (state: RootState) => state.categories
  );
  const { t } = useTranslation();

  useEffect(() => {
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

  const handleEdit = () => {
    if (currentCategory?.id) {
      router.push(`/dashboard/categories/edit/${currentCategory.id}`);
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

  if (!currentCategory) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Category not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/categories")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("categories.back_to_categories")}
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {currentCategory.name}
          </h1>
          <p className="text-muted-foreground">
            {t("categories.view_details")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Category Info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Category Information</CardTitle>
                  <Button onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Category
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Name
                  </h4>
                  <p className="text-lg">{currentCategory.name}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Description
                  </h4>
                  <p className="text-sm">{currentCategory.description}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Slug
                  </h4>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {currentCategory.slug}
                  </code>
                </div>

                <Separator />

                <div className="flex items-center space-x-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">
                      Level
                    </h4>
                    <Badge
                      variant={
                        currentCategory.level === 1 ? "default" : "secondary"
                      }
                    >
                      Level {currentCategory.level || 1}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">
                      Status
                    </h4>
                    <Badge
                      variant={
                        currentCategory.isActive !== false
                          ? "default"
                          : "destructive"
                      }
                    >
                      {currentCategory.isActive !== false
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Created
                  </h4>
                  <p className="text-sm">
                    {new Date(currentCategory.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Last Updated
                  </h4>
                  <p className="text-sm">
                    {new Date(currentCategory.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Translations */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-4 w-4" />
                  Translations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentCategory.translations &&
                Object.keys(currentCategory.translations).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(currentCategory.translations).map(
                      ([lang, translation]) => (
                        <div key={lang} className="space-y-2">
                          <h4 className="font-medium text-sm text-muted-foreground">
                            {lang === "en"
                              ? "English"
                              : lang === "ar"
                              ? "Arabic"
                              : lang.toUpperCase()}
                          </h4>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {translation.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {translation.description}
                            </p>
                          </div>
                          <Separator />
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No translations available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
