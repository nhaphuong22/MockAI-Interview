import express from 'express';
import { 
  createPaymentUrl, handleVnpayIpn, getPackages, 
  getAllPackagesForAdmin, togglePackageStatus, getTransactionsForAdmin, updatePackagePrice,
  getCouponsForAdmin, createCoupon, toggleCouponStatus, deleteCoupon, validateCoupon
} from '../controllers/paymentController.js';
import { authenticateToken, requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// ADMIN-ONLY ROUTES (requireAuth + requireAdmin = 403 for non-admin)
// ─────────────────────────────────────────────────────────────
// Packages
router.get('/admin/packages', requireAuth, requireAdmin, getAllPackagesForAdmin);
router.patch('/admin/packages/:id/toggle-status', requireAuth, requireAdmin, togglePackageStatus);
router.patch('/admin/packages/:id/price', requireAuth, requireAdmin, updatePackagePrice);
// Transactions
router.get('/admin/transactions', requireAuth, requireAdmin, getTransactionsForAdmin);
// Coupons
router.get('/admin/coupons', requireAuth, requireAdmin, getCouponsForAdmin);
router.post('/admin/coupons', requireAuth, requireAdmin, createCoupon);
router.patch('/admin/coupons/:id/toggle-status', requireAuth, requireAdmin, toggleCouponStatus);
router.delete('/admin/coupons/:id', requireAuth, requireAdmin, deleteCoupon);


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
 * /api/payments/validate-coupon:
 *   post:
 *     summary: Kiểm tra mã giảm giá
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
 *               - code
 *             properties:
 *               packageId:
 *                 type: integer
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trả về thông tin số tiền được giảm
 */
router.post('/validate-coupon', authenticateToken, validateCoupon);

/**
 * @swagger
 * /api/payments/vnpay-ipn:
 *   get:
 *     summary: API IPN nhận callback ngầm từ VNPAY
 *     tags: [Payments]
 */
router.get('/vnpay-ipn', handleVnpayIpn);

export default router;
