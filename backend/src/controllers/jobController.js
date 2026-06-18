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
import { sendResponse, sendError } from '../ultils/responseHelper.js';

export const createNewJob = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      status, 
      deadline,
      positions 
    } = req.body;
    const hrId = req.user.id;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return sendError(res, 400, 'Tiêu đề tin tuyển dụng (title) là bắt buộc và không được để trống.');
    }

    const VALID_STATUSES = ['OPEN', 'CLOSED'];
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return sendError(res, 400, 'Trạng thái (status) không hợp lệ. Chỉ chấp nhận: OPEN hoặc CLOSED.');
    }

    if (!Array.isArray(positions) || positions.length === 0) {
      return sendError(res, 400, 'Phải có ít nhất một vị trí tuyển dụng (positions).');
    }

    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      if (!pos.title || typeof pos.title !== 'string' || pos.title.trim() === '') {
        return sendError(res, 400, `Tiêu đề vị trí tại index ${i} là bắt buộc.`);
      }
      
      let parsedVacancyCount = 1;
      if (pos.vacancyCount !== undefined && pos.vacancyCount !== null && pos.vacancyCount !== '') {
        parsedVacancyCount = parseInt(pos.vacancyCount);
        if (isNaN(parsedVacancyCount) || parsedVacancyCount <= 0) {
          return sendError(res, 400, `Số lượng tuyển dụng tại vị trí ${i} phải là số nguyên lớn hơn 0.`);
        }
      }
      pos.vacancyCount = parsedVacancyCount;
      
      let parsedSalaryMin = null;
      if (pos.salaryMin !== undefined && pos.salaryMin !== null && pos.salaryMin !== '') {
        parsedSalaryMin = parseInt(pos.salaryMin);
        if (isNaN(parsedSalaryMin) || parsedSalaryMin < 0) {
          return sendError(res, 400, `Mức lương tối thiểu vị trí ${i} phải là số nguyên dương.`);
        }
      }
      pos.salaryMin = parsedSalaryMin;

      let parsedSalaryMax = null;
      if (pos.salaryMax !== undefined && pos.salaryMax !== null && pos.salaryMax !== '') {
        parsedSalaryMax = parseInt(pos.salaryMax);
        if (isNaN(parsedSalaryMax) || parsedSalaryMax < 0) {
          return sendError(res, 400, `Mức lương tối đa vị trí ${i} phải là số nguyên dương.`);
        }
        if (parsedSalaryMin !== null && parsedSalaryMax < parsedSalaryMin) {
          return sendError(res, 400, `Mức lương tối đa không được nhỏ hơn mức lương tối thiểu tại vị trí ${i}.`);
        }
      }
      pos.salaryMax = parsedSalaryMax;
    }

    const result = await createJob({
      hrId,
      title: title.trim(),
      description,
      status,
      deadline: deadline || null,
      positions
    });

    return sendResponse(res, 201, result);
  } catch (error) {
    console.error('Lỗi trong jobController.createNewJob:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi đăng tin tuyển dụng.');
  }
};

