import api from "@/lib/axios";

export type HomeSectionType = "products" | "categories";

export interface LocalizedTitle {
  en: string;
  ar: string;
}

export interface HomeSectionBase {
  type: HomeSectionType;
  title: LocalizedTitle;
  order: number;
  active: boolean;
}

export interface ProductsSection extends HomeSectionBase {
  type: "products";
  product_ids: string[];
}

export interface CategoriesSection extends HomeSectionBase {
  type: "categories";
  category_ids: string[];
}

export type HomeSection = (ProductsSection | CategoriesSection) & {
  id?: string;
};

type HomeSectionCreateUpdate = Omit<HomeSection, "id">;

export const homeSectionService = {
  // Public
  async listPublic(): Promise<HomeSection[]> {
    const { data } = await api.get("/home-sections");
    return data;
  },

  // Admin
  async list(): Promise<HomeSection[]> {
    const { data } = await api.get("/admin/home-sections");
    return data;
  },

  async getById(id: string): Promise<HomeSection> {
    const { data } = await api.get(`/admin/home-sections/${id}`);
    return data;
  },

  async create(payload: HomeSectionCreateUpdate): Promise<HomeSection> {
    const { data } = await api.post("/admin/home-sections", payload);
    return data;
  },

  async update(
    id: string,
    payload: HomeSectionCreateUpdate
  ): Promise<HomeSection> {
    const { data } = await api.put(`/admin/home-sections/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/admin/home-sections/${id}`);
  },
};

export default homeSectionService;
