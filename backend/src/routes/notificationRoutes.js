import express from 'express';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead 
} from '../controllers/notificationController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', requireAuth, getNotifications);
router.patch('/:id/read', requireAuth, markAsRead);
router.post('/read-all', requireAuth, markAllAsRead);

export default router;
