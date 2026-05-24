import express from 'express';
import authRoutes from './authRoutes.js';
import systemRoutes from './systemRoutes.js';
 feature/trieu/BE_create_job_api
import jobRoutes from './jobRoutes.js';

import userRoutes from './userRoutes.js';
 main
import voiceSessionRoutes from './voiceSessionRoutes.js';

const router = express.Router();

// Aggregate all routes
router.use('/auth', authRoutes);
 feature/trieu/BE_create_job_api
router.use('/jobs', jobRoutes);

router.use('/users', userRoutes);
 main
router.use('/voice-sessions', voiceSessionRoutes);
router.use('/', systemRoutes);

export default router;
