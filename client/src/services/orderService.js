import api from './api';

export const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get order by ID
  getOrder: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Get user's orders
  getMyOrders: async () => {
    const response = await api.get('/orders/myorders');
    return response.data;
  },

  // Update order to paid
  updateOrderToPaid: async (id, paymentResult) => {
    const response = await api.put(`/orders/${id}/pay`, paymentResult);
    return response.data;
  },

  // Admin: Get all orders
  getAllOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  // Admin: Update order status
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },
};

