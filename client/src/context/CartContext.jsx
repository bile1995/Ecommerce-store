import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { cartService } from '../services/cartService';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      // Don't set error state for 503 errors to prevent UI blocking
      if (err.status !== 503) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      const data = await cartService.addToCart(productId, quantity);
      setCart(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      setLoading(true);
      const data = await cartService.updateCartItem(itemId, quantity);
      setCart(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      const data = await cartService.removeFromCart(itemId);
      setCart(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartService.clearCart();
      setCart({ items: [], totalPrice: 0 });
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCartItemsCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
    getCartItemsCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

