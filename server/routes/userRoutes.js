import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  deleteUser,
  updateUserRole
} from '../controllers/userController.js';
import { checkJwt, checkAdmin } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.get('/profile', checkJwt, getUserProfile);
router.put('/profile', checkJwt, updateUserProfile);

// Admin routes
router.get('/', checkJwt, checkAdmin, getUsers);
router.get('/:id', checkJwt, checkAdmin, getUserById);
router.delete('/:id', checkJwt, checkAdmin, deleteUser);
router.put('/:id/role', checkJwt, checkAdmin, updateUserRole);

export default router;

