import { axiosClient } from './axiosClient';

export const cvApi = {
  uploadCV: (file) => {
    const formData = new FormData();
    formData.append('cv_file', file);
    return axiosClient.post('/cv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  scoreCV: (cv_text, job_title, job_description, fileUrl) => {
    return axiosClient.post('/cv/score', { cv_text, job_title, job_description, fileUrl });
  },
  exportPdf: (aiResults) => {
    return axiosClient.post('/cv/export-pdf', aiResults, {
      responseType: 'blob'
    });
  }
};
