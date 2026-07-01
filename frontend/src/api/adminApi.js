import { axiosClient } from "./axiosClient";

/**
 * Lấy tất cả danh sách các tin tuyển dụng dành cho Admin kiểm duyệt
 */
export const getAllAdminJobs = () => {
  return axiosClient.get("/admin/jobs");
};

/**
 * Cập nhật trạng thái duyệt tin tuyển dụng (Phê duyệt/Từ chối)
 * @param {string|number} id - ID công việc (e.g. JOB-001 hoặc 1)
 * @param {string} status - Trạng thái mới ("Approved" hoặc "Rejected")
 */
export const updateJobApproval = (id, status) => {
  return axiosClient.patch(`/admin/jobs/${id}/approval`, { status });
};

/**
 * Lấy tất cả danh sách các bài viết cộng đồng dành cho Admin kiểm duyệt
 */
export const getAllAdminBlogs = () => {
  return axiosClient.get("/admin/blogs");
};

/**
 * Kiếm duyệt bài viết cộng đồng (Phê duyệt/Từ chối)
 * @param {string|number} id - ID bài viết (e.g. BLOG-001 hoặc 1)
 * @param {string} status - Trạng thái mới ("Published" hoặc "Rejected")
 * @param {string} [rejectReason] - Lý do từ chối nếu status là "Rejected"
 */
export const reviewBlog = (id, status, rejectReason) => {
  return axiosClient.patch(`/admin/blogs/${id}/review`, { 
    status, 
    reject_reason: rejectReason 
  });
};

/**
 * Gỡ hoàn toàn một bài viết cộng đồng khỏi hệ thống
 * @param {string|number} id - ID bài viết
 */
export const deleteBlog = (id) => {
  return axiosClient.delete(`/admin/blogs/${id}`);
};

/**
 * Lấy số liệu phân tích và tăng trưởng của toàn hệ thống
 */
export const getAdminAnalytics = () => {
  return axiosClient.get("/admin/analytics");
};

/**
 * Lấy ma trận phân quyền đầy đủ (roles × permissions)
 */
export const getPermissionsMatrix = () => {
  return axiosClient.get("/admin/permissions");
};

/**
 * Cập nhật danh sách quyền hạn cho một role
 * @param {number} roleId - ID của role cần cập nhật
 * @param {number[]} permissionIds - Danh sách permission IDs được gán
 */
export const updateRolePermissions = (roleId, permissionIds) => {
  return axiosClient.put(`/admin/permissions/${roleId}`, { permissionIds });
};

/**
 * Lấy toàn bộ danh sách gói dịch vụ (Bao gồm cả gói đã tắt)
 */
export const getAdminPackages = () => {
  return axiosClient.get("/admin/packages");
};

/**
 * Cập nhật cấu hình gói dịch vụ
 * @param {number} id - ID của package
 * @param {Object} data - Dữ liệu cần cập nhật
 */
export const updateAdminPackage = (id, data) => {
  return axiosClient.put(`/admin/packages/${id}`, data);
};
