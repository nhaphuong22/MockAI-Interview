import express from 'express';
import { getCompanyDetail, toggleFollowCompany, getCompanyFollowers } from '../controllers/companyController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết công ty theo ID
 *     description: Cho phép xem hồ sơ công ty. Trả về is_following nếu đã đăng nhập.
 *     tags:
 *       - Companies
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Trả về thông tin chi tiết của công ty
 *       404:
 *         description: Không tìm thấy công ty
 */
router.get('/:id', optionalAuthenticateToken, getCompanyDetail);

/**
 * @swagger
 * /api/companies/{id}/follow:
 *   post:
 *     summary: Toggle theo dõi / bỏ theo dõi công ty
 *     description: Ứng viên nhấn để theo dõi hoặc bỏ theo dõi công ty.
 *     tags:
 *       - Companies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Trạng thái theo dõi đã được cập nhật
 *       403:
 *         description: HR/Admin không có quyền follow
 */
router.post('/:id/follow', authenticateToken, toggleFollowCompany);

/**
 * @swagger
 * /api/companies/{id}/followers:
 *   get:
 *     summary: Lấy danh sách những ứng viên đang theo dõi công ty (HR/ADMIN)
 */
router.get('/:id/followers', authenticateToken, getCompanyFollowers);

export default router;
