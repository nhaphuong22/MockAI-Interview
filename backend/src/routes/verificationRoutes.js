import express from 'express';
import { getVerificationStatus, getAllVerifications, reviewVerification, scanIdCardController } from '../controllers/verificationController.js';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// HR Routes
router.get('/status', authenticateToken, getVerificationStatus);

// Admin Routes
router.get('/all', authenticateToken, requireAdmin, getAllVerifications);
router.post('/:id/review', authenticateToken, requireAdmin, reviewVerification);
router.post('/:id/scan-id', authenticateToken, requireAdmin, scanIdCardController);

export default router;
