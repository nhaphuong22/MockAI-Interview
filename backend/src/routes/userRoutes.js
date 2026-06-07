import express from 'express';
import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  toggleUserStatus, 
  deleteUser 
} from '../controllers/userController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';
import { cacheMiddleware } from '../middlewares/cacheMiddleware.js';

const router = express.Router();

// Tất cả các tuyến đường quản lý User dưới đây đều yêu cầu đăng nhập & quyền ADMIN

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách người dùng kèm phân trang và bộ lọc (Admin)
 *     tags: [Users]
 */
router.get('/', requireAuth, requireAdmin, cacheMiddleware('users:list', 1800), getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Lấy chi tiết thông tin một người dùng (Admin)
 *     tags: [Users]
 */
router.get('/:id', requireAuth, requireAdmin, getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Tạo người dùng mới (Admin)
 *     tags: [Users]
 */
router.post('/', requireAuth, requireAdmin, createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Cập nhật thông tin chi tiết người dùng và phân vai trò (Admin)
 *     tags: [Users]
 */
router.put('/:id', requireAuth, requireAdmin, updateUser);

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Khóa / Kích hoạt lại tài khoản người dùng (Admin)
 *     tags: [Users]
 */
router.patch('/:id/status', requireAuth, requireAdmin, toggleUserStatus);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Xóa người dùng hoàn toàn khỏi hệ thống (Admin)
 *     tags: [Users]
 */
router.delete('/:id', requireAuth, requireAdmin, deleteUser);

export default router;
