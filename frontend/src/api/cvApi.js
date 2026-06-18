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
  scoreCV: (cv_text, job_description) => {
    return axiosClient.post('/cv/score', { cv_text, job_description });
  },
  exportPdf: (aiResults) => {
    return axiosClient.post('/cv/export-pdf', aiResults, {
      responseType: 'blob'
    });
  },
  
  // --- CV Drag & Drop Builder API ---
  getProjects: () => axiosClient.get('/cv-projects'),
  getProjectById: (id) => axiosClient.get(`/cv-projects/${id}`),
  saveProject: (data) => {
    if (data.id && data.id.startsWith('new-')) {
      return axiosClient.post('/cv-projects', data);
    }
    return axiosClient.put(`/cv-projects/${data.id}`, data);
  },
  scoreCVBuilder: (cvData) => axiosClient.post('/cv/builder-score', { cvData }),
};
