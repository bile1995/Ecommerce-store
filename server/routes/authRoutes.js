import express from 'express';
import { signup, login, getMe, verifyToken } from '../controllers/authController.js';
import { forgotPassword, resetPassword } from '../controllers/passwordController.js';
import { checkJwt } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/verify', verifyToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', checkJwt, getMe);

export default router;

