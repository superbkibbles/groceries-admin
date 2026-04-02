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

/** Backend uses snake_case (e.g. category_name); admin uses camelCase Category */
function normalizeCategory(raw: Record<string, unknown>): Category {
  type Raw = {
    id?: unknown;
    name?: unknown;
    category_name?: unknown;
    description?: unknown;
    slug?: unknown;
    parentId?: unknown;
    parent_id?: unknown;
    level?: unknown;
    path?: unknown;
    translations?: Record<string, Translation>;
    children?: unknown[];
    isActive?: unknown;
    is_active?: unknown;
    createdAt?: unknown;
    created_at?: unknown;
    updatedAt?: unknown;
    updated_at?: unknown;
  };
  const r = raw as Raw;
  return {
    id: String(r.id ?? ""),
    name: String(r.name ?? r.category_name ?? ""),
    description: String(r.description ?? ""),
    slug: String(r.slug ?? ""),
    parentId: (r.parentId ?? r.parent_id) as string | undefined,
    level: r.level as number | undefined,
    path: r.path as string[] | undefined,
    translations: r.translations,
    children: Array.isArray(r.children)
      ? r.children.map((c) =>
          normalizeCategory(c as Record<string, unknown>)
        )
      : undefined,
    isActive: (r.isActive ?? r.is_active) as boolean | undefined,
    createdAt: String(r.createdAt ?? r.created_at ?? ""),
    updatedAt: String(r.updatedAt ?? r.updated_at ?? ""),
  };
}

function unwrapEntity(body: unknown): Record<string, unknown> {
  if (body && typeof body === "object" && "data" in body) {
    const d = (body as { data: unknown }).data;
    if (d && typeof d === "object" && !Array.isArray(d)) {
      return d as Record<string, unknown>;
    }
  }
  return (body ?? {}) as Record<string, unknown>;
}

/**
 * POST /categories — see groceries-backend CreateCategoryRequest:
 * slug, parent_id, translations (required map with "en" key)
 */
function toApiCreateCategoryBody(
  data: Omit<Category, "id" | "createdAt" | "updatedAt">
): Record<string, unknown> {
  const translations: Record<string, Translation> = {
    ...(data.translations || {}),
  };
  const fromTab = translations.en;
  translations.en = {
    name: (fromTab?.name?.trim() ? fromTab.name : data.name) || "",
    description:
      fromTab?.description !== undefined
        ? fromTab.description
        : data.description || "",
  };

  const out: Record<string, unknown> = {
    slug: data.slug,
    translations,
  };
  if (data.parentId) {
    out.parent_id = data.parentId;
  }
  return out;
}

/** PUT /categories/:id — see groceries-backend UpdateCategoryRequest: name, description, slug */
function toApiUpdateCategoryBody(data: Partial<Category>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (data.name !== undefined) out.name = data.name;
  if (data.description !== undefined) out.description = data.description;
  if (data.slug !== undefined) out.slug = data.slug;
  return out;
}

function normalizeCategoriesListPayload(body: unknown): unknown {
  if (Array.isArray(body)) {
    return {
      data: body.map((item) =>
        normalizeCategory(item as Record<string, unknown>)
      ),
    };
  }
  if (!body || typeof body !== "object") return body;
  const b = body as { data?: unknown };
  const list = b.data;
  if (!Array.isArray(list)) return body;
  return {
    ...b,
    data: list.map((item) =>
      normalizeCategory(item as Record<string, unknown>)
    ),
  };
}

const categoryService = {
  /**
   * Get all categories
   */
  getCategories: async () => {
    const response = await api.get("/categories", {
      // params: { includeInactive }
    });
    return normalizeCategoriesListPayload(response.data) as {
      data?: Category[];
      [key: string]: unknown;
    };
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (categoryId: string): Promise<Category> => {
    const response = await api.get(`/categories/${categoryId}`);
    return normalizeCategory(unwrapEntity(response.data));
  },

  /**
   * Create new category
   */
  createCategory: async (
    categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">
  ) => {
    const response = await api.post(
      "/categories",
      toApiCreateCategoryBody(categoryData)
    );
    return normalizeCategory(unwrapEntity(response.data));
  },

  /**
   * Update category
   */
  updateCategory: async (
    categoryId: string,
    categoryData: Partial<Category>
  ) => {
    const response = await api.put(
      `/categories/${categoryId}`,
      toApiUpdateCategoryBody(categoryData)
    );
    return normalizeCategory(unwrapEntity(response.data));
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
