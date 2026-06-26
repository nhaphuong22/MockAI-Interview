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
  },


  /**
   * Lấy danh sách việc làm đã lưu
   * @param {object} params - Bộ lọc (VD: returnIdsOnly=true)
   */
  getSavedJobs: (params) => {
    return axiosClient.get("/jobs/saved-jobs", { params });
  },

  /**
   * Thêm/Bỏ lưu việc làm
   */
  toggleSavedJob: (jobId) => {
    return axiosClient.post(`/jobs/${jobId}/save`);
  },

  /**
   * Cập nhật ghi chú việc làm đã lưu
   */
  updateSavedJobNote: (jobId, note) => {
    return axiosClient.put(`/jobs/${jobId}/save/note`, { note });
  },
  /**
   * Tổng hợp báo cáo chiến dịch Boss AI
   * @param {number|string} jobId - ID của Job
   */
  getJobCampaignReport: (jobId) => {
    return axiosClient.get(`/jobs/${jobId}/campaign-report`);
  },

  /**
   * Xuất danh sách ứng viên đạt yêu cầu ra file Excel
   * @param {number[]} jobIds - Danh sách job IDs cần xuất (rỗng = tất cả)
   */
  exportApplications: async ({ jobIds = [] } = {}) => {
    const params = new URLSearchParams();
    if (jobIds.length > 0) {
      params.set("jobIds", jobIds.join(","));
    }
    params.set("format", "excel");

    const token = localStorage.getItem("token");
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    
    // Import axios dynamically or we can just use fetch to avoid interceptor issues and keep headers
    const response = await fetch(`${baseURL}/applications/export?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Lỗi xuất file Excel");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    // Extract filename from headers
    const disposition = response.headers.get("content-disposition") || "";
    const filenameMatch = disposition.match(/filename="?([^";\n]+)"?/);
    link.download = filenameMatch
      ? decodeURIComponent(filenameMatch[1])
      : `MockAI_Shortlist_${new Date().toLocaleDateString("vi-VN").replace(/\//g, "-")}.zip`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Lưu ghi chú nội bộ của HR cho một đơn ứng tuyển
   * @param {number} applicationId - ID đơn ứng tuyển
   * @param {string} note - Nội dung ghi chú
   */
  saveApplicationNote: ({ applicationId, note }) => {
    return axiosClient.patch(`/applications/${applicationId}/note`, { note });
  },
};

