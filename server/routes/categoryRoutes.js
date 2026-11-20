import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory
} from '../controllers/categoryController.js';
import { checkJwt, checkAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', checkJwt, checkAdmin, createCategory);
router.put('/:id', checkJwt, checkAdmin, updateCategory);
router.delete('/:id', checkJwt, checkAdmin, deleteCategory);
router.post('/:id/subcategories', checkJwt, checkAdmin, addSubcategory);
router.put('/:id/subcategories/:subId', checkJwt, checkAdmin, updateSubcategory);
router.delete('/:id/subcategories/:subId', checkJwt, checkAdmin, deleteSubcategory);

export default router;
