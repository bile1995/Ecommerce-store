import express from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  updateOrderToPaid,
  getAllOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { checkJwt, checkAdmin } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.post('/', checkJwt, createOrder);
router.get('/myorders', checkJwt, getMyOrders);

// Admin routes (must be before /:id route)
router.get('/', checkJwt, checkAdmin, getAllOrders);
router.put('/:id/status', checkJwt, checkAdmin, updateOrderStatus);

// User routes
router.get('/:id', checkJwt, getOrderById);
router.put('/:id/pay', checkJwt, updateOrderToPaid);

export default router;

