import express from 'express';
import { login } from '../controllers/authController.js';

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

export default router;
