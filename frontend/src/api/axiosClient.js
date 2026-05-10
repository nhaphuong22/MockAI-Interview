import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

// Tạo instance của axios với config cơ bản
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor cho Request: Tự động đính kèm Token trước khi gửi
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy token trực tiếp từ Zustand store
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response: Xử lý lỗi trả về (VD: Token hết hạn)
axiosClient.interceptors.response.use(
  (response) => {
    // Có thể tùy chỉnh bóc tách data ở đây nếu API luôn trả về { success, data, error }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ -> Xóa state và đẩy về trang chủ
      useAuthStore.getState().logout();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
