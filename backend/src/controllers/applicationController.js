import db from '../db/knex.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';
import { sendApprovalEmail, sendRejectionEmail } from '../services/emailService.js';

/**
 * Update application review status (HIRED or REJECTED) and send email notification
 * Only HR or ADMIN can call this endpoint
 */
export const reviewApplication = async (req, res) => {
  try {
    const { id: applicationId } = req.params;
    const { status, customMessage } = req.body;
    const hrUserId = req.user.id;

    // Validate status
    const ALLOWED_STATUSES = ['HIRED', 'REJECTED'];
    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return sendError(res, 400, 'Trạng thái không hợp lệ. Chỉ chấp nhận: HIRED hoặc REJECTED.');
    }

    // Fetch application with candidate and job info
    const application = await db('applications')
      .join('users as candidate', 'applications.candidate_id', 'candidate.id')
      .join('jobs', 'applications.job_id', 'jobs.id')
      .leftJoin('users as hr', 'jobs.hr_id', 'hr.id')
      .leftJoin('companies', 'hr.company_id', 'companies.id')
      .where('applications.id', applicationId)
      .select(
        'applications.id',
        'applications.status as current_status',
        'candidate.id as candidate_id',
        'candidate.full_name as candidate_name',
        'candidate.email as candidate_email',
        'jobs.title as job_title',
        'companies.name as company_name'
      )
      .first();

    if (!application) {
      return sendError(res, 404, 'Không tìm thấy đơn ứng tuyển.');
    }

    // Update application status in DB
    await db('applications')
      .where('id', applicationId)
      .update({
        status,
        updated_at: new Date()
      });

    // Send notification email to candidate
    const emailPayload = {
      toEmail: application.candidate_email,
      candidateName: application.candidate_name,
      jobTitle: application.job_title,
      companyName: application.company_name || 'MockAI Interview',
      customMessage: customMessage || '',
    };

    if (status === 'HIRED') {
      await sendApprovalEmail(emailPayload);
    } else {
      await sendRejectionEmail(emailPayload);
    }

    return sendResponse(res, 200, {
      applicationId,
      newStatus: status,
      emailSentTo: application.candidate_email,
      message: `Đã cập nhật trạng thái và gửi email thông báo đến ${application.candidate_email}.`,
    });
  } catch (error) {
    console.error('Lỗi reviewApplication:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi duyệt ứng viên.');
  }
};
