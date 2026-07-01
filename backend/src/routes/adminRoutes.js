import express from 'express';
import { 
  getJobs, 
  updateJobApproval, 
  getBlogs, 
  reviewBlog, 
  deleteBlog,
  getAnalytics,
  getPermissionsMatrix,
  updatePermissionsMatrix,
  getAdminPackages,
  updatePackage
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Tất cả các tuyến đường dưới đây đều yêu cầu đăng nhập và có quyền ADMIN
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

router.get('/analytics', getAnalytics);

/**
 * Quản lý Ma trận Phân quyền (Role Permissions)
 */
router.get('/permissions', getPermissionsMatrix);
router.put('/permissions/:roleId', updatePermissionsMatrix);


/**
 * Quản lý tin tuyển dụng (Jobs)
 */
router.get('/jobs', getJobs);
router.patch('/jobs/:id/approval', updateJobApproval);

/**
 * Quản lý bài viết cộng đồng (Blogs)
 */
router.get('/blogs', getBlogs);
router.patch('/blogs/:id/review', reviewBlog);
router.delete('/blogs/:id', deleteBlog);

/**
 * Quản lý gói dịch vụ (Packages)
 */
router.get('/packages', getAdminPackages);
router.put('/packages/:id', updatePackage);

export default router;
