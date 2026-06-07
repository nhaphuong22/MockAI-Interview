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
<<<<<<< HEAD
import paymentRoutes from './paymentRoutes.js';
=======
import applicationRoutes from './applicationRoutes.js';
import notificationRoutes from './notificationRoutes.js';
>>>>>>> 6c76fc9 (add apply job logic)

const router = express.Router();

// Aggregate all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/voice-sessions', voiceSessionRoutes);
router.use('/cv', cvRoutes);
router.use('/blogs', blogRoutes);
router.use('/interviews', interviewRoutes);
router.use('/jobs', jobRoutes);
router.use('/admin', adminRoutes);
router.use('/verification', verificationRoutes);
<<<<<<< HEAD
router.use('/payments', paymentRoutes);
=======
router.use('/applications', applicationRoutes);
router.use('/notifications', notificationRoutes);
>>>>>>> 6c76fc9 (add apply job logic)
router.use('/', systemRoutes);

export default router;


