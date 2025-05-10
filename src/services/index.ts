// Export all services from a single file for easier imports
import authService from './authService';
import userService from './userService';
import productService from './productService';
import categoryService from './categoryService';
import orderService from './orderService';
import settingService from './settingService';

export {
  authService,
  userService,
  productService,
  categoryService,
  orderService,
  settingService
};