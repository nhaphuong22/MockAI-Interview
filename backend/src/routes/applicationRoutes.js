import express from 'express';
import { reviewApplication } from '../controllers/applicationController.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * PUT /api/applications/:id/review
 * HR/ADMIN duyệt ứng viên (HIRED hoặc REJECTED) và gửi email thông báo tự động
 */
router.put(
  '/:id/review',
  authenticateToken,
  requireRole(['HR', 'ADMIN']),
  reviewApplication
);

export default router;
