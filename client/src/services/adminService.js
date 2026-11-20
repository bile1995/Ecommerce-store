import api from './api';

export const adminService = {
  // Dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Product management
  getAllProducts: async (params) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Order management
  getAllOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  // User management
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Settings management
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateSetting: async (key, value) => {
    const response = await api.put(`/admin/settings/${key}`, { value });
    return response.data;
  },
};
