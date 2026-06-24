import express from 'express';
import { 
  applyJob, 
  getApplications, 
  updateApplicationStatus 
} from '../controllers/applicationController.js';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import { inviteForAIInterview } from '../controllers/hrInterviewController.js';

const router = express.Router();

// Tất cả các tuyến đường này yêu cầu người dùng phải xác thực đăng nhập
router.post('/apply/:jobId', requireAuth, applyJob);
router.get('/', requireAuth, getApplications);
router.patch('/:id/status', requireAuth, updateApplicationStatus);
router.patch('/:id/invite-ai-interview', requireAuth, requireRole(['HR', 'ADMIN']), inviteForAIInterview);

export default router;
