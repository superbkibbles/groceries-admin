import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import productService, {
  Product,
  ProductFilter,
} from "@/services/productService";

// Define the state interface
interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: ProductFilter;
}

// Initial state
const initialState: ProductState = {
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  filters: {},
};

// Async thunks for API calls
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (filters: ProductFilter = {}) => {
    const response = await productService.getProducts(filters);
    return response;
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (productId: string) => {
    const response = await productService.getProductById(productId);
    return response;
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (productData: Omit<Product, "id" | "created_at" | "updated_at">) => {
    const response = await productService.createProduct(productData);
    return response;
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({
    productId,
    productData,
  }: {
    productId: string;
    productData: Partial<Product>;
  }) => {
    const response = await productService.updateProduct(productId, productData);
    return response;
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (productId: string) => {
    await productService.deleteProduct(productId);
    return productId;
  }
);

export const updateProductStock = createAsyncThunk(
  "products/updateProductStock",
  async ({ productId, quantity }: { productId: string; quantity: number }) => {
    await productService.updateProductStock(productId, quantity);
    return { productId, quantity };
  }
);

export const uploadProductImage = createAsyncThunk(
  "products/uploadProductImage",
  async ({ productId, imageFile }: { productId: string; imageFile: File }) => {
    const response = await productService.uploadProductImage(
      productId,
      imageFile
    );
    return { productId, imageUrl: response.imageUrl };
  }
);

export const deleteProductImage = createAsyncThunk(
  "products/deleteProductImage",
  async ({ productId, imageUrl }: { productId: string; imageUrl: string }) => {
    await productService.deleteProductImage(productId, imageUrl);
    return { productId, imageUrl };
  }
);

// Product slice
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<ProductFilter>) => {
      state.filters = action.payload;
    },
    setPagination: (
      state,
      action: PayloadAction<{
        page?: number;
        limit?: number;
      }>
    ) => {
      if (action.payload.page !== undefined) {
        state.pagination.page = action.payload.page;
      }
      if (action.payload.limit !== undefined) {
        state.pagination.limit = action.payload.limit;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data || action.payload;
        if (action.payload.total !== undefined) {
          state.pagination.total = action.payload.total;
          state.pagination.totalPages = action.payload.totalPages || 0;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch products";
      });

    // Fetch product by ID
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch product";
      });

    // Create product
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create product";
      });

    // Update product
    builder
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(
          (product) => product.id === action.payload.id
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.currentProduct?.id === action.payload.id) {
          state.currentProduct = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update product";
      });

    // Delete product
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(
          (product) => product.id !== action.payload
        );
        state.pagination.total -= 1;
        if (state.currentProduct?.id === action.payload) {
          state.currentProduct = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete product";
      });

    // Update product stock
    builder
      .addCase(updateProductStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductStock.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, quantity } = action.payload;
        const index = state.products.findIndex(
          (product) => product.id === productId
        );
        if (index !== -1) {
          state.products[index].stock_quantity = quantity;
        }
        if (state.currentProduct?.id === productId) {
          state.currentProduct.stock_quantity = quantity;
        }
      })
      .addCase(updateProductStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update stock";
      });

    // Upload product image
    builder
      .addCase(uploadProductImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProductImage.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, imageUrl } = action.payload;
        const index = state.products.findIndex(
          (product) => product.id === productId
        );
        if (index !== -1) {
          state.products[index].images = state.products[index].images || [];
          state.products[index].images.push(imageUrl);
        }
        if (state.currentProduct?.id === productId) {
          state.currentProduct.images = state.currentProduct.images || [];
          state.currentProduct.images.push(imageUrl);
        }
      })
      .addCase(uploadProductImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to upload image";
      });

    // Delete product image
    builder
      .addCase(deleteProductImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProductImage.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, imageUrl } = action.payload;
        const index = state.products.findIndex(
          (product) => product.id === productId
        );
        if (index !== -1) {
          state.products[index].images = (
            state.products[index].images || []
          ).filter((img) => img !== imageUrl);
        }
        if (state.currentProduct?.id === productId) {
          state.currentProduct.images = (
            state.currentProduct.images || []
          ).filter((img) => img !== imageUrl);
        }
      })
      .addCase(deleteProductImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete image";
      });
  },
});

export const { clearCurrentProduct, clearError, setFilters, setPagination } =
  productSlice.actions;

export default productSlice.reducer;
