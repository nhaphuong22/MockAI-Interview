import { axiosClient } from "./axiosClient";

export const jobApi = {
  /**
   * Đăng tin tuyển dụng mới kèm các yêu cầu chi tiết
   * @param {object} data - Dữ liệu tin tuyển dụng và yêu cầu chi tiết
   */
  createJob: (data) => {
    return axiosClient.post("/jobs", data);
  },

  /**
   * Lấy danh sách tin tuyển dụng có lọc và phân trang
   * @param {object} params - Bộ lọc (status, experience_level, hr_id, search, page, limit)
   */
  getJobs: (params) => {
    return axiosClient.get("/jobs", { params });
  },

  /**
   * Lấy chi tiết tin tuyển dụng kèm yêu cầu chi tiết
   * @param {number|string} id - ID của Job
   */
  getJobById: (id) => {
    return axiosClient.get(`/jobs/${id}`);
  },

  /**
   * Cập nhật tin tuyển dụng và yêu cầu chi tiết
   * @param {number|string} id - ID của Job cần cập nhật
   * @param {object} data - Dữ liệu cập nhật
   */
  updateJob: (id, data) => {
    return axiosClient.put(`/jobs/${id}`, data);
  },

  /**
   * Xóa tin tuyển dụng
   * @param {number|string} id - ID của Job cần xóa
   */
  deleteJob: (id) => {
    return axiosClient.delete(`/jobs/${id}`);
  },

  /**
   * Lấy danh sách hồ sơ ứng tuyển của HR
   * @param {object} params - Bộ lọc (job_id, status)
   */
  getJobApplications: (params) => {
    return axiosClient.get("/jobs/applications", { params });
  },

  /**
   * Cập nhật trạng thái duyệt, nhãn và ghi chú của hồ sơ
   * @param {number|string} id - ID của hồ sơ ứng tuyển
   * @param {object} data - Dữ liệu (status, hr_tag, hr_notes)
   */
  updateJobApplication: (id, data) => {
    return axiosClient.put(`/jobs/applications/${id}`, data);
  }
};
