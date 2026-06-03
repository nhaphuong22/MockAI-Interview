import db from '../db/knex.js';
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
  return await db.transaction(async (trx) => {
    // 1. Tạo bản ghi tin tuyển dụng trong bảng 'jobs' qua jobModel
    const [newJob] = await insertJob({
      hr_id: hrId,
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
      ...newJob,
      detailed_requirements: insertedRequirements
    };
  });
};
