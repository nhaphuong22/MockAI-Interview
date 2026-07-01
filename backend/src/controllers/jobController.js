import { 
  createJob,
  getJobsList,
  getJobDetailById,
  updateJobById,
  deleteJobById,
  getJobApplicationsService,
  updateJobApplicationService,
  getApplicationDetailById,

  getSavedJobsService,
  toggleSavedJobService,
  updateSavedJobNoteService,

  generateJobCampaignReportService

} from '../services/jobService.js';
import { sendApplicationResultEmail, sendApplicationStatusUpdateEmail } from '../services/emailService.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';
import { getCompanyFollowerIds } from '../services/companyService.js';
import { sendRealtimeNotification } from '../socket.js';
import db from '../db/knex.js';

/**
 * Đăng tin tuyển dụng mới kèm theo các yêu cầu chi tiết
 */
export const createNewJob = async (req, res) => {
  try {
    const { 
      title, 
      description, 
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

    // Kiểm tra xem HR đã liên kết công ty và được phê duyệt chưa
    const hrUser = await db('users')
      .leftJoin('hr_profiles', 'users.id', 'hr_profiles.user_id')
      .select('users.*', 'hr_profiles.company_join_status')
      .where('users.id', hrId)
      .first();
      
    if (!hrUser || !hrUser.company_id || hrUser.company_join_status !== 'APPROVED') {
      return sendError(res, 403, 'Tài khoản của bạn chưa liên kết doanh nghiệp hoặc đang chờ phê duyệt. Không thể đăng tuyển dụng.');
    }

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
      if (parsedSalaryMin !== null && parsedSalaryMax !== null && parsedSalaryMax < parsedSalaryMin) {
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

    // Trả kết quả ngay cho client
    sendResponse(res, 201, result);

    // Gửi thông báo real-time tới tất cả những ứng viên đang follow công ty này
    // Dùng setImmediate để chạy bất đồng bộ sau khi response được gửi, không làm chậm request
    setImmediate(async () => {
      try {
        const hr = await db('users').where({ id: hrId }).select('company_id', 'full_name').first();
        if (hr?.company_id) {
          const company = await db('companies').where({ id: hr.company_id }).select('name').first();
          const followerIds = await getCompanyFollowerIds(hr.company_id);
          
          for (const followerId of followerIds) {
            // Lưu thông báo vào cơ sở dữ liệu để xem sau
            const [savedNotification] = await db('notifications')
              .insert({
                user_id: followerId,
                type: 'NEW_JOB',
                title: `💼 ${company?.name || 'Công ty'} vừa đăng việc mới!`,
                content: `Vị trí "${result.title}" vừa được đăng. Ứng tuyển ngay trước khi hết hạn!`,
                link: `/jobs/${result.id}`,
                reference_id: result.id,
                reference_type: 'job'
              })
              .returning('*');

            // Gửi qua socket.io
            sendRealtimeNotification(followerId, savedNotification);
          }
          console.log(`[Follow Notify] Đã lưu và gửi thông báo việc mới "${result.title}" tới ${followerIds.length} người theo dõi.`);
        }
      } catch (notifyErr) {
        console.error('[Follow Notify] Lỗi gửi thông báo follow:', notifyErr.message);
      }
    });
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
    const { status, experience_level, hr_id, company_id, search, page = 1, limit = 10 } = req.query;

    const filters = {
      status,
      experienceLevel: experience_level,
      hrId: hr_id ? parseInt(hr_id) : null,
      companyId: company_id ? parseInt(company_id) : null,
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
      if (parsedSalaryMin !== null && parsedSalaryMax !== null && parsedSalaryMax < parsedSalaryMin) {
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

    const formattedApplications = applications.map(app => {
      let aiFeedback = null;
      if (app.cv_ai_feedback) {
        try {
          aiFeedback = typeof app.cv_ai_feedback === 'string' ? JSON.parse(app.cv_ai_feedback) : app.cv_ai_feedback;
        } catch (e) {
          console.error("Lỗi parse cv_ai_feedback:", e);
        }
      }
      return {
        ...app,
        aiFeedback
      };
    });

    return sendResponse(res, 200, formattedApplications);
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
      'AI_INTERVIEW_INVITED',
      'INTERVIEWED',
      'INTERVIEW_SCHEDULED', 
      'HIRED', 
      'ACCEPTED',
      'REJECTED'
    ];
    if (status && !VALID_STATUSES.includes(status.toUpperCase())) {
      return sendError(res, 400, 'Trạng thái ứng tuyển không hợp lệ.');
    }

    const finalStatus = status ? status.toUpperCase() : (application.status || '').toUpperCase();
    const statusChanged = finalStatus !== (application.status || '').toUpperCase();

    const result = await updateJobApplicationService(applicationId, {
      status: finalStatus,
      hrTag: hr_tag !== undefined ? hr_tag : application.hr_tag,
      hrNotes: hr_notes !== undefined ? hr_notes : application.hr_notes,
      reviewedBy: userId
    });

    // Tạo thông báo in-app và gửi real-time qua Socket.io nếu trạng thái thay đổi
    if (statusChanged) {
      const statusLabels = {
        SUBMITTED: 'Đã nộp',
        AI_REVIEWED: 'AI đã duyệt',
        HR_REVIEWING: 'HR Đang duyệt',
        SHORTLISTED: 'Vào vòng trong',
        AI_INTERVIEW_INVITED: 'Đã mời PV AI',
        INTERVIEWED: 'Có kết quả PV',
        INTERVIEW_SCHEDULED: 'Lịch phỏng vấn',
        HIRED: 'Đã tuyển',
        ACCEPTED: 'Trúng tuyển',
        REJECTED: 'Từ chối'
      };

      try {
        const [notification] = await db('notifications')
          .insert({
            user_id: application.candidate_id,
            type: 'APPLICATION_UPDATE',
            title: 'Cập nhật trạng thái đơn tuyển',
            content: `Đơn ứng tuyển vị trí "${application.job_title}" của bạn đã được cập nhật thành: ${statusLabels[finalStatus] || finalStatus}`,
            link: '/applications',
            reference_id: applicationId,
            reference_type: 'application',
            is_read: false,
            created_at: new Date(),
            updated_at: new Date()
          })
          .returning('*');

        sendRealtimeNotification(application.candidate_id, {
          id: notification.id,
          type: 'application',
          title: notification.title,
          content: notification.content,
          time: 'Vừa xong',
          isRead: false
        });
      } catch (notiError) {
        console.error('Lỗi khi tạo/gửi thông báo cập nhật trạng thái:', notiError);
      }

      // Gửi email thông báo trạng thái cập nhật tự động (nếu trạng thái nằm trong danh sách cần gửi)
      const notifyStatuses = ['INTERVIEWED', 'ACCEPTED', 'REJECTED', 'AI_INTERVIEW_INVITED', 'HIRED'];
      if (notifyStatuses.includes(finalStatus) && application.candidate_email) {
        console.log(`[Application] Tự động gửi mail thông báo trạng thái ${finalStatus} tới Candidate: ${application.candidate_email}`);
        sendApplicationStatusUpdateEmail(
          application.candidate_email,
          application.candidate_name || 'Ứng viên',
          application.job_title,
          finalStatus
        ).catch(err => console.error('Lỗi khi tự động gửi email thông báo trạng thái:', err));
      }
    }

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
    return sendError(res, 500, 'Lỗi hệ thống khi cập nhật trạng thái ứng tuyển.');
  }
};

/**
 * Lấy danh sách công việc đã lưu của ứng viên
 */
export const getSavedJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { returnIdsOnly } = req.query;
    
    const savedJobs = await getSavedJobsService(userId, returnIdsOnly === 'true');
    return sendResponse(res, 200, savedJobs);
  } catch (error) {
    console.error('Lỗi trong jobController.getSavedJobs:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi lấy danh sách việc làm đã lưu.');
  }
};

/**
 * Thêm / Xóa công việc khỏi danh sách đã lưu
 */
export const toggleSavedJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = parseInt(req.params.id);
    
    if (isNaN(jobId)) {
      return sendError(res, 400, 'ID công việc không hợp lệ.');
    }

    const result = await toggleSavedJobService(userId, jobId);
    // return sendResponse(res, statusCode, data)
    return sendResponse(res, 200, { isSaved: result.isSaved, message: result.message });
  } catch (error) {
    console.error('Lỗi trong jobController.toggleSavedJob:', error);
    if (error.message === 'Không tìm thấy công việc.') {
      return sendError(res, 404, error.message);
    }
    return sendError(res, 500, 'Lỗi hệ thống khi thay đổi trạng thái lưu công việc.');
  }
};

