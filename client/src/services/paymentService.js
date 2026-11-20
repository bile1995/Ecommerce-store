import api from './api';

export const paymentService = {
  // Create payment intent for Stripe
  createPaymentIntent: async (amount) => {
    const response = await api.post('/payments/create-intent', { amount });
    return response.data;
  },

  // Process payment
  processPayment: async (paymentData) => {
    const response = await api.post('/payments/process', paymentData);
    return response.data;
  },

  // Get payment status
  getPaymentStatus: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },
};

