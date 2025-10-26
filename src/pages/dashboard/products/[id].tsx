import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Mock product data - in a real app, this would come from an API
const mockProducts = [
  {
    id: "1",
    name: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation.",
    price: 99.99,
    category: "electronics",
    stock: 45,
    status: "In Stock",
    sku: "WH-001",
    createdAt: "2023-05-15T10:30:00Z",
    updatedAt: "2023-06-20T14:45:00Z",
    images: [],
  },
  {
    id: "2",
    name: "Cotton T-Shirt",
    description: "Comfortable cotton t-shirt available in various colors.",
    price: 24.99,
    category: "clothing",
    stock: 120,
    status: "In Stock",
    sku: "CT-002",
    createdAt: "2023-04-10T09:15:00Z",
    updatedAt: "2023-05-05T11:20:00Z",
    images: [],
  },
  {
    id: "3",
    name: "Smart Watch",
    description:
      "Feature-rich smart watch with health monitoring capabilities.",
    price: 199.99,
    category: "electronics",
    stock: 18,
    status: "Low Stock",
    sku: "SW-003",
    createdAt: "2023-03-22T13:40:00Z",
    updatedAt: "2023-06-18T16:30:00Z",
    images: [],
  },
  {
    id: "4",
    name: "Desk Lamp",
    description: "Adjustable desk lamp with multiple brightness settings.",
    price: 34.99,
    category: "home",
    stock: 0,
    status: "Out of Stock",
    sku: "DL-004",
    createdAt: "2023-02-05T15:20:00Z",
    updatedAt: "2023-04-12T10:10:00Z",
    images: [],
  },
  {
    id: "5",
    name: "Leather Wallet",
    description: "Genuine leather wallet with multiple card slots.",
    price: 49.99,
    category: "accessories",
    stock: 65,
    status: "In Stock",
    sku: "LW-005",
    createdAt: "2023-01-18T11:05:00Z",
    updatedAt: "2023-03-25T09:45:00Z",
    images: [],
  },
];

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  status: string;
  sku: string;
  createdAt: string;
  updatedAt: string;
  images: string[];
}

const categoryMap: Record<string, string> = {
  electronics: "Electronics",
  clothing: "Clothing",
  home: "Home",
  accessories: "Accessories",
  books: "Books",
};

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      // In a real app, you would fetch the product from an API
      const fetchProduct = async () => {
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 500));

          const foundProduct = mockProducts.find((p) => p.id === id);

          if (foundProduct) {
            setProduct(foundProduct);
          } else {
            toast.error("Product not found");
            router.push("/dashboard/products");
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          toast.error("Failed to load product");
        } finally {
          setIsLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, router]);

  const handleEdit = () => {
    router.push(`/dashboard/products/edit/${id}`);
  };

  const handleDelete = async () => {
    try {
      // In a real app, you would call an API to delete the product
      console.log("Deleting product:", id);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Product deleted successfully");
      router.push("/dashboard/products");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  if (!product) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <p>Product not found</p>
          <Button onClick={() => router.push("/dashboard/products")}>
            Back to Products
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/dashboard/products")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              {product.name}
            </h1>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Basic details about the product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Name
                  </h3>
                  <p className="mt-1">{product.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    SKU
                  </h3>
                  <p className="mt-1">{product.sku}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Price
                  </h3>
                  <p className="mt-1">${product.price.toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Category
                  </h3>
                  <p className="mt-1">
                    {categoryMap[product.category] || product.category}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Stock
                  </h3>
                  <p className="mt-1">{product.stock}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Status
                  </h3>
                  <p className="mt-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.status === "In Stock"
                          ? "bg-green-100 text-green-800"
                          : product.status === "Low Stock"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.status}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
              <CardDescription>Detailed product description</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{product.description}</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                Visual representation of the product
              </CardDescription>
            </CardHeader>
            <CardContent>
              {product.images && product.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {product.images.map((image: string, index: number) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden rounded-md border"
                    >
                      <Image
                        src={image}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="h-full w-full object-cover"
                        width={200}
                        height={200}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                  <p className="text-muted-foreground">No images available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
              <CardDescription>Additional information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Created At
                  </h3>
                  <p className="mt-1">{formatDate(product.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </h3>
                  <p className="mt-1">{formatDate(product.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
