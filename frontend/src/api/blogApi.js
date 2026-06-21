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
  },
  getPublishedBlogs: () => {
    return axiosClient.get('/blogs/published');
  },
  getBlogById: (id) => {
    return axiosClient.get(`/blogs/${id}`);
  },
  toggleLikeBlog: (id) => {
    return axiosClient.post(`/blogs/${id}/like`);
  },
  createComment: (id, content) => {
    return axiosClient.post(`/blogs/${id}/comments`, { content });
  },
  getComments: (id) => {
    return axiosClient.get(`/blogs/${id}/comments`);
  }
};
