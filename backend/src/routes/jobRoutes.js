import express from 'express';
import { createJob } from '../controllers/jobController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, createJob);

export default router;
