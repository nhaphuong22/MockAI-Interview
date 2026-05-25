import axios from "axios";

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

// Interceptor cho response (xử lý lỗi chung)
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // TODO: Xử lý các lỗi global như 401, 403, 500
    return Promise.reject(error);
  }
);
