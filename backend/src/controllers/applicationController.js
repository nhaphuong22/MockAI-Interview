import db from '../db/knex.js';
import { evaluateCV, generatePDFReportBuffer } from '../services/cvService.js';
import { runHrScreeningPipeline } from '../services/hrScreeningService.js';
import { sendJobApplicationEmail, sendApplicationReportEmail, sendApplicationStatusUpdateEmail } from '../services/emailService.js';
import { sendRealtimeNotification, broadcastNewApplication } from '../socket.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';
import cloudinary from '../core/cloudinary.js';
import path from 'path';
import { deleteCache, deleteCachePattern } from '../config/redis.js';

// Đã xóa hàm extractSkillsFromText vì AI Pipeline mới đã tự động bóc tách kỹ năng chuẩn xác.

/**
 * Helper: Upload file report PDF buffer lên Cloudinary dạng raw
 */
const uploadReportToCloudinary = (fileBuffer, candidateName) => {
  return new Promise((resolve, reject) => {
    const cleanName = candidateName.replace(/[^a-zA-Z0-9_]/g, '_');
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'reports',
        public_id: `${Date.now()}-Report-${cleanName}`
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Ứng viên nộp đơn ứng tuyển cho một Job
 */
export const applyJob = async (req, res) => {
  try {
    const jobId = parseInt(req.params.jobId);
    const { cv_text, cv_url, cover_letter, candidate_name, candidate_email, candidate_phone, portfolio_url } = req.body;
    const candidateId = req.user.id;
    console.log("[Apply Job] Nhận được cv_url từ frontend body:", cv_url);

    if (isNaN(jobId)) {
      return sendError(res, 400, 'ID công việc không hợp lệ.');
    }

    if (!cv_text || typeof cv_text !== 'string' || cv_text.trim() === '') {
      return sendError(res, 400, 'Nội dung CV (cv_text) là bắt buộc.');
    }

    // Validate số điện thoại Việt Nam (nếu có)
    if (candidate_phone) {
      const cleanPhone = candidate_phone.trim().replace(/\s/g, '');
      const phoneRegex = /^(\+84|0)(3[2-9]|5[6-9]|7[06-9]|8[0-9]|9[0-9])[0-9]{7}$/;
      if (!phoneRegex.test(cleanPhone)) {
        return sendError(res, 400, 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 số, bắt đầu bằng 0 hoặc +84).');
      }
    }

    // Loại bỏ ký tự null (0x00) để tránh lỗi UTF-8 của PostgreSQL
    const sanitizedCvText = cv_text.replace(/\x00/g, '');

    // 1. Kiểm tra xem ứng viên đã ứng tuyển công việc này chưa
    const existingApp = await db('applications')
      .where({ candidate_id: candidateId, job_id: jobId })
      .first();

    // 2. Lấy thông tin công việc và thông tin HR tạo tin
    const job = await db('jobs')
      .leftJoin('companies', 'jobs.company_id', 'companies.id')
      .select('jobs.*', 'companies.name as company_name')
      .where('jobs.id', jobId)
      .first();

    if (!job) {
      return sendError(res, 404, 'Không tìm thấy thông tin công việc này.');
    }

    // Lấy thêm các tiêu chí đánh giá tự động (job_requirements)
    const jobRequirements = await db('job_requirements').where('job_id', jobId);

    const formattedName = candidate_name || req.user.full_name || req.user.email;
    console.log(`[Application] Đang chấm điểm CV cho ứng viên ${formattedName} với HR Screening Pipeline...`);

    // Gọi Pipeline mới thay vì evaluateCV cũ
    const evaluation = await runHrScreeningPipeline(sanitizedCvText, job, jobRequirements);

    // Xác định trạng thái ban đầu của Application dựa trên kết quả Knock-out của AI
    const initialStatus = evaluation.knockout_status === 'REJECTED' ? 'REJECTED' : 'SUBMITTED';

    // 3.1. Tạo PDF báo cáo và tải lên Cloudinary
    const candidateName = candidate_name || req.user.full_name || req.user.email;
    console.log(`[Application] Đang tạo báo cáo đánh giá PDF cho ứng viên ${candidateName}...`);

    // Map data mới sang chuẩn cũ để PDF vẫn tạo được không bị lỗi
    const mappedEvaluationForPDF = {
      overallScore: evaluation.semantic_score || 0,
      strengths: evaluation.talent_signals || [],
      improvements: evaluation.red_flags && evaluation.red_flags.length > 0 ? evaluation.red_flags : ["Hồ sơ khá tốt, cần phỏng vấn thêm để làm rõ."],
      sections: [
        { name: "Vòng Gửi Xe (Knock-out)", score: evaluation.knockout_status === 'PASSED' ? 100 : 0, feedback: evaluation.knockout_reason || "Đạt các yêu cầu tối thiểu của công việc" },
        { name: "Đánh giá Ngữ nghĩa (Semantic)", score: evaluation.semantic_score || 0, feedback: evaluation.evaluation_summary || "Không có nhận xét" },
        { name: "Kỹ năng Khớp", score: evaluation.matched_skills && evaluation.matched_skills.length > 0 ? 100 : 50, feedback: evaluation.matched_skills ? evaluation.matched_skills.join(', ') : "Không có" },
        { name: "Kỹ năng Cần Bổ Sung", score: evaluation.missing_skills && evaluation.missing_skills.length > 0 ? 50 : 100, feedback: evaluation.missing_skills ? evaluation.missing_skills.join(', ') : "Không phát hiện thiếu sót" }
      ]
    };

    const pdfReportBuffer = await generatePDFReportBuffer(mappedEvaluationForPDF, candidateName, job.title);

    console.log(`[Application] Đang upload PDF báo cáo lên Cloudinary...`);
    const reportCloudinaryResult = await uploadReportToCloudinary(pdfReportBuffer, candidateName);
    const pdfReportUrl = reportCloudinaryResult.secure_url;
    console.log(`[Application] Upload báo cáo thành công! URL: ${pdfReportUrl}`);

    let cv;
    let application;

    if (existingApp) {
      console.log(`[Application] Ứng viên ${formattedName} cập nhật CV/đơn ứng tuyển cho Job ${job.title}...`);

      // Lưu thông tin CV mới vào bảng `cvs`
      const [newCv] = await db('cvs')
        .insert({
          user_id: candidateId,
          file_url: cv_url || 'uploads/cv/cv_uploaded.pdf',
          parsed_text: sanitizedCvText,
          ats_score: evaluation.semantic_score || 0,
          ai_feedback: JSON.stringify(evaluation).replace(/\x00/g, ''),
          pdf_report_url: pdfReportUrl,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');
      cv = newCv;

      // Cập nhật đơn ứng tuyển hiện tại
      const [updatedApp] = await db('applications')
        .where({ id: existingApp.id })
        .update({
          cv_id: cv.id,
          status: initialStatus, // Sử dụng trạng thái dựa trên Knock-out
          cv_score: evaluation.semantic_score || 0,
          total_score: evaluation.semantic_score || 0,
          cover_letter: cover_letter || null,
          candidate_name: candidate_name || null,
          candidate_email: candidate_email || null,
          candidate_phone: candidate_phone || null,
          portfolio_url: portfolio_url || null,
          ai_summary: evaluation.matched_skills && evaluation.matched_skills.length > 0 ? evaluation.matched_skills.slice(0, 3).join(', ') : 'Chưa cập nhật kỹ năng',
          updated_at: new Date(),
          created_at: new Date() // Đẩy lên đầu danh sách HR
        })
        .returning('*');
      application = updatedApp;
    } else {
      // 4. Lưu thông tin CV vào bảng `cvs`
      const [newCv] = await db('cvs')
        .insert({
          user_id: candidateId,
          file_url: cv_url || 'uploads/cv/cv_uploaded.pdf',
          parsed_text: sanitizedCvText,
          ats_score: evaluation.semantic_score || 0,
          ai_feedback: JSON.stringify(evaluation).replace(/\x00/g, ''),
          pdf_report_url: pdfReportUrl,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');
      cv = newCv;

      // 5. Lưu đơn ứng tuyển vào bảng `applications`
      const [newApp] = await db('applications')
        .insert({
          candidate_id: candidateId,
          job_id: jobId,
          cv_id: cv.id,
          status: initialStatus, // Sử dụng trạng thái dựa trên Knock-out
          cv_score: evaluation.semantic_score || 0,
          total_score: evaluation.semantic_score || 0,
          cover_letter: cover_letter || null,
          candidate_name: candidate_name || null,
          candidate_email: candidate_email || null,
          candidate_phone: candidate_phone || null,
          portfolio_url: portfolio_url || null,
          ai_summary: evaluation.matched_skills && evaluation.matched_skills.length > 0 ? evaluation.matched_skills.slice(0, 3).join(', ') : 'Chưa cập nhật kỹ năng',
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');
      application = newApp;
    }


    // 6. Gửi thông báo & email cho HR (nếu có thông tin HR)
    if (job.hr_id) {
      // Clear HR's applications cache so they can see the new application in the "All" tab
      await deleteCachePattern(`applications:hr:${job.hr_id}:*`);

      const hrUser = await db('users').where({ id: job.hr_id }).first();

      // Lưu thông báo vào CSDL
      const [notification] = await db('notifications')
        .insert({
          user_id: job.hr_id,
          type: 'APPLICATION_UPDATE',
          title: existingApp ? 'Cập nhật đơn ứng tuyển' : 'Đơn ứng tuyển mới',
          content: existingApp
            ? `${req.user.full_name || req.user.email} đã cập nhật lại CV cho vị trí "${job.title}"`
            : `${req.user.full_name || req.user.email} đã nộp đơn ứng tuyển cho vị trí "${job.title}"`,
          link: `/hr/dashboard`,
          reference_id: application.id,
          reference_type: 'application',
          is_read: false,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');

      // Đã vô hiệu hóa gửi mail cho HR khi có đơn mới theo yêu cầu của user

      // Đẩy thông báo tức thời (In-app notification) cho HR qua Socket.io
      sendRealtimeNotification(job.hr_id, {
        id: notification.id,
        type: 'application',
        title: notification.title,
        content: notification.content,
        time: 'Vừa xong',
        isRead: false
      });

      // Phát thông tin đơn ứng tuyển mới tới toàn bộ trang Dashboard HR đang mở
      broadcastNewApplication({
        id: application.id,
        name: req.user.full_name || 'Ứng viên',
        avatar: req.user.avatar_url ? '👦' : '👨‍💻',
        email: req.user.email,
        position: job.title,
        aiScore: evaluation.semantic_score || 0,
        skills: evaluation.matched_skills && evaluation.matched_skills.length > 0 ? evaluation.matched_skills.slice(0, 3) : ['Chưa cập nhật kỹ năng'],
        status: 'new',
        appliedDate: new Date().toISOString()
      });
    }

    // Đã vô hiệu hóa gửi mail xác nhận cho ứng viên khi nộp đơn theo yêu cầu của user

    // Tuy nhiên, nếu AI tự động đánh rớt (Knock-out REJECTED), thì tự động gửi mail báo Từ chối cho ứng viên luôn
    if (initialStatus === 'REJECTED') {
      const emailToUse = candidate_email || req.user.email;
      const candidateNameToUse = candidate_name || req.user.full_name || req.user.email;
      if (emailToUse) {
        console.log(`[Application] AI Knock-out REJECTED - Tự động gửi mail báo rớt tới Candidate: ${emailToUse}`);
        sendApplicationStatusUpdateEmail(
          emailToUse,
          candidateNameToUse,
          job.title,
          'REJECTED'
        ).catch(err => console.error('Lỗi khi gửi email báo rớt AI Knock-out:', err));
      }

      // Tạo thông báo in-app cho ứng viên
      try {
        const [candidateNotification] = await db('notifications')
          .insert({
            user_id: candidateId,
            type: 'APPLICATION_UPDATE',
            title: 'Cập nhật trạng thái đơn tuyển',
            content: `Đơn ứng tuyển vị trí "${job.title}" của bạn đã được cập nhật thành: Từ chối`,
            link: '/applications',
            reference_id: application.id,
            reference_type: 'application',
            is_read: false,
            created_at: new Date(),
            updated_at: new Date()
          })
          .returning('*');

        sendRealtimeNotification(candidateId, {
          id: candidateNotification.id,
          type: 'application',
          title: candidateNotification.title,
          content: candidateNotification.content,
          time: 'Vừa xong',
          isRead: false
        });
      } catch (notiError) {
        console.error('Lỗi khi tạo in-app notification cho Candidate bị AI từ chối:', notiError);
      }
    }

    return sendResponse(res, 201, {
      application_id: application.id,
      cv_id: cv.id,
      status: application.status,
      ai_score: evaluation.semantic_score
    }, 'Nộp đơn ứng tuyển thành công.');
  } catch (error) {
    console.error('Lỗi trong applyJob controller:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi nộp đơn ứng tuyển.');
  }
};

/**
 * Lấy danh sách các đơn ứng tuyển (Theo phân vai)
 */
export const getApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role?.toUpperCase();

    let query = db('applications')
      .join('users', 'applications.candidate_id', 'users.id')
      .join('jobs', 'applications.job_id', 'jobs.id')
      .leftJoin('companies', 'jobs.company_id', 'companies.id')
      .leftJoin('cvs', 'applications.cv_id', 'cvs.id') // Join bảng cvs để lấy cv file url
      .select(
        'applications.*',
        db.raw('COALESCE(applications.candidate_name, users.full_name) as candidate_name'),
        db.raw('COALESCE(applications.candidate_email, users.email) as candidate_email'),
        'users.phone as user_phone',
        'users.avatar_url as candidate_avatar',
        'jobs.title as job_title',
        'jobs.hr_id as job_hr_id',
        'companies.name as company_name',
        'cvs.file_url as cv_url',
        'cvs.pdf_report_url as pdf_report_url',
        'cvs.ai_feedback as ai_feedback',
        'cvs.parsed_text as cv_text'
      );

    if (role === 'HR') {
      // HR chỉ xem các ứng đơn nộp vào công việc của HR đó tạo
      query.where('jobs.hr_id', userId);
    } else if (role === 'USER') {
      // Candidate chỉ xem các ứng đơn của chính họ nộp
      query.where('applications.candidate_id', userId);
    } // ADMIN xem toàn bộ

    // Xử lý lọc theo jobId (chỉ áp dụng cho HR hoặc Admin)
    const { jobId, sortBy, order } = req.query;
    if (jobId && jobId !== "Tất cả công việc" && !isNaN(parseInt(jobId))) {
      query.where("applications.job_id", parseInt(jobId));
    }

    // Xử lý sắp xếp (Sorting)
    const validSortFields = {
      ats: "applications.cv_score",
      date: "applications.created_at"
    };
    const sortField = validSortFields[sortBy] || "applications.cv_score";
    const sortOrder = (order === "asc" || order === "desc") ? order : "desc";

    query.orderBy(sortField, sortOrder);

    // Secondary sort để đảm bảo thứ tự nhất quán khi trùng điểm
    if (sortField !== "applications.created_at") {
      query.orderBy("applications.created_at", "desc");
    }

    const list = await query;

    // Ánh xạ trả về định dạng chuẩn hoá
    const formatted = list.map(item => ({
      id: item.id,
      jobId: item.job_id,
      jobTitle: item.job_title,
      companyName: item.company_name || 'MockAI Company',
      candidateName: item.candidate_name,
      candidateEmail: item.candidate_email,
      candidatePhone: item.candidate_phone || item.user_phone,
      portfolioUrl: item.portfolio_url,
      candidateAvatar: item.candidate_avatar || '👨‍💻',
      cvId: item.cv_id,
      cvUrl: item.cv_url, // Lấy file url CV thực tế trả về cho frontend
      cv_text: item.cv_text || null,
      cvText: item.cv_text || null,
      pdfReportUrl: item.pdf_report_url,
      aiFeedback: item.ai_feedback ? JSON.parse(item.ai_feedback) : null,
      status: item.status.toLowerCase(), // frontend match: 'new', 'reviewed', 'interviewed', 'accepted', 'rejected'
      aiScore: item.cv_score || 0,
      appliedDate: item.created_at,
      coverLetter: item.cover_letter,
      aiSummary: item.ai_summary
    }));


    return sendResponse(res, 200, formatted);
  } catch (error) {
    console.error('Lỗi trong getApplications controller:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi lấy danh sách ứng tuyển.');
  }
};

/**
 * Cập nhật trạng thái đơn ứng tuyển (Chỉ HR/ADMIN)
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const appId = parseInt(req.params.id);
    const { status } = req.body; // new, reviewed, interviewed, accepted, rejected
    const userId = req.user.id;
    const role = req.user.role?.toUpperCase();

    if (isNaN(appId)) {
      return sendError(res, 400, 'ID đơn tuyển dụng không hợp lệ.');
    }

    const VALID_STATUSES = ['new', 'reviewed', 'interviewed', 'accepted', 'rejected', 'hired', 'shortlisted', 'SUBMITTED', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'HIRED', 'SHORTLISTED'];
    if (!status || !VALID_STATUSES.includes(status)) {
      return sendError(res, 400, 'Trạng thái cập nhật không hợp lệ.');
    }

    // Lấy thông tin đơn ứng tuyển hiện tại cùng thông tin ứng viên
    const app = await db('applications')
      .join('jobs', 'applications.job_id', 'jobs.id')
      .join('users', 'applications.candidate_id', 'users.id')
      .select(
        'applications.*',
        'jobs.hr_id as job_hr_id',
        'jobs.title as job_title',
        'users.email as candidate_email',
        'users.full_name as candidate_name'
      )
      .where('applications.id', appId)
      .first();

    if (!app) {
      return sendError(res, 404, 'Không tìm thấy đơn ứng tuyển.');
    }

    // Kiểm tra quyền: HR sở hữu Job này hoặc Admin
    if (app.job_hr_id !== userId && role !== 'ADMIN') {
      return sendError(res, 403, 'Bạn không có quyền cập nhật trạng thái đơn ứng tuyển này.');
    }

    // Chuẩn hoá status lưu DB (in HOA)
    let dbStatus = status.toUpperCase();
    if (dbStatus === 'NEW') dbStatus = 'SUBMITTED';
    if (dbStatus === 'REVIEWED') dbStatus = 'REVIEWING';

    await db('applications')
      .where({ id: appId })
      .update({
        status: dbStatus,
        reviewed_by: userId,
        reviewed_at: new Date(),
        updated_at: new Date()
      });

    // Check vacancy count to automatically close job if enough candidates are accepted/hired
    if (dbStatus === 'ACCEPTED' || dbStatus === 'HIRED') {
      const jobInfo = await db('jobs').where({ id: app.job_id }).first();
      if (jobInfo && jobInfo.vacancy_count !== null && jobInfo.vacancy_count > 0) {
        const acceptedCountRes = await db('applications')
          .where({ job_id: app.job_id })
          .whereIn('status', ['ACCEPTED', 'HIRED'])
          .count('id as count')
          .first();
        const acceptedCount = parseInt(acceptedCountRes.count || 0);

        if (acceptedCount >= jobInfo.vacancy_count) {
          await db('jobs')
            .where({ id: app.job_id })
            .update({
              status: 'CLOSED',
              updated_at: new Date()
            });
          // Invalidate cache for job list and detail since status changed to CLOSED
          await deleteCachePattern('jobs:list:*');
          await deleteCache(`jobs:detail:${app.job_id}`);
          console.log(`[Job Status] Job ID ${app.job_id} ("${jobInfo.title}") has been automatically CLOSED. Accepted count (${acceptedCount}) reached vacancy count (${jobInfo.vacancy_count}).`);
        }
      }
    }

    // Gửi email thông báo trạng thái cập nhật cho ứng viên
    if (app.candidate_email) {
      console.log(`[Application] Gửi mail thông báo trạng thái ${dbStatus} tới Candidate: ${app.candidate_email}`);
      sendApplicationStatusUpdateEmail(
        app.candidate_email,
        app.candidate_name || 'Ứng viên',
        app.job_title,
        dbStatus
      ).catch(err => console.error('Lỗi khi gửi email thông báo trạng thái đơn ứng tuyển:', err));
    }

    // Tạo thông báo gửi cho Ứng viên
    const statusLabels = {
      SUBMITTED: 'Đã nhận hồ sơ',
      REVIEWING: 'Đang xem xét',
      INTERVIEWED: 'Mời phỏng vấn',
      ACCEPTED: 'Trúng tuyển',
      REJECTED: 'Không đạt'
    };

    const [notification] = await db('notifications')
      .insert({
        user_id: app.candidate_id,
        type: 'APPLICATION_UPDATE',
        title: 'Cập nhật trạng thái đơn tuyển',
        content: `Đơn ứng tuyển vị trí "${app.job_title}" của bạn đã được cập nhật thành: ${statusLabels[dbStatus] || dbStatus}`,
        link: `/applications`,
        reference_id: appId,
        reference_type: 'application',
        is_read: false,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    // Đẩy thông báo đẩy qua Socket.io tới Ứng viên
    sendRealtimeNotification(app.candidate_id, {
      id: notification.id,
      type: 'application',
      title: notification.title,
      content: notification.content,
      time: 'Vừa xong',
      isRead: false
    });

    return sendResponse(res, 200, { id: appId, status: status.toLowerCase() }, 'Cập nhật trạng thái đơn ứng tuyển thành công.');
  } catch (error) {
    console.error('Lỗi trong updateApplicationStatus controller:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi cập nhật trạng thái đơn tuyển.');
  }
};

/**
 * PATCH /api/applications/:id/note
 * HR saves an internal note for an application (not visible to candidates).
 */
export const saveApplicationNote = async (req, res) => {
  try {
    const appId = parseInt(req.params.id, 10);
    const { note } = req.body;
    const hrId = req.user.id;
    const role = req.user.role?.toUpperCase();

    if (isNaN(appId)) {
      return sendError(res, 400, 'ID đơn ứng tuyển không hợp lệ.');
    }

    // Fetch application and verify HR ownership
    const app = await db('applications')
      .join('jobs', 'applications.job_id', 'jobs.id')
      .select('applications.id', 'jobs.hr_id as job_hr_id')
      .where('applications.id', appId)
      .first();

    if (!app) {
      return sendError(res, 404, 'Không tìm thấy đơn ứng tuyển.');
    }

    if (app.job_hr_id !== hrId && role !== 'ADMIN') {
      return sendError(res, 403, 'Bạn không có quyền ghi chú vào đơn ứng tuyển này.');
    }

    await db('applications')
      .where({ id: appId })
      .update({ hr_notes: note ?? null, updated_at: new Date() });

    return sendResponse(res, 200, { id: appId, hr_notes: note }, 'Đã lưu ghi chú thành công.');
  } catch (error) {
    console.error('saveApplicationNote error:', error);
    return sendError(res, 500, 'Lỗi khi lưu ghi chú.');
  }
};
