import db from '../db/knex.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';

export const createJob = async (req, res) => {
  const trx = await db.transaction();
  try {
    const hr_id = req.user.id;
    const {
      title,
      description,
      requirements,
      experience_level,
      salary_min,
      salary_max,
      salary_currency,
      is_salary_visible,
      vacancy_count,
      deadline,
      job_requirements
    } = req.body;

    if (!title || !description) {
      return sendError(res, 400, 'Title and description are required');
    }

    // Create job
    const [job] = await trx('jobs').insert({
      hr_id,
      title,
      description,
      requirements,
      experience_level,
      salary_min,
      salary_max,
      salary_currency: salary_currency || 'VND',
      is_salary_visible: is_salary_visible ?? true,
      vacancy_count: vacancy_count || 1,
      deadline: deadline ? new Date(deadline) : null,
      status: 'OPEN',
      approval_status: 'PENDING'
    }).returning('*');

    // Create job requirements if any
    if (job_requirements && Array.isArray(job_requirements) && job_requirements.length > 0) {
      const requirementsToInsert = job_requirements.map(req => ({
        job_id: job.id,
        requirement_text: req.description,
        is_mandatory: req.is_required ?? true
      })).filter(r => r.requirement_text);

      if (requirementsToInsert.length > 0) {
        await trx('job_requirements').insert(requirementsToInsert);
      }
    }

    await trx.commit();
    
    return sendResponse(res, 201, 'Job created successfully', job);
  } catch (error) {
    await trx.rollback();
    console.error('Error creating job:', error);
    return sendError(res, 500, 'Internal server error while creating job');
  }
};
