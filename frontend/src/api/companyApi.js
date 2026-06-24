import { axiosClient } from "./axiosClient";

export const companyApi = {
  /**
   * Lấy chi tiết thông tin công ty theo ID
   * @param {number|string} id - ID của công ty
   */
  getCompanyById: (id) => {
    return axiosClient.get(`/companies/${id}`);
  }
};
