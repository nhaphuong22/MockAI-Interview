import db from '../db/knex.js';
import { deleteCache, deleteCachePattern } from '../config/redis.js';
import { generateCampaignReportFromGemini } from './geminiService.js';
import { 
  insertJob, 
  insertJobRequirements 
} from '../models/jobModel.js';
/**
 * Credit cost constants for HR actions
 */
export const CREDIT_COSTS = {
  JOB_POST: 10,         // Đăng 1 tin thường (hiển thị 14 ngày)
  AI_SCREENING: 30,     // Bật lọc AI cho tin đó (add-on)
  AI_INTERVIEW: 10,     // Phỏng vấn AI 1 ứng viên
};

/**
 * Trừ credit từ 1 ví cụ thể (unified credits, FIFO theo batch hết hạn sớm nhất)
 */
const consumeFromWallet = async (trx, wallet, amount) => {
  if (!wallet) return false;

  if (wallet.total_credits < amount) return false;

  const batches = await trx('credit_batches')
    .where({ wallet_id: wallet.id })
    .where('amount_remaining', '>', 0)
    .where('expires_at', '>', new Date())
    .orderBy('expires_at', 'asc');

  const totalInBatches = batches.reduce((sum, b) => sum + b.amount_remaining, 0);
  if (totalInBatches < amount) return false;

  let remainingToDeduct = amount;
  for (const batch of batches) {
    if (remainingToDeduct <= 0) break;
    
    const deduct = Math.min(batch.amount_remaining, remainingToDeduct);
    remainingToDeduct -= deduct;
    
    await trx('credit_batches').where({ id: batch.id }).update({
      amount_remaining: batch.amount_remaining - deduct,
      updated_at: new Date()
    });
  }

  await trx('hr_wallets').where({ id: wallet.id }).update({
    total_credits: wallet.total_credits - amount,
    updated_at: new Date()
  });
  
  return true;
};

/**
 * Trừ credit của HR (ưu tiên ví công ty, fallback sang ví cá nhân)
 */
const consumeCredit = async (trx, hrId, companyId, amount) => {
  let success = false;

  // Ưu tiên dùng ví công ty trước
  if (companyId) {
    const companyWallet = await trx('hr_wallets').where({ company_id: companyId }).first();
    success = await consumeFromWallet(trx, companyWallet, amount);
  }

  // Nếu công ty hết credit (hoặc không có), dùng ví cá nhân
  if (!success) {
    const personalWallet = await trx('hr_wallets').where({ user_id: hrId }).first();
    success = await consumeFromWallet(trx, personalWallet, amount);
  }

  if (!success) {
    throw new Error(`Không đủ credit (cần ${amount}). Vui lòng nạp thêm credit để tiếp tục.`);
  }
};

/**
 * Tạo mới tin tuyển dụng và lưu các yêu cầu chi tiết đi kèm trong một transaction
 */
