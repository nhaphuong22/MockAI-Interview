import ExcelJS from 'exceljs';
import db from '../db/knex.js';
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
      .join('jobs', 'applications.job_id', 'jobs.id')
      .leftJoin('companies', 'jobs.company_id', 'companies.id')
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
        db.raw("COALESCE(applications.candidate_phone, users.phone) as candidate_phone"),
        'jobs.title as job_title',
        'jobs.hr_id as job_hr_id',
        'companies.name as company_name'
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

    const HEADER_COLS = [
      { header: 'STT',                key: 'stt',            width: 6 },
      { header: 'Họ và Tên',          key: 'candidate_name', width: 28 },
      { header: 'Email',              key: 'email',          width: 32 },
      { header: 'Số Điện Thoại',      key: 'phone',          width: 16 },
      { header: 'Portfolio / GitHub', key: 'portfolio',      width: 30 },
      { header: 'Vị Trí Ứng Tuyển',  key: 'job_title',      width: 28 },
      { header: 'Công Ty',            key: 'company',        width: 22 },
      { header: 'Điểm CV AI',         key: 'cv_score',       width: 12 },
      { header: 'Điểm PV AI',         key: 'interview_score',width: 12 },
      { header: 'Trạng Thái',         key: 'status',         width: 22 },
      { header: 'Kỹ Năng Khớp',       key: 'skills',         width: 32 },
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
      // Truncate sheet name to 31 chars (Excel limit)
      const sheetName = title.substring(0, 31);
      const sheet = workbook.addWorksheet(sheetName);
      sheet.columns = HEADER_COLS;

      // Style header row
      const headerRow = sheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.fill = HEADER_FILL;
        cell.font = HEADER_FONT;
        cell.border = CELL_BORDER;
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      });
      headerRow.height = 30;

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

      // Freeze first row
      sheet.views = [{ state: 'frozen', ySplit: 1 }];
    });

    // Build filename
    const dateStr = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
    const sheetCount = Object.keys(groupedByJob).length;
    const firstJobTitle = Object.values(groupedByJob)[0]?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'Shortlist';
    const filename = sheetCount === 1
      ? `MockAI_Shortlist_${firstJobTitle}_${dateStr}.xlsx`
      : `MockAI_Shortlist_${sheetCount}-Vi-Tri_${dateStr}.xlsx`;

    // Stream response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('exportApplications error:', error);
    return sendError(res, 500, 'Lỗi khi xuất file Excel. Vui lòng thử lại.');
  }
};
