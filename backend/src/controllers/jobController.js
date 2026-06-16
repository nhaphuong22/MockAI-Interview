import { 
  createJob,
  getJobsList,
  getJobDetailById,
  updateJobById,
  deleteJobById,
  getJobApplicationsService,
  updateJobApplicationService,
  getApplicationDetailById
} from '../services/jobService.js';
import { sendApplicationResultEmail } from '../services/emailService.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';

/**
 * Đăng tin tuyển dụng mới kèm theo các yêu cầu chi tiết
 */
export const createNewJob = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      requirements, 
      status, 
      experience_level,
      salary_min,
      salary_max,
      salary_currency,
      is_salary_visible,
      vacancy_count,
      deadline,
      detailed_requirements 
    } = req.body;
    const hrId = req.user.id;

    // 1. Kiểm tra validation cơ bản cho job title
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return sendError(res, 400, 'Tiêu đề tin tuyển dụng (title) là bắt buộc và không được để trống.');
    }

    // 2. Kiểm tra validation cho status nếu có
    const VALID_STATUSES = ['OPEN', 'CLOSED'];
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return sendError(res, 400, 'Trạng thái (status) không hợp lệ. Chỉ chấp nhận: OPEN hoặc CLOSED.');
    }

    // Validation bổ sung cho các trường số liệu
    let parsedSalaryMin = null;
    if (salary_min !== undefined && salary_min !== null && salary_min !== '') {
      parsedSalaryMin = parseInt(salary_min);
      if (isNaN(parsedSalaryMin) || parsedSalaryMin < 0) {
        return sendError(res, 400, 'Mức lương tối thiểu (salary_min) phải là số nguyên dương.');
      }
    }

    let parsedSalaryMax = null;
    if (salary_max !== undefined && salary_max !== null && salary_max !== '') {
      parsedSalaryMax = parseInt(salary_max);
      if (isNaN(parsedSalaryMax) || parsedSalaryMax < 0) {
        return sendError(res, 400, 'Mức lương tối đa (salary_max) phải là số nguyên dương.');
      }
      if (parsedSalaryMin !== null && parsedSalaryMax < parsedSalaryMin) {
        return sendError(res, 400, 'Mức lương tối đa không được nhỏ hơn mức lương tối thiểu.');
      }
    }

    let parsedVacancyCount = 1;
    if (vacancy_count !== undefined && vacancy_count !== null && vacancy_count !== '') {
      parsedVacancyCount = parseInt(vacancy_count);
      if (isNaN(parsedVacancyCount) || parsedVacancyCount <= 0) {
        return sendError(res, 400, 'Số lượng tuyển dụng (vacancy_count) phải là số nguyên lớn hơn 0.');
      }
    }

    // 3. Kiểm tra validation cho detailed_requirements nếu có
    if (detailed_requirements !== undefined) {
      if (!Array.isArray(detailed_requirements)) {
        return sendError(res, 400, 'Yêu cầu chi tiết (detailed_requirements) phải là một mảng.');
      }

      for (let i = 0; i < detailed_requirements.length; i++) {
        const reqItem = detailed_requirements[i];
        if (!reqItem.requirement_text || typeof reqItem.requirement_text !== 'string' || reqItem.requirement_text.trim() === '') {
          return sendError(res, 400, `Yêu cầu chi tiết tại vị trí ${i} thiếu nội dung (requirement_text) hợp lệ.`);
        }
        if (reqItem.is_mandatory !== undefined && typeof reqItem.is_mandatory !== 'boolean') {
          return sendError(res, 400, `Trường bắt buộc (is_mandatory) tại vị trí ${i} phải là kiểu boolean.`);
        }
      }
    }

    // 4. Gọi service tạo job
    const result = await createJob({
      hrId,
      title: title.trim(),
      description,
      requirements,
      status,
      experienceLevel: experience_level || null,
      salaryMin: parsedSalaryMin,
      salaryMax: parsedSalaryMax,
      salaryCurrency: salary_currency || 'VND',
      isSalaryVisible: is_salary_visible !== undefined ? !!is_salary_visible : true,
      vacancyCount: parsedVacancyCount,
      deadline: deadline || null,
      detailedRequirements: detailed_requirements || []
    });

    return sendResponse(res, 201, result);
  } catch (error) {
    console.error('Lỗi trong jobController.createNewJob:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi đăng tin tuyển dụng.');
  }
};

/**
 * Lấy danh sách tin tuyển dụng có lọc và phân trang
 */
