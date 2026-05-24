import { axiosClient } from './axiosClient';

export const blogApi = {
  createDraft: (data) => {
    return axiosClient.post('/blogs/draft', data);
  },
  submitForReview: (id) => {
    return axiosClient.put(`/blogs/${id}/submit`);
  },
  uploadCoverImage: (file) => {
    const formData = new FormData();
    formData.append('cover_image', file);
    return axiosClient.post('/blogs/upload-cover', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};
