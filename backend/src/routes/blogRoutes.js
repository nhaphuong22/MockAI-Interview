import express from 'express';
import multer from 'multer';
import path from 'path';
import { createDraft, submitForReview, uploadCoverImage, getPublishedBlogs, getBlogById, getRelatedBlogs } from '../controllers/blogController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { cacheMiddleware } from '../middlewares/cacheMiddleware.js';

const router = express.Router();

// Cấu hình Multer để lưu ảnh vào thư mục 'uploads/'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cover-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

/**
 * @swagger
 * /api/blogs/upload-cover:
 *   post:
 *     summary: Tải lên ảnh bìa cho bài viết Blog
 *     description: Upload một file ảnh và trả về URL để sử dụng làm ảnh bìa.
 *     tags:
 *       - Community Blog
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cover_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Tải ảnh thành công.
 *       400:
 *         description: Thiếu file ảnh.
 */
router.post('/upload-cover', authenticateToken, upload.single('cover_image'), uploadCoverImage);

/**
 * @swagger
 * /api/blogs/draft:
 *   post:
 *     summary: Lưu bản nháp bài viết Blog
 *     description: API dành cho ứng viên lưu tạm bài viết nháp trước khi đăng.
 *     tags:
 *       - Community Blog
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Kinh nghiệm phỏng vấn React 2026"
 *               content:
 *                 type: string
 *                 example: "# Kinh nghiệm của tôi..."
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["react", "interview"]
 *               category_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Lưu nháp thành công.
 *       400:
 *         description: Lỗi thiếu tham số.
 *       401:
 *         description: Lỗi xác thực token.
 */
router.post('/draft', authenticateToken, createDraft);

/**
 * @swagger
 * /api/blogs/{id}/submit:
 *   put:
 *     summary: Gửi yêu cầu duyệt bài viết
 *     description: Đổi trạng thái bài viết từ bản nháp (draft) sang chờ duyệt (pending_review) để Admin kiểm duyệt.
 *     tags:
 *       - Community Blog
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của bài viết
 *     responses:
 *       200:
 *         description: Gửi yêu cầu duyệt thành công.
 *       404:
 *         description: Bài viết không tồn tại.
 *       401:
 *         description: Lỗi xác thực token.
 */
router.put('/:id/submit', authenticateToken, submitForReview);

/**
 * @swagger
 * /api/blogs/published:
 *   get:
 *     summary: Lấy danh sách bài viết đã duyệt
 *     description: Lấy danh sách bài viết có trạng thái PUBLISHED cho trang Cộng đồng.
 *     tags:
 *       - Community Blog
 *     responses:
 *       200:
 *         description: Trả về danh sách bài viết.
 */
router.get('/published', cacheMiddleware('blogs:published', 1800), getPublishedBlogs);

/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     summary: Lấy chi tiết bài viết Blog
 *     description: Lấy chi tiết bài viết dựa vào ID.
 *     tags:
 *       - Community Blog
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của bài viết
 *     responses:
 *       200:
 *         description: Lấy chi tiết bài viết thành công.
 *       404:
 *         description: Không tìm thấy bài viết.
 */
router.get('/:id', cacheMiddleware('blogs:detail', 1800), getBlogById);

/**
 * @swagger
 * /api/blogs/{id}/related:
 *   get:
 *     summary: Lấy danh sách bài viết liên quan
 *     description: Lấy danh sách bài viết liên quan dựa vào tags của bài viết hiện tại.
 *     tags:
 *       - Community Blog
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của bài viết
 *     responses:
 *       200:
 *         description: Lấy bài viết liên quan thành công.
 *       404:
 *         description: Không tìm thấy bài viết.
 */
router.get('/:id/related', getRelatedBlogs);

export default router;
