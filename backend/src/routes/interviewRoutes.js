import express from 'express';
import { startInterviewSession, submitAnswer, getInterviewsHistory } from '../controllers/interviewController.js';
import { startHRInterview, getHRInterviewResultHandler, finishHRInterview, getHRInterviewTranscriptHandler } from '../controllers/hrInterviewController.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
const router = express.Router();

// Protected routes for interview operations
router.post('/init', authenticateToken, startInterviewSession);
router.post('/answers', authenticateToken, submitAnswer);
router.get('/', authenticateToken, getInterviewsHistory);

// HR Interview Routes
router.post('/hr/init', authenticateToken, startHRInterview);
router.get('/hr/result/:interviewId', authenticateToken, getHRInterviewResultHandler);
router.post('/hr/finish', authenticateToken, finishHRInterview);

// API dành cho HR quản lý xem transcript
router.get('/hr/transcript/:interviewId', authenticateToken, requireRole(['HR', 'ADMIN']), getHRInterviewTranscriptHandler);

export default router;
