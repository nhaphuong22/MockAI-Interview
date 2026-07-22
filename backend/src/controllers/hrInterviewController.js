import { initHRInterviewSession, getHRInterviewResult, finishHRInterviewSession, getHRInterviewTranscript } from '../services/hrInterviewService.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';
import { sendRealtimeNotification } from '../socket.js';
import db from '../db/knex.js';
import http from 'http';
import https from 'https';

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
      .join('users', 'applications.candidate_id', 'users.id')
      .select(
        'applications.id',
        'applications.status',
        'applications.candidate_id',
        'jobs.hr_id as job_hr_id',
        'jobs.title as job_title',
        'users.full_name as candidate_name'
      )
      .where('applications.id', appId)
      .first();

    if (!app) return sendError(res, 404, 'Không tìm thấy đơn ứng tuyển');
    if (app.job_hr_id !== hrId && req.user.role?.toUpperCase() !== 'ADMIN') {
      return sendError(res, 403, 'Không có quyền thực hiện thao tác này');
    }

    // Chỉ những hồ sơ này mới được mời
    const validStatuses = ['SUBMITTED', 'AI_REVIEWED', 'HR_REVIEWING', 'SHORTLISTED', 'REJECTED'];
    if (!validStatuses.includes(app.status)) {
      return sendError(res, 400, 'Trạng thái hồ sơ không hợp lệ để gửi lời mời phỏng vấn AI');
    }

    const walletCondition = req.user.company_id ? { company_id: req.user.company_id } : { user_id: hrId };

    await db.transaction(async (trx) => {
      // 1. Khóa và kiểm tra ví
      const wallet = await trx('hr_wallets').where(walletCondition).forUpdate().first();
      if (!wallet || wallet.total_credits < 10) {
        throw new Error('INSUFFICIENT_CREDITS');
      }

      // 2. Trừ credit
      const updated = await trx('hr_wallets')
        .where({ id: wallet.id })
        .andWhere('total_credits', '>=', 10)
        .decrement('total_credits', 10);

      if (updated === 0) {
        throw new Error('INSUFFICIENT_CREDITS');
      }

      // 3. Cập nhật applications
      await trx('applications')
        .where({ id: appId })
        .update({
          status: 'AI_INTERVIEW_INVITED',
          reviewed_by: hrId,
          reviewed_at: new Date(),
          invited_at: new Date(),
          credit_deducted: 10,
          is_refunded: false,
          updated_at: new Date()
        });

      // 4. Ghi log transaction
      await trx('credit_transactions').insert({
        wallet_id: wallet.id,
        user_id: hrId,
        application_id: appId,
        amount: -10,
        transaction_type: 'INVITE_AI_INTERVIEW',
        description: `Mời phỏng vấn AI cho ứng viên ${app.candidate_name} (Công việc: ${app.job_title})`,
        created_at: new Date(),
        updated_at: new Date()
      });
    });

    // Xóa cache của applications
    const { deleteCachePattern } = await import('../config/redis.js');
    await deleteCachePattern('applications:hr:*');

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
    if (error.message === 'INSUFFICIENT_CREDITS') {
      return sendError(res, 400, 'Không đủ Credit để thực hiện mời phỏng vấn AI.');
    }
    console.error('inviteForAIInterview error:', error);
    return sendError(res, 500, 'Lỗi khi gửi lời mời phỏng vấn');
  }
};

/**
 * POST /api/applications/bulk-invite-ai-interview
 * Gửi lời mời phỏng vấn AI hàng loạt
 */
