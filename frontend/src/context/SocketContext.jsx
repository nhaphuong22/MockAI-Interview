import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../store/useAuthStore";
import { useUiStore } from "../store/useUiStore";
import { useQueryClient } from "@tanstack/react-query";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { isAuthenticated, user } = useAuthStore();
  const { showToast } = useUiStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    let active = true;

    // Khởi tạo kết nối Socket.io
    const wsUrl = import.meta.env.VITE_WS_URL || "http://localhost:5000";
    console.log("[Socket] Đang kết nối tới server:", wsUrl);

    const socketInstance = io(wsUrl, {
      auth: { token }
    });

    setTimeout(() => {
      if (active) {
        setSocket(socketInstance);
      }
    }, 0);

    socketInstance.on("connect", () => {
      console.log("[Socket] Đã kết nối thành công, ID:", socketInstance.id);
    });

    // Lắng nghe sự kiện thông báo in-app mới
    socketInstance.on("new_notification", (notification) => {
      console.log("[Socket] Nhận thông báo mới:", notification);
      
      // Hiển thị Toast thông báo đẩy
      showToast({
        message: notification.content || "Bạn có thông báo mới",
        type: "success"
      });

      // Làm mới danh sách thông báo trên giao diện
      queryClient.invalidateQueries(["notifications"]);
    });

    // Lắng nghe sự kiện ứng tuyển mới (chỉ dành cho HR ở Dashboard)
    socketInstance.on("new_application", (application) => {
      console.log("[Socket] Có ứng viên mới ứng tuyển:", application);
      
      // Hiển thị Toast thông báo nộp đơn mới cho HR
      showToast({
        message: `Hồ sơ mới: Ứng viên ${application.name} vừa nộp đơn vào vị trí "${application.position}"!`,
        type: "success"
      });

      // Làm mới danh sách ứng viên tuyển dụng trên Dashboard HR
      queryClient.invalidateQueries(["recruiter-applications"]);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("[Socket] Lỗi kết nối socket:", error.message);
    });

    socketInstance.on("disconnect", () => {
      console.log("[Socket] Đã ngắt kết nối socket");
    });

    return () => {
      active = false;
      if (socketInstance) {
        socketInstance.disconnect();
        setSocket(null);
      }
    };
  }, [isAuthenticated, user?.id, showToast, queryClient]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
