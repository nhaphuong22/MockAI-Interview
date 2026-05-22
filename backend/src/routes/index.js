import express from 'express';
import authRoutes from './authRoutes.js';
import systemRoutes from './systemRoutes.js';
import voiceSessionRoutes from './voiceSessionRoutes.js';

const router = express.Router();

// Aggregate all routes
router.use('/auth', authRoutes);
router.use('/voice-sessions', voiceSessionRoutes);
router.use('/', systemRoutes);

export default router;
