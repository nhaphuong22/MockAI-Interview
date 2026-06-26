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
  rejectJoinRequest
} from '../controllers/companyController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

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

export default router;
