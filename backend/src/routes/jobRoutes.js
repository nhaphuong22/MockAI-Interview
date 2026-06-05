import express from 'express';

import { 
  createNewJob,
  getJobs,
  getJobById,
  updateJob,

  deleteJob,
  getJobApplications,
  updateJobApplication

  deleteJob

} from '../controllers/jobController.js';
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
 *               description:
 *                 type: string
 *                 example: "Chúng tôi tìm kiếm lập trình viên ReactJS tài năng để phát triển sản phẩm..."
 *               requirements:
 *                 type: string
 *                 example: "Có từ 2 năm kinh nghiệm làm việc với ReactJS, Git, Javascript..."
 *               status:
 *                 type: string
 *                 enum: [OPEN, CLOSED]
 *                 example: "OPEN"
 *               experience_level:
 *                 type: string
 *                 enum: [INTERN, JUNIOR, MID, SENIOR, LEAD]
 *                 example: "JUNIOR"
 *               salary_min:
 *                 type: number
 *                 example: 10000000
 *               salary_max:
 *                 type: number
 *                 example: 20000000
 *               salary_currency:
 *                 type: string
 *                 example: "VND"
 *               is_salary_visible:
 *                 type: boolean
 *                 example: true
 *               vacancy_count:
 *                 type: number
 *                 example: 2
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-30T17:00:00.000Z"
 *               detailed_requirements:
 *                 type: array
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
 *         description: Lỗi đầu vào.

 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền truy cập.
 *       500:
 *         description: Lỗi hệ thống.
 * 
 *   get:
 *     summary: Lấy danh sách tin tuyển dụng có bộ lọc và phân trang
 *     description: Cho phép ứng viên và HR xem danh sách tin tuyển dụng đang mở hoặc đóng.
 *     tags:
 *       - Jobs
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, CLOSED]
 *         description: Trạng thái tuyển dụng
 *       - in: query
 *         name: experience_level
 *         schema:
 *           type: string
 *         description: Yêu cầu cấp độ kinh nghiệm (JUNIOR, MID, SENIOR...)
 *       - in: query
 *         name: hr_id
 *         schema:
 *           type: integer
 *         description: Lọc theo ID của HR tạo tin
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm theo tiêu đề công việc
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng tin hiển thị mỗi trang
 *     responses:
 *       200:
 *         description: Thành công.
 *       500:
 *         description: Lỗi hệ thống.
 */

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Lấy chi tiết một tin tuyển dụng kèm yêu cầu chi tiết
 *     description: Xem chi tiết công việc và các yêu cầu để chuẩn bị ứng tuyển hoặc chấm điểm.
 *     tags:
 *       - Jobs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của Job
 *     responses:
 *       200:
 *         description: Thành công.
 *       404:
 *         description: Không tìm thấy tin tuyển dụng.
 *       500:
 *         description: Lỗi hệ thống.
 * 
 *   put:
 *     summary: Cập nhật thông tin tin tuyển dụng
 *     description: Cho phép HR (chủ sở hữu) hoặc Admin chỉnh sửa tin tuyển dụng và yêu cầu chi tiết.
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của Job cần cập nhật
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
 *               description:
 *                 type: string
 *               requirements:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [OPEN, CLOSED]
 *               experience_level:
 *                 type: string
 *               salary_min:
 *                 type: number
 *               salary_max:
 *                 type: number
 *               salary_currency:
 *                 type: string
 *               is_salary_visible:
 *                 type: boolean
 *               vacancy_count:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               detailed_requirements:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - requirement_text
 *                   properties:
 *                     requirement_text:
 *                       type: string
 *                     is_mandatory:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công.
 *       400:
 *         description: Lỗi dữ liệu đầu vào.
 *       401:
 *         description: Chưa đăng nhập.
 *       403:
 *         description: Không có quyền truy cập.
 *       404:
 *         description: Không tìm thấy tin.
 *       500:
 *         description: Lỗi hệ thống.
 * 
 *   delete:
 *     summary: Xóa một tin tuyển dụng
 *     description: Cho phép HR (chủ sở hữu) hoặc Admin xóa hoàn toàn tin tuyển dụng và các yêu cầu chi tiết của nó.
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của Job cần xóa
 *     responses:
 *       200:
 *         description: Xóa thành công.
 *       401:
 *         description: Chưa đăng nhập.
 *       403:
 *         description: Không có quyền truy cập.
 *       404:
 *         description: Không tìm thấy tin.

 *       401:
 *         description: Chưa xác thực.
 *       403:
 *         description: Không có quyền truy cập.
 *       500:
 *         description: Lỗi hệ thống.
 * 
 *   get:
 *     summary: Lấy danh sách tin tuyển dụng có bộ lọc và phân trang
 *     description: Cho phép ứng viên và HR xem danh sách tin tuyển dụng đang mở hoặc đóng.
 *     tags:
 *       - Jobs
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, CLOSED]
 *         description: Trạng thái tuyển dụng
 *       - in: query
 *         name: experience_level
 *         schema:
 *           type: string
 *         description: Yêu cầu cấp độ kinh nghiệm (JUNIOR, MID, SENIOR...)
 *       - in: query
 *         name: hr_id
 *         schema:
 *           type: integer
 *         description: Lọc theo ID của HR tạo tin
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm theo tiêu đề công việc
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng tin hiển thị mỗi trang
 *     responses:
 *       200:
 *         description: Thành công.

 *       500:
 *         description: Lỗi hệ thống.
 */


