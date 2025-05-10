import api from '@/lib/axios';
import { User } from '@/store/slices/authSlice';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const authService = {
  /**
   * Login user with email and password
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post('/users/login', credentials);
    // Store token in localStorage
    if (response.data && response.data.token) {
        console.log("saving token")
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  /**
   * Register a new user
   */
  register: async (userData: RegisterData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await api.get('/users/me');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateUser: async (userId: string, userData: Partial<User>) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  /**
   * Change user password
   */
  changePassword: async (userId: string, currentPassword: string, newPassword: string) => {
    const response = await api.put(`/users/${userId}/password`, {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  /**
   * Logout user (client-side only)
   */
  logout: () => {
    localStorage.removeItem('token');
  }
};

export default authService;