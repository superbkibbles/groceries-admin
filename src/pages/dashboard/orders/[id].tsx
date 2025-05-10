import { useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Printer, XCircle, Truck, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOrderById, updateOrderStatus } from '@/store/slices/orderSlice';
import type { Order } from '@/services/orderService';



export default function OrderDetail() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useAppDispatch();
  const { currentOrder, loading, error } = useAppSelector((state) => state.orders);

  useEffect(() => {
    if (id && typeof id === 'string') {
      dispatch(fetchOrderById(id));
    }
  }, [id, dispatch]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'pending':
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    dispatch(updateOrderStatus({ orderId, status: newStatus as Order['status'] }));
    toast.success(`Order status updated to ${newStatus}`);
  };

  const handlePrintOrder = () => {
    toast.success('Preparing order for printing...');
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <p>Loading order details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={() => router.push('/dashboard/orders')}>
            Back to Orders
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentOrder) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <p>Order not found</p>
          <Button onClick={() => router.push('/dashboard/orders')}>
            Back to Orders
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
              onClick={() => router.push('/dashboard/orders')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{currentOrder.id || 'Order ID Not Available'}</h1>
              <p className="text-muted-foreground">
                Placed on {formatDate(currentOrder.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handlePrintOrder}>
              <Printer className="mr-2 h-4 w-4" />
              Print Order
            </Button>
            {currentOrder.status !== 'shipped' && currentOrder.status !== 'delivered' && currentOrder.status !== 'cancelled' && (
              <Button onClick={() => handleUpdateStatus(currentOrder.id, 'shipped')}>
                <Truck className="mr-2 h-4 w-4" />
                Mark as Shipped
              </Button>
            )}
            {currentOrder.status === 'shipped' && (
              <Button onClick={() => handleUpdateStatus(currentOrder.id, 'delivered')}>
                <Check className="mr-2 h-4 w-4" />
                Mark as Delivered
              </Button>
            )}
            {currentOrder.status !== 'cancelled' && (
              <Button variant="destructive" onClick={() => handleUpdateStatus(currentOrder.id, 'cancelled')}>
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Order
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                Order details and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(currentOrder.status)}`}
                >
                  {currentOrder.status ? currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1) : 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Order Date</span>
                <span>{formatDate(currentOrder.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span>{currentOrder.paymentMethod || 'Not specified'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment Status</span>
                <span>{currentOrder.paymentStatus || 'Not specified'}</span>
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${currentOrder.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${currentOrder.tax?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${currentOrder.shipping?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t font-bold">
                  <span>Total</span>
                  <span>${currentOrder.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>
                Details about the customer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Customer ID</h3>
                <p className="mt-1 font-medium">{currentOrder.userId || 'N/A'}</p>
              </div>
              {currentOrder.shippingAddressId && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Shipping Address ID</h3>
                  <p className="mt-1">{currentOrder.shippingAddressId}</p>
                </div>
              )}
              {currentOrder.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Order Notes</h3>
                  <p className="mt-1">{currentOrder.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                Products included in this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentOrder.items && currentOrder.items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrder.items.map((item) => (
                      <TableRow key={item.id || `${item.productId}-${item.orderId}`}>
                        <TableCell className="font-medium">{item.productName || 'Product'}</TableCell>
                        <TableCell className="text-right">${item.price?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell className="text-right">{item.quantity || 0}</TableCell>
                        <TableCell className="text-right">${item.total?.toFixed(2) || '0.00'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-4">No items in this order</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}