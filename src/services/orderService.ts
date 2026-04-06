import api from "@/lib/axios";

/** Matches groceries-backend entities.OrderStatus */
export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

/** Labels for admin UI — pending is always ship first, then deliver after shipped */
export function orderStatusAdminLabel(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "paid":
      return "Ready to ship";
    case "shipped":
      return "Shipped";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
  }
}

export interface OrderShippingInfo {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  carrier: string;
  trackingNum: string;
}

export interface OrderPaymentInfo {
  method: string;
  transactionId: string;
  paidAt?: string;
  status: string;
  amount: number;
  timestamp?: string;
}

export interface OrderItemRow {
  productId: string;
  variationId?: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

/**
 * Normalized order for the admin UI (maps backend snake_case).
 * Backend does not store separate tax/shipping lines; totals come from line items + total_amount.
 */
export interface Order {
  id: string;
  /** Same as id; used by some tables as "order #" */
  orderNumber: string;
  customerId: string;
  items: OrderItemRow[];
  totalAmount: number;
  status: OrderStatus;
  shippingInfo: OrderShippingInfo;
  paymentInfo: OrderPaymentInfo;
  createdAt: string;
  updatedAt: string;
  /** Sum of line item subtotals */
  subtotal: number;
  /** Not provided by API today */
  tax: number;
  shipping: number;
  /** Same as totalAmount from API */
  total: number;
}

export interface OrderFilter {
  page?: number;
  limit?: number;
  /** Mongo user ObjectID hex — sent as `customer_id` query param */
  customerId?: string;
  /** Exact backend status — sent as `status` query param when set */
  status?: OrderStatus | "";
}

function num(v: unknown, fallback = 0): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v !== "") return Number(v) || fallback;
  return fallback;
}

function str(v: unknown): string {
  return v == null ? "" : String(v);
}

function normalizeShippingInfo(raw: unknown): OrderShippingInfo {
  const s = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  return {
    address: str(s.address),
    city: str(s.city),
    state: str(s.state),
    country: str(s.country),
    postalCode: str(s.postal_code ?? s.postalCode),
    carrier: str(s.carrier),
    trackingNum: str(s.tracking_num ?? s.trackingNum),
  };
}

function normalizePaymentInfo(raw: unknown): OrderPaymentInfo {
  const p = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const paidAt = p.paid_at ?? p.paidAt;
  const ts = p.timestamp;
  return {
    method: str(p.method),
    transactionId: str(p.transaction_id ?? p.transactionId),
    paidAt: paidAt ? String(paidAt) : undefined,
    status: str(p.status),
    amount: num(p.amount),
    timestamp: ts ? String(ts) : undefined,
  };
}

function normalizeItem(raw: unknown): OrderItemRow {
  const i = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const price = num(i.price);
  const quantity = num(i.quantity);
  const subtotal = num(i.subtotal, price * quantity);
  return {
    productId: str(i.product_id ?? i.productId),
    variationId: str(i.variation_id ?? i.variationId) || undefined,
    sku: str(i.sku),
    name: str(i.name),
    price,
    quantity,
    subtotal,
  };
}

const VALID_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
];

export function normalizeOrder(raw: unknown): Order {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const id = str(o.id ?? o._id);
  const itemsRaw = o.items;
  const items: OrderItemRow[] = Array.isArray(itemsRaw)
    ? itemsRaw.map((it) => normalizeItem(it))
    : [];
  const subtotal = items.reduce((sum, it) => sum + it.subtotal, 0);
  const totalAmount = num(o.total_amount ?? o.totalAmount, subtotal);
  const rawStatus = str(o.status).toLowerCase() as OrderStatus;
  const status = VALID_STATUSES.includes(rawStatus) ? rawStatus : "pending";

  return {
    id,
    orderNumber: id,
    customerId: str(o.customer_id ?? o.customerId ?? o.userId),
    items,
    totalAmount,
    status,
    shippingInfo: normalizeShippingInfo(o.shipping_info ?? o.shippingInfo),
    paymentInfo: normalizePaymentInfo(o.payment_info ?? o.paymentInfo),
    createdAt: str(o.created_at ?? o.createdAt),
    updatedAt: str(o.updated_at ?? o.updatedAt),
    subtotal,
    tax: 0,
    shipping: 0,
    total: totalAmount,
  };
}

