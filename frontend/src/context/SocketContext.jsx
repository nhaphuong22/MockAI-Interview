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
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
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

      // Nếu là thông báo cập nhật đơn, làm mới danh sách đơn ứng tuyển để giao diện cập nhật ngay lập tức
      if (notification.type === 'application') {
        queryClient.invalidateQueries(["candidate-applications"]);
        queryClient.invalidateQueries(["manage-applications"]);
      }
    });

    // Lắng nghe sự kiện cập nhật skill tree real-time
    socketInstance.on("skill_tree_update", (updatedTree) => {
      console.log("[Socket] Nhận cập nhật skill tree mới:", updatedTree);
      
      showToast({
        message: "Sơ đồ cây kỹ năng của bạn đã được cập nhật!",
        type: "success"
      });

      // Cập nhật trực tiếp cache query cho "skillTree"
      queryClient.setQueryData(["skillTree"], (oldData) => {
        if (!oldData) return updatedTree;
        return {
          ...oldData,
          graph_data: updatedTree.graph_data,
          last_updated: updatedTree.last_updated
        };
      });
    });

    let disconnectToastShown = false;

    socketInstance.on("connect_error", (error) => {
      console.error("[Socket] Lỗi kết nối socket:", error.message);
      if (!disconnectToastShown) {
        showToast({
          message: "Không thể kết nối máy chủ thời gian thực. Đang tự động kết nối lại...",
          type: "warning"
        });
        disconnectToastShown = true;
      }
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("[Socket] Đã ngắt kết nối socket. Lý do:", reason);
      if (!disconnectToastShown && reason !== "io client disconnect") {
        showToast({
          message: "Mất kết nối thời gian thực. Đang tự động kết nối lại...",
          type: "warning"
        });
        disconnectToastShown = true;
      }
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log("[Socket] Đã kết nối lại thành công sau", attemptNumber, "lần thử.");
      showToast({
        message: "Đã khôi phục kết nối thời gian thực thành công!",
        type: "success"
      });
      disconnectToastShown = false;
    });

    socketInstance.on("reconnect_error", (error) => {
      console.error("[Socket] Lỗi kết nối lại socket:", error.message);
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
