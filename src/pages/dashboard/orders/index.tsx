import { useState, useEffect } from "react";
import { useRouter } from "next/router";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, MoreHorizontal, Eye } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchOrders,
  updateOrderStatus,
  markOrderShipped,
  markOrderDelivered,
} from "@/store/slices/orderSlice";
import {
  orderStatusAdminLabel,
  type OrderStatus,
} from "@/services/orderService";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const STATUS_OPTIONS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: orderStatusAdminLabel("pending") },
  { value: "paid", label: orderStatusAdminLabel("paid") },
  { value: "shipped", label: orderStatusAdminLabel("shipped") },
  { value: "delivered", label: orderStatusAdminLabel("delivered") },
  { value: "cancelled", label: orderStatusAdminLabel("cancelled") },
];

function formatMoney(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default function Orders() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { orders, totalOrders, loading, error } = useAppSelector(
    (state) => state.orders
  );
  const [customerIdInput, setCustomerIdInput] = useState("");
  const [appliedCustomerId, setAppliedCustomerId] = useState("");
  const [statusSelect, setStatusSelect] = useState<OrderStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [limit] = useState(DEFAULT_LIMIT);

  useEffect(() => {
    dispatch(
      fetchOrders({
        page: currentPage,
        limit,
        customerId: appliedCustomerId.trim() || undefined,
        status:
          statusSelect === "all" ? undefined : (statusSelect as OrderStatus),
      })
    );
  }, [dispatch, currentPage, limit, appliedCustomerId, statusSelect]);

  const handleApplyFilters = () => {
    const next = customerIdInput.trim();
    if (next && !/^[a-f\d]{24}$/i.test(next)) {
      toast.error("Customer ID must be a 24-character hex value (Mongo ObjectId).");
      return;
    }
    setAppliedCustomerId(next);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setCustomerIdInput("");
    setAppliedCustomerId("");
    setStatusSelect("all");
    setCurrentPage(1);
  };

  const handleViewOrder = (id: string) => {
    router.push(`/dashboard/orders/${id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCancelOrder = (orderId: string) => {
    dispatch(updateOrderStatus({ orderId, status: "cancelled" }));
    toast.success("Order cancelled");
  };

  const handleMarkShipped = async (orderId: string) => {
    const result = await dispatch(markOrderShipped(orderId));
    if (markOrderShipped.fulfilled.match(result)) {
      toast.success(
        "Order marked as shipped — paid set automatically when required"
      );
    } else {
      toast.error((result.payload as string) || "Could not mark as shipped");
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    const result = await dispatch(markOrderDelivered(orderId));
    if (markOrderDelivered.fulfilled.match(result)) {
      toast.success("Order marked as delivered");
    } else {
      toast.error((result.payload as string) || "Could not mark as delivered");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "pending":
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders and track their status.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Order history</CardTitle>
            </div>
            <CardDescription>
              Filter by customer ID and/or status (server-side). Leave customer
              empty for all customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 py-2 md:flex-row md:flex-wrap md:items-end">
              <div className="grid w-full max-w-md gap-2">
                <Label htmlFor="orders-customer-id">Customer ID</Label>
                <Input
                  id="orders-customer-id"
                  placeholder="24-char Mongo ObjectId (optional)"
                  value={customerIdInput}
                  onChange={(e) => setCustomerIdInput(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              <div className="grid w-full max-w-xs gap-2">
                <Label>Status</Label>
                <Select
                  value={statusSelect}
                  onValueChange={(v) => {
                    setStatusSelect(v as OrderStatus | "all");
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={handleApplyFilters}>
                  <Filter className="mr-2 h-4 w-4" />
                  Apply filters
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearFilters}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="rounded-md border mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                          <span className="ml-2">Loading orders...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-red-500"
                      >
                        Error loading orders: {error}
                      </TableCell>
                    </TableRow>
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No orders match these filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium font-mono text-xs max-w-[140px] truncate">
                          {order.id || "—"}
                        </TableCell>
                        <TableCell className="font-mono text-xs max-w-[120px] truncate">
                          {order.customerId || "—"}
                        </TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {orderStatusAdminLabel(order.status)}
                          </span>
                        </TableCell>
                        <TableCell>{formatMoney(order.total)}</TableCell>
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
                                onClick={() => handleViewOrder(order.id)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {(order.status === "pending" ||
                                order.status === "paid") && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleMarkShipped(order.id)}
                                  >
                                    Mark as shipped
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleCancelOrder(order.id)}
                                  >
                                    Cancel order
                                  </DropdownMenuItem>
                                </>
                              )}
                              {order.status === "shipped" && (
                                <DropdownMenuItem
                                  onClick={() => handleMarkDelivered(order.id)}
                                >
                                  Mark as delivered
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {!loading && totalOrders > 0 && (
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * limit, totalOrders)}
                  </span>{" "}
                  of <span className="font-medium">{totalOrders}</span> orders
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage * limit >= totalOrders}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
