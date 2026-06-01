import express from 'express';
import { createNewJob } from '../controllers/jobController.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Tạo mới tin tuyển dụng kèm yêu cầu chi tiết
 *     description: Cho phép HR hoặc Admin đăng tin tuyển dụng mới và lưu các yêu cầu chi tiết của công việc.
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Frontend Developer (ReactJS)"
 *                 description: Tiêu đề công việc
 *               description:
 *                 type: string
 *                 example: "Chúng tôi tìm kiếm lập trình viên ReactJS tài năng để phát triển sản phẩm..."
 *                 description: Mô tả công việc
 *               requirements:
 *                 type: string
 *                 example: "Có từ 2 năm kinh nghiệm làm việc với ReactJS, Git, Javascript..."
 *                 description: Yêu cầu tổng quan (AI sẽ dùng để đặt câu hỏi)
 *               status:
 *                 type: string
 *                 enum: [OPEN, CLOSED]
 *                 example: "OPEN"
 *                 description: Trạng thái tuyển dụng
 *               detailed_requirements:
 *                 type: array
 *                 description: Danh sách yêu cầu chi tiết để chấm điểm
 *                 items:
 *                   type: object
 *                   required:
 *                     - requirement_text
 *                   properties:
 *                     requirement_text:
 *                       type: string
 *                       example: "Có kinh nghiệm với React Hooks và Context API"
 *                     is_mandatory:
 *                       type: boolean
 *                       example: true
 *                       default: true
 *     responses:
 *       201:
 *         description: Tạo tin tuyển dụng thành công.
 *       400:
 *         description: Lỗi đầu vào (thiếu title hoặc sai định dạng detailed_requirements).
 *       401:
 *         description: Chưa xác thực (thiếu token).
 *       403:
 *         description: Không có quyền truy cập (không phải HR hoặc ADMIN).
 *       500:
 *         description: Lỗi hệ thống.
 */
router.post('/', authenticateToken, requireRole(['HR', 'ADMIN']), createNewJob);

export default router;
