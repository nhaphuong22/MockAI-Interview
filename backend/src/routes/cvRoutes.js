import express from 'express';
import multer from 'multer';
import { uploadCV, scoreCV, exportPdf, getTemplates, getTemplateById, saveCVHtml } from '../controllers/cvController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Cấu hình multer để lưu file trên RAM (buffer)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn file 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error(`Chỉ cho phép file định dạng PDF. File của bạn có định dạng: ${file.mimetype}`));
    }
  }
});

/**
 * @swagger
 * /api/cv/upload:
 *   post:
 *     summary: Upload và bóc tách CV (PDF)
 *     description: Tải lên file CV định dạng PDF để hệ thống trích xuất nội dung chữ thô.
 *     tags:
 *       - CV & Resume
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cv_file:
 *                 type: string
 *                 format: binary
 *                 description: File CV định dạng PDF (Max 5MB)
 *     responses:
 *       200:
 *         description: Trích xuất nội dung CV thành công.
 *       400:
 *         description: Lỗi không tìm thấy file hoặc sai định dạng.
 *       401:
 *         description: Thiếu token.
 */
const uploadHandler = upload.single('cv_file');

router.post('/upload', authenticateToken, (req, res, next) => {
  uploadHandler(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, uploadCV);

/**
 * @swagger
 * /api/cv/score:
 *   post:
 *     summary: AI đánh giá và chấm điểm CV
 *     description: Dựa vào nội dung CV và yêu cầu công việc (JD), AI sẽ chấm điểm và nhận xét điểm mạnh, điểm yếu.
 *     tags:
 *       - CV & Resume
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cv_text
 *               - job_description
 *             properties:
 *               cv_text:
 *                 type: string
 *                 example: "Kinh nghiệm 3 năm làm ReactJS và NodeJS..."
 *               job_description:
 *                 type: string
 *                 example: "Tuyển Frontend Developer giỏi React..."
 *     responses:
 *       200:
 *         description: AI trả về kết quả chấm điểm.
 *       400:
 *         description: Thiếu thông tin truyền vào.
 */
router.post('/score', authenticateToken, scoreCV);

/**
 * @swagger
 * /api/cv/export-pdf:
 *   post:
 *     summary: Xuất PDF báo cáo đánh giá CV
 *     description: Tạo file PDF từ dữ liệu đánh giá CV được truyền lên.
 *     tags:
 *       - CV & Resume
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               overallScore:
 *                 type: number
 *               strengths:
 *                 type: array
 *                 items:
 *                   type: string
 *               improvements:
 *                 type: array
 *                 items:
 *                   type: string
 *               sections:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Trả về luồng dữ liệu file PDF.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.post('/export-pdf', authenticateToken, exportPdf);

/**
 * @swagger
 * /api/cv/templates:
 *   get:
 *     summary: Lấy danh sách mẫu CV (Templates)
 *     description: Lấy danh sách template CV, có hỗ trợ phân trang.
 *     tags:
 *       - CV & Resume
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Số trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng template mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách mẫu CV thành công.
 */
router.get('/templates', getTemplates);

/**
 * @swagger
 * /api/cv/templates/{id}:
 *   get:
 *     summary: Lấy chi tiết nội dung HTML của mẫu CV
 *     tags:
 *       - CV & Resume
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của template
 *     responses:
 *       200:
 *         description: Trả về nội dung HTML của template.
 *       404:
 *         description: Không tìm thấy template.
 */
router.get('/templates/:id', getTemplateById);

/**
 * @swagger
 * /api/cv/save-html:
 *   post:
 *     summary: Lưu CV HTML
 *     description: Lưu nội dung HTML của CV sau khi ứng viên chỉnh sửa vào Database.
 *     tags:
 *       - CV & Resume
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               html_content:
 *                 type: string
 *                 description: Nội dung HTML của CV
 *               template_id:
 *                 type: string
 *                 description: ID của mẫu CV gốc
 *     responses:
 *       200:
 *         description: Lưu CV thành công.
 *       401:
 *         description: Chưa đăng nhập.
 */
router.post('/save-html', authenticateToken, saveCVHtml);

export default router;