export const bulkInviteForAIInterview = async (req, res) => {
  try {
    const hrId = req.user.id;
    const { applicationIds } = req.body;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return sendError(res, 400, 'Danh sách hồ sơ không hợp lệ');
    }

    // Lấy thông tin ứng viên
    const apps = await db('applications')
      .join('jobs', 'applications.job_id', 'jobs.id')
      .join('users', 'applications.candidate_id', 'users.id')
      .select(
        'applications.id',
        'applications.status',
        'applications.candidate_id',
        'jobs.hr_id as job_hr_id',
        'jobs.title as job_title',
        'users.full_name as candidate_name'
      )
      .whereIn('applications.id', applicationIds);

    // Lọc những hồ sơ thuộc về HR và trạng thái hợp lệ
    const validStatuses = ['SUBMITTED', 'AI_REVIEWED', 'HR_REVIEWING', 'SHORTLISTED'];
    const validApps = apps.filter(app =>
      (app.job_hr_id === hrId || req.user.role?.toUpperCase() === 'ADMIN') &&
      validStatuses.includes(app.status)
    );

    if (validApps.length === 0) {
      return sendError(res, 400, 'Không có hồ sơ nào hợp lệ để gửi lời mời.');
    }

    const neededCredits = validApps.length * 10;
    const walletCondition = req.user.company_id ? { company_id: req.user.company_id } : { user_id: hrId };

    await db.transaction(async (trx) => {
      // 1. Khóa và kiểm tra ví
      const wallet = await trx('hr_wallets').where(walletCondition).forUpdate().first();
      if (!wallet || wallet.total_credits < neededCredits) {
        throw new Error('INSUFFICIENT_CREDITS');
      }

      // 2. Trừ credit
      const updated = await trx('hr_wallets')
        .where({ id: wallet.id })
        .andWhere('total_credits', '>=', neededCredits)
        .decrement('total_credits', neededCredits);

      if (updated === 0) {
        throw new Error('INSUFFICIENT_CREDITS');
      }

      // 3. Cập nhật applications & ghi log transactions
      const validAppIds = validApps.map(a => a.id);

      await trx('applications')
        .whereIn('id', validAppIds)
        .update({
          status: 'AI_INTERVIEW_INVITED',
          reviewed_by: hrId,
          reviewed_at: new Date(),
          invited_at: new Date(),
          credit_deducted: 10,
          is_refunded: false,
          updated_at: new Date()
        });

      const transactions = validApps.map(app => ({
        wallet_id: wallet.id,
        user_id: hrId,
        application_id: app.id,
        amount: -10,
        transaction_type: 'INVITE_AI_INTERVIEW',
        description: `Mời phỏng vấn AI cho ứng viên ${app.candidate_name} (Công việc: ${app.job_title})`,
        created_at: new Date(),
        updated_at: new Date()
      }));

      await trx('credit_transactions').insert(transactions);
    });

    // Xóa cache
    const { deleteCachePattern } = await import('../config/redis.js');
    await deleteCachePattern('applications:hr:*');

    // Gửi thông báo cho từng ứng viên
    const notifications = validApps.map(app => ({
      user_id: app.candidate_id,
      type: 'INTERVIEW_INVITE',
      title: 'Lời mời phỏng vấn AI',
      content: `Bạn được mời tham gia phỏng vấn AI cho vị trí "${app.job_title}". Hãy vào mục "Theo dõi ứng tuyển" để bắt đầu!`,
      link: '/applications',
      reference_id: app.id,
      reference_type: 'application',
      is_read: false,
      created_at: new Date(),
      updated_at: new Date()
    }));

    if (notifications.length > 0) {
      const insertedNotifs = await db('notifications').insert(notifications).returning('*');
      // Gửi Socket realtime
      insertedNotifs.forEach(notif => {
        sendRealtimeNotification(notif.user_id, {
          id: notif.id,
          type: 'interview_invite',
          title: notif.title,
          content: notif.content,
          time: 'Vừa xong',
          isRead: false
        });
      });
    }

    return sendResponse(res, 200, { successCount: validApps.length, totalRequested: applicationIds.length },
      `Đã gửi thành công ${validApps.length} lời mời phỏng vấn AI.`);
  } catch (error) {
    if (error.message === 'INSUFFICIENT_CREDITS') {
      return sendError(res, 400, 'Không đủ Credit để thực hiện gửi hàng loạt.');
    }
    console.error('bulkInviteForAIInterview error:', error);
    return sendError(res, 500, 'Lỗi khi gửi lời mời phỏng vấn hàng loạt');
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

/**
 * GET /api/interviews/hr/highlights/:interviewId
 * Lấy highlights của cuộc phỏng vấn cho HR
 */
export const getHRInterviewHighlightsHandler = async (req, res) => {
  try {
    const hrId = req.user.id;
    const interviewId = Number(req.params.interviewId);

    if (!interviewId) return sendError(res, 400, 'interviewId là bắt buộc');

    // Chỉ HR hoặc Admin được phép truy cập
    if (req.user.role?.toUpperCase() !== 'HR' && req.user.role?.toUpperCase() !== 'ADMIN') {
      return sendError(res, 403, 'Chỉ HR hoặc Admin mới có quyền xem highlights');
    }

    // Verify interview ownership: Phỏng vấn phải thuộc Job của HR đó (nếu là HR)
    const interview = await db('interviews').where({ id: interviewId }).first();
    if (!interview) return sendError(res, 404, 'Không tìm thấy cuộc phỏng vấn');

    if (req.user.role?.toUpperCase() === 'HR' && interview.job_id) {
      const job = await db('jobs').where({ id: interview.job_id }).first();
      if (!job || job.hr_id !== hrId) {
        return sendError(res, 403, 'Bạn không có quyền truy cập thông tin cuộc phỏng vấn này');
      }
    }

    // Lấy highlights
    const highlight = await db('interview_highlights').where({ interview_id: interviewId }).first();
    if (!highlight) {
      return sendResponse(res, 404, null, 'Chưa sinh Highlights cho cuộc phỏng vấn này');
    }

    return sendResponse(res, 200, {
      id: highlight.id,
      interviewId: highlight.interview_id,
      highlightSummary: highlight.highlight_summary,
      isFlagged: highlight.is_flagged,
      timestampsData: typeof highlight.timestamps_data === 'string' ? JSON.parse(highlight.timestamps_data) : highlight.timestamps_data,
      createdAt: highlight.created_at,
      updatedAt: highlight.updated_at
    });
  } catch (error) {
    console.error('getHRInterviewHighlightsHandler error:', error);
    return sendError(res, 500, 'Lỗi khi lấy dữ liệu Highlights');
  }
};

/**
 * GET /api/interviews/hr/audio/slice
 * Proxy stream tệp âm thanh gốc để hỗ trợ Virtual Slicing và Range Requests
 */
export const getAudioSliceHandler = async (req, res) => {
  try {
    const { audioUrl, start, duration } = req.query;

    if (!audioUrl) {
      return sendError(res, 400, 'audioUrl là bắt buộc');
    }

    // Chỉ HR hoặc Admin được phép truy cập
    if (req.user.role?.toUpperCase() !== 'HR' && req.user.role?.toUpperCase() !== 'ADMIN') {
      return sendError(res, 403, 'Chỉ HR hoặc Admin mới có quyền truy cập audio slice');
    }

    // SSRF Guard: Kiểm tra hostname hợp lệ và Whitelist Cloudinary
    try {
      const parsedUrl = new URL(audioUrl);
      const hostname = parsedUrl.hostname.toLowerCase();
      const isInternal = hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('172.16.');
      if (isInternal) {
        return sendError(res, 400, 'Yêu cầu URL an toàn bên ngoài');
      }

      // Giới hạn chỉ chấp nhận domain Cloudinary chính thức của dự án
      const allowedDomains = ['res.cloudinary.com'];
      const isCloudinary = allowedDomains.includes(hostname) || hostname.endsWith('.cloudinary.com');
      if (!isCloudinary) {
        return sendError(res, 400, 'audioUrl không được phép truy cập');
      }
    } catch (e) {
      return sendError(res, 400, 'audioUrl không đúng định dạng URL');
    }

    const startVal = Number(start || 0);
    const durationVal = Number(duration || 30);

    // Gán headers báo hiệu virtual slice
    res.setHeader('X-Audio-Slice-Start', startVal);
    res.setHeader('X-Audio-Slice-Duration', durationVal);
    res.setHeader('X-Audio-Slice-Virtual', 'true');

    // Cấu hình headers proxy, chuyển tiếp Range request của Client
    const client = audioUrl.startsWith('https') ? https : http;
    const headers = {};
    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const request = client.get(audioUrl, { headers }, (stream) => {
      // Xử lý Redirect (301, 302, 307, 308)
      const status = stream.statusCode;
      if (status >= 300 && status < 400 && stream.headers.location) {
        console.log(`getAudioSliceHandler redirecting to: ${stream.headers.location}`);
        return res.redirect(stream.headers.location);
      }

      // Gán HTTP Status Code tương ứng (200 hoặc 206 Partial Content)
      res.statusCode = status;

      // Chuyển tiếp các Header âm thanh quan trọng
      const importantHeaders = [
        'content-type',
        'content-length',
        'content-range',
        'accept-ranges'
      ];

      importantHeaders.forEach(h => {
        if (stream.headers[h]) {
          res.setHeader(h, stream.headers[h]);
        }
      });

      stream.pipe(res);
    });

    request.on('error', (err) => {
      console.error('getAudioSliceHandler http.get error:', err);
      // Fallback: redirect đến audioUrl gốc
      return res.redirect(audioUrl);
    });

    // Tránh rò rỉ bộ nhớ/connection khi client hủy request giữa chừng
    res.on('close', () => {
      request.destroy();
    });

  } catch (error) {
    console.error('getAudioSliceHandler error:', error);
    if (req.query.audioUrl) {
      try {
        return res.redirect(req.query.audioUrl);
      } catch (e) {
        // Do nothing
      }
    }
    return sendError(res, 500, 'Lỗi khi tải stream audio');
  }
};
