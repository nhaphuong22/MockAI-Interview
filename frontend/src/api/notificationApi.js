import { axiosClient } from "./axiosClient";

export const notificationApi = {
  /**
   * Lấy danh sách thông báo của người dùng
   */
  getNotifications: () => {
    return axiosClient.get("/notifications");
  },

  /**
   * Đánh dấu một thông báo cụ thể là đã đọc
   * @param {number|string} id - ID thông báo
   */
  markAsRead: (id) => {
    return axiosClient.patch(`/notifications/${id}/read`);
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  markAllRead: () => {
    return axiosClient.post("/notifications/read-all");
  }
};
