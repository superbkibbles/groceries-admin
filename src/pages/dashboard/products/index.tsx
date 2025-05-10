import { useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Edit, Trash, Eye } from 'lucide-react';
import { toast } from 'sonner';

// Mock product data
const mockProducts = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 99.99,
    category: 'Electronics',
    stock: 45,
    status: 'In Stock',
  },
  {
    id: '2',
    name: 'Cotton T-Shirt',
    price: 24.99,
    category: 'Clothing',
    stock: 120,
    status: 'In Stock',
  },
  {
    id: '3',
    name: 'Smart Watch',
    price: 199.99,
    category: 'Electronics',
    stock: 18,
    status: 'Low Stock',
  },
  {
    id: '4',
    name: 'Desk Lamp',
    price: 34.99,
    category: 'Home',
    stock: 0,
    status: 'Out of Stock',
  },
  {
    id: '5',
    name: 'Leather Wallet',
    price: 49.99,
    category: 'Accessories',
    stock: 65,
    status: 'In Stock',
  },
];

export default function Products() {
  const router = useRouter();
  const [products, setProducts] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Filter products based on search query
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddProduct = () => {
    router.push('/dashboard/products/add');
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

  const handleDeleteProduct = () => {
    if (productToDelete) {
      // In a real app, you would call an API to delete the product
      setProducts(products.filter((product) => product.id !== productToDelete));
      toast.success('Product deleted successfully');
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product inventory, add new products, or update existing ones.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Product Inventory</CardTitle>
              <Button onClick={handleAddProduct}>
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </div>
            <CardDescription>A list of all products in your store.</CardDescription>
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
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              product.status === 'In Stock'
                                ? 'bg-green-100 text-green-800'
                                : product.status === 'Low Stock'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.status}
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
                              <DropdownMenuItem onClick={() => handleViewProduct(product.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditProduct(product.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => confirmDelete(product.id)}>
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
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
            <DialogTitle>Are you sure you want to delete this product?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the product from your store.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
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