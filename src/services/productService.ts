import api from "@/lib/axios";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images?: string[];
  categories: string[]; // Array of category IDs
  stock_quantity: number; // Renamed to match backend
  sku?: string;
  attributes?: Record<string, string | number | boolean>; // Generic attributes object for variations
  created_at: string; // Snake case to match backend
  updated_at: string; // Snake case to match backend
}

export interface ProductFilter {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

const productService = {
  /**
   * Get all products with optional filtering
   */
  getProducts: async (filters: ProductFilter = {}) => {
    const response = await api.get("/products", { params: filters });
    return response.data;
  },

  /**
   * Get product by ID
   */
  getProductById: async (productId: string): Promise<Product> => {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  },

  /**
   * Create new product
   */
  createProduct: async (
    productData: Omit<Product, "id" | "created_at" | "updated_at">
  ) => {
    const response = await api.post("/products", productData);
    return response.data;
  },

  /**
   * Update product
   */
  updateProduct: async (productId: string, productData: Partial<Product>) => {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
  },

  /**
   * Update product stock
   */
  updateProductStock: async (productId: string, quantity: number) => {
    const response = await api.put(`/products/${productId}/stock`, {
      quantity,
    });
    return response.data;
  },

  /**
   * Delete product
   */
  deleteProduct: async (productId: string) => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  },

  /**
   * Upload product image
   */
  uploadProductImage: async (productId: string, imageFile: File) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await api.post(`/products/${productId}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  /**
   * Delete product image
   */
  deleteProductImage: async (productId: string, imageUrl: string) => {
    const response = await api.delete(`/products/${productId}/images`, {
      data: { imageUrl },
    });
    return response.data;
  },
};

export default productService;
