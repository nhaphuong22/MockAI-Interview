import db from '../db/knex.js';
import { deleteCache, deleteCachePattern } from '../config/redis.js';
import { 
  insertJob, 
  insertJobRequirements 
} from '../models/jobModel.js';

/**
 * Tạo mới tin tuyển dụng và lưu các yêu cầu chi tiết đi kèm trong một transaction
 */
export const createJob = async ({
  hrId,
  title,
  description = '',
  requirements = '',
  status = 'OPEN',
  experienceLevel = null,
  salaryMin = null,
  salaryMax = null,
  salaryCurrency = 'VND',
  isSalaryVisible = true,
  vacancyCount = 1,
  deadline = null,
  detailedRequirements = []
}) => {
  // Lấy company_id của HR tuyển dụng từ bảng users để liên kết công ty
  const hrUser = await db('users').where({ id: hrId }).first();
  const companyId = hrUser ? hrUser.company_id : null;

  const result = await db.transaction(async (trx) => {
    // 1. Tạo bản ghi tin tuyển dụng trong bảng 'jobs' qua jobModel
    const [newJob] = await insertJob({
      hr_id: hrId,
      company_id: companyId, // Lưu thông tin công ty của HR
      title,
      description: description || null,
      requirements: requirements || null,
      status: status || 'OPEN',
      experience_level: experienceLevel || null,
      salary_min: salaryMin || null,
      salary_max: salaryMax || null,
      salary_currency: salaryCurrency || 'VND',
      is_salary_visible: isSalaryVisible,
      vacancy_count: vacancyCount,
      deadline: deadline || null,
      created_at: new Date(),
      updated_at: new Date()
    }, trx);

    let insertedRequirements = [];

    // 2. Tạo bản ghi yêu cầu chi tiết trong bảng 'job_requirements' qua jobModel nếu có
    if (detailedRequirements && detailedRequirements.length > 0) {
      const requirementsToInsert = detailedRequirements.map((req) => ({
        job_id: newJob.id,
        requirement_text: req.requirement_text,
        is_mandatory: req.is_mandatory !== undefined ? req.is_mandatory : true,
        created_at: new Date(),
        updated_at: new Date()
      }));

      insertedRequirements = await insertJobRequirements(requirementsToInsert, trx);
    }

    return {
      newJob,
      insertedRequirements
    };
  });

  // Clear Jobs list cache SAU KHI TRANSACTION ĐÃ COMMIT THÀNH CÔNG
  // Tránh Race Condition: client khác truy vấn DB cũ và ghi đè cache cũ vào Redis
  await deleteCachePattern('jobs:list:*');

  return {
    ...result.newJob,
    detailed_requirements: result.insertedRequirements
  };
};

/**
 * Lấy danh sách tin tuyển dụng có lọc và phân trang
 * 
 * @param {object} filters
 * @param {string} [filters.status] - OPEN hoặc CLOSED
 * @param {string} [filters.experienceLevel] - Kinh nghiệm
 * @param {number} [filters.hrId] - Lọc theo HR tạo tin
 * @param {string} [filters.search] - Từ khóa tìm kiếm theo title
 * @param {number} [filters.page] - Trang hiện tại
 * @param {number} [filters.limit] - Số lượng bản ghi mỗi trang
 */
export const getJobsList = async ({
  status,
  experienceLevel,
  hrId,
  search,
  page = 1,
  limit = 10
}) => {
  const query = db('jobs')
    .select(
      'jobs.*',
      'companies.name as company_name',
      'companies.logo_url as company_logo',
      'companies.address as company_address'
    )
    .leftJoin('companies', 'jobs.company_id', 'companies.id');

  if (status) {
    query.where('jobs.status', status);
  }
  if (experienceLevel) {
    query.where('jobs.experience_level', experienceLevel);
  }
  if (hrId) {
    query.where('jobs.hr_id', hrId);
  }
  if (search) {
    query.where('jobs.title', 'ilike', `%${search}%`); // ilike cho PostgreSQL để tìm kiếm không phân biệt hoa thường
  }

  const offset = (page - 1) * limit;
  
  // Tạo query đếm tổng số bản ghi
  const countQuery = db('jobs');
  if (status) countQuery.where('status', status);
  if (experienceLevel) countQuery.where('experience_level', experienceLevel);
  if (hrId) countQuery.where('hr_id', hrId);
  if (search) countQuery.where('title', 'ilike', `%${search}%`);

  const [countResult] = await countQuery.count('id as count');
  const count = parseInt(countResult.count || 0);

  const items = await query
    .offset(offset)
    .limit(limit)
    .orderBy('jobs.created_at', 'desc');

  return {
    items,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    }
  };
};

/**
 * Lấy chi tiết tin tuyển dụng kèm yêu cầu chi tiết
 * 
 * @param {number} id - ID của Job
 */
export const getJobDetailById = async (id) => {
  const job = await db('jobs')
    .select(
      'jobs.*',
      'companies.name as company_name',
      'companies.logo_url as company_logo',
      'companies.address as company_address',
      'companies.website as company_website'
    )
    .leftJoin('companies', 'jobs.company_id', 'companies.id')
    .where('jobs.id', id)
    .first();

  if (!job) {
    return null;
  }

  const detailedRequirements = await db('job_requirements')
    .where('job_id', id)
    .orderBy('created_at', 'asc');

  return {
    ...job,
    detailed_requirements: detailedRequirements
  };
};

/**
 * Cập nhật tin tuyển dụng và yêu cầu tuyển dụng chi tiết trong một transaction
 */
