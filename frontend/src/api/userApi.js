import { axiosClient } from "./axiosClient";

/**
 * Lấy danh sách người dùng kèm phân trang, tìm kiếm và bộ lọc
 * @param {Object} params - { page, limit, search, role, status }
 */
export const getAllUsers = (params) => {
  return axiosClient.get("/api/users", { params });
};

/**
 * Lấy thông tin chi tiết một người dùng cụ thể
 * @param {number|string} id - ID người dùng
 */
export const getUserById = (id) => {
  return axiosClient.get(`/api/users/${id}`);
};

/**
 * Admin tạo mới tài khoản người dùng
 * @param {Object} data - { email, password, full_name, role, phone, address }
 */
export const createUser = (data) => {
  return axiosClient.post("/api/users", data);
};

/**
 * Admin cập nhật thông tin và vai trò của người dùng
 * @param {number|string} id - ID người dùng
 * @param {Object} data - { name, phone, bio, address, dateOfBirth, role }
 */
export const updateUser = (id, data) => {
  return axiosClient.put(`/api/users/${id}`, data);
};

/**
 * Khóa hoặc kích hoạt lại tài khoản người dùng
 * @param {number|string} id - ID người dùng
 */
export const toggleUserStatus = (id) => {
  return axiosClient.patch(`/api/users/${id}/status`);
};

/**
 * Xóa tài khoản người dùng khỏi hệ thống
 * @param {number|string} id - ID người dùng
 */
export const deleteUser = (id) => {
  return axiosClient.delete(`/api/users/${id}`);
};
