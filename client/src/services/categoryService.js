import api from './api';

export const categoryService = {
  getCategories: async () => {
    const response = await api.get('/products/categories'); // Use products/categories endpoint
    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  addSubcategory: async (categoryId, subcategoryData) => {
    const response = await api.post(`/categories/${categoryId}/subcategories`, subcategoryData);
    return response.data;
  },

  updateSubcategory: async (categoryId, subId, subcategoryData) => {
    const response = await api.put(`/categories/${categoryId}/subcategories/${subId}`, subcategoryData);
    return response.data;
  },

  deleteSubcategory: async (categoryId, subId) => {
    const response = await api.delete(`/categories/${categoryId}/subcategories/${subId}`);
    return response.data;
  }
};