export const createJob = async ({
  hrId,
  title,
  description = '',
  status = 'OPEN',
  experienceLevel = null,
  salaryMin = null,
  salaryMax = null,
  salaryCurrency = 'VND',
  isSalaryVisible = true,
  vacancyCount = 1,
  deadline = null,
  enableAiScreening = false,
  detailedRequirements = []
}) => {
  const hrUser = await db('users').where({ id: hrId }).first();
  const companyId = hrUser ? hrUser.company_id : null;

  const result = await db.transaction(async (trx) => {
    // Calculate credit cost: 10 (base) + 30 (if AI screening enabled)
    if (status === 'OPEN') {
      let creditCost = CREDIT_COSTS.JOB_POST;
      if (enableAiScreening) {
        creditCost += CREDIT_COSTS.AI_SCREENING;
      }
      await consumeCredit(trx, hrId, companyId, creditCost);
    }

    // Calculate deadline (max 14 days if OPEN)
    let finalDeadline = deadline ? new Date(deadline) : null;
    if (status === 'OPEN') {
      const maxDeadline = new Date();
      maxDeadline.setDate(maxDeadline.getDate() + 14);
      if (!finalDeadline || finalDeadline > maxDeadline) {
        finalDeadline = maxDeadline;
      }
    }

    const [newJob] = await insertJob({
      hr_id: hrId,
      company_id: companyId,
      title,
      description: description || null,
      status: status || 'OPEN',
      experience_level: experienceLevel || null,
      salary_min: salaryMin || null,
      salary_max: salaryMax || null,
      salary_currency: salaryCurrency || 'VND',
      is_salary_visible: isSalaryVisible,
      vacancy_count: vacancyCount,
      deadline: finalDeadline,
      created_at: new Date(),
      updated_at: new Date()
    }, trx);

    let insertedRequirements = [];
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

    return { newJob, insertedRequirements };
  });

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
    query.where(function() {
      this.where('jobs.title', 'ilike', `%${search}%`)
          .orWhere('companies.name', 'ilike', `%${search}%`);
    });
  }

  const offset = (page - 1) * limit;
  
  // Tạo query đếm tổng số bản ghi (luôn join companies để có thể lọc theo tên công ty)
  const countQuery = db('jobs').leftJoin('companies', 'jobs.company_id', 'companies.id');
  if (status) countQuery.where('jobs.status', status);
  if (experienceLevel) countQuery.where('jobs.experience_level', experienceLevel);
  if (hrId) countQuery.where('jobs.hr_id', hrId);
  if (companyId) countQuery.where('jobs.company_id', companyId);
  if (search) {
    countQuery.where(function() {
      this.where('jobs.title', 'ilike', `%${search}%`)
          .orWhere('companies.name', 'ilike', `%${search}%`);
    });
  }

  const [countResult] = await countQuery.count('jobs.id as count');
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
    const oldJob = await trx('jobs').where({ id }).first();
    if (!oldJob) throw new Error('Không tìm thấy công việc này');

    // Nghiệp vụ: Cấm đổi Title nếu tin đã từng xuất bản (khác DRAFT)
    if (oldJob.status !== 'DRAFT' && updateData.title && updateData.title !== oldJob.title) {
       throw new Error('Không thể thay đổi chức danh khi tin đã từng xuất bản. Vui lòng đóng tin và tạo tin mới (tốn credit).');
    }

    // Nghiệp vụ: Trừ Credit nếu renew (từ CLOSED hoặc DRAFT sang OPEN)
    // Lưu ý: Từ PAUSED -> OPEN thì không mất credit.
    const isRenewing = updateData.status === 'OPEN' && ['CLOSED', 'DRAFT'].includes(oldJob.status);
    if (isRenewing) {
       const creditCost = updateData.enableAiScreening
         ? CREDIT_COSTS.JOB_POST + CREDIT_COSTS.AI_SCREENING
         : CREDIT_COSTS.JOB_POST;
       await consumeCredit(trx, oldJob.hr_id, oldJob.company_id, creditCost);
    }

    // 1. Cập nhật bảng 'jobs'
    const [updatedJob] = await trx('jobs')
      .where({ id })
      .update({
        title: updateData.title,
        description: updateData.description || null,
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
    await deleteCachePattern(`jobs:detail:*jobs/${id}*`);

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
    await deleteCachePattern(`jobs:detail:*jobs/${id}*`);
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
      db.raw('COALESCE(applications.candidate_phone, candidate_profiles.phone) as candidate_phone'),
      'users.avatar_url as candidate_avatar',
      'jobs.title as job_title',
      'cvs.file_url as cv_file_url',
      'cvs.ai_feedback as cv_ai_feedback',
      'cvs.parsed_text as cv_text'
    )
    .join('users', 'applications.candidate_id', 'users.id')
    .leftJoin('candidate_profiles', 'users.id', 'candidate_profiles.user_id')
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
          await deleteCachePattern(`jobs:detail:*jobs/${application.job_id}*`);
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
    requirements: reqText,
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

