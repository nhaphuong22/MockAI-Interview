import { 
  fetchJobsForApproval, 
  approveOrRejectJob, 
  fetchBlogsForApproval, 
  approveOrRejectBlog, 
  removeBlogByAdmin, 
  generateDashboardAnalytics,
  fetchPermissionsMatrix,
  updateRolePermissionsMatrix
} from '../services/adminService.js';

/**
 * Lấy danh sách tất cả các tin tuyển dụng dành cho Admin kiểm duyệt
 */
export const getJobs = async (req, res) => {
  try {
    const formattedJobs = await fetchJobsForApproval();
    return res.status(200).json({
      success: true,
      data: formattedJobs
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách tin tuyển dụng kiểm duyệt:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi lấy danh sách tin tuyển dụng.' });
  }
};

/**
 * Cập nhật phê duyệt/từ chối/ẩn tin tuyển dụng
 */
export const updateJobApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const dbId = id.startsWith('JOB-') ? parseInt(id.replace('JOB-', '')) : parseInt(id);
    const { status } = req.body; // status is "Approved" or "Rejected"

    await approveOrRejectJob(dbId, status, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái tin tuyển dụng thành công.',
      status: status
    });
  } catch (error) {
    if (error.message === 'Không tìm thấy tin tuyển dụng.') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Lỗi khi kiểm duyệt tin tuyển dụng:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi kiểm duyệt tin tuyển dụng.' });
  }
};

/**
 * Lấy danh sách tất cả các bài viết cộng đồng dành cho Admin kiểm duyệt
 */
export const getBlogs = async (req, res) => {
  try {
    const formattedBlogs = await fetchBlogsForApproval();
    return res.status(200).json({
      success: true,
      data: formattedBlogs
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài viết kiểm duyệt:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi lấy danh sách bài viết.' });
  }
};

/**
 * Kiểm duyệt phê duyệt/từ chối bài viết cộng đồng
 */
export const reviewBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const dbId = id.startsWith('BLOG-') ? parseInt(id.replace('BLOG-', '')) : parseInt(id);
    const { status, reject_reason } = req.body; // status is "Published" or "Rejected"

    await approveOrRejectBlog(dbId, status, reject_reason, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Kiểm duyệt bài viết thành công.',
      status: status
    });
  } catch (error) {
    if (error.message === 'Không tìm thấy bài viết.') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Lỗi khi kiểm duyệt bài viết:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi kiểm duyệt bài viết.' });
  }
};

/**
 * Xóa/gỡ bài viết khỏi hệ thống
 */
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const dbId = id.startsWith('BLOG-') ? parseInt(id.replace('BLOG-', '')) : parseInt(id);

    await removeBlogByAdmin(dbId);

    return res.status(200).json({
      success: true,
      message: 'Gỡ bài viết khỏi hệ thống thành công.'
    });
  } catch (error) {
    if (error.message === 'Không tìm thấy bài viết để gỡ.') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Lỗi khi gỡ bài viết:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi gỡ bài viết.' });
  }
};

/**
 * Lấy số liệu phân tích và tăng trưởng của toàn hệ thống dành cho Admin Dashboard
 */
export const getAnalytics = async (req, res) => {
  try {
    const analyticsData = await generateDashboardAnalytics();
    return res.status(200).json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu phân tích hệ thống:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi lấy dữ liệu phân tích.' });
  }
};

/**
 * Lấy ma trận phân quyền toàn bộ hệ thống (roles × permissions)
 */
export const getPermissionsMatrix = async (req, res) => {
  try {
    const matrix = await fetchPermissionsMatrix();
    return res.status(200).json({
      success: true,
      data: matrix
    });
  } catch (error) {
    console.error('Lỗi khi lấy ma trận phân quyền:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi lấy ma trận phân quyền.' });
  }
};

/**
 * Cập nhật danh sách quyền hạn cho một role
 */
export const updatePermissionsMatrix = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissionIds } = req.body; // Array of permission IDs

    await updateRolePermissionsMatrix(parseInt(roleId), permissionIds);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật quyền hạn vai trò thành công.'
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ message: error.message });
    }
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Lỗi khi cập nhật quyền hạn vai trò:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi cập nhật quyền hạn.' });
  }
};
