import express from 'express';
import { 
  applyJob, 
  getApplications, 
  updateApplicationStatus 
} from '../controllers/applicationController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Tất cả các tuyến đường này yêu cầu người dùng phải xác thực đăng nhập
router.post('/apply/:jobId', requireAuth, applyJob);
router.get('/', requireAuth, getApplications);
router.patch('/:id/status', requireAuth, updateApplicationStatus);

export default router;
