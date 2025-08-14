import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import categoryService, { Category } from "@/services/categoryService";
import { Product } from "@/services/productService";

// Define the state interface
interface CategoryState {
  categories: Category[];
  currentCategory: Category | null;
  loading: boolean;
  error: string | null;
  categoryProducts: {
    [categoryId: string]: {
      products: Product[];
      total: number;
      page: number;
      limit: number;
    };
  };
}

// Initial state
const initialState: CategoryState = {
  categories: [],
  currentCategory: null,
  loading: false,
  error: null,
  categoryProducts: {},
};

// Async thunks for API calls
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async () => {
    const response = await categoryService.getCategories();
    return response;
  }
);

export const fetchCategoryById = createAsyncThunk(
  "categories/fetchCategoryById",
  async (categoryId: string) => {
    const response = await categoryService.getCategoryById(categoryId);
    return response;
  }
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    const response = await categoryService.createCategory(categoryData);
    return response;
  }
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({
    categoryId,
    categoryData,
  }: {
    categoryId: string;
    categoryData: Partial<Category>;
  }) => {
    const response = await categoryService.updateCategory(
      categoryId,
      categoryData
    );
    return response;
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (categoryId: string) => {
    await categoryService.deleteCategory(categoryId);
    return categoryId;
  }
);

export const fetchCategoryProducts = createAsyncThunk(
  "categories/fetchCategoryProducts",
  async ({
    categoryId,
    page = 1,
    limit = 10,
  }: {
    categoryId: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await categoryService.getCategoryProducts(
      categoryId,
      page,
      limit
    );
    return { categoryId, ...response };
  }
);

// Category slice
const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCategoryProducts: (state, action: PayloadAction<string>) => {
      delete state.categoryProducts[action.payload];
    },
  },
  extraReducers: (builder) => {
    // Fetch categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data || action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch categories";
      });

    // Fetch category by ID
    builder
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch category";
      });

    // Create category
    builder
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.unshift(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create category";
      });

    // Update category
    builder
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex(
          (category) => category.id === action.payload.id
        );
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        if (state.currentCategory?.id === action.payload.id) {
          state.currentCategory = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update category";
      });

    // Delete category
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(
          (category) => category.id !== action.payload
        );
        if (state.currentCategory?.id === action.payload) {
          state.currentCategory = null;
        }
        // Clear associated products
        delete state.categoryProducts[action.payload];
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete category";
      });

    // Fetch category products
    builder
      .addCase(fetchCategoryProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryProducts.fulfilled, (state, action) => {
        state.loading = false;
        const { categoryId, data, total, page, limit } = action.payload;
        state.categoryProducts[categoryId] = {
          products: data || [],
          total: total || 0,
          page: page || 1,
          limit: limit || 10,
        };
      })
      .addCase(fetchCategoryProducts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch category products";
      });
  },
});

export const { clearCurrentCategory, clearError, clearCategoryProducts } =
  categorySlice.actions;

export default categorySlice.reducer;
