import db from '../db/knex.js';
import { deleteCache, deleteCachePattern } from '../config/redis.js';

export const createJob = async ({
  hrId,
  title, // Campaign title
  description = '',
  status = 'OPEN',
  deadline = null,
  positions = [] // Array of jobs (positions)
}) => {
  const hrUser = await db('users').where({ id: hrId }).first();
  const companyId = hrUser ? hrUser.company_id : null;

  const result = await db.transaction(async (trx) => {
    // 1. Create job_post
    const [newJobPost] = await trx('job_posts').insert({
      hr_id: hrId,
      company_id: companyId,
      title,
      description: description || null,
      deadline: deadline || null,
      status: status || 'OPEN',
      created_at: new Date(),
      updated_at: new Date()
    }).returning('*');

    let insertedPositions = [];

    // 2. Create jobs (positions)
    if (positions && positions.length > 0) {
      for (const pos of positions) {
        const [newJob] = await trx('jobs').insert({
          job_post_id: newJobPost.id,
          title: pos.title, // Position title
          requirements: pos.requirements || null,
          experience_level: pos.experienceLevel || null,
          salary_min: pos.salaryMin || null,
          salary_max: pos.salaryMax || null,
          salary_currency: pos.salaryCurrency || 'VND',
          is_salary_visible: pos.isSalaryVisible !== undefined ? pos.isSalaryVisible : true,
          vacancy_count: pos.vacancyCount || 1,
          created_at: new Date(),
          updated_at: new Date()
        }).returning('*');

        // 3. Create job_requirements
        let insertedReqs = [];
        if (pos.detailedRequirements && pos.detailedRequirements.length > 0) {
          const reqsToInsert = pos.detailedRequirements.map((req) => ({
            job_id: newJob.id,
            requirement_text: req.requirement_text,
            is_mandatory: req.is_mandatory !== undefined ? req.is_mandatory : true,
            created_at: new Date(),
            updated_at: new Date()
          }));
          insertedReqs = await trx('job_requirements').insert(reqsToInsert).returning('*');
        }

        insertedPositions.push({
          ...newJob,
          detailed_requirements: insertedReqs
        });
      }
    }

    return {
      newJobPost,
      insertedPositions
    };
  });

  await deleteCachePattern('jobs:list:*');

  return {
    ...result.newJobPost,
    positions: result.insertedPositions
  };
};

