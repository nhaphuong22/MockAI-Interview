import db from '../db/knex.js';

/**
 * Tạo mới tin tuyển dụng và lưu các yêu cầu chi tiết đi kèm trong một transaction
 * 
 * @param {object} params
 * @param {number} params.hrId - ID của HR đăng tin tuyển dụng
 * @param {string} params.title - Tiêu đề tin tuyển dụng
 * @param {string} [params.description] - Mô tả chi tiết công việc
 * @param {string} [params.requirements] - Yêu cầu tổng quan (dành cho AI)
 * @param {string} [params.status] - Trạng thái tin (OPEN / CLOSED)
 * @param {Array<object>} [params.detailedRequirements] - Danh sách yêu cầu chi tiết
 * @returns {Promise<object>} Đối tượng tin tuyển dụng kèm theo danh sách yêu cầu chi tiết
 */
export const createJob = async ({
  hrId,
  title,
  description = '',
  requirements = '',
  status = 'OPEN',
  detailedRequirements = []
}) => {
  return await db.transaction(async (trx) => {
    // 1. Tạo bản ghi tin tuyển dụng trong bảng 'jobs'
    const [newJob] = await trx('jobs')
      .insert({
        hr_id: hrId,
        title,
        description: description || null,
        requirements: requirements || null,
        status: status || 'OPEN',
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    let insertedRequirements = [];

    // 2. Tạo bản ghi yêu cầu chi tiết trong bảng 'job_requirements' nếu có
    if (detailedRequirements && detailedRequirements.length > 0) {
      const requirementsToInsert = detailedRequirements.map((req) => ({
        job_id: newJob.id,
        requirement_text: req.requirement_text,
        is_mandatory: req.is_mandatory !== undefined ? req.is_mandatory : true,
        created_at: new Date(),
        updated_at: new Date()
      }));

      insertedRequirements = await trx('job_requirements')
        .insert(requirementsToInsert)
        .returning('*');
    }

    return {
      ...newJob,
      detailed_requirements: insertedRequirements
    };
  });
};
