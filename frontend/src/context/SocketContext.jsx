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
    const token = localStorage.getItem("token");

    let active = true;

    // Khởi tạo kết nối Socket.io (Hỗ trợ cả guest lẫn authenticated users)
    const wsUrl = import.meta.env.VITE_WS_URL || "http://localhost:5000";
    console.log("[Socket] Đang kết nối tới server:", wsUrl);

    const socketInstance = io(wsUrl, {
      auth: { token: token || "" },
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

    // Lắng nghe sự kiện có tin tuyển dụng mới
    socketInstance.on("new_job_posted", (job) => {
      console.log("[Socket] Nhận sự kiện tin tuyển dụng mới:", job);
      
      showToast({
        message: `💼 ${job.company_name || 'Một công ty'} vừa đăng tuyển vị trí mới: "${job.title}"!`,
        type: "success"
      });

      // Tự động làm mới danh sách việc làm của ứng viên
      queryClient.invalidateQueries({ queryKey: ["candidate-jobs-list"] });
    });

    // --- CÁC SỰ KIỆN CỘNG ĐỒNG REAL-TIME (BLOGS / LIKES / COMMENTS) ---

    // 1. Lắng nghe bài viết mới xuất bản
    socketInstance.on("community_post_published", (blog) => {
      console.log("[Socket] Nhận sự kiện bài viết cộng đồng mới:", blog);
      queryClient.invalidateQueries({ queryKey: ["publishedBlogs"] });
      queryClient.invalidateQueries({ queryKey: ["blogSidebar"] });
      showToast({
        message: `📢 Bài viết mới vừa xuất bản: "${blog.title}"`,
        type: "info"
      });
    });

    // 2. Lắng nghe cập nhật lượt thả cảm xúc (Likes/Reactions)
    socketInstance.on("community_post_reacted", ({ blogId, total_reactions, reaction_counts }) => {
      console.log("[Socket] Cập nhật lượt thả cảm xúc real-time:", blogId, total_reactions);
      
      queryClient.setQueryData(["publishedBlogs"], (old) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((post) => {
          if (post.id === blogId) {
            return {
              ...post,
              total_reactions,
              reaction_counts: reaction_counts || post.reaction_counts
            };
          }
          return post;
        });
      });

      queryClient.invalidateQueries({ queryKey: ["publishedBlogs"] });
    });

    // 3. Lắng nghe thêm bình luận mới
    socketInstance.on("community_comment_added", ({ blogId, comment, commentsCount }) => {
      console.log("[Socket] Nhận bình luận mới bài viết:", blogId);

      queryClient.invalidateQueries({ queryKey: ["blogComments", blogId] });

      queryClient.setQueryData(["publishedBlogs"], (old) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((post) => {
          if (post.id === blogId) {
            return {
              ...post,
              comments_count: commentsCount !== undefined ? commentsCount : (post.comments_count || 0) + 1
            };
          }
          return post;
        });
      });

      queryClient.invalidateQueries({ queryKey: ["publishedBlogs"] });
    });

    // 4. Lắng nghe cập nhật bình luận
    socketInstance.on("community_comment_updated", ({ blogId }) => {
      console.log("[Socket] Cập nhật bình luận bài viết:", blogId);
      queryClient.invalidateQueries({ queryKey: ["blogComments", blogId] });
    });

    // 5. Lắng nghe xóa bình luận
    socketInstance.on("community_comment_deleted", ({ blogId, commentsCount }) => {
      console.log("[Socket] Xóa bình luận bài viết:", blogId);

      queryClient.invalidateQueries({ queryKey: ["blogComments", blogId] });

      queryClient.setQueryData(["publishedBlogs"], (old) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((post) => {
          if (post.id === blogId) {
            return {
              ...post,
              comments_count: commentsCount !== undefined ? commentsCount : Math.max(0, (post.comments_count || 0) - 1)
            };
          }
          return post;
        });
      });

      queryClient.invalidateQueries({ queryKey: ["publishedBlogs"] });
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
  }, [isAuthenticated, user?.id, user?.role, showToast, queryClient]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
