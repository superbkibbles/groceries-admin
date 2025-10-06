import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Edit, Trash, Eye } from "lucide-react";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/store";
import { fetchProducts, deleteProduct } from "@/store/slices/productSlice";
import { useTranslation } from "@/hooks/useTranslation";

export default function Products() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { products, error } = useSelector((state: RootState) => state.products);
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Load products on component mount
  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  // Handle Redux error states
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Filter products based on search query
  const filteredProducts = useMemo(
    () =>
      products?.filter(
        (product) =>
          product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product?.categories &&
            product?.categories?.some((cat) =>
              cat?.toLowerCase().includes(searchQuery.toLowerCase())
            ))
      ),
    [products, searchQuery]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddProduct = () => {
    router.push("/dashboard/products/add");
  };

  const handleEditProduct = (id: string) => {
    router.push(`/dashboard/products/edit/${id}`);
  };

  const handleViewProduct = (id: string) => {
    router.push(`/dashboard/products/${id}`);
  };

  const confirmDelete = (id: string) => {
    setProductToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (productToDelete) {
      try {
        await dispatch(deleteProduct(productToDelete));
        toast.success(t("products.product_deleted"));
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
      } catch {
        toast.error("Failed to delete product");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("products.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("products.manage_inventory")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("products.product_list")}</CardTitle>
              <Button onClick={handleAddProduct}>
                <Plus className="mr-2 h-4 w-4" /> {t("products.add_new")}
              </Button>
            </div>
            <CardDescription>
              {t("products.product_list_description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center py-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-8"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts?.map((product) => {
                      // Determine status based on stock quantity
                      const getProductStatus = (stockQuantity: number) => {
                        if (stockQuantity === 0)
                          return {
                            text: "Out of Stock",
                            className: "bg-red-100 text-red-800",
                          };
                        if (stockQuantity < 20)
                          return {
                            text: "Low Stock",
                            className: "bg-yellow-100 text-yellow-800",
                          };
                        return {
                          text: "In Stock",
                          className: "bg-green-100 text-green-800",
                        };
                      };

                      const status = getProductStatus(product.stock_quantity);

                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            {product.categories?.length > 0
                              ? product.categories.join(", ")
                              : "Uncategorized"}
                          </TableCell>
                          <TableCell>{product.stock_quantity}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                            >
                              {status.text}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleViewProduct(product.id)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEditProduct(product.id)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => confirmDelete(product.id)}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this product?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              product from your store.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
