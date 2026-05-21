import express from 'express';
import { login, register, loginGoogle, updateProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập người dùng (Ứng viên / Nhà tuyển dụng)
 *     description: Đăng nhập bằng Email và Mật khẩu để nhận JWT token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: candidate@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về JWT Token và thông tin User.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: candidate@example.com
 *                     role:
 *                       type: string
 *                       example: candidate
 *       401:
 *         description: Sai thông tin tài khoản hoặc mật khẩu.
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản người dùng mới
 *     description: Tạo mới tài khoản (Ứng viên hoặc Nhà tuyển dụng) và trả về thông tin người dùng cùng JWT Token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: candidate@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *               fullName:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *               role:
 *                 type: string
 *                 enum: [jobseeker, recruiter]
 *                 example: jobseeker
 *     responses:
 *       201:
 *         description: Đăng ký thành công, trả về JWT Token và thông tin User.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: candidate@example.com
 *                     full_name:
 *                       type: string
 *                       example: "Nguyễn Văn A"
 *                     role:
 *                       type: string
 *                       example: USER
 *       400:
 *         description: Thiếu tham số hoặc Email đã được đăng ký trước đó.
 *       500:
 *         description: Lỗi máy chủ nội bộ.
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Đăng nhập bằng Google
 *     description: Xác thực tài khoản bằng Google ID Token và trả về JWT Token cùng thông tin User.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Đăng nhập bằng Google thành công, trả về JWT Token và thông tin User.
 *       400:
 *         description: Thiếu ID Token.
 *       401:
 *         description: ID Token không hợp lệ hoặc không đúng Client ID.
 *       500:
 *         description: Lỗi máy chủ nội bộ.
 */
router.post('/google', loginGoogle);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Cập nhật thông tin hồ sơ cá nhân
 *     description: Cập nhật thông tin chi tiết của người dùng đang đăng nhập (yêu cầu JWT token).
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *               phone:
 *                 type: string
 *                 example: "0987654321"
 *               address:
 *                 type: string
 *                 example: "Hà Nội, Việt Nam"
 *               bio:
 *                 type: string
 *                 example: "Lập trình viên đam mê công nghệ."
 *               avatarUrl:
 *                 type: string
 *                 example: "https://example.com/avatar.jpg"
 *     responses:
 *       200:
 *         description: Cập nhật thành công, trả về thông tin user mới.
 *       401:
 *         description: Không có token xác thực hoặc token không hợp lệ.
 *       404:
 *         description: Không tìm thấy người dùng.
 *       500:
 *         description: Lỗi máy chủ nội bộ.
 */
router.put('/profile', authenticateToken, updateProfile);

export default router;


