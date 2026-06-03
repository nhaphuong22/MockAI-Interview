import { Server } from 'socket.io';
import { verifyToken } from '../auth/jwt.js';

let io;

export const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Middleware xác thực JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (!token) {
      console.warn("⚠️ Socket Bypass Auth: Không có token, sử dụng Mock User ID=1 (HR)");
      socket.user = { id: 1, role: 'HR' };
      return next();
    }

    try {
      const decoded = verifyToken(token);
      socket.user = decoded;
      next();
    } catch (error) {
      console.error('Socket JWT Verification Error:', error.message);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`🔌 Người dùng đã kết nối: ${userId} (Socket ID: ${socket.id})`);

    // 1. Tham gia phòng cá nhân để nhận thông báo trực tiếp
    socket.join(`user_${userId}`);

    // 2. Tham gia phòng của một cuộc hội thoại cụ thể
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${userId} tham gia conversation_${conversationId}`);
    });

    // 3. Rời khỏi phòng hội thoại
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`User ${userId} rời conversation_${conversationId}`);
    });

    // 4. Sự kiện đang gõ phím
    socket.on('typing', ({ conversationId, receiverId }) => {
      // Bắn sự kiện tới người nhận
      socket.to(`user_${receiverId}`).emit('user_typing', { conversationId, senderId: userId });
    });

    socket.on('stop_typing', ({ conversationId, receiverId }) => {
      socket.to(`user_${receiverId}`).emit('user_stop_typing', { conversationId, senderId: userId });
    });

    // Sự kiện ngắt kết nối
    socket.on('disconnect', () => {
      console.log(`🔌 Người dùng ngắt kết nối: ${userId}`);
    });
  });

  return io;
};

// Hàm tiện ích để lấy instance của io từ các controller/service khác
export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io chưa được khởi tạo!');
  }
  return io;
};
