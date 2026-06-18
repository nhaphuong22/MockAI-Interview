import { initHRInterviewSession, getHRInterviewResult, finishHRInterviewSession, getHRInterviewTranscript } from '../services/hrInterviewService.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';
import { sendRealtimeNotification } from '../socket.js';
import db from '../db/knex.js';

/**
 * POST /api/interviews/hr/init
 * Candidate bắt đầu phiên phỏng vấn HR thật (phải được HR mời trước)
 */
export const startHRInterview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { applicationId } = req.body;

    if (!applicationId) return sendError(res, 400, 'applicationId là bắt buộc');

    const sessionData = await initHRInterviewSession({
      userId,
      applicationId: Number(applicationId)
    });

    return sendResponse(res, 201, sessionData);
  } catch (error) {
    if (error.message?.includes('Unauthorized')) return sendError(res, 403, error.message);
    if (error.message?.includes('not found')) return sendError(res, 404, error.message);
    if (error.message?.includes('chưa mời')) return sendError(res, 403, error.message);
    console.error('startHRInterview error:', error);
    return sendError(res, 500, 'Lỗi khởi tạo phiên phỏng vấn HR');
  }
};

/**
 * GET /api/interviews/hr/result/:interviewId
 * Lấy thông tin cơ bản sau khi hoàn thành (cho candidate)
 */
export const getHRInterviewResultHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const interviewId = Number(req.params.interviewId);

    const result = await getHRInterviewResult({ interviewId, userId });
    return sendResponse(res, 200, result);
  } catch (error) {
    if (error.message === 'Unauthorized') return sendError(res, 403, 'Không có quyền truy cập');
    if (error.message === 'Interview not found') return sendError(res, 404, 'Không tìm thấy phiên phỏng vấn');
    console.error('getHRInterviewResult error:', error);
    return sendError(res, 500, 'Lỗi lấy kết quả phỏng vấn');
  }
};

/**
 * PATCH /api/applications/:id/invite-ai-interview
 * HR mời ứng viên tham gia phỏng vấn AI (chỉ HR/ADMIN)
 */
export const inviteForAIInterview = async (req, res) => {
  try {
    const hrId = req.user.id;
    const appId = Number(req.params.id);

    // Lấy application + verify HR ownership
    const app = await db('applications')
      .join('jobs', 'applications.job_id', 'jobs.id')
      .join('job_posts', 'jobs.job_post_id', 'job_posts.id')
      .join('users', 'applications.candidate_id', 'users.id')
      .select(
        'applications.*',
        'job_posts.hr_id as job_hr_id',
        'jobs.title as job_title',
        'users.full_name as candidate_name'
      )
      .where('applications.id', appId)
      .first();

    if (!app) return sendError(res, 404, 'Không tìm thấy đơn ứng tuyển');
    if (app.job_hr_id !== hrId && req.user.role?.toUpperCase() !== 'ADMIN') {
      return sendError(res, 403, 'Không có quyền thực hiện thao tác này');
    }

    // Cập nhật status
    await db('applications')
      .where({ 'applications.id': appId })
      .update({ status: 'AI_INTERVIEW_INVITED', updated_at: new Date() });

    // Tạo notification cho ứng viên
    const [notification] = await db('notifications').insert({
      user_id: app.candidate_id,
      type: 'INTERVIEW_INVITE',
      title: 'Lời mời phỏng vấn AI',
      content: `Bạn được mời tham gia phỏng vấn AI cho vị trí "${app.job_title}". Hãy vào mục "Theo dõi ứng tuyển" để bắt đầu!`,
      link: '/applications',
      reference_id: appId,
      reference_type: 'application',
      is_read: false,
      created_at: new Date(),
      updated_at: new Date()
    }).returning('*');

    // Gửi notification realtime qua Socket.io
    sendRealtimeNotification(app.candidate_id, {
      id: notification.id,
      type: 'interview_invite',
      title: notification.title,
      content: notification.content,
      time: 'Vừa xong',
      isRead: false
    });

    return sendResponse(res, 200, { applicationId: appId, status: 'AI_INTERVIEW_INVITED' },
      `Đã gửi lời mời phỏng vấn AI đến ${app.candidate_name}`);
  } catch (error) {
    console.error('inviteForAIInterview error:', error);
    return sendError(res, 500, 'Lỗi khi gửi lời mời phỏng vấn');
  }
};

/**
 * POST /api/interviews/hr/finish
 * Gọi khi ứng viên hoàn thành câu hỏi cuối cùng
 */
export const finishHRInterview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { interviewId, totalTabViolations } = req.body;

    if (!interviewId) return sendError(res, 400, 'interviewId là bắt buộc');

    const result = await finishHRInterviewSession({
      interviewId: Number(interviewId),
      userId,
      totalTabViolations: Number(totalTabViolations || 0)
    });

    return sendResponse(res, 200, result, 'Đã tổng hợp kết quả phỏng vấn thành công');
  } catch (error) {
    console.error('finishHRInterview error:', error);
    if (error.message === 'Interview not found') return sendError(res, 404, 'Không tìm thấy phiên phỏng vấn');
    return sendError(res, 500, 'Lỗi tổng hợp kết quả phỏng vấn');
  }
};

/**
 * GET /api/interviews/hr/transcript/:interviewId
 * Lấy toàn bộ transcript (Q&A) cho HR
 */
export const getHRInterviewTranscriptHandler = async (req, res) => {
  try {
    const hrId = req.user.id;
    const interviewId = Number(req.params.interviewId);

    if (!interviewId) return sendError(res, 400, 'interviewId là bắt buộc');

    // We can allow HR or Admin
    if (req.user.role?.toUpperCase() !== 'HR' && req.user.role?.toUpperCase() !== 'ADMIN') {
      return sendError(res, 403, 'Chỉ HR hoặc Admin mới có quyền xem transcript');
    }

    const transcript = await getHRInterviewTranscript({ interviewId, hrId });
    return sendResponse(res, 200, transcript);
  } catch (error) {
    console.error('getHRInterviewTranscriptHandler error:', error);
    if (error.message === 'Interview not found') return sendError(res, 404, 'Không tìm thấy phiên phỏng vấn');
    return sendError(res, 500, 'Lỗi khi lấy dữ liệu Transcript');
  }
};
