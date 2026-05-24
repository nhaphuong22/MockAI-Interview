import express from 'express';
import { startInterviewSession } from '../controllers/interviewController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected route to initialize an interview session
router.post('/init', authenticateToken, startInterviewSession);

export default router;
