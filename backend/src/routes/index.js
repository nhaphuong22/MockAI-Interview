import express from 'express';
import authRoutes from './authRoutes.js';
import systemRoutes from './systemRoutes.js';
import userRoutes from './userRoutes.js';
import voiceSessionRoutes from './voiceSessionRoutes.js';
feature/BE_job_posting_api
import jobRoutes from './jobRoutes.js';

import cvRoutes from './cvRoutes.js';
import blogRoutes from './blogRoutes.js';
import interviewRoutes from './interviewRoutes.js';
 main

const router = express.Router();

// Aggregate all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/voice-sessions', voiceSessionRoutes);
 feature/BE_job_posting_api
router.use('/jobs', jobRoutes);

router.use('/cv', cvRoutes);
router.use('/blogs', blogRoutes);
 main
router.use('/', systemRoutes);

export default router;

