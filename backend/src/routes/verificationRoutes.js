import express from 'express';
import { getVerificationStatus, submitVerification, getPendingVerifications, reviewVerification } from '../controllers/verificationController.js';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// HR Routes
router.get('/status', authenticateToken, getVerificationStatus);
router.post('/submit', authenticateToken, submitVerification);

// Admin Routes
router.get('/pending', authenticateToken, requireAdmin, getPendingVerifications);
router.post('/:id/review', authenticateToken, requireAdmin, reviewVerification);

export default router;
