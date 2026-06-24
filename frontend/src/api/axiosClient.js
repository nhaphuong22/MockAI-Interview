import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

// Cấu hình Axios instance mặc định
export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor cho request (gắn token)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isSessionExpiredAlertShown = false;

// Interceptor cho response (xử lý lỗi chung)
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Xử lý lỗi 401 (Unauthorized) do JWT hết hạn hoặc không hợp lệ
    if (error.response && error.response.status === 401) {
      // Nếu đã báo lỗi rồi thì không báo nữa để tránh bị đúp 2 lần
      if (isSessionExpiredAlertShown) {
        return Promise.reject(error);
      }
      
      const token = localStorage.getItem("token");
      // Nếu không có token, có nghĩa là người dùng vừa bấm đăng xuất, 
      // API call nào đó chạy ngầm bị fail 401 thì bỏ qua luôn, không cảnh báo.
      if (!token) {
        return Promise.reject(error);
      }

      console.warn("Phiên đăng nhập đã hết hạn hoặc token không hợp lệ.");
      isSessionExpiredAlertShown = true;
      
      useAuthStore.getState().logout();
      alert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục sử dụng hệ thống!");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