export const updateJobById = async (id, updateData, detailedRequirements = []) => {
  return await db.transaction(async (trx) => {
    // 1. Cập nhật bảng 'jobs'
    const [updatedJob] = await trx('jobs')
      .where({ id })
      .update({
        title: updateData.title,
        description: updateData.description || null,
        requirements: updateData.requirements || null,
        status: updateData.status || 'OPEN',
        experience_level: updateData.experienceLevel || null,
        salary_min: updateData.salaryMin || null,
        salary_max: updateData.salaryMax || null,
        salary_currency: updateData.salaryCurrency || 'VND',
        is_salary_visible: updateData.isSalaryVisible !== undefined ? updateData.isSalaryVisible : true,
        vacancy_count: updateData.vacancyCount !== undefined ? updateData.vacancyCount : 1,
        deadline: updateData.deadline || null,
        updated_at: new Date()
      })
      .returning('*');

    // 2. Cập nhật các yêu cầu chi tiết (Xóa các yêu cầu cũ và chèn lại mới)
    await trx('job_requirements').where({ job_id: id }).delete();

    let insertedRequirements = [];
    if (detailedRequirements && detailedRequirements.length > 0) {
      const requirementsToInsert = detailedRequirements.map((req) => ({
        job_id: id,
        requirement_text: req.requirement_text,
        is_mandatory: req.is_mandatory !== undefined ? req.is_mandatory : true,
        created_at: new Date(),
        updated_at: new Date()
      }));

      insertedRequirements = await trx('job_requirements')
        .insert(requirementsToInsert)
        .returning('*');
    }

    // Clear cache list and detail of this job
    await deleteCachePattern('jobs:list:*');
    await deleteCache(`jobs:detail:${id}`);

    return {
      ...updatedJob,
      detailed_requirements: insertedRequirements
    };
  });
};

/**
 * Xóa tin tuyển dụng
 */
export const deleteJobById = async (id) => {
  const deletedCount = await db('jobs').where({ id }).delete();
  
  if (deletedCount > 0) {
    // Clear cache list and detail of this job
    await deleteCachePattern('jobs:list:*');
    await deleteCache(`jobs:detail:${id}`);
  }

  return deletedCount > 0;
};


/**
 * Lấy danh sách hồ sơ ứng tuyển nộp vào các job thuộc sở hữu của HR
 */
export const getJobApplicationsService = async ({ hrId, jobId, status }) => {
  const query = db('applications')
    .select(
      'applications.*',
      'users.full_name as candidate_name',
      'users.email as candidate_email',
      'users.phone as candidate_phone',
      'users.avatar_url as candidate_avatar',
      'jobs.title as job_title',
      'cvs.file_url as cv_file_url'
    )
    .join('users', 'applications.candidate_id', 'users.id')
    .join('jobs', 'applications.job_id', 'jobs.id')
    .leftJoin('cvs', 'applications.cv_id', 'cvs.id')
    .where('jobs.hr_id', hrId);

  if (jobId) {
    query.where('applications.job_id', jobId);
  }
  
  if (status) {
    query.where('applications.status', status);
  }

  return await query.orderBy('applications.created_at', 'desc');
};

/**
 * Cập nhật thông tin chi tiết của hồ sơ ứng tuyển
 */
export const updateJobApplicationService = async (applicationId, updateData) => {
  const application = await getApplicationDetailById(applicationId);

  const [updatedApplication] = await db('applications')
    .where({ id: applicationId })
    .update({
      status: updateData.status,
      hr_tag: updateData.hrTag,
      hr_notes: updateData.hrNotes,
      reviewed_by: updateData.reviewedBy,
      reviewed_at: new Date(),
      updated_at: new Date()
    })
    .returning('*');

  if (application) {
    // Check vacancy count to automatically close job if enough candidates are accepted/hired
    const dbStatus = updateData.status;
    if (dbStatus === 'ACCEPTED' || dbStatus === 'HIRED') {
      const jobInfo = await db('jobs').where({ id: application.job_id }).first();
      if (jobInfo && jobInfo.vacancy_count !== null && jobInfo.vacancy_count > 0) {
        const acceptedCountRes = await db('applications')
          .where({ job_id: application.job_id })
          .whereIn('status', ['ACCEPTED', 'HIRED'])
          .count('id as count')
          .first();
        const acceptedCount = parseInt(acceptedCountRes.count || 0);

        if (acceptedCount >= jobInfo.vacancy_count) {
          await db('jobs')
            .where({ id: application.job_id })
            .update({
              status: 'CLOSED',
              updated_at: new Date()
            });
          // Invalidate cache for job list and detail since status changed to CLOSED
          await deleteCachePattern('jobs:list:*');
          await deleteCache(`jobs:detail:${application.job_id}`);
          console.log(`[Job Status] Job ID ${application.job_id} ("${jobInfo.title}") has been automatically CLOSED. Accepted count (${acceptedCount}) reached vacancy count (${jobInfo.vacancy_count}).`);
        }
      }
    }

    // Clear HR applications list cache
    await deleteCachePattern(`applications:hr:${application.job_hr_id}:*`);
  }

  return updatedApplication;
};

/**
 * Lấy chi tiết hồ sơ ứng tuyển và tin tuyển dụng tương ứng (dùng để check quyền)
 */
export const getApplicationDetailById = async (applicationId) => {
  return await db('applications')
    .select(
      'applications.*', 
      'jobs.hr_id as job_hr_id',
      'jobs.title as job_title',
      'users.full_name as candidate_name',
      'users.email as candidate_email'
    )
    .join('jobs', 'applications.job_id', 'jobs.id')
    .join('users', 'applications.candidate_id', 'users.id')
    .where('applications.id', applicationId)
    .first();
};