export const getJobs = async (req, res) => {
  try {
    const { status, hr_id, search, page = 1, limit = 10 } = req.query;

    const filters = {
      status,
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

export const updateJob = async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    if (isNaN(jobId)) {
      return sendError(res, 400, 'ID công việc không hợp lệ.');
    }

    const { 
      title, 
      description, 
      status, 
      deadline,
      positions 
    } = req.body;

    const jobPost = await getJobDetailById(jobId);
    if (!jobPost) {
      return sendError(res, 404, 'Không tìm thấy tin tuyển dụng để cập nhật.');
    }

    const userId = req.user.id;
    const userRole = req.user.role?.toUpperCase();
    
    if (jobPost.hr_id !== userId && userRole !== 'ADMIN') {
      return sendError(res, 403, 'Bạn không có quyền chỉnh sửa tin tuyển dụng này.');
    }

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return sendError(res, 400, 'Tiêu đề tin tuyển dụng (title) là bắt buộc.');
    }

    const VALID_STATUSES = ['OPEN', 'CLOSED'];
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return sendError(res, 400, 'Trạng thái (status) không hợp lệ. Chỉ chấp nhận: OPEN hoặc CLOSED.');
    }

    if (!Array.isArray(positions) || positions.length === 0) {
      return sendError(res, 400, 'Phải có ít nhất một vị trí tuyển dụng (positions).');
    }

    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      if (!pos.title || typeof pos.title !== 'string' || pos.title.trim() === '') {
        return sendError(res, 400, `Tiêu đề vị trí tại index ${i} là bắt buộc.`);
      }
      
      let parsedVacancyCount = 1;
      if (pos.vacancyCount !== undefined && pos.vacancyCount !== null && pos.vacancyCount !== '') {
        parsedVacancyCount = parseInt(pos.vacancyCount);
        if (isNaN(parsedVacancyCount) || parsedVacancyCount <= 0) {
          return sendError(res, 400, `Số lượng tuyển dụng tại vị trí ${i} phải là số nguyên lớn hơn 0.`);
        }
      }
      pos.vacancyCount = parsedVacancyCount;
      
      let parsedSalaryMin = null;
      if (pos.salaryMin !== undefined && pos.salaryMin !== null && pos.salaryMin !== '') {
        parsedSalaryMin = parseInt(pos.salaryMin);
        if (isNaN(parsedSalaryMin) || parsedSalaryMin < 0) {
          return sendError(res, 400, `Mức lương tối thiểu vị trí ${i} phải là số nguyên dương.`);
        }
      }
      pos.salaryMin = parsedSalaryMin;

      let parsedSalaryMax = null;
      if (pos.salaryMax !== undefined && pos.salaryMax !== null && pos.salaryMax !== '') {
        parsedSalaryMax = parseInt(pos.salaryMax);
        if (isNaN(parsedSalaryMax) || parsedSalaryMax < 0) {
          return sendError(res, 400, `Mức lương tối đa vị trí ${i} phải là số nguyên dương.`);
        }
        if (parsedSalaryMin !== null && parsedSalaryMax < parsedSalaryMin) {
          return sendError(res, 400, `Mức lương tối đa không được nhỏ hơn mức lương tối thiểu tại vị trí ${i}.`);
        }
      }
      pos.salaryMax = parsedSalaryMax;
    }

    const result = await updateJobById(jobId, {
      title: title.trim(),
      description,
      status,
      deadline: deadline || null
    }, positions);

    return sendResponse(res, 200, result);
  } catch (error) {
    console.error('Lỗi trong jobController.updateJob:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi cập nhật tin tuyển dụng.');
  }
};

export const deleteJob = async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    if (isNaN(jobId)) {
      return sendError(res, 400, 'ID công việc không hợp lệ.');
    }

    const jobPost = await getJobDetailById(jobId);
    if (!jobPost) {
      return sendError(res, 404, 'Không tìm thấy tin tuyển dụng.');
    }

    const userId = req.user.id;
    const userRole = req.user.role?.toUpperCase();

    if (jobPost.hr_id !== userId && userRole !== 'ADMIN') {
      return sendError(res, 403, 'Bạn không có quyền xóa tin tuyển dụng này.');
    }

    await deleteJobById(jobId);
    return sendResponse(res, 200, null, 'Xóa tin tuyển dụng thành công.');
  } catch (error) {
    console.error('Lỗi trong jobController.deleteJob:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi xóa tin tuyển dụng.');
  }
};

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

export const updateJobApplication = async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    if (isNaN(applicationId)) {
      return sendError(res, 400, 'ID hồ sơ ứng tuyển không hợp lệ.');
    }

    const { status, hr_tag, hr_notes } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role?.toUpperCase();

    const application = await getApplicationDetailById(applicationId);
    if (!application) {
      return sendError(res, 404, 'Không tìm thấy hồ sơ ứng tuyển.');
    }

    if (application.job_hr_id !== userId && userRole !== 'ADMIN') {
      return sendError(res, 403, 'Bạn không có quyền chỉnh sửa hồ sơ ứng tuyển này.');
    }

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

    return sendResponse(res, 200, result, 'Cập nhật hồ sơ ứng tuyển thành công.');
  } catch (error) {
    console.error('Lỗi trong jobController.updateJobApplication:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi cập nhật hồ sơ ứng tuyển.');
  }
};
