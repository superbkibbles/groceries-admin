import api from '@/lib/axios';

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const categoryService = {
  /**
   * Get all categories
   */
  getCategories: async (includeInactive = false) => {
    const response = await api.get('/categories', {
      params: { includeInactive }
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
  createCategory: async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  /**
   * Update category
   */
  updateCategory: async (categoryId: string, categoryData: Partial<Category>) => {
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
      params: { page, limit }
    });
    return response.data;
  }
};

export default categoryService;