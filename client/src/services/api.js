import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    
    // Handle database connection errors with user-friendly message
    if (status === 503 && message.includes('Database connection unavailable')) {
      return Promise.reject({ 
        message: 'Service temporarily unavailable. Please try again later.', 
        status: 503
      });
    }
    
    return Promise.reject({ message, status });
  }
);

export default api;