export const getJobs = async (req, res) => {
  try {
    const { status, experience_level, hr_id, search, page = 1, limit = 10 } = req.query;

    const filters = {
      status,
      experienceLevel: experience_level,
      hrId: hr_id ? parseInt(hr_id) : null,
      search,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await getJobsList(filters);
    return sendResponse(res, 200, result);
  } catch (error) {
    console.error('Lỗi trong jobController.getJobs:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi lấy danh sách tin tuyển dụng.');
  }
};

/**
 * Lấy chi tiết tin tuyển dụng
 */
export const getJobById = async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    if (isNaN(jobId)) {
      return sendError(res, 400, 'ID công việc không hợp lệ.');
    }

    const job = await getJobDetailById(jobId);
    if (!job) {
      return sendError(res, 404, 'Không tìm thấy tin tuyển dụng.');
    }

    return sendResponse(res, 200, job);
  } catch (error) {
    console.error('Lỗi trong jobController.getJobById:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi lấy chi tiết tin tuyển dụng.');
  }
};

/**
 * Cập nhật tin tuyển dụng
 */
export const updateJob = async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    if (isNaN(jobId)) {
      return sendError(res, 400, 'ID công việc không hợp lệ.');
    }

    const { 
      title, 
      description, 
      requirements, 
      status, 
      experience_level,
      salary_min,
      salary_max,
      salary_currency,
      is_salary_visible,
      vacancy_count,
      deadline,
      detailed_requirements 
    } = req.body;

    // Kiểm tra xem job có tồn tại không
    const job = await getJobDetailById(jobId);
    if (!job) {
      return sendError(res, 404, 'Không tìm thấy tin tuyển dụng để cập nhật.');
    }

    // Kiểm quyền sở hữu: Chỉ chủ sở hữu (HR tạo tin) hoặc ADMIN mới được cập nhật
    const userId = req.user.id;
    const userRole = req.user.role?.toUpperCase();
    
    if (job.hr_id !== userId && userRole !== 'ADMIN') {
      return sendError(res, 403, 'Bạn không có quyền chỉnh sửa tin tuyển dụng này.');
    }

    // Validation
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return sendError(res, 400, 'Tiêu đề tin tuyển dụng (title) là bắt buộc.');
    }

    const VALID_STATUSES = ['OPEN', 'CLOSED'];
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return sendError(res, 400, 'Trạng thái (status) không hợp lệ. Chỉ chấp nhận: OPEN hoặc CLOSED.');
    }

    let parsedSalaryMin = null;
    if (salary_min !== undefined && salary_min !== null && salary_min !== '') {
      parsedSalaryMin = parseInt(salary_min);
      if (isNaN(parsedSalaryMin) || parsedSalaryMin < 0) {
        return sendError(res, 400, 'Mức lương tối thiểu (salary_min) phải là số nguyên dương.');
      }
    }

    let parsedSalaryMax = null;
    if (salary_max !== undefined && salary_max !== null && salary_max !== '') {
      parsedSalaryMax = parseInt(salary_max);
      if (isNaN(parsedSalaryMax) || parsedSalaryMax < 0) {
        return sendError(res, 400, 'Mức lương tối đa (salary_max) phải là số nguyên dương.');
      }
      if (parsedSalaryMin !== null && parsedSalaryMax < parsedSalaryMin) {
        return sendError(res, 400, 'Mức lương tối đa không được nhỏ hơn mức lương tối thiểu.');
      }
    }

    let parsedVacancyCount = 1;
    if (vacancy_count !== undefined && vacancy_count !== null && vacancy_count !== '') {
      parsedVacancyCount = parseInt(vacancy_count);
      if (isNaN(parsedVacancyCount) || parsedVacancyCount <= 0) {
        return sendError(res, 400, 'Số lượng tuyển dụng (vacancy_count) phải là số nguyên lớn hơn 0.');
      }
    }

    if (detailed_requirements !== undefined) {
      if (!Array.isArray(detailed_requirements)) {
        return sendError(res, 400, 'Yêu cầu chi tiết (detailed_requirements) phải là một mảng.');
      }

      for (let i = 0; i < detailed_requirements.length; i++) {
        const reqItem = detailed_requirements[i];
        if (!reqItem.requirement_text || typeof reqItem.requirement_text !== 'string' || reqItem.requirement_text.trim() === '') {
          return sendError(res, 400, `Yêu cầu chi tiết tại vị trí ${i} thiếu nội dung (requirement_text) hợp lệ.`);
        }
        if (reqItem.is_mandatory !== undefined && typeof reqItem.is_mandatory !== 'boolean') {
          return sendError(res, 400, `Trường bắt buộc (is_mandatory) tại vị trí ${i} phải là kiểu boolean.`);
        }
      }
    }

    const result = await updateJobById(jobId, {
      title: title.trim(),
      description,
      requirements,
      status,
      experienceLevel: experience_level || null,
      salaryMin: parsedSalaryMin,
      salaryMax: parsedSalaryMax,
      salaryCurrency: salary_currency || 'VND',
      isSalaryVisible: is_salary_visible !== undefined ? !!is_salary_visible : true,
      vacancyCount: parsedVacancyCount,
      deadline: deadline || null
    }, detailed_requirements || []);

    return sendResponse(res, 200, result);
  } catch (error) {
    console.error('Lỗi trong jobController.updateJob:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi cập nhật tin tuyển dụng.');
  }
};

