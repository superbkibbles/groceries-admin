import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import orderService from "@/services/orderService";
import type { Order, OrderFilter } from "@/services/orderService";

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  totalOrders: number;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  totalOrders: 0,
  loading: false,
  error: null,
};

// Fetch orders
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (filters: OrderFilter = {}, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrders(filters);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to fetch orders"
      );
    }
  }
);

// Fetch order by ID
export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderById(orderId);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to fetch order details"
      );
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async (
    { orderId, status }: { orderId: string; status: Order["status"] },
    { rejectWithValue }
  ) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, status);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to update order status"
      );
    }
  }
);

// Update payment status
export const updatePaymentStatus = createAsyncThunk(
  "orders/updatePaymentStatus",
  async (
    {
      orderId,
      paymentStatus,
    }: { orderId: string; paymentStatus: Order["paymentStatus"] },
    { rejectWithValue }
  ) => {
    try {
      const response = await orderService.updatePaymentStatus(
        orderId,
        paymentStatus
      );
      return response;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to update payment status"
      );
    }
  }
);

// Add notes to order
export const addOrderNotes = createAsyncThunk(
  "orders/addOrderNotes",
  async (
    { orderId, notes }: { orderId: string; notes: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await orderService.addOrderNotes(orderId, notes);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to add notes to order"
      );
    }
  }
);

// Cancel order
export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async (
    { orderId, reason }: { orderId: string; reason: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await orderService.cancelOrder(orderId, reason);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to cancel order"
      );
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    setCurrentOrder: (state, action: PayloadAction<Order>) => {
      state.currentOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        state.totalOrders = action.payload.total;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;

        // Update the order in the orders array
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update payment status
      .addCase(updatePaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;

        // Update the order in the orders array
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add notes to order
      .addCase(addOrderNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOrderNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;

        // Update the order in the orders array
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(addOrderNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;

        // Update the order in the orders array
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentOrder, setCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
