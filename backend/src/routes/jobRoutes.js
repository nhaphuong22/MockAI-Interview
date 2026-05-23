import express from 'express';
import {
  createJobController,
  getJobByIdController,
  getJobsController,
  updateJobController,
  deleteJobController,
} from '../controllers/jobController.js';
import { authenticate, authorize } from '../auth/authMiddleware.js';

const router = express.Router();

/**
 * Public routes
 */
router.get('/', getJobsController); // Get all jobs (with filters)
router.get('/:id', getJobByIdController); // Get job by ID

/**
 * Protected routes - Require authentication
 */
router.post('/', authenticate, authorize('HR', 'ADMIN'), createJobController); // Create job
router.put('/:id', authenticate, authorize('HR', 'ADMIN'), updateJobController); // Update job
router.delete('/:id', authenticate, authorize('HR', 'ADMIN'), deleteJobController); // Delete job

export default router;
