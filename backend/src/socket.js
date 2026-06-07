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
      return next(new Error('Authentication error: Token is required'));
    }

    try {
      const decoded = verifyToken(token);
      socket.user = decoded; // Gắn thông tin người dùng đã giải mã vào socket
      next();
    } catch (err) {
      console.error('Socket authentication failed:', err.message);
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    const userRole = socket.user.role || 'USER';

    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    console.log(`[Socket] Người dùng connected: ${userId} (Vai trò: ${userRole}) - Socket ID: ${socket.id}`);

    // Cho phép người dùng join vào room của riêng họ hoặc room theo vai trò
    socket.join(`user_${userId}`);
    if (userRole.toUpperCase() === 'HR') {
      socket.join('hr_room');
    }

    socket.on('disconnect', () => {
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
      console.log(`[Socket] Người dùng disconnected: ${userId} - Socket ID: ${socket.id}`);
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
