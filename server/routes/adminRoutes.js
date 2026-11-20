import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { checkJwt, checkAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', checkJwt, checkAdmin, getDashboardStats);

export default router;