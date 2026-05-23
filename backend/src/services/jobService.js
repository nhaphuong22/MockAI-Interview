import db from '../db/knex.js';

/**
 * Create a new job posting with requirements
 * @param {Object} jobData - Job information
 * @param {Array} requirements - Array of job requirements
 * @param {Number} userId - ID of the user creating the job
 * @returns {Object} Created job with requirements
 */
export const createJob = async (jobData, requirements = [], userId) => {
  const trx = await db.transaction();

  try {
    // 1. Insert job
    const jobToInsert = {
      hr_id: userId,
      title: jobData.title,
      description: jobData.description,
      requirements: jobData.requirements, // Text field for AI
      status: jobData.status || 'OPEN',
    };

    // Add optional fields only if provided
    if (jobData.company_id) jobToInsert.company_id = jobData.company_id;
    if (jobData.category_id) jobToInsert.category_id = jobData.category_id;
    if (jobData.location_id) jobToInsert.location_id = jobData.location_id;
    if (jobData.job_type_id) jobToInsert.job_type_id = jobData.job_type_id;
    if (jobData.experience_level) jobToInsert.experience_level = jobData.experience_level;
    if (jobData.salary_min) jobToInsert.salary_min = jobData.salary_min;
    if (jobData.salary_max) jobToInsert.salary_max = jobData.salary_max;
    if (jobData.salary_currency) jobToInsert.salary_currency = jobData.salary_currency;
    if (jobData.is_salary_visible !== undefined) jobToInsert.is_salary_visible = jobData.is_salary_visible;
    if (jobData.vacancy_count) jobToInsert.vacancy_count = jobData.vacancy_count;
    if (jobData.deadline) jobToInsert.deadline = jobData.deadline;

    jobToInsert.approval_status = 'PENDING';

    const [job] = await trx('jobs')
      .insert(jobToInsert)
      .returning('*');

    // 2. Insert job requirements if provided
    if (requirements && requirements.length > 0) {
      const requirementsToInsert = requirements.map((req, index) => ({
        job_id: job.id,
        requirement_type: req.requirement_type,
        description: req.description,
        is_required: req.is_required !== undefined ? req.is_required : true,
        priority: req.priority !== undefined ? req.priority : index,
      }));

      await trx('job_requirements').insert(requirementsToInsert);
    }

    // 3. Insert job skills if provided
    if (jobData.skill_ids && jobData.skill_ids.length > 0) {
      const jobSkills = jobData.skill_ids.map(skillId => ({
        job_id: job.id,
        skill_id: skillId,
      }));

      await trx('job_skills').insert(jobSkills);
    }

    await trx.commit();

    // 4. Fetch complete job with requirements
    const completeJob = await getJobById(job.id);
    return completeJob;

  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

/**
 * Get job by ID with all related data
 * @param {Number} jobId - Job ID
 * @returns {Object} Job with requirements, skills, company, etc.
 */
export const getJobById = async (jobId) => {
  const job = await db('jobs')
    .where('jobs.id', jobId)
    .leftJoin('companies', 'jobs.company_id', 'companies.id')
    .leftJoin('categories', 'jobs.category_id', 'categories.id')
    .leftJoin('locations', 'jobs.location_id', 'locations.id')
    .leftJoin('job_types', 'jobs.job_type_id', 'job_types.id')
    .leftJoin('users', 'jobs.hr_id', 'users.id')
    .select(
      'jobs.*',
      'companies.name as company_name',
      'companies.logo_url as company_logo',
      'categories.name as category_name',
      'locations.name as location_name',
      'job_types.name as job_type_name',
      'users.full_name as hr_name',
      'users.email as hr_email'
    )
    .first();

  if (!job) {
    return null;
  }

  // Get job requirements
  const requirements = await db('job_requirements')
    .where('job_id', jobId)
    .orderBy('priority', 'asc');

  // Get job skills
  const skills = await db('job_skills')
    .where('job_skills.job_id', jobId)
    .join('skills', 'job_skills.skill_id', 'skills.id')
    .select('skills.id', 'skills.name', 'skills.slug');

  return {
    ...job,
    requirements,
    skills,
  };
};

/**
 * Get all jobs with filters and pagination
 * @param {Object} filters - Filter options
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Object} Jobs list with pagination info
 */
export const getJobs = async (filters = {}, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    let query = db('jobs')
      .leftJoin('companies', 'jobs.company_id', 'companies.id')
      .leftJoin('categories', 'jobs.category_id', 'categories.id')
      .leftJoin('locations', 'jobs.location_id', 'locations.id')
      .leftJoin('job_types', 'jobs.job_type_id', 'job_types.id')
      .select(
        'jobs.*',
        'companies.name as company_name',
        'companies.logo_url as company_logo',
        'categories.name as category_name',
        'locations.name as location_name',
        'job_types.name as job_type_name'
      );

    // Apply filters
    if (filters.status) {
      query = query.where('jobs.status', filters.status);
    }

    if (filters.approval_status) {
      query = query.where('jobs.approval_status', filters.approval_status);
    }

    if (filters.company_id) {
      query = query.where('jobs.company_id', filters.company_id);
    }

    if (filters.category_id) {
      query = query.where('jobs.category_id', filters.category_id);
    }

    if (filters.location_id) {
      query = query.where('jobs.location_id', filters.location_id);
    }

    if (filters.job_type_id) {
      query = query.where('jobs.job_type_id', filters.job_type_id);
    }

    if (filters.experience_level) {
      query = query.where('jobs.experience_level', filters.experience_level);
    }

    if (filters.search) {
      query = query.where(function() {
        this.where('jobs.title', 'ilike', `%${filters.search}%`)
          .orWhere('jobs.description', 'ilike', `%${filters.search}%`);
      });
    }

    // Get total count - simplified
    const countResult = await db('jobs')
      .count('id as count')
      .where(function() {
        if (filters.status) this.where('status', filters.status);
        if (filters.approval_status) this.where('approval_status', filters.approval_status);
        if (filters.company_id) this.where('company_id', filters.company_id);
        if (filters.category_id) this.where('category_id', filters.category_id);
        if (filters.location_id) this.where('location_id', filters.location_id);
        if (filters.job_type_id) this.where('job_type_id', filters.job_type_id);
        if (filters.experience_level) this.where('experience_level', filters.experience_level);
        if (filters.search) {
          this.where('title', 'ilike', `%${filters.search}%`)
            .orWhere('description', 'ilike', `%${filters.search}%`);
        }
      })
      .first();

    const total = parseInt(countResult.count) || 0;

    // Get paginated results
    const jobs = await query
      .orderBy('jobs.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('getJobs service error:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

/**
 * Update job
 * @param {Number} jobId - Job ID
 * @param {Object} jobData - Updated job data
 * @param {Array} requirements - Updated requirements
 * @returns {Object} Updated job
 */
export const updateJob = async (jobId, jobData, requirements = null) => {
  const trx = await db.transaction();

  try {
    // Update job
    await trx('jobs')
      .where('id', jobId)
      .update({
        ...jobData,
        updated_at: trx.fn.now(),
      });

    // Update requirements if provided
    if (requirements !== null) {
      // Delete old requirements
      await trx('job_requirements').where('job_id', jobId).delete();

      // Insert new requirements
      if (requirements.length > 0) {
        const requirementsToInsert = requirements.map((req, index) => ({
          job_id: jobId,
          requirement_type: req.requirement_type,
          description: req.description,
          is_required: req.is_required !== undefined ? req.is_required : true,
          priority: req.priority !== undefined ? req.priority : index,
        }));

        await trx('job_requirements').insert(requirementsToInsert);
      }
    }

    await trx.commit();

    // Fetch updated job
    const updatedJob = await getJobById(jobId);
    return updatedJob;

  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

/**
 * Delete job
 * @param {Number} jobId - Job ID
 * @returns {Boolean} Success status
 */
export const deleteJob = async (jobId) => {
  const deleted = await db('jobs').where('id', jobId).delete();
  return deleted > 0;
};
