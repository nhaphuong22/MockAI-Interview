import {
  createJob,
  getJobById,
  getJobs,
  updateJob,
  deleteJob,
} from '../services/jobService.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job posting
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Senior Frontend Developer"
 *               description:
 *                 type: string
 *                 example: "We are looking for an experienced frontend developer..."
 *               requirements:
 *                 type: string
 *                 example: "3+ years of React experience"
 *               status:
 *                 type: string
 *                 enum: [OPEN, CLOSED]
 *                 default: OPEN
 *               company_id:
 *                 type: integer
 *               category_id:
 *                 type: integer
 *               location_id:
 *                 type: integer
 *               job_type_id:
 *                 type: integer
 *               experience_level:
 *                 type: string
 *                 enum: [INTERN, JUNIOR, MID, SENIOR, LEAD]
 *               salary_min:
 *                 type: number
 *               salary_max:
 *                 type: number
 *               salary_currency:
 *                 type: string
 *                 default: VND
 *               is_salary_visible:
 *                 type: boolean
 *                 default: true
 *               vacancy_count:
 *                 type: integer
 *                 default: 1
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               skill_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               job_requirements:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - requirement_type
 *                     - description
 *                   properties:
 *                     requirement_type:
 *                       type: string
 *                       enum: [EDUCATION, EXPERIENCE, SKILL, LANGUAGE, CERTIFICATE, OTHER]
 *                     description:
 *                       type: string
 *                     is_required:
 *                       type: boolean
 *                       default: true
 *                     priority:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Job created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const createJobController = async (req, res) => {
  try {
    const { job_requirements, ...jobData } = req.body;

    // Validation
    if (!jobData.title || !jobData.description) {
      return sendError(res, 400, 'Title and description are required');
    }

    // Create job with requirements
    const job = await createJob(jobData, job_requirements, req.user.id);

    return sendResponse(res, 201, job);

  } catch (error) {
    console.error('Create job error:', error);
    return sendError(res, 500, 'Failed to create job');
  }
};

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
export const getJobByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await getJobById(id);

    if (!job) {
      return sendError(res, 404, 'Job not found');
    }

    return sendResponse(res, 200, job);

  } catch (error) {
    console.error('Get job error:', error);
    return sendError(res, 500, 'Failed to get job');
  }
};

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs with filters and pagination
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, CLOSED]
 *       - in: query
 *         name: approval_status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *       - in: query
 *         name: company_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: location_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: job_type_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: experience_level
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of jobs
 *       500:
 *         description: Server error
 */
export const getJobsController = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      approval_status,
      company_id,
      category_id,
      location_id,
      job_type_id,
      experience_level,
      search,
    } = req.query;

    const filters = {
      status,
      approval_status,
      company_id,
      category_id,
      location_id,
      job_type_id,
      experience_level,
      search,
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const result = await getJobs(filters, parseInt(page), parseInt(limit));

    return sendResponse(res, 200, result);

  } catch (error) {
    console.error('Get jobs error:', error);
    console.error('Error stack:', error.stack);
    return sendError(res, 500, 'Failed to get jobs');
  }
};

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: Update job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       404:
 *         description: Job not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const updateJobController = async (req, res) => {
  try {
    const { id } = req.params;
    const { job_requirements, skill_ids, ...jobData } = req.body;

    // Check if job exists
    const existingJob = await getJobById(id);
    if (!existingJob) {
      return sendError(res, 404, 'Job not found');
    }

    // Check if user is the owner or admin
    if (existingJob.hr_id !== req.user.id && req.user.role !== 'ADMIN') {
      return sendError(res, 403, 'You do not have permission to update this job');
    }

    // Update job
    const updatedJob = await updateJob(id, jobData, job_requirements);

    return sendResponse(res, 200, updatedJob);

  } catch (error) {
    console.error('Update job error:', error);
    return sendError(res, 500, 'Failed to update job');
  }
};

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Delete job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       404:
 *         description: Job not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const deleteJobController = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if job exists
    const existingJob = await getJobById(id);
    if (!existingJob) {
      return sendError(res, 404, 'Job not found');
    }

    // Check if user is the owner or admin
    if (existingJob.hr_id !== req.user.id && req.user.role !== 'ADMIN') {
      return sendError(res, 403, 'You do not have permission to delete this job');
    }

    // Delete job
    await deleteJob(id);

    return sendResponse(res, 200, { message: 'Job deleted successfully' });

  } catch (error) {
    console.error('Delete job error:', error);
    return sendError(res, 500, 'Failed to delete job');
  }
};
