import { axiosClient } from "./axiosClient";

export const applicationApi = {
  /**
   * Lấy danh sách hồ sơ ứng tuyển của HR
   * @param {object} params - Bộ lọc (job_id, status)
   */
  getApplications: (params) => {
    return axiosClient.get("/jobs/applications", { params });
  },

  /**
   * Cập nhật trạng thái duyệt/nhãn/ghi chú của hồ sơ ứng tuyển
   * @param {number|string} id - ID của hồ sơ ứng tuyển
   * @param {object} data - Dữ liệu cập nhật (status, hr_tag, hr_notes)
   */
  updateApplication: (id, data) => {
    return axiosClient.put(`/jobs/applications/${id}`, data);
  }
};
