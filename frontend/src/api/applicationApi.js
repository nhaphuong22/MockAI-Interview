import { axiosClient } from "./axiosClient";

export const applicationApi = {
  /**
   * Nộp đơn ứng tuyển cho một tin tuyển dụng
   * @param {number|string} jobId - ID của công việc
   * @param {object} data - Chứa cv_text và cover_letter
   */
  applyJob: (jobId, data) => {
    return axiosClient.post(`/applications/apply/${jobId}`, data);
  },

  /**
   * Lấy danh sách hồ sơ ứng tuyển của người dùng hiện tại (Candidate hoặc HR/Admin)
   */
  getApplications: () => {
    return axiosClient.get("/applications");
  },

  /**
   * Cập nhật trạng thái đơn ứng tuyển (Chỉ dành cho HR hoặc Admin)
   * @param {number|string} id - ID đơn ứng tuyển
   * @param {string} status - Trạng thái mới (reviewed, interviewed, accepted, rejected)
   */
  updateStatus: (id, status) => {
    return axiosClient.patch(`/applications/${id}/status`, { status });
  }
};
