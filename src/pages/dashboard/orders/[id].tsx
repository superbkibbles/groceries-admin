import { useEffect, useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Printer, XCircle, Truck, Check } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchOrderById,
  updateOrderStatus,
  markOrderShipped,
  markOrderDelivered,
} from "@/store/slices/orderSlice";
import { orderStatusAdminLabel } from "@/services/orderService";
import api from "@/lib/axios";

type CustomerInfo = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

function formatMoney(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default function OrderDetail() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useAppDispatch();
  const { currentOrder, loading, error } = useAppSelector(
    (state) => state.orders
  );
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);

  useEffect(() => {
    if (id && typeof id === "string") {
      dispatch(fetchOrderById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    const customerId = currentOrder?.customerId;
    if (!customerId) {
      setCustomer(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/users/${customerId}`);
        const u = res.data as Record<string, unknown>;
        if (cancelled) return;
        setCustomer({
          email: String(u.email ?? ""),
          firstName: String(u.first_name ?? u.firstName ?? ""),
          lastName: String(u.last_name ?? u.lastName ?? ""),
          phone: String(u.phone_number ?? u.phone ?? "") || undefined,
        });
      } catch {
        if (!cancelled) setCustomer(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentOrder?.customerId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  const handleCancelOrder = (orderId: string) => {
    dispatch(updateOrderStatus({ orderId, status: "cancelled" }));
    toast.success("Order cancelled");
  };

  const handleMarkShipped = async (orderId: string) => {
    const result = await dispatch(markOrderShipped(orderId));
    if (markOrderShipped.fulfilled.match(result)) {
      toast.success(
        "Order marked as shipped — status set to paid automatically where required"
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
      toast.error(
        (result.payload as string) || "Could not mark as delivered"
      );
    }
  };

  const handlePrintOrder = () => {
    window.print();
  };

  const shipping = currentOrder?.shippingInfo;
  const payment = currentOrder?.paymentInfo;
  const hasAddress =
    shipping &&
    [shipping.address, shipping.city, shipping.state, shipping.country].some(
      (x) => x?.trim()
    );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
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
          <Button onClick={() => router.push("/dashboard/orders")}>
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
          <Button onClick={() => router.push("/dashboard/orders")}>
            Back to Orders
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const { status } = currentOrder;

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push("/dashboard/orders")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {currentOrder.id || "Order"}
                </h1>
                <p className="text-muted-foreground">
                  Placed on {formatDate(currentOrder.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handlePrintOrder}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              {(status === "pending" || status === "paid") && (
                <>
                  <Button onClick={() => handleMarkShipped(currentOrder.id)}>
                    <Truck className="mr-2 h-4 w-4" />
                    Mark as shipped
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleCancelOrder(currentOrder.id)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              )}
              {status === "shipped" && (
                <Button onClick={() => handleMarkDelivered(currentOrder.id)}>
                  <Check className="mr-2 h-4 w-4" />
                  Mark as delivered
                </Button>
              )}
            </div>
          </div>
          {status === "pending" && (
            <p className="text-sm text-muted-foreground max-w-2xl">
              While this order is pending, use <strong>Mark as shipped</strong>{" "}
              first. After it is shipped, <strong>Mark as delivered</strong>{" "}
              will appear for when the customer receives it.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
              <CardDescription>
                From pending: mark as shipped first, then mark as delivered.
                Payment is set automatically when required before shipping.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(currentOrder.status)}`}
                >
                  {orderStatusAdminLabel(currentOrder.status)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last updated</span>
                <span>{formatDate(currentOrder.updatedAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment method</span>
                <span>
                  {payment?.method?.trim()
                    ? payment.method
                    : "Not recorded"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment status</span>
                <span>
                  {payment?.status?.trim()
                    ? payment.status
                    : payment?.amount
                      ? "Recorded"
                      : "—"}
                </span>
              </div>
              {payment?.transactionId ? (
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground shrink-0">
                    Transaction
                  </span>
                  <span className="truncate font-mono text-xs">
                    {payment.transactionId}
                  </span>
                </div>
              ) : null}
              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatMoney(currentOrder.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>
                    {currentOrder.tax > 0
                      ? formatMoney(currentOrder.tax)
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {currentOrder.shipping > 0
                      ? formatMoney(currentOrder.shipping)
                      : "—"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tax and shipping are not stored separately on this API; order
                  total is the sum of line items.
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatMoney(currentOrder.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
              <CardDescription>Buyer and delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Customer ID
                </h3>
                <p className="mt-1 font-mono text-sm break-all">
                  {currentOrder.customerId || "—"}
                </p>
              </div>
              {customer ? (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Name
                    </h3>
                    <p className="mt-1 font-medium">
                      {[customer.firstName, customer.lastName]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Email
                    </h3>
                    <p className="mt-1">{customer.email || "—"}</p>
                  </div>
                  {customer.phone ? (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Phone
                      </h3>
                      <p className="mt-1">{customer.phone}</p>
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Could not load customer profile (check permissions or ID).
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Shipping address</CardTitle>
              <CardDescription>From order shipping_info</CardDescription>
            </CardHeader>
            <CardContent>
              {hasAddress ? (
                <address className="not-italic text-sm space-y-1">
                  {shipping?.address ? <p>{shipping.address}</p> : null}
                  <p>
                    {[shipping?.city, shipping?.state, shipping?.postalCode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {shipping?.country ? <p>{shipping.country}</p> : null}
                  {(shipping?.carrier || shipping?.trackingNum) && (
                    <div className="mt-4 pt-4 border-t space-y-1">
                      {shipping.carrier ? (
                        <p>
                          <span className="text-muted-foreground">
                            Carrier:{" "}
                          </span>
                          {shipping.carrier}
                        </p>
                      ) : null}
                      {shipping.trackingNum ? (
                        <p>
                          <span className="text-muted-foreground">
                            Tracking:{" "}
                          </span>
                          <span className="font-mono">{shipping.trackingNum}</span>
                        </p>
                      ) : null}
                    </div>
                  )}
                </address>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No structured address on this order.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Line items</CardTitle>
              <CardDescription>Products in this order</CardDescription>
            </CardHeader>
            <CardContent>
              {currentOrder.items && currentOrder.items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="hidden sm:table-cell">SKU</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrder.items.map((item) => (
                      <TableRow key={`${item.productId}-${item.sku}`}>
                        <TableCell>
                          <div className="font-medium">{item.name || "—"}</div>
                          <div className="text-xs text-muted-foreground font-mono sm:hidden">
                            {item.sku}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell font-mono text-sm">
                          {item.sku || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatMoney(item.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatMoney(item.subtotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  No line items on this order.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
