import express from 'express';
import { registerVoiceSession, transcribeVoiceSession } from '../controllers/voiceSessionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { uploadAudio } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Protected route to register a new voice session
router.post('/', authenticateToken, registerVoiceSession);

// Protected route to handle audio file upload and run Speech-to-Text translation
router.post('/transcribe', authenticateToken, uploadAudio.single('audio'), transcribeVoiceSession);

export default router;

