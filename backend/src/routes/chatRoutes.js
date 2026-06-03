import express from 'express';
import * as chatController from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Tất cả các route chat đều cần đăng nhập
router.use(authenticateToken);

// Lấy danh sách hội thoại của user hiện tại
router.get('/conversations', chatController.getConversations);

// Tạo hoặc lấy hội thoại với một user khác
router.post('/conversations', chatController.getOrCreateConversation);

// Lấy lịch sử tin nhắn trong 1 hội thoại
router.get('/conversations/:id/messages', chatController.getMessages);

// Gửi tin nhắn mới (Dùng API HTTP thay vì Emit Socket trực tiếp để lưu CSDL tin cậy hơn)
router.post('/conversations/:id/messages', chatController.sendMessage);

// Đánh dấu đã đọc
router.put('/conversations/:id/read', chatController.markAsRead);

export default router;
