import axiosClient from './axiosClient';

const submitReport = async (reportData) => {
  const url = '/reports';
  const response = await axiosClient.post(url, reportData);
  return response;
};

export const reportApi = {
  submitReport,
  getAdminReports: async (params) => {
    const response = await axiosClient.get("/reports", { params });
    return response;
  },

  updateReportStatus: async (id, status) => {
    const response = await axiosClient.patch(`/reports/${id}/status`, { status });
    return response;
  }
};
