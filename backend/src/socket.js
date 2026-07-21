import { Server } from 'socket.io';
import { verifyToken } from './auth/jwt.js';

let io = null;
const userSockets = new Map(); // userId -> Set of socketIds

/**
 * Khởi tạo Socket.io Server liên kết với server HTTP
 * @param {object} server - HTTP Server instance
 */
export const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Cho phép truy cập từ mọi nguồn trong môi trường dev
      methods: ['GET', 'POST']
    }
  });

  // Middleware xác thực socket connection bằng JWT Token
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      // Cho phép guest connection để nhận các sự kiện công khai (Cộng đồng)
      socket.user = { id: null, role: 'GUEST' };
      return next();
    }

    try {
      const decoded = verifyToken(token);
      socket.user = decoded; // Gắn thông tin người dùng đã giải mã vào socket
      next();
    } catch (err) {
      console.error('Socket authentication fallback to guest:', err.message);
      socket.user = { id: null, role: 'GUEST' };
      return next();
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user?.id || null;
    const userRole = socket.user?.role || 'GUEST';

    if (userId) {
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);
      socket.join(`user_${userId}`);
    }

    console.log(`[Socket] Người dùng connected: ${userId || 'GUEST'} (Vai trò: ${userRole}) - Socket ID: ${socket.id}`);

    if (userRole.toUpperCase() === 'HR') {
      socket.join('hr_room');
    }

    socket.on('disconnect', () => {
      if (userId) {
        const sockets = userSockets.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            userSockets.delete(userId);
          }
        }
      }
      console.log(`[Socket] Người dùng disconnected: ${userId || 'GUEST'} - Socket ID: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Lấy đối tượng io hiện tại
 */
export const getIo = () => io;

/**
 * Gửi thông báo real-time tới một người dùng cụ thể
 * @param {number} userId - ID của người nhận
 * @param {object} notification - Dữ liệu thông báo
 */
export const sendRealtimeNotification = (userId, notification) => {
  if (!io) return;
  console.log(`[Socket] Gửi thông báo real-time tới user_${userId}:`, notification.title);
  io.to(`user_${userId}`).emit('new_notification', notification);
};

/**
 * Gửi thông báo sự kiện ứng tuyển mới tới toàn bộ HR trong phòng hr_room
 * @param {object} application - Dữ liệu đơn ứng tuyển mới
 */
export const broadcastNewApplication = (application) => {
  if (!io) return;
  console.log(`[Socket] Broadcast ứng tuyển mới tới toàn bộ HR:`, application.name || application.candidate_name);
  io.to('hr_room').emit('new_application', application);
};

/**
 * Phát tin tuyển dụng mới tới toàn bộ người dùng đang kết nối
 * @param {object} job - Dữ liệu tin tuyển dụng mới
 */
export const broadcastNewJob = (job) => {
  if (!io) return;
  console.log(`[Socket] Broadcast tin tuyển dụng mới:`, job.title);
  io.emit('new_job_posted', job);
};

/**
 * Phát sóng bài viết mới được xuất bản tới tất cả người dùng
 * @param {object} blog - Dữ liệu bài viết mới xuất bản
 */
export const broadcastBlogPublished = (blog) => {
  if (!io) return;
  console.log('[Socket] Broadcast bài viết xuất bản mới:', blog.title || blog.id);
  io.emit('community_post_published', blog);
};

/**
 * Phát sóng sự kiện thả/thay đổi biểu cảm bài viết tới tất cả người dùng
 * @param {object} data - { blogId, total_reactions, reaction_counts }
 */
export const broadcastBlogReacted = (data) => {
  if (!io) return;
  console.log('[Socket] Broadcast phản hồi biểu cảm bài viết:', data.blogId);
  io.emit('community_post_reacted', data);
};

/**
 * Phát sóng khi có bình luận mới
 * @param {object} data - { blogId, comment, commentsCount }
 */
export const broadcastBlogCommentAdded = (data) => {
  if (!io) return;
  console.log('[Socket] Broadcast bình luận mới bài viết:', data.blogId);
  io.emit('community_comment_added', data);
};

/**
 * Phát sóng khi cập nhật bình luận
 * @param {object} data - { blogId, comment }
 */
export const broadcastBlogCommentUpdated = (data) => {
  if (!io) return;
  console.log('[Socket] Broadcast cập nhật bình luận bài viết:', data.blogId);
  io.emit('community_comment_updated', data);
};

/**
 * Phát sóng khi xóa bình luận
 * @param {object} data - { blogId, commentId, commentsCount }
 */
export const broadcastBlogCommentDeleted = (data) => {
  if (!io) return;
  console.log('[Socket] Broadcast xóa bình luận bài viết:', data.blogId);
  io.emit('community_comment_deleted', data);
};


