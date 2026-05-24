import express from 'express';
import authRoutes from './authRoutes.js';
import systemRoutes from './systemRoutes.js';
import userRoutes from './userRoutes.js';
import voiceSessionRoutes from './voiceSessionRoutes.js';
import cvRoutes from './cvRoutes.js';
import blogRoutes from './blogRoutes.js';
import interviewRoutes from './interviewRoutes.js';

const router = express.Router();

// Aggregate all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/voice-sessions', voiceSessionRoutes);
router.use('/cv', cvRoutes);
router.use('/blogs', blogRoutes);
router.use('/interviews', interviewRoutes);
router.use('/', systemRoutes);

export default router;

