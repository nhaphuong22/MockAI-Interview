import ExcelJS from 'exceljs';
import db from '../db/knex.js';
import fs from 'fs';
import path from 'path';
import { sendResponse, sendError } from '../ultils/responseHelper.js';

// Status label mapping for Excel output
const STATUS_LABELS = {
  SUBMITTED: 'Mới tiếp nhận',
  REVIEWING: 'Đang xem xét',
  AI_INTERVIEW_INVITED: 'Mời phỏng vấn AI',
  INTERVIEWED: 'Đã phỏng vấn AI',
  SHORTLISTED: 'Đậu phỏng vấn (Chờ KQ)',
  ACCEPTED: 'Trúng tuyển',
  HIRED: 'Đạt / Trúng tuyển',
  REJECTED: 'Không đạt',
};

/**
 * GET /api/applications/export
 * Export qualified candidates (SHORTLISTED, HIRED, ACCEPTED) to Excel.
 *
 * Query params:
 *   - jobIds: comma-separated job IDs (e.g. "1,2,3"). Omit or "all" = all HR's jobs.
 *   - format: "excel" (default) — reserved for future PDF support
 *
 * Security: HR can only export their own jobs. ADMIN can export all.
 */
export const exportApplications = async (req, res) => {
  try {
    const hrId = req.user.id;
    const role = req.user.role?.toUpperCase();
    const { jobIds: jobIdsParam } = req.query;

    // Parse jobIds param
    let jobIdList = [];
    if (jobIdsParam && jobIdsParam !== 'all') {
      jobIdList = jobIdsParam
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id));
    }

    // Build base query — fetch SHORTLISTED + HIRED + ACCEPTED applications
    let query = db('applications')
      .join('users', 'applications.candidate_id', 'users.id')
      .leftJoin('candidate_profiles', 'users.id', 'candidate_profiles.user_id')
      .join('jobs', 'applications.job_id', 'jobs.id')
      .leftJoin('companies', 'jobs.company_id', 'companies.id')
      .leftJoin('cvs', 'applications.cv_id', 'cvs.id')
      .leftJoin('assessments', 'applications.interview_id', 'assessments.interview_id')
      .select(
        'applications.id',
        'applications.job_id',
        'applications.status',
        'applications.cv_score',
        'applications.interview_score',
        'applications.portfolio_url',
        'applications.hr_notes',
        'applications.ai_summary',
        'applications.created_at',
        db.raw("COALESCE(applications.candidate_name, users.full_name) as candidate_name"),
        db.raw("COALESCE(applications.candidate_email, users.email) as candidate_email"),
        db.raw("COALESCE(applications.candidate_phone, candidate_profiles.phone) as candidate_phone"),
        'jobs.title as job_title',
        'jobs.hr_id as job_hr_id',
        'companies.name as company_name',
        'cvs.file_url as cv_url',
        'cvs.ai_feedback as cv_ai_feedback',
        'assessments.feedback_summary as ai_hr_feedback'
      )
      .whereIn('applications.status', ['SHORTLISTED', 'HIRED', 'ACCEPTED'])
      .orderBy('applications.cv_score', 'desc');

    // Security: HR can only export their own jobs
    if (role !== 'ADMIN') {
      query = query.where('jobs.hr_id', hrId);
    }

    // Filter by specific jobIds if provided
    if (jobIdList.length > 0) {
      query = query.whereIn('applications.job_id', jobIdList);

      // Extra security: verify all requested jobIds belong to this HR
      if (role !== 'ADMIN') {
        const ownedJobs = await db('jobs')
          .whereIn('id', jobIdList)
          .where('hr_id', hrId)
          .pluck('id');
        const unauthorizedIds = jobIdList.filter((id) => !ownedJobs.includes(id));
        if (unauthorizedIds.length > 0) {
          return sendError(res, 403, 'Bạn không có quyền xuất dữ liệu của vị trí này.');
        }
      }
    }

    const applications = await query;

    if (applications.length === 0) {
      return sendError(res, 404, 'Không có ứng viên đạt yêu cầu để xuất.');
    }

    // Group applications by jobId → each job = 1 sheet
    const groupedByJob = applications.reduce((acc, app) => {
      const key = app.job_id;
      if (!acc[key]) {
        acc[key] = { title: app.job_title, rows: [] };
      }
      acc[key].rows.push(app);
      return acc;
    }, {});

    // Build Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'MockAI Interview';
    workbook.created = new Date();

    const COLS_DEF = [
      { header: 'STT',                key: 'stt',            width: 6 },
      { header: 'Họ và Tên',          key: 'candidate_name', width: 28 },
      { header: 'Email',              key: 'email',          width: 32 },
      { header: 'Số Điện Thoại',      key: 'phone',          width: 16 },
      { header: 'Portfolio / GitHub', key: 'portfolio',      width: 30 },
      { header: 'Vị Trí Ứng Tuyển',   key: 'job_title',      width: 28 },
      { header: 'Công Ty',            key: 'company',        width: 22 },
      { header: 'Điểm CV AI',         key: 'cv_score',       width: 12 },
      { header: 'Điểm PV AI',         key: 'interview_score',width: 12 },
      { header: 'Trạng Thái',         key: 'status',         width: 22 },
      { header: 'Kỹ Năng Khớp',       key: 'skills',         width: 32 },
      { header: 'Phân Tích CV (AI)',  key: 'cv_ai_feedback', width: 40 },
      { header: 'Nhận Xét PV (AI HR)',key: 'ai_hr_feedback', width: 40 },
      { header: 'Ngày Nộp Đơn',       key: 'applied_date',   width: 16 },
      { header: 'Ghi Chú HR',         key: 'hr_notes',       width: 36 },
    ];

    const HEADER_FILL = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0F2FE' }, // sky-100
    };
    const HEADER_FONT = { bold: true, color: { argb: 'FF0369A1' }, size: 11 }; // sky-700
    const BORDER_STYLE = { style: 'thin', color: { argb: 'FFBAE6FD' } }; // sky-200
    const CELL_BORDER = {
      top: BORDER_STYLE, left: BORDER_STYLE, bottom: BORDER_STYLE, right: BORDER_STYLE,
    };

    Object.values(groupedByJob).forEach(({ title, rows }) => {
      // Truncate sheet name to 31 chars (Excel limit) & remove invalid chars
      const safeTitle = title ? title.replace(/[\\/*?:[\]]/g, '') : 'Chiến dịch';
      const sheetName = safeTitle.substring(0, 31);
      const sheet = workbook.addWorksheet(sheetName);
      
      // Define columns but without headers to prevent overwriting row 1
      sheet.columns = COLS_DEF.map(c => ({ key: c.key, width: c.width }));

      // Add "Tên Chiến Dịch" at the top
      const titleRow = sheet.addRow([`Tên Chiến Dịch: ${title || 'Không xác định'}`]);
      sheet.mergeCells(`A1:M1`);
      titleRow.font = { bold: true, size: 14, color: { argb: 'FF0369A1' } };
      titleRow.alignment = { vertical: 'middle', horizontal: 'left' };
      titleRow.height = 40;

      // Empty row
      sheet.addRow([]);

      // Headers row
      const headerRow = sheet.addRow(COLS_DEF.map(c => c.header));
      
      // Style header row
      headerRow.eachCell((cell) => {
        cell.fill = HEADER_FILL;
        cell.font = HEADER_FONT;
        cell.border = CELL_BORDER;
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      });
      headerRow.height = 30;

      // Helper to format CV AI Feedback
      const formatCVFeedback = (rawStr) => {
        if (!rawStr) return '—';
        try {
          if (typeof rawStr === 'string' && rawStr.trim().startsWith('{')) {
            const data = JSON.parse(rawStr);
            let textLines = [];
            if (data.evaluation_summary) textLines.push(`Nhận xét: ${data.evaluation_summary}`);
            if (data.positive_notes && data.positive_notes.length) textLines.push(`Điểm mạnh: ${data.positive_notes.join(', ')}`);
            if (data.negative_notes && data.negative_notes.length) textLines.push(`Cần cải thiện: ${data.negative_notes.join(', ')}`);
            if (data.missing_skills && data.missing_skills.length) textLines.push(`Thiếu kỹ năng: ${data.missing_skills.join(', ')}`);
            if (data.interview_notes) textLines.push(`Gợi ý PV: ${data.interview_notes}`);
            return textLines.join('\n\n') || rawStr;
          }
        } catch (e) {
          // ignore error, return raw
        }
        return rawStr;
      };

      // Helper to format AI HR Feedback
      const formatHRFeedback = (rawStr) => {
        if (!rawStr) return '—';
        try {
          if (typeof rawStr === 'string' && rawStr.trim().startsWith('{')) {
            const data = JSON.parse(rawStr);
            if (data.summary) return data.summary;
            return Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n');
          }
        } catch (e) {
          // ignore
        }
        return rawStr;
      };

      // Add data rows
      rows.forEach((app, index) => {
        const row = sheet.addRow({
          stt: index + 1,
          candidate_name: app.candidate_name || '—',
          email: app.candidate_email || '—',
          phone: app.candidate_phone || '—',
          portfolio: app.portfolio_url || '—',
          job_title: app.job_title || '—',
          company: app.company_name || '—',
          cv_score: app.cv_score ?? '—',
          interview_score: app.interview_score ?? '—',
          status: STATUS_LABELS[app.status] || app.status,
          skills: app.ai_summary || '—',
          cv_ai_feedback: formatCVFeedback(app.cv_ai_feedback),
          ai_hr_feedback: formatHRFeedback(app.ai_hr_feedback),
          applied_date: app.created_at
            ? new Date(app.created_at).toLocaleDateString('vi-VN')
            : '—',
          hr_notes: app.hr_notes || '',
        });

        // Zebra striping
        if (index % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
          });
        }
        row.eachCell((cell) => {
          cell.border = CELL_BORDER;
          cell.alignment = { vertical: 'middle', wrapText: true };
        });
        row.height = 22;
      });

      // Freeze up to the header row (row 3)
      sheet.views = [{ state: 'frozen', ySplit: 3 }];
    });

    // Build filename base
    const dateStr = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
    const sheetCount = Object.keys(groupedByJob).length;
    const firstJobTitle = Object.values(groupedByJob)[0]?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'Shortlist';
    const baseFilename = sheetCount === 1
      ? `MockAI_Shortlist_${firstJobTitle}_${dateStr}`
      : `MockAI_Shortlist_${sheetCount}-Vi-Tri_${dateStr}`;

    const excelFilename = `${baseFilename}.xlsx`;
    const zipFilename = `${baseFilename}.zip`;

    // Stream response as ZIP
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(zipFilename)}"`);

    const { ZipArchive } = await import('archiver');
    const archive = new ZipArchive({ zlib: { level: 9 } });
    archive.on('error', (err) => {
      console.error('Archiver error:', err);
      if (!res.headersSent) {
        res.status(500).send({ error: 'Lỗi khi tạo file nén ZIP.' });
      }
    });

    archive.pipe(res);

    // 1. Add Excel file to ZIP
    const excelBuffer = await workbook.xlsx.writeBuffer();
    archive.append(excelBuffer, { name: excelFilename });

    // Ensure CVs directory exists
    archive.append(null, { name: 'CVs/' });

    // 2. Add CVs to ZIP
    for (const app of applications) {
      if (!app.cv_url) continue;

      const candidateName = (app.candidate_name || 'Ung_Vien').replace(/[^a-zA-Z0-9]/g, '_');
      const jobTitle = (app.job_title || 'Job').replace(/[^a-zA-Z0-9]/g, '_');
      const ext = path.extname(app.cv_url) || '.pdf';
      const cvFilename = `CV_${jobTitle}_${candidateName}_${app.id}${ext}`;

      try {
        if (app.cv_url.startsWith('http://') || app.cv_url.startsWith('https://')) {
          // Download remote CV (e.g. from Cloudinary)
          const cvResponse = await fetch(app.cv_url);
          if (!cvResponse.ok) {
            throw new Error(`Mã lỗi HTTP: ${cvResponse.status} ${cvResponse.statusText}`);
          }
          const arrayBuffer = await cvResponse.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          archive.append(buffer, { name: `CVs/${cvFilename}` });
        } else {
          // Read local CV
          const localPath = path.join(process.cwd(), app.cv_url);
          if (fs.existsSync(localPath)) {
            archive.file(localPath, { name: `CVs/${cvFilename}` });
          } else {
            throw new Error(`Không tìm thấy file trên server nội bộ: ${localPath}`);
          }
        }
      } catch (err) {
        console.error(`Failed to fetch CV for application ${app.id}:`, err.message);
        // Write an error file so the user knows why the CV is missing
        const errorContent = `Lỗi khi tải CV của ứng viên ${app.candidate_name || 'Không xác định'}\nLink gốc: ${app.cv_url}\nChi tiết lỗi: ${err.message}`;
        archive.append(Buffer.from(errorContent, 'utf-8'), { name: `CVs/Loi_Tai_CV_${candidateName}_${app.id}.txt` });
      }
    }

    await archive.finalize();
    // Do not call res.end() here; archiver.finalize() automatically closes the stream
  } catch (error) {
    console.error('exportApplications error:', error);
    try { fs.writeFileSync('export_error_dump.txt', error.stack || error.toString()); } catch(e){}
    return sendError(res, 500, 'Lỗi khi xuất file Excel. Vui lòng thử lại.');
  }
};
