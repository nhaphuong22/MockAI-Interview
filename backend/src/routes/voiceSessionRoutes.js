import express from 'express';
import { 
  registerVoiceSession, 
  transcribeVoiceSession,
  getTTSAudio,
  completeVoiceSession,
  assessVoiceSession
} from '../controllers/voiceSessionController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { uploadAudio } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Protected route to register a new voice session
router.post('/', authenticateToken, registerVoiceSession);

// Protected route to handle audio file upload and run Speech-to-Text translation
router.post('/transcribe', authenticateToken, uploadAudio.single('audio'), transcribeVoiceSession);

// Protected route to generate and stream Text-To-Speech audio of interview question (Fallback)
router.post('/tts', authenticateToken, getTTSAudio);

// Protected route to finalize a voice session and log duration
router.put('/:id/complete', authenticateToken, completeVoiceSession);

// Protected route to trigger AI evaluation, package result as JSON, upload to Cloudinary and return URL
router.post('/:id/assess', authenticateToken, assessVoiceSession);

export default router;
