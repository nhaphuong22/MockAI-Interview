import express from 'express';
import {
  login,
  register,
  loginGoogle,
  updateProfile,
  logout,
  verifyEmailController,
  resendVerificationEmailController,
  forgotPasswordController,
  resetPasswordController,
  changePasswordController,
  uploadAvatarController,
  getProfile,
  requestCompanyOtpController,
  verifyCompanyOtpController,
  resendCompanyOtpController,
  acceptPrivacyAgreementController,
} from '../controllers/authController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middlewares/authMiddleware.js';
import { uploadAvatar } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// ─── Verification & Privacy ──────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/privacy-agreement:
 *   post:
 *     summary: Chấp nhận thoả thuận dữ liệu cá nhân
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đã chấp nhận thành công
 */
router.post('/privacy-agreement', authenticateToken, acceptPrivacyAgreementController);

// ─── Register & Login ──────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản người dùng mới
 *     description: Tạo mới tài khoản và gửi email xác thực. Người dùng cần xác thực email trước khi đăng nhập.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, fullName]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               fullName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [jobseeker, recruiter]
 *     responses:
 *       201:
 *         description: Đăng ký thành công. Email xác thực đã được gửi.
 *       400:
 *         description: Thiếu tham số hoặc Email đã tồn tại.
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập người dùng
 *     description: Đăng nhập bằng Email và Mật khẩu để nhận JWT token. Email phải được xác thực trước.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công.
 *       401:
 *         description: Sai thông tin tài khoản hoặc mật khẩu.
 *       403:
 *         description: Email chưa được xác thực.
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Đăng xuất
 *     description: Kết thúc phiên làm việc. Client phải tự xoá JWT token.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất thành công.
 */
router.post('/logout', authenticateToken, logout);

// ─── Google OAuth ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Đăng nhập bằng Google
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idToken]
 *             properties:
 *               idToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập Google thành công.
 *       401:
 *         description: Token không hợp lệ.
 */
router.post('/google', loginGoogle);

// ─── Email Verification ────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Xác thực địa chỉ email
 *     description: Xác thực tài khoản bằng token được gửi qua email.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Xác thực email thành công.
 *       400:
 *         description: Token không hợp lệ hoặc đã hết hạn.
 */
router.post('/verify-email', verifyEmailController);

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Gửi lại email xác thực
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Kết quả (generic để tránh user enumeration).
 */
router.post('/resend-verification', resendVerificationEmailController);

// ─── Forgot / Reset Password ───────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Quên mật khẩu — gửi email đặt lại
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Kết quả (generic để tránh user enumeration).
 */
router.post('/forgot-password', forgotPasswordController);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu mới
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đặt lại mật khẩu thành công.
 *       400:
 *         description: Token không hợp lệ hoặc đã hết hạn.
 */
router.post('/reset-password', resetPasswordController);

// ─── Change Password (Authenticated) ──────────────────────────────────────────

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Đổi mật khẩu (khi đã đăng nhập)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công.
 *       400:
 *         description: Mật khẩu hiện tại không đúng.
 */
router.post('/change-password', authenticateToken, changePasswordController);

// ─── Profile ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Lấy thông tin hồ sơ cá nhân hiện tại
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công.
 *   put:
 *     summary: Cập nhật thông tin hồ sơ cá nhân
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cập nhật thành công.
 */
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

// ─── Company OTP Routes ────────────────────────────────────────────────────────

router.post('/company/request-otp', authenticateToken, requestCompanyOtpController);
router.post('/company/verify-otp', authenticateToken, verifyCompanyOtpController);
router.post('/company/resend-otp', authenticateToken, resendCompanyOtpController);

// ─── Avatar Upload ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/upload-avatar:
 *   post:
 *     summary: Tải lên ảnh đại diện
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tải lên thành công.
 */
router.post('/upload-avatar', authenticateToken, uploadAvatar.single('avatar'), uploadAvatarController);

// ─── Company Invitation Public Flow (Cách A) ───────────────────────────────────
import { verifyInvitationToken, acceptCompanyInvitation } from '../controllers/companyController.js';

router.get('/invitations/verify', verifyInvitationToken);
router.post('/invitations/accept', optionalAuthenticateToken, acceptCompanyInvitation);

export default router;
