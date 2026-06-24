import db from '../db/knex.js';
import { deleteCache, deleteCachePattern } from '../config/redis.js';
import { generateCampaignReportFromGemini } from './geminiService.js';
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
  companyId,
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
  if (companyId) {
    query.where('jobs.company_id', companyId);
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
  if (companyId) countQuery.where('company_id', companyId);
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
      db.raw('COALESCE(applications.candidate_name, users.full_name) as candidate_name'),
      db.raw('COALESCE(applications.candidate_email, users.email) as candidate_email'),
      db.raw('COALESCE(applications.candidate_phone, users.phone) as candidate_phone'),
      'users.avatar_url as candidate_avatar',
      'jobs.title as job_title',
      'cvs.file_url as cv_file_url',
      'cvs.ai_feedback as cv_ai_feedback',
      'cvs.parsed_text as cv_text'
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

/**

 * Lấy danh sách việc làm đã lưu hoặc ID việc làm đã lưu của ứng viên
 */
export const getSavedJobsService = async (userId, returnIdsOnly = false) => {
  if (returnIdsOnly) {
    const savedJobs = await db('saved_jobs')
      .where('user_id', userId)
      .select('job_id');
    return savedJobs.map(sj => sj.job_id);
  }

  // Lấy chi tiết việc làm đã lưu
  const savedJobs = await db('saved_jobs')
    .join('jobs', 'saved_jobs.job_id', '=', 'jobs.id')
    .leftJoin('companies', 'jobs.company_id', 'companies.id')
    .where('saved_jobs.user_id', userId)
    .select(
      'jobs.id',
      'jobs.title',
      'companies.name as company_name',
      'companies.logo_url as company_logo',
      'companies.address as company_address',
      'jobs.salary_min',
      'jobs.salary_max',
      'jobs.salary_currency',
      'jobs.is_salary_visible',
      'jobs.experience_level as type',
      'saved_jobs.created_at as savedDate',
      'saved_jobs.note'
    )
    .orderBy('saved_jobs.created_at', 'desc');

  // Format lại dữ liệu
  return savedJobs.map(job => ({
    id: job.id,
    title: job.title,
    company: job.company_name || 'Công ty ẩn danh',
    logo: job.company_logo || '🚀',
    location: job.company_address || 'Việt Nam',
    salary: job.is_salary_visible && job.salary_min
      ? `${(job.salary_min / 1000000).toFixed(0)} - ${(job.salary_max / 1000000).toFixed(0)} triệu ${job.salary_currency}`
      : 'Thương lượng',
    type: job.type || 'Không yêu cầu',
    savedDate: job.savedDate,
    note: job.note || '',
    tags: [job.type, job.company_address].filter(Boolean)
  }));
};

/**
 * Bật/Tắt lưu việc làm
 */
export const toggleSavedJobService = async (userId, jobId) => {
  // Check job exists
  const job = await db('jobs').where({ id: jobId }).first();
  if (!job) {
    throw new Error('Không tìm thấy công việc.');
  }

  const existingSave = await db('saved_jobs')
    .where({ user_id: userId, job_id: jobId })
    .first();

  if (existingSave) {
    await db('saved_jobs').where({ id: existingSave.id }).delete();
    return { message: 'Đã bỏ lưu việc làm.', isSaved: false };
  } else {
    await db('saved_jobs').insert({ user_id: userId, job_id: jobId });
    return { message: 'Đã lưu việc làm.', isSaved: true };
  }
};

/**
 * Cập nhật ghi chú cho việc làm đã lưu
 */
export const updateSavedJobNoteService = async (userId, jobId, note) => {
  const existingSave = await db('saved_jobs')
    .where({ user_id: userId, job_id: jobId })
    .first();

  if (!existingSave) {
    throw new Error('Công việc này chưa được lưu.');
  }

  await db('saved_jobs')
    .where({ id: existingSave.id })
    .update({ note, updated_at: db.fn.now() });
};

/**
 * Tổng hợp toàn bộ dữ liệu ứng viên của 1 Job và gọi Gemini (Boss) để sinh Báo cáo Chiến dịch
 */
export const generateJobCampaignReportService = async (jobId, hrId) => {
  // 1. Kiểm tra Job và quyền
  const job = await db('jobs').where({ id: jobId }).first();
  if (!job) throw new Error('Không tìm thấy tin tuyển dụng');
  if (job.hr_id !== hrId) throw new Error('Bạn không có quyền truy cập tin tuyển dụng này');

  // Lấy chi tiết yêu cầu công việc
  const requirements = await db('job_requirements').where({ job_id: jobId });
  const reqText = requirements.map(r => r.requirement_text).join(', ');

  // 2. Lấy danh sách ứng viên đã hoàn thành phỏng vấn (có điểm)
  const applications = await db('applications')
    .join('users', 'applications.candidate_id', 'users.id')
    .select(
      'applications.id as app_id',
      'applications.interview_score',
      'applications.ai_summary',
      'applications.updated_at',
      'users.full_name as candidate_name'
    )
    .where('applications.job_id', jobId)
    .whereNotNull('applications.interview_score') // Đã có điểm phỏng vấn
    .orderBy('applications.interview_score', 'desc');

  if (!applications || applications.length === 0) {
    throw new Error('Chưa có ứng viên nào hoàn thành phỏng vấn để tổng hợp báo cáo.');
  }

  // 3. Cache Check
  let maxAppUpdated = 0;
  for (const app of applications) {
    if (app.updated_at) {
      const appTime = new Date(app.updated_at).getTime();
      if (appTime > maxAppUpdated) maxAppUpdated = appTime;
    }
  }
  const jobUpdated = job.updated_at ? new Date(job.updated_at).getTime() : 0;
  const lastChangedAt = Math.max(jobUpdated, maxAppUpdated);
  const cacheDate = job.campaign_report_updated_at ? new Date(job.campaign_report_updated_at).getTime() : 0;

  if (job.campaign_report_cache && cacheDate >= lastChangedAt) {
    console.log(`[Cache Hit] Returning cached Campaign Report for Job ${jobId}`);
    
    // Nếu data bị lưu nhầm thành string do lỗi trước đó, parse lại
    let parsedCache = job.campaign_report_cache;
    if (typeof parsedCache === 'string') {
      try { parsedCache = JSON.parse(parsedCache); } catch(e) {}
    }

    return {
      ...parsedCache,
      is_cached: true,
      generated_at: job.campaign_report_updated_at
    };
  }

  // 4. Chuẩn bị dữ liệu để đưa cho Gemini Boss
  const candidatesData = applications.map(app => ({
    id: app.app_id,
    name: app.candidate_name,
    score: app.interview_score,
    violations: 0, // Violations được tổng hợp ngầm hoặc có thể lấy từ db, tạm để 0 vì đã bị trừ điểm trực tiếp
    summary: app.ai_summary || 'Không có nhận xét'
  }));

  // 5. Gọi Gemini
  console.log(`Generating Boss Campaign Report for Job ${jobId} with ${candidatesData.length} candidates...`);
  const report = await generateCampaignReportFromGemini({
    jobTitle: job.title,
    requirements: job.requirements || reqText,
    candidatesData
  });

  // 6. Lưu Cache
  const generatedDate = new Date();
  await db('jobs').where({ id: jobId }).update({
    campaign_report_cache: report,
    campaign_report_updated_at: generatedDate
  });

  return {
    ...report,
    is_cached: false,
    generated_at: generatedDate
  };

};