/**
 * Cập nhật ghi chú cho công việc đã lưu
 */
export const updateSavedJobNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = parseInt(req.params.id);
    const { note } = req.body;
    
    if (isNaN(jobId)) {
      return sendError(res, 400, 'ID công việc không hợp lệ.');
    }

    await updateSavedJobNoteService(userId, jobId, note);
    return sendResponse(res, 200, { note });
  } catch (error) {
    console.error('Lỗi trong jobController.updateSavedJobNote:', error);
    if (error.message === 'Công việc này chưa được lưu.') {
      return sendError(res, 404, error.message);
    }
    return sendError(res, 500, 'Lỗi hệ thống khi cập nhật ghi chú.');
  }
};

/**
 * Tổng hợp toàn bộ dữ liệu ứng viên của 1 Job và gọi Gemini sinh báo cáo
 */
export const getJobCampaignReport = async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    if (isNaN(jobId)) {
      return sendError(res, 400, 'ID công việc không hợp lệ.');
    }

    const hrId = req.user.id;
    const report = await generateJobCampaignReportService(jobId, hrId);
    
    return sendResponse(res, 200, report, 'Tạo báo cáo chiến dịch AI thành công.');
  } catch (error) {
    console.error('Lỗi trong jobController.getJobCampaignReport:', error);
    if (error.message.includes('Chưa có ứng viên nào') || error.message.includes('quyền truy cập') || error.message.includes('Không tìm thấy')) {
      return sendError(res, 400, error.message);
    }
    return sendError(res, 500, 'Lỗi hệ thống khi tạo báo cáo chiến dịch AI.');
  }
};
