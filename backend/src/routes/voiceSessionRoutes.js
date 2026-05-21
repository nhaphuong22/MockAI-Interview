import express from 'express';
import { registerVoiceSession } from '../controllers/voiceSessionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected route to register a new voice session
router.post('/', authenticateToken, registerVoiceSession);

export default router;