/**
 * Xóa tin tuyển dụng
 */
export const deleteJob = async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    if (isNaN(jobId)) {
      return sendError(res, 400, 'ID công việc không hợp lệ.');
    }

    const job = await getJobDetailById(jobId);
    if (!job) {
      return sendError(res, 404, 'Không tìm thấy tin tuyển dụng.');
    }

    // Kiểm quyền sở hữu: Chỉ chủ sở hữu (HR tạo tin) hoặc ADMIN mới được xóa
    const userId = req.user.id;
    const userRole = req.user.role?.toUpperCase();

    if (job.hr_id !== userId && userRole !== 'ADMIN') {
      return sendError(res, 403, 'Bạn không có quyền xóa tin tuyển dụng này.');
    }

    await deleteJobById(jobId);
    return sendResponse(res, 200, null, 'Xóa tin tuyển dụng thành công.');
  } catch (error) {
    console.error('Lỗi trong jobController.deleteJob:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi xóa tin tuyển dụng.');
  }
};

/**
 * Lấy danh sách hồ sơ ứng tuyển của HR
 */
export const getJobApplications = async (req, res) => {
  try {
    const hrId = req.user.id;
    const { job_id, status } = req.query;

    const parsedJobId = job_id ? parseInt(job_id) : null;
    if (job_id && isNaN(parsedJobId)) {
      return sendError(res, 400, 'ID công việc không hợp lệ.');
    }

    const applications = await getJobApplicationsService({
      hrId,
      jobId: parsedJobId,
      status
    });

    return sendResponse(res, 200, applications);
  } catch (error) {
    console.error('Lỗi trong jobController.getJobApplications:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi lấy danh sách hồ sơ ứng tuyển.');
  }
};

/**
 * Cập nhật trạng thái duyệt/nhãn/ghi chú của hồ sơ ứng tuyển
 */
export const updateJobApplication = async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    if (isNaN(applicationId)) {
      return sendError(res, 400, 'ID hồ sơ ứng tuyển không hợp lệ.');
    }

    const { status, hr_tag, hr_notes, send_email, email_content } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role?.toUpperCase();

    // 1. Kiểm tra sự tồn tại của hồ sơ
    const application = await getApplicationDetailById(applicationId);
    if (!application) {
      return sendError(res, 404, 'Không tìm thấy hồ sơ ứng tuyển.');
    }

    // 2. Kiểm tra quyền sở hữu của HR tương ứng hoặc Admin
    if (application.job_hr_id !== userId && userRole !== 'ADMIN') {
      return sendError(res, 403, 'Bạn không có quyền chỉnh sửa hồ sơ ứng tuyển này.');
    }

    // 3. Validation cho status nếu có
    const VALID_STATUSES = [
      'SUBMITTED', 
      'AI_INTERVIEW', 
      'AI_REVIEWED', 
      'HR_REVIEWING', 
      'SHORTLISTED', 
      'INTERVIEW_SCHEDULED', 
      'HIRED', 
      'REJECTED'
    ];
    if (status && !VALID_STATUSES.includes(status.toUpperCase())) {
      return sendError(res, 400, 'Trạng thái ứng tuyển không hợp lệ.');
    }

    const result = await updateJobApplicationService(applicationId, {
      status: status ? status.toUpperCase() : application.status,
      hrTag: hr_tag !== undefined ? hr_tag : application.hr_tag,
      hrNotes: hr_notes !== undefined ? hr_notes : application.hr_notes,
      reviewedBy: userId
    });

    // 4. Gửi email nếu được yêu cầu
    if (send_email && email_content) {
      try {
        await sendApplicationResultEmail(
          application.candidate_email,
          application.candidate_name,
          application.job_title,
          email_content
        );
      } catch (emailError) {
        console.error('Lỗi khi gửi email ứng viên:', emailError);
      }
    }

    return sendResponse(res, 200, result, 'Cập nhật hồ sơ ứng tuyển thành công.');
  } catch (error) {
    console.error('Lỗi trong jobController.updateJobApplication:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi cập nhật hồ sơ ứng tuyển.');
  }
};
