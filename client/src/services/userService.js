import api from './api';

export const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  // Admin: Get all users
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Admin: Get user by ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Admin: Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Admin: Update user role
  updateUserRole: async (id, role) => {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data;
  },
};

