import axiosClient from './axiosClient';

const submitReport = async (reportData) => {
  const url = '/reports';
  const response = await axiosClient.post(url, reportData);
  return response;
};

export const reportApi = {
  submitReport,
  getGroupedReports: async (params) => {
    const response = await axiosClient.get("/reports/grouped", { params });
    return response;
  },

  getReportDetails: async (targetType, targetId) => {
    const response = await axiosClient.get(`/reports/${targetType}/${targetId}`);
    return response;
  },

  warnUser: async (targetType, targetId) => {
    const response = await axiosClient.post(`/reports/${targetType}/${targetId}/warn`);
    return response;
  },

  deleteContent: async (targetType, targetId) => {
    const response = await axiosClient.delete(`/reports/${targetType}/${targetId}/content`);
    return response;
  },

  rejectReports: async (targetType, targetId) => {
    const response = await axiosClient.post(`/reports/${targetType}/${targetId}/reject`);
    return response;
  },

  unhideContent: async (targetType, targetId) => {
    const response = await axiosClient.post(`/reports/${targetType}/${targetId}/unhide`);
    return response;
  }
};
