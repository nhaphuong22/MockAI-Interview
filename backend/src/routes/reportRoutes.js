import express from 'express';
import { submitReport } from '../controllers/reportController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Gửi báo cáo bài viết/việc làm
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - target_type
 *               - target_id
 *               - reason
 *             properties:
 *               target_type:
 *                 type: string
 *                 enum: [JOB, COMMUNITY_POST]
 *               target_id:
 *                 type: integer
 *               reason:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Gửi báo cáo thành công
 *       400:
 *         description: Lỗi dữ liệu hoặc đã báo cáo rồi
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, submitReport);

export default router;
