import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getCategories,
  createProductReview,
  syncProducts,
  syncSingleProductById,
  getProductSyncStats
} from '../controllers/productController.js';
import { checkJwt, checkAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Protected routes (Admin only)
router.post('/', checkJwt, checkAdmin, createProduct);
router.put('/:id', checkJwt, checkAdmin, updateProduct);
router.delete('/:id', checkJwt, checkAdmin, deleteProduct);

// Sync routes (Admin only)
router.post('/sync', checkJwt, checkAdmin, syncProducts);
router.post('/sync/:externalId', checkJwt, checkAdmin, syncSingleProductById);
router.get('/sync/stats', checkJwt, checkAdmin, getProductSyncStats);

// Protected routes (Authenticated users)
router.post('/:id/reviews', checkJwt, createProductReview);

export default router;

