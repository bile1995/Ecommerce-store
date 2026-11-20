import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch current user
  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      // Don't remove token on 503 errors (service unavailable)
      if (err.status !== 503) {
        localStorage.removeItem('token');
        setAuthToken(null);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      setAuthToken(token);
      setUser(userData);

      return userData;
    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Signup
  const signup = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/auth/signup', { name, email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      setAuthToken(token);
      setUser(userData);

      return userData;
    } catch (err) {
      const message = err.message || 'Signup failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
    setError(null);
  };

  // Update user profile
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    currentUser: user, // Add currentUser alias for compatibility
    loading,
    error,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

