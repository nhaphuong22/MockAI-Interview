import express from 'express';
import { getStatus } from '../controllers/systemController.js';

const router = express.Router();

/**
 * @swagger
 * /api/status:
 *   get:
 *     summary: Lấy thông tin trạng thái hoạt động của hệ thống (Health Check)
 *     description: Trả về trạng thái của server và các thông tin liên quan khác.
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Hệ thống hoạt động bình thường.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: System is up and running!
 */
router.get('/status', getStatus);

export default router;
