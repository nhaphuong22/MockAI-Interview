import db from '../db/knex.js';
import { evaluateCV, generatePDFReportBuffer } from '../services/cvService.js';
import { sendJobApplicationEmail, sendApplicationReportEmail, sendApplicationStatusUpdateEmail } from '../services/emailService.js';
import { sendRealtimeNotification, broadcastNewApplication } from '../socket.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';
import cloudinary from '../core/cloudinary.js';
import path from 'path';

/**
 * Helper: Trích xuất các từ khóa kỹ năng từ văn bản CV
 */
const extractSkillsFromText = (text) => {
  if (!text) return ['React', 'JavaScript'];
  const commonSkills = [
    'React', 'Node.js', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'HTML', 'CSS', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Docker', 'Kubernetes', 
    'Git', 'AWS', 'Vue', 'Angular', 'Express', 'Tailwind', 'Figma', 'UI/UX', 
    'Marketing', 'SEO', 'Sales', 'Excel', 'Photoshop', 'Project Management'
  ];
  const foundSkills = [];
  const lowerText = text.toLowerCase();
  for (const skill of commonSkills) {
    const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(?:\\b|\\s|^)${escapedSkill}(?:\\b|\\s|$|\\.)`, 'i');
    if (regex.test(lowerText)) {
      foundSkills.push(skill);
    }
  }
  return foundSkills.length > 0 ? foundSkills : ['React', 'JavaScript'];
};

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
    const { cv_text, cv_url, cover_letter } = req.body;
    const candidateId = req.user.id;
    console.log("[Apply Job] Nhận được cv_url từ frontend body:", cv_url);

    if (isNaN(jobId)) {
      return sendError(res, 400, 'ID công việc không hợp lệ.');
    }

    if (!cv_text || typeof cv_text !== 'string' || cv_text.trim() === '') {
      return sendError(res, 400, 'Nội dung CV (cv_text) là bắt buộc.');
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

    // 3. Đánh giá CV bằng AI dựa trên JD và yêu cầu công việc
    const jobJD = `${job.title}\n${job.description || ''}\n${job.requirements || ''}`;
    console.log(`[Application] Đang chấm điểm CV cho ứng viên ${req.user.full_name} với JD của Job ${job.title}...`);
    const evaluation = await evaluateCV(sanitizedCvText, jobJD);

    // 3.1. Tạo PDF báo cáo và tải lên Cloudinary
    const candidateName = req.user.full_name || req.user.email;
    console.log(`[Application] Đang tạo báo cáo đánh giá PDF cho ứng viên ${candidateName}...`);
    const pdfReportBuffer = await generatePDFReportBuffer(evaluation, candidateName, job.title);
    
    console.log(`[Application] Đang upload PDF báo cáo lên Cloudinary...`);
    const reportCloudinaryResult = await uploadReportToCloudinary(pdfReportBuffer, candidateName);
    const pdfReportUrl = reportCloudinaryResult.secure_url;
    console.log(`[Application] Upload báo cáo thành công! URL: ${pdfReportUrl}`);

    let cv;
    let application;

    if (existingApp) {
      console.log(`[Application] Ứng viên ${req.user.full_name} cập nhật CV/đơn ứng tuyển cho Job ${job.title}...`);
      
      // Lưu thông tin CV mới vào bảng `cvs`
      const [newCv] = await db('cvs')
        .insert({
          user_id: candidateId,
          file_url: cv_url || 'uploads/cv/cv_uploaded.pdf',
          parsed_text: sanitizedCvText,
          ats_score: evaluation.overallScore || 0,
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
          status: 'SUBMITTED', // Reset trạng thái về Mới tiếp nhận
          cv_score: evaluation.overallScore || 0,
          total_score: evaluation.overallScore || 0,
          cover_letter: cover_letter || null,
          ai_summary: extractSkillsFromText(sanitizedCvText).slice(0, 3).join(', '),
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
          ats_score: evaluation.overallScore || 0,
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
          status: 'SUBMITTED',
          cv_score: evaluation.overallScore || 0,
          total_score: evaluation.overallScore || 0,
          cover_letter: cover_letter || null,
          ai_summary: extractSkillsFromText(sanitizedCvText).slice(0, 3).join(', '),
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');
      application = newApp;
    }


    // 6. Gửi thông báo & email cho HR (nếu có thông tin HR)
    if (job.hr_id) {
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

      // Gửi mail cho HR thông qua SMTP kèm PDF báo cáo
      if (hrUser && hrUser.email) {
        console.log(`[Application] Đang gửi mail báo cáo tuyển dụng kèm PDF tới HR: ${hrUser.email}`);
        await sendApplicationReportEmail(
          hrUser.email,
          hrUser.full_name || 'Nhà tuyển dụng',
          candidateName,
          job.title,
          evaluation.overallScore || 0,
          pdfReportUrl,
          true, // Gửi cho HR
          pdfReportBuffer
        );
      }

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
        aiScore: evaluation.overallScore || 0,
        skills: extractSkillsFromText(sanitizedCvText).slice(0, 3),
        status: 'new',
        appliedDate: new Date().toISOString()
      });
    }

    // Gửi mail xác nhận và báo cáo chi tiết cho Candidate thông qua SMTP kèm PDF báo cáo
    if (req.user.email) {
      console.log(`[Application] Đang gửi mail xác nhận và báo cáo tuyển dụng tới Candidate: ${req.user.email}`);
      await sendApplicationReportEmail(
        req.user.email,
        req.user.full_name || 'Ứng viên',
        candidateName,
        job.title,
        evaluation.overallScore || 0,
        pdfReportUrl,
        false, // Gửi cho Candidate
        pdfReportBuffer
      );
    }


    return sendResponse(res, 201, {
      application_id: application.id,
      cv_id: cv.id,
      status: application.status,
      ai_score: evaluation.overallScore
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
        'users.full_name as candidate_name',
        'users.email as candidate_email',
        'users.avatar_url as candidate_avatar',
        'jobs.title as job_title',
        'jobs.hr_id as job_hr_id',
        'companies.name as company_name',
        'cvs.file_url as cv_url',
        'cvs.pdf_report_url as pdf_report_url',
        'cvs.ai_feedback as ai_feedback'
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
      candidateAvatar: item.candidate_avatar || '👨‍💻',
      cvId: item.cv_id,
      cvUrl: item.cv_url, // Lấy file url CV thực tế trả về cho frontend
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

    const VALID_STATUSES = ['new', 'reviewed', 'interviewed', 'accepted', 'rejected', 'SUBMITTED', 'REVIEWING', 'ACCEPTED', 'REJECTED'];
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
