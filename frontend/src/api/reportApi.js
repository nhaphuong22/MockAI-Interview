import axiosClient from './axiosClient';

const submitReport = async (reportData) => {
  const url = '/reports';
  return axiosClient.post(url, reportData);
};

export const reportApi = {
  submitReport
};