export const getJobsList = async ({
  status,
  hrId,
  search,
  page = 1,
  limit = 10
}) => {
  const query = db('job_posts')
    .select(
      'job_posts.*',
      'companies.name as company_name',
      'companies.logo_url as company_logo',
      'companies.address as company_address'
    )
    .leftJoin('companies', 'job_posts.company_id', 'companies.id');

  if (status) {
    query.where('job_posts.status', status);
  }
  if (hrId) {
    query.where('job_posts.hr_id', hrId);
  }
  if (search) {
    query.where('job_posts.title', 'ilike', `%${search}%`);
  }

  const offset = (page - 1) * limit;
  
  const countQuery = db('job_posts');
  if (status) countQuery.where('status', status);
  if (hrId) countQuery.where('hr_id', hrId);
  if (search) countQuery.where('title', 'ilike', `%${search}%`);

  const [countResult] = await countQuery.count('id as count');
  const count = parseInt(countResult.count || 0);

  const items = await query
    .offset(offset)
    .limit(limit)
    .orderBy('job_posts.created_at', 'desc');

  // Lấy thêm danh sách vị trí (jobs) cho mỗi job_post
  const jobPostIds = items.map(item => item.id);
  if (jobPostIds.length > 0) {
    const jobs = await db('jobs').whereIn('job_post_id', jobPostIds);
    items.forEach(item => {
      item.positions = jobs.filter(job => job.job_post_id === item.id);
    });
  }

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

export const getJobDetailById = async (id) => {
  const jobPost = await db('job_posts')
    .select(
      'job_posts.*',
      'companies.name as company_name',
      'companies.logo_url as company_logo',
      'companies.address as company_address',
      'companies.website as company_website'
    )
    .leftJoin('companies', 'job_posts.company_id', 'companies.id')
    .where('job_posts.id', id)
    .first();

  if (!jobPost) {
    return null;
  }

  // Fetch positions
  const positions = await db('jobs').where('job_post_id', id).orderBy('created_at', 'asc');
  
  // Fetch detailed requirements for all positions
  if (positions.length > 0) {
    const jobIds = positions.map(p => p.id);
    const allReqs = await db('job_requirements').whereIn('job_id', jobIds);
    
    positions.forEach(pos => {
      pos.detailed_requirements = allReqs.filter(req => req.job_id === pos.id);
    });
  }

  return {
    ...jobPost,
    positions
  };
};

export const updateJobById = async (id, updateData, positions = []) => {
  return await db.transaction(async (trx) => {
    // 1. Cập nhật bảng job_posts
    const [updatedJobPost] = await trx('job_posts')
      .where({ id })
      .update({
        title: updateData.title,
        description: updateData.description || null,
        status: updateData.status || 'OPEN',
        deadline: updateData.deadline || null,
        updated_at: new Date()
      })
      .returning('*');

    // 2. Xóa các vị trí cũ (Tạm thời drop / recreate cho đơn giản, hoặc update dựa trên ID)
    // Cần cẩn thận khi xóa `jobs` vì nó cascade tới `applications`. 
    // Tuy nhiên, logic này sẽ tốt hơn nếu hỗ trợ update/insert/delete linh hoạt.
    // Để giữ toàn vẹn dữ liệu cho ứng tuyển cũ, KHÔNG ĐƯỢC XÓA TẤT CẢ jobs.
    // Thay vào đó, ta sẽ xử lý insert mới hoặc update.
    
    const existingJobs = await trx('jobs').where({ job_post_id: id });
    const existingJobIds = existingJobs.map(j => j.id);
    
    const incomingJobIds = positions.map(p => p.id).filter(id => id);
    
    // Tìm các vị trí bị xóa
    const jobsToDelete = existingJobIds.filter(id => !incomingJobIds.includes(id));
    if (jobsToDelete.length > 0) {
      // NOTE: Chỉ xóa khi không có applications, nếu không sẽ cascade!
      // Việc này cần quyết định kỹ, tạm thời vẫn cho xóa vì hr muốn đổi cấu hình.
      await trx('jobs').whereIn('id', jobsToDelete).delete();
    }

    let finalPositions = [];

    for (const pos of positions) {
      let jobId = pos.id;
      if (jobId) {
        // Cập nhật
        const [updatedJob] = await trx('jobs').where({ id: jobId }).update({
          title: pos.title,
          requirements: pos.requirements || null,
          experience_level: pos.experienceLevel || null,
          salary_min: pos.salaryMin || null,
          salary_max: pos.salaryMax || null,
          salary_currency: pos.salaryCurrency || 'VND',
          is_salary_visible: pos.isSalaryVisible !== undefined ? pos.isSalaryVisible : true,
          vacancy_count: pos.vacancyCount || 1,
          updated_at: new Date()
        }).returning('*');
        
        // Cập nhật requirement
        await trx('job_requirements').where({ job_id: jobId }).delete();
        let insertedReqs = [];
        if (pos.detailedRequirements && pos.detailedRequirements.length > 0) {
          const reqsToInsert = pos.detailedRequirements.map((req) => ({
            job_id: jobId,
            requirement_text: req.requirement_text,
            is_mandatory: req.is_mandatory !== undefined ? req.is_mandatory : true,
            created_at: new Date(),
            updated_at: new Date()
          }));
          insertedReqs = await trx('job_requirements').insert(reqsToInsert).returning('*');
        }
        finalPositions.push({ ...updatedJob, detailed_requirements: insertedReqs });
      } else {
        // Thêm mới
        const [newJob] = await trx('jobs').insert({
          job_post_id: id,
          title: pos.title,
          requirements: pos.requirements || null,
          experience_level: pos.experienceLevel || null,
          salary_min: pos.salaryMin || null,
          salary_max: pos.salaryMax || null,
          salary_currency: pos.salaryCurrency || 'VND',
          is_salary_visible: pos.isSalaryVisible !== undefined ? pos.isSalaryVisible : true,
          vacancy_count: pos.vacancyCount || 1,
          created_at: new Date(),
          updated_at: new Date()
        }).returning('*');

        let insertedReqs = [];
        if (pos.detailedRequirements && pos.detailedRequirements.length > 0) {
          const reqsToInsert = pos.detailedRequirements.map((req) => ({
            job_id: newJob.id,
            requirement_text: req.requirement_text,
            is_mandatory: req.is_mandatory !== undefined ? req.is_mandatory : true,
            created_at: new Date(),
            updated_at: new Date()
          }));
          insertedReqs = await trx('job_requirements').insert(reqsToInsert).returning('*');
        }
        finalPositions.push({ ...newJob, detailed_requirements: insertedReqs });
      }
    }

    await deleteCachePattern('jobs:list:*');
    await deleteCache(`jobs:detail:${id}`);

    return {
      ...updatedJobPost,
      positions: finalPositions
    };
  });
};

export const deleteJobById = async (id) => {
  const deletedCount = await db('job_posts').where({ id }).delete();
  
  if (deletedCount > 0) {
    await deleteCachePattern('jobs:list:*');
    await deleteCache(`jobs:detail:${id}`);
  }

  return deletedCount > 0;
};

// --- Applications ---

export const getJobApplicationsService = async ({ hrId, jobId, status }) => {
  // jobId ở đây là job_id cụ thể của 1 vị trí. 
  // Để lấy tất cả application của một HR, ta join applications -> jobs -> job_posts
  const query = db('applications')
    .select(
      'applications.*',
      'users.full_name as candidate_name',
      'users.email as candidate_email',
      'users.phone as candidate_phone',
      'users.avatar_url as candidate_avatar',
      'jobs.title as job_title',
      'job_posts.title as job_post_title',
      'cvs.file_url as cv_file_url'
    )
    .join('users', 'applications.candidate_id', 'users.id')
    .join('jobs', 'applications.job_id', 'jobs.id')
    .join('job_posts', 'jobs.job_post_id', 'job_posts.id')
    .leftJoin('cvs', 'applications.cv_id', 'cvs.id')
    .where('job_posts.hr_id', hrId);

  if (jobId) {
    // Có thể truyền lên job_post_id thay vì job_id, nhưng tạm giữ nguyên để đỡ sửa frontend quá nhiều.
    // Nếu frontend truyền job_post_id (vì lúc này ID của Job Detail là job_post_id)
    // Tạm thời sửa chỗ này thành job_post_id để query danh sách ứng viên theo Job Post.
    query.where('job_posts.id', jobId);
  }
  
  if (status) {
    query.where('applications.status', status);
  }

  return await query.orderBy('applications.created_at', 'desc');
};

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
          // Chỉ update status của vị trí (job), không phải cả chiến dịch (job_post)
          // Nhưng hiện tại job không còn status (do ta chuyển qua job_post).
          // Thôi tạm thời bỏ qua auto-close job_post vì 1 job_post có nhiều positions.
        }
      }
    }

    await deleteCachePattern(`applications:hr:${application.job_hr_id}:*`);
  }

  return updatedApplication;
};

export const getApplicationDetailById = async (applicationId) => {
  return await db('applications')
    .select('applications.*', 'job_posts.hr_id as job_hr_id')
    .join('jobs', 'applications.job_id', 'jobs.id')
    .join('job_posts', 'jobs.job_post_id', 'job_posts.id')
    .where('applications.id', applicationId)
    .first();
};
