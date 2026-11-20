import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';
import { checkJwt } from '../middleware/auth.js';

const router = express.Router();

// All cart routes are protected
router.get('/', checkJwt, getCart);
router.post('/', checkJwt, addToCart);
router.put('/:itemId', checkJwt, updateCartItem);
router.delete('/:itemId', checkJwt, removeFromCart);
router.delete('/', checkJwt, clearCart);

export default router;

