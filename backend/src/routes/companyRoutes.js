import express from 'express';
import {
  getCompanyDetail,
  toggleFollowCompany,
  getCompanyFollowers,
  getCompanies,
  createCompany,
  joinCompany,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  uploadVerificationDocsController,
  leaveCompany,
  deleteCompany,
  getCompanyMembers,
  inviteCompanyMember,
  getCompanyInvitations,
  cancelCompanyInvitation,
  removeCompanyMember
} from '../controllers/companyController.js';
import { authenticateToken, optionalAuthenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import { uploadAvatar } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/companies/upload-verification-docs:
 *   post:
 *     summary: Tải lên tài liệu xác minh công ty
 *     tags:
 *       - Companies
 */
router.post(
  '/upload-verification-docs',
  authenticateToken,
  uploadAvatar.fields([
    { name: 'licenseFile', maxCount: 1 },
    { name: 'authFile', maxCount: 1 },
    { name: 'idFrontFile', maxCount: 1 },
    { name: 'idBackFile', maxCount: 1 }
  ]),
  uploadVerificationDocsController
);

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Lấy danh sách các công ty hoạt động (đã được duyệt)
 *     tags:
 *       - Companies
 */
router.get('/', optionalAuthenticateToken, getCompanies);

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Tạo công ty mới (HR gốc đăng ký công ty mới)
 *     tags:
 *       - Companies
 */
router.post('/', authenticateToken, createCompany);

/**
 * @swagger
 * /api/companies/join:
 *   post:
 *     summary: Gửi yêu cầu gia nhập một công ty sẵn có (HR phụ)
 *     tags:
 *       - Companies
 */
router.post('/join', authenticateToken, joinCompany);

/**
 * @swagger
 * /api/companies/my-company/join-requests:
 *   get:
 *     summary: Xem các yêu cầu xin gia nhập công ty (Dành cho HR gốc)
 *     tags:
 *       - Companies
 */
router.get('/my-company/join-requests', authenticateToken, getJoinRequests);

/**
 * @swagger
 * /api/companies/my-company/join-requests/{userId}/approve:
 *   post:
 *     summary: HR gốc phê duyệt yêu cầu gia nhập của HR phụ
 *     tags:
 *       - Companies
 */
router.post('/my-company/join-requests/:userId/approve', authenticateToken, approveJoinRequest);

/**
 * @swagger
 * /api/companies/my-company/join-requests/{userId}/reject:
 *   post:
 *     summary: HR gốc từ chối yêu cầu gia nhập của HR phụ
 *     tags:
 *       - Companies
 */
router.post('/my-company/join-requests/:userId/reject', authenticateToken, rejectJoinRequest);

/**
 * @swagger
 * /api/companies/my-company/leave:
 *   post:
 *     summary: HR phụ rời công ty hiện tại
 *     tags:
 *       - Companies
 */
router.post('/my-company/leave', authenticateToken, leaveCompany);

/**
 * @swagger
 * /api/companies/my-company:
 *   delete:
 *     summary: HR gốc xóa công ty của mình
 *     tags:
 *       - Companies
 */
router.delete('/my-company', authenticateToken, deleteCompany);

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết công ty theo ID
 *     tags:
 *       - Companies
 */
router.get('/:id', optionalAuthenticateToken, getCompanyDetail);

/**
 * @swagger
 * /api/companies/{id}/follow:
 *   post:
 *     summary: Toggle theo dõi / bỏ theo dõi công ty
 *     tags:
 *       - Companies
 */
router.post('/:id/follow', authenticateToken, toggleFollowCompany);

/**
 * @swagger
 * /api/companies/{id}/followers:
 *   get:
 *     summary: Lấy danh sách những ứng viên đang theo dõi công ty (HR/ADMIN)
 *     tags:
 *       - Companies
 */
router.get('/:id/followers', authenticateToken, getCompanyFollowers);

// ─── Company Member Management (Cách A & Cách B) ─────────────────────────────────
router.get('/my-company/members', authenticateToken, requireRole(['HR']), getCompanyMembers);
router.delete('/my-company/members/:userId', authenticateToken, requireRole(['HR']), removeCompanyMember);

// ─── Company Invitation Flow (Cách A) ───────────────────────────────────────────
router.post('/my-company/invitations', authenticateToken, requireRole(['HR']), inviteCompanyMember);
router.get('/my-company/invitations', authenticateToken, requireRole(['HR']), getCompanyInvitations);
router.delete('/my-company/invitations/:invitationId', authenticateToken, requireRole(['HR']), cancelCompanyInvitation);

export default router;
