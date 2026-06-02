import express from 'express';
import { startInterviewSession, submitAnswer, getInterviewsHistory } from '../controllers/interviewController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected routes for interview operations
router.post('/init', authenticateToken, startInterviewSession);
router.post('/answers', authenticateToken, submitAnswer);
router.get('/', authenticateToken, getInterviewsHistory);

export default router;
