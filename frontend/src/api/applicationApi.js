import { axiosClient } from "./axiosClient";

export const applicationApi = {
  /**
   * Lấy danh sách đơn ứng tuyển (HR xem toàn bộ, candidate xem của mình)
   */
  getApplications: (params = {}) => {
    return axiosClient.get("/jobs/applications", { params });
  },

  /**
   * Cập nhật thông tin đơn ứng tuyển (status, hr_tag, hr_notes)
   */
  updateApplication: (id, data) => {
    return axiosClient.put(`/jobs/applications/${id}`, data);
  },

  /**
   * Duyệt kết quả ứng viên (HIRED hoặc REJECTED) và gửi email thông báo tự động
   * @param {number} id - application ID
   * @param {object} data - { status: 'HIRED' | 'REJECTED', customMessage?: string }
   */
  reviewApplication: (id, data) => {
    return axiosClient.put(`/applications/${id}/review`, data);
  },
};

export default applicationApi;
