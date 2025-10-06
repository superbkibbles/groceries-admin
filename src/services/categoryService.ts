import api from "@/lib/axios";

export interface Translation {
  name: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  parentId?: string;
  level?: number;
  path?: string[];
  translations?: Record<string, Translation>; // Embedded translations
  children?: Category[];
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

const categoryService = {
  /**
   * Get all categories
   */
  getCategories: async () => {
    const response = await api.get("/categories", {
      // params: { includeInactive }
    });
    return response.data;
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (categoryId: string): Promise<Category> => {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data;
  },

  /**
   * Create new category
   */
  createCategory: async (
    categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">
  ) => {
    const response = await api.post("/categories", categoryData);
    return response.data;
  },

  /**
   * Update category
   */
  updateCategory: async (
    categoryId: string,
    categoryData: Partial<Category>
  ) => {
    const response = await api.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  },

  /**
   * Delete category
   */
  deleteCategory: async (categoryId: string) => {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  },

  /**
   * Get products by category
   */
  getCategoryProducts: async (categoryId: string, page = 1, limit = 10) => {
    const response = await api.get(`/categories/${categoryId}/products`, {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Update category translations
   */
  updateCategoryTranslations: async (
    categoryId: string,
    translations: Record<string, Translation>
  ) => {
    const response = await api.put(`/categories/${categoryId}/translations`, {
      translations,
    });
    return response.data;
  },

  /**
   * Add translation to category
   */
  addCategoryTranslation: async (
    categoryId: string,
    language: string,
    translation: Translation
  ) => {
    const response = await api.post(`/categories/${categoryId}/translations`, {
      language,
      translation,
    });
    return response.data;
  },

  /**
   * Delete category translation
   */
  deleteCategoryTranslation: async (categoryId: string, language: string) => {
    const response = await api.delete(
      `/categories/${categoryId}/translations/${language}`
    );
    return response.data;
  },
};

export default categoryService;
