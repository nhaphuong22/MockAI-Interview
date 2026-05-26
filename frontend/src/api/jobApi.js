import { axiosClient } from "./axiosClient";

export const jobApi = {
  /**
   * Đăng tin tuyển dụng mới kèm các yêu cầu chi tiết
   * @param {object} data - Dữ liệu tin tuyển dụng và yêu cầu chi tiết
   * @returns {Promise<{success: boolean, data: object}>}
   */
  createJob: (data) => {
    return axiosClient.post("/jobs", data);
  }
};
