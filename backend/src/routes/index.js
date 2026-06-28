import express from 'express';
import authRoutes from './authRoutes.js';
import systemRoutes from './systemRoutes.js';
import userRoutes from './userRoutes.js';
import voiceSessionRoutes from './voiceSessionRoutes.js';
import cvRoutes from './cvRoutes.js';
import blogRoutes from './blogRoutes.js';
import interviewRoutes from './interviewRoutes.js';
import jobRoutes from './jobRoutes.js';
import adminRoutes from './adminRoutes.js';
import verificationRoutes from './verificationRoutes.js';

import companyRoutes from './companyRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import applicationRoutes from './applicationRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import aiRoutes from './aiRoutes.js';
import dailyChallengeRoutes from './dailyChallengeRoutes.js';
import skillTreeRoutes from './skillTreeRoutes.js';


const router = express.Router();

// Aggregate all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/voice-sessions', voiceSessionRoutes);
router.use('/cv', cvRoutes);
router.use('/blogs', blogRoutes);
router.use('/interviews', interviewRoutes);
router.use('/jobs', jobRoutes);
router.use('/companies', companyRoutes);
router.use('/admin', adminRoutes);
router.use('/verification', verificationRoutes);
router.use('/payments', paymentRoutes);
router.use('/applications', applicationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ai', aiRoutes);
router.use('/daily-challenge', dailyChallengeRoutes);
router.use('/skill-tree', skillTreeRoutes);
router.use('/', systemRoutes);

export default router;


