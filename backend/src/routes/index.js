import express from 'express';
import authRoutes from './authRoutes.js';
import systemRoutes from './systemRoutes.js';
import jobRoutes from './jobRoutes.js';

const router = express.Router();

// Aggregate all routes
router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/', systemRoutes);

export default router;
