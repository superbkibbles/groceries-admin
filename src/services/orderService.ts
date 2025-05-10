import api from '@/lib/axios';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddressId: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilter {
  userId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

const orderService = {
  /**
   * Get all orders with optional filtering
   */
  getOrders: async (filters: OrderFilter = {}) => {
    const response = await api.get('/orders', { params: filters });
    return response.data;
  },

  /**
   * Get order by ID
   */
  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (orderId: string, status: Order['status']) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  /**
   * Update payment status
   */
  updatePaymentStatus: async (orderId: string, paymentStatus: Order['paymentStatus']) => {
    const response = await api.put(`/orders/${orderId}/payment-status`, { paymentStatus });
    return response.data;
  },

  /**
   * Get orders by user ID
   */
  getUserOrders: async (userId: string, page = 1, limit = 10) => {
    const response = await api.get(`/users/${userId}/orders`, {
      params: { page, limit }
    });
    // Extract orders from the data field of the paginated response
    return response.data.data || [];
  },

  /**
   * Get orders by customer ID (alias for getUserOrders)
   */
  getOrdersByCustomer: async (customerId: string, page = 1, limit = 10) => {
    const response = await orderService.getUserOrders(customerId, page, limit);
    // Extract orders from the data field of the paginated response
    return response.data || [];
  },

  /**
   * Add notes to an order
   */
  addOrderNotes: async (orderId: string, notes: string) => {
    const response = await api.put(`/orders/${orderId}/notes`, { notes });
    return response.data;
  },

  /**
   * Cancel an order
   */
  cancelOrder: async (orderId: string, reason: string) => {
    const response = await api.put(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  }
};

export default orderService;