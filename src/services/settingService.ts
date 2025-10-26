import api from "@/lib/axios";

export interface Setting {
  id: string;
  key: string;
  value: string | number | boolean | object;
  type: "string" | "number" | "boolean" | "json";
  scope: "system" | "user";
  userId?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettingFilter {
  key?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface CreateSettingDto {
  key: string;
  value: string | number | boolean | object;
  type: "string" | "number" | "boolean" | "json";
  description: string;
}

const settingService = {
  /**
   * Get all system settings with optional filtering
   */
  getSystemSettings: async (filters: SettingFilter = {}) => {
    const response = await api.get("/settings/system", { params: filters });
    return response.data;
  },

  /**
   * Get system setting by key
   */
  getSystemSettingByKey: async (key: string): Promise<Setting> => {
    const response = await api.get(`/settings/system/${key}`);
    return response.data;
  },

  /**
   * Create new system setting
   */
  createSystemSetting: async (settingData: CreateSettingDto) => {
    const response = await api.post("/settings/system", settingData);
    return response.data;
  },

  /**
   * Update system setting
   */
  updateSystemSetting: async (
    id: string,
    settingData: Partial<CreateSettingDto>
  ) => {
    const response = await api.put(`/settings/system/${id}`, settingData);
    return response.data;
  },

  /**
   * Delete system setting
   */
  deleteSystemSetting: async (id: string) => {
    const response = await api.delete(`/settings/system/${id}`);
    return response.data;
  },

  /**
   * Get all user settings with optional filtering
   */
  getUserSettings: async (filters: SettingFilter = {}) => {
    const response = await api.get("/settings/user", { params: filters });
    return response.data;
  },

  /**
   * Get user setting by key
   */
  getUserSettingByKey: async (key: string): Promise<Setting> => {
    const response = await api.get(`/settings/user/${key}`);
    return response.data;
  },

  /**
   * Create new user setting
   */
  createUserSetting: async (settingData: CreateSettingDto) => {
    const response = await api.post("/settings/user", settingData);
    return response.data;
  },

  /**
   * Update user setting
   */
  updateUserSetting: async (
    id: string,
    settingData: Partial<CreateSettingDto>
  ) => {
    const response = await api.put(`/settings/user/${id}`, settingData);
    return response.data;
  },

  /**
   * Delete user setting
   */
  deleteUserSetting: async (id: string) => {
    const response = await api.delete(`/settings/user/${id}`);
    return response.data;
  },
};

export default settingService;
