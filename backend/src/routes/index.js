import express from 'express';
import authRoutes from './authRoutes.js';
import systemRoutes from './systemRoutes.js';
import userRoutes from './userRoutes.js';

const router = express.Router();

// Aggregate all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/', systemRoutes);

export default router;
