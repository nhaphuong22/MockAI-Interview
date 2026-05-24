import express from 'express';
import multer from 'multer';
import { uploadCV, scoreCV } from '../controllers/cvController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

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

export default router;
