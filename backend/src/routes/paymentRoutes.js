import express from 'express';
import { createPaymentUrl, handleVnpayIpn, getPackages } from '../controllers/paymentController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/payments/packages:
 *   get:
 *     summary: Lấy danh sách gói thanh toán theo vai trò người dùng
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách gói cước
 */
router.get('/packages', authenticateToken, getPackages);

/**
 * @swagger
 * /api/payments/create-vnpay-url:
 *   post:
 *     summary: Tạo liên kết thanh toán VNPAY Sandbox
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - packageId
 *             properties:
 *               packageId:
 *                 type: integer
 *                 description: ID của gói dịch vụ muốn mua
 *     responses:
 *       200:
 *         description: Trả về URL thanh toán VNPAY thành công
 */
router.post('/create-vnpay-url', authenticateToken, createPaymentUrl);

/**
 * @swagger
 * /api/payments/vnpay-ipn:
 *   get:
 *     summary: API IPN nhận callback ngầm từ VNPAY
 *     tags: [Payments]
 */
router.get('/vnpay-ipn', handleVnpayIpn);

export default router;
