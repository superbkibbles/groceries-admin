import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { userService, orderService } from '@/services';
import { Mail, Calendar, MapPin, Phone, Package, ArrowLeft } from 'lucide-react';

// Types
interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Address {
  id: string;
  userId: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  items: any[];
  shippingAddress: Address;
  createdAt: string;
}

export default function CustomerDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchCustomerData(id);
    }
  }, [id]);

  const fetchCustomerData = async (customerId: string) => {
    try {
      setLoading(true);
      // Fetch customer details
      const customerData = await userService.getUserById(customerId);
      setCustomer(customerData);

      // Fetch customer addresses
      const addressesData = await userService.getUserAddresses(customerId);
      setAddresses(addressesData);

      // Fetch customer orders
      const ordersData = await orderService.getOrdersByCustomer(customerId);
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to fetch customer data:', error);
      toast.error('Failed to load customer information');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getOrderStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading customer information...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-xl">Customer not found</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/customers')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/customers')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">
                {customer.firstName} {customer.lastName}
              </h1>
            </div>
            <p className="text-muted-foreground">
              Customer details and order history
            </p>
          </div>
          <Button onClick={() => window.location.href = `mailto:${customer.email}`}>
            <Mail className="mr-2 h-4 w-4" />
            Contact Customer
          </Button>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Basic details about the customer.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                      <p className="text-base">{customer.firstName} {customer.lastName}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Email Address</h3>
                      <p className="text-base">{customer.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          customer.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {customer.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Customer Since</h3>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <p className="text-base">{formatDate(customer.createdAt)}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                      <p className="text-base">{formatDate(customer.updatedAt)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Total Orders</h3>
                      <p className="text-base">{orders.length}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>All orders placed by this customer.</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-6">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No orders yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      This customer hasn't placed any orders yet.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.orderNumber}</TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  getOrderStatusBadgeClass(order.status)
                                }`}
                              >
                                {order.status}
                              </span>
                            </TableCell>
                            <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Saved Addresses</CardTitle>
                <CardDescription>Customer's shipping and billing addresses.</CardDescription>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-6">
                    <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No addresses saved</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      This customer hasn't saved any addresses yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                      <Card key={address.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base">{address.name}</CardTitle>
                            {address.isDefault && (
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <p>{address.addressLine1}</p>
                            {address.addressLine2 && <p>{address.addressLine2}</p>}
                            <p>
                              {address.city}, {address.state} {address.postalCode}
                            </p>
                            <p>{address.country}</p>
                            <div className="flex items-center pt-2">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{address.phone}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}