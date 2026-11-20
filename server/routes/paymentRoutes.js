import express from 'express';
import {
  processPayment,
  getPaymentStatus,
} from '../controllers/paymentController.js';
import { checkJwt } from '../middleware/auth.js';

const router = express.Router();

// Process payment (cash or mobile banking)
router.post('/process', checkJwt, processPayment);

// Get payment status
router.get('/:paymentId', checkJwt, getPaymentStatus);

export default router;

