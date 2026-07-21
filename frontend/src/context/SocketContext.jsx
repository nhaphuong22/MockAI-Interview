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

    // Helper kiểm tra khớp blogId linh hoạt (hỗ trợ cả string "1", number 1, hoặc "BLOG-001")
    const helperMatchBlogId = (targetId, eventBlogId) => {
      if (targetId == null || eventBlogId == null) return false;
      const targetNum = targetId.toString().startsWith('BLOG-') ? parseInt(targetId.toString().replace('BLOG-', '')) : parseInt(targetId);
      const eventNum = eventBlogId.toString().startsWith('BLOG-') ? parseInt(eventBlogId.toString().replace('BLOG-', '')) : parseInt(eventBlogId);
      return targetNum === eventNum || targetId.toString() === eventBlogId.toString();
    };

    // --- CÁC SỰ KIỆN CỘNG ĐỒNG REAL-TIME (BLOGS / LIKES / COMMENTS) ---

    // 1. Lắng nghe bài viết mới xuất bản
    socketInstance.on("community_post_published", (blog) => {
      console.log("[Socket] Nhận sự kiện bài viết cộng đồng mới:", blog);
      queryClient.invalidateQueries({ queryKey: ["publishedBlogs"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["blogSidebar"], refetchType: "all" });
      showToast({
        message: `📢 Bài viết mới vừa xuất bản: "${blog.title}"`,
        type: "info"
      });
    });

    // 2. Lắng nghe cập nhật lượt thả cảm xúc (Likes/Reactions)
    socketInstance.on("community_post_reacted", ({ blogId, total_reactions, reaction_counts }) => {
      console.log("[Socket] Cập nhật lượt thả cảm xúc real-time:", blogId, total_reactions);
      
      queryClient.setQueriesData({ queryKey: ["publishedBlogs"] }, (old) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((post) => {
          if (helperMatchBlogId(post.id, blogId)) {
            return {
              ...post,
              total_reactions,
              reaction_counts: reaction_counts || post.reaction_counts
            };
          }
          return post;
        });
      });

      queryClient.setQueriesData({ queryKey: ["blog"] }, (old) => {
        if (!old || !old.id || !helperMatchBlogId(old.id, blogId)) return old;
        return {
          ...old,
          total_reactions,
          reaction_counts: reaction_counts || old.reaction_counts
        };
      });

      queryClient.invalidateQueries({ queryKey: ["publishedBlogs"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["blog"], refetchType: "all" });
    });

    // 3. Lắng nghe thêm bình luận mới
    socketInstance.on("community_comment_added", ({ blogId, comment, commentsCount }) => {
      console.log("[Socket] Nhận bình luận mới bài viết:", blogId, comment);

      // Cập nhật tất cả các query `blogComments` trong cache có blogId trùng khớp
      if (comment && comment.id) {
        const updateList = (oldQueryData) => {
          const list = Array.isArray(oldQueryData) ? oldQueryData : [];
          const exists = list.some((c) => Number(c.id) === Number(comment.id));
          if (exists) {
            return list.map((c) => (Number(c.id) === Number(comment.id) ? { ...c, ...comment } : c));
          }
          return [...list, comment];
        };

        queryClient.setQueriesData({ queryKey: ["blogComments", blogId] }, updateList);
        queryClient.setQueriesData({ queryKey: ["blogComments", Number(blogId)] }, updateList);
        queryClient.setQueriesData({ queryKey: ["blogComments", String(blogId)] }, updateList);
      }

      // Cập nhật số đếm comments trong danh sách bài viết `publishedBlogs`
      queryClient.setQueriesData({ queryKey: ["publishedBlogs"] }, (old) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((post) => {
          if (helperMatchBlogId(post.id, blogId)) {
            const newCount = commentsCount !== undefined ? commentsCount : (post.comments_count || post.comments || 0) + 1;
            return {
              ...post,
              comments_count: newCount,
              comments: newCount
            };
          }
          return post;
        });
      });

      queryClient.refetchQueries({ queryKey: ["blogComments"] });
      queryClient.refetchQueries({ queryKey: ["publishedBlogs"] });
    });

    // 4. Lắng nghe cập nhật bình luận
    socketInstance.on("community_comment_updated", ({ blogId, comment }) => {
      console.log("[Socket] Cập nhật bình luận bài viết:", blogId, comment);

      if (comment && comment.id) {
        const updateList = (oldQueryData) => {
          if (!oldQueryData || !Array.isArray(oldQueryData)) return oldQueryData;
          return oldQueryData.map((c) => (Number(c.id) === Number(comment.id) ? { ...c, ...comment } : c));
        };

        queryClient.setQueriesData({ queryKey: ["blogComments", blogId] }, updateList);
        queryClient.setQueriesData({ queryKey: ["blogComments", Number(blogId)] }, updateList);
        queryClient.setQueriesData({ queryKey: ["blogComments", String(blogId)] }, updateList);
      }

      queryClient.refetchQueries({ queryKey: ["blogComments"] });
    });

    // 5. Lắng nghe xóa bình luận
    socketInstance.on("community_comment_deleted", ({ blogId, commentId, commentsCount }) => {
      console.log("[Socket] Xóa bình luận bài viết:", blogId, commentId);

      const filterList = (oldQueryData) => {
        if (!oldQueryData || !Array.isArray(oldQueryData)) return oldQueryData;
        return oldQueryData.filter((c) => Number(c.id) !== Number(commentId));
      };

      queryClient.setQueriesData({ queryKey: ["blogComments", blogId] }, filterList);
      queryClient.setQueriesData({ queryKey: ["blogComments", Number(blogId)] }, filterList);
      queryClient.setQueriesData({ queryKey: ["blogComments", String(blogId)] }, filterList);

      queryClient.setQueriesData({ queryKey: ["publishedBlogs"] }, (old) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((post) => {
          if (helperMatchBlogId(post.id, blogId)) {
            const newCount = commentsCount !== undefined ? commentsCount : Math.max(0, (post.comments_count || post.comments || 0) - 1);
            return {
              ...post,
              comments_count: newCount,
              comments: newCount
            };
          }
          return post;
        });
      });

      queryClient.refetchQueries({ queryKey: ["blogComments"] });
      queryClient.refetchQueries({ queryKey: ["publishedBlogs"] });
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