const orderService = {
  /**
   * Get all orders with optional filtering (paginated).
   */
  getOrders: async (filters: OrderFilter = {}) => {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const params: Record<string, string | number> = { page, limit };
    const customerId = filters.customerId?.trim();
    if (customerId) params.customer_id = customerId;
    const status = typeof filters.status === "string" ? filters.status.trim() : "";
    if (status) params.status = status;

    const response = await api.get("/orders", { params });
    const body = response.data as {
      data?: unknown[];
      total?: number;
      page?: number;
      limit?: number;
      total_pages?: number;
    };
    const list = Array.isArray(body?.data) ? body.data : [];
    return {
      ...body,
      data: list.map((row) => normalizeOrder(row)),
      total: body.total ?? list.length,
    };
  },

  /**
   * Get order by ID
   */
  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/orders/${orderId}`);
    return normalizeOrder(response.data);
  },

  /**
   * Update order status (backend returns message only; we refetch the order).
   */
  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    await api.put(`/orders/${orderId}/status`, { status });
    const response = await api.get(`/orders/${orderId}`);
    return normalizeOrder(response.data);
  },

  /**
   * Admin workflow: ship order. API requires `paid` before `shipped`, so pending → paid → shipped in one action.
   * “Delivered” in the UI means the customer received it; payment is treated as settled once shipped.
   */
  markAsShipped: async (orderId: string): Promise<Order> => {
    let order = await orderService.getOrderById(orderId);
    if (order.status === "cancelled") {
      throw new Error("Cannot ship a cancelled order");
    }
    if (order.status === "shipped" || order.status === "delivered") {
      return order;
    }
    if (order.status === "pending") {
      await api.put(`/orders/${orderId}/status`, { status: "paid" });
    }
    order = await orderService.getOrderById(orderId);
    if (order.status === "paid") {
      await api.put(`/orders/${orderId}/status`, { status: "shipped" });
    }
    return orderService.getOrderById(orderId);
  },

  /** Admin workflow: delivered — only after shipped (fulfillment complete; paid was set at ship). */
  markAsDelivered: async (orderId: string): Promise<Order> => {
    const order = await orderService.getOrderById(orderId);
    if (order.status !== "shipped") {
      throw new Error(
        "Mark the order as shipped before marking it as delivered"
      );
    }
    await api.put(`/orders/${orderId}/status`, { status: "delivered" });
    return orderService.getOrderById(orderId);
  },

  /**
   * Set payment — matches PUT /orders/:id/payment
   */
  setPaymentInfo: async (
    orderId: string,
    payload: { method: string; transactionId: string; amount: number }
  ) => {
    await api.put(`/orders/${orderId}/payment`, {
      method: payload.method,
      transaction_id: payload.transactionId,
      amount: payload.amount,
    });
    return orderService.getOrderById(orderId);
  },

  /**
   * Set tracking — matches PUT /orders/:id/tracking
   */
  setTrackingInfo: async (
    orderId: string,
    payload: { carrier: string; trackingNum: string }
  ) => {
    await api.put(`/orders/${orderId}/tracking`, {
      carrier: payload.carrier,
      tracking_num: payload.trackingNum,
    });
    return orderService.getOrderById(orderId);
  },

  /**
   * Legacy alias — backend has no PATCH payment-status; refetches order.
   */
  updatePaymentStatus: async (orderId: string, paymentStatus: string) => {
    void paymentStatus;
    return orderService.getOrderById(orderId);
  },

  /**
   * Legacy — backend has no notes endpoint; refetch only.
   */
  addOrderNotes: async (orderId: string, notes: string) => {
    void notes;
    return orderService.getOrderById(orderId);
  },

  /**
   * Get orders for a user (backend: GET /users/:id/orders)
   */
  getUserOrders: async (userId: string, page = 1, limit = 10) => {
    const response = await api.get(`/users/${userId}/orders`, {
      params: { page, limit },
    });
    const body = response.data as { data?: unknown[] };
    const list = Array.isArray(body?.data) ? body.data : [];
    return list.map((row) => normalizeOrder(row));
  },

  getOrdersByCustomer: async (customerId: string, page = 1, limit = 10) => {
    const response = await api.get(`/orders/customer/${customerId}`, {
      params: { page, limit },
    });
    const body = response.data as { data?: unknown[] };
    const list = Array.isArray(body?.data) ? body.data : [];
    return list.map((row) => normalizeOrder(row));
  },

  /**
   * Cancel = set status to cancelled
   */
  cancelOrder: async (orderId: string, reason?: string) => {
    void reason;
    await api.put(`/orders/${orderId}/status`, { status: "cancelled" });
    return orderService.getOrderById(orderId);
  },
};

export default orderService;