// Route khai báo
router.post('/', authenticateToken, requireRole(['HR', 'ADMIN']), createNewJob);
router.get('/', getJobs);
router.get('/applications', authenticateToken, requireRole(['HR', 'ADMIN']), getJobApplications);
router.put('/applications/:id', authenticateToken, requireRole(['HR', 'ADMIN']), updateJobApplication);

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Lấy chi tiết một tin tuyển dụng kèm yêu cầu chi tiết
 *     description: Xem chi tiết công việc và các yêu cầu để chuẩn bị ứng tuyển hoặc chấm điểm.
 *     tags:
 *       - Jobs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của Job
 *     responses:
 *       200:
 *         description: Thành công.
 *       404:
 *         description: Không tìm thấy tin tuyển dụng.
 *       500:
 *         description: Lỗi hệ thống.
 * 
 *   put:
 *     summary: Cập nhật thông tin tin tuyển dụng
 *     description: Cho phép HR (chủ sở hữu) hoặc Admin chỉnh sửa tin tuyển dụng và yêu cầu chi tiết.
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của Job cần cập nhật
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
 *               description:
 *                 type: string
 *               requirements:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [OPEN, CLOSED]
 *               experience_level:
 *                 type: string
 *               salary_min:
 *                 type: number
 *               salary_max:
 *                 type: number
 *               salary_currency:
 *                 type: string
 *               is_salary_visible:
 *                 type: boolean
 *               vacancy_count:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               detailed_requirements:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - requirement_text
 *                   properties:
 *                     requirement_text:
 *                       type: string
 *                     is_mandatory:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công.
 *       400:
 *         description: Lỗi dữ liệu đầu vào.
 *       401:
 *         description: Chưa đăng nhập.
 *       403:
 *         description: Không có quyền truy cập.
 *       404:
 *         description: Không tìm thấy tin.
 *       500:
 *         description: Lỗi hệ thống.
 * 
 *   delete:
 *     summary: Xóa một tin tuyển dụng
 *     description: Cho phép HR (chủ sở hữu) hoặc Admin xóa hoàn toàn tin tuyển dụng và các yêu cầu chi tiết của nó.
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của Job cần xóa
 *     responses:
 *       200:
 *         description: Xóa thành công.
 *       401:
 *         description: Chưa đăng nhập.
 *       403:
 *         description: Không có quyền truy cập.
 *       404:
 *         description: Không tìm thấy tin.
 *       500:
 *         description: Lỗi hệ thống.
 */

// Route khai báo
router.post('/', authenticateToken, requireRole(['HR', 'ADMIN']), createNewJob);
router.get('/', getJobs);

router.get('/:id', getJobById);
router.put('/:id', authenticateToken, requireRole(['HR', 'ADMIN']), updateJob);
router.delete('/:id', authenticateToken, requireRole(['HR', 'ADMIN']), deleteJob);

export default router;
