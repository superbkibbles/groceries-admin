import api from '@/lib/axios';
import { User } from '@/store/slices/authSlice';

interface Address {
  id: string;
  userId: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

const userService = {
  /**
   * Get user by ID
   */
  getUserById: async (userId: string): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * Get all users (admin only)
   */
  getUsers: async (page = 1, limit = 10) => {
    const response = await api.get('/users', {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * List users with filtering options (admin only)
   */
  listUsers: async ({ page = 1, limit = 10, role = '' }) => {
    const response = await api.get('/users', {
      params: { page, limit, role }
    });
    return {
      users: response.data.users || response.data,
      total: response.data.total || response.data.length
    };
  },

  /**
   * Update user profile
   */
  updateUser: async (userId: string, userData: Partial<User>) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  /**
   * Get user addresses
   */
  getUserAddresses: async (userId: string): Promise<Address[]> => {
    const response = await api.get(`/users/${userId}/addresses`);
    return response.data;
  },

  /**
   * Add new address
   */
  addAddress: async (userId: string, addressData: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post(`/users/${userId}/addresses`, addressData);
    return response.data;
  },

  /**
   * Update address
   */
  updateAddress: async (userId: string, addressId: string, addressData: Partial<Address>) => {
    const response = await api.put(`/users/${userId}/addresses/${addressId}`, addressData);
    return response.data;
  },

  /**
   * Delete address
   */
  deleteAddress: async (userId: string, addressId: string) => {
    const response = await api.delete(`/users/${userId}/addresses/${addressId}`);
    return response.data;
  },

  /**
   * Set default address
   */
  setDefaultAddress: async (userId: string, addressId: string) => {
    const response = await api.put(`/users/${userId}/addresses/${addressId}/default`);
    return response.data;
  }
};

export default userService;