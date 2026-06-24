import express from 'express';
import { getCompanyDetail } from '../controllers/companyController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết công ty theo ID
 *     description: Cho phép ứng viên hoặc HR xem hồ sơ chi tiết của công ty (view-only).
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
 *         description: ID của công ty cần lấy thông tin
 *     responses:
 *       200:
 *         description: Trả về thông tin chi tiết của công ty
 *       404:
 *         description: Không tìm thấy công ty
 *       500:
 *         description: Lỗi hệ thống
 */
router.get('/:id', authenticateToken, getCompanyDetail);

export default router;
