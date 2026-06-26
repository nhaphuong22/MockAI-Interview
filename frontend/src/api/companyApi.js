import { axiosClient } from "./axiosClient";

export const companyApi = {
  /**
   * Lấy chi tiết thông tin công ty theo ID
   * Trả về follower_count và is_following nếu đã đăng nhập
   * @param {number|string} id - ID của công ty
   */
  getCompanyById: (id) => {
    return axiosClient.get(`/companies/${id}`);
  },

  /**
   * Toggle theo dõi / bỏ theo dõi công ty
   * @param {number|string} id - ID của công ty
   */
  toggleFollow: (id) => {
    return axiosClient.post(`/companies/${id}/follow`);
  },

  /**
   * Lấy danh sách ứng viên theo dõi công ty (dành cho HR/Admin)
   * @param {number|string} id - ID của công ty
   */
  getCompanyFollowers: (id) => {
    return axiosClient.get(`/companies/${id}/followers`);
  }
};
