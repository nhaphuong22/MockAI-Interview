import { sendSuccess, sendError } from '../ultils/responseHelper.js';
import * as chatService from '../services/chatService.js';
import { getIo } from '../config/socket.js';

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await chatService.getUserConversations(userId);
    return sendSuccess(res, conversations, 'Lấy danh sách hội thoại thành công');
  } catch (error) {
    console.error('Lỗi getConversations:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi lấy cuộc hội thoại');
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const messages = await chatService.getConversationMessages(id, userId);
    return sendSuccess(res, messages, 'Lấy tin nhắn thành công');
  } catch (error) {
    console.error('Lỗi getMessages:', error);
    return sendError(res, 403, error.message);
  }
};

export const getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { receiverId, applicationId } = req.body;
    
    if (!receiverId) {
      return sendError(res, 400, 'Thiếu thông tin người nhận');
    }

    const conv = await chatService.getOrCreateConversation(userId, receiverId, applicationId);
    return sendSuccess(res, conv, 'Tạo hoặc lấy hội thoại thành công');
  } catch (error) {
    console.error('Lỗi getOrCreateConversation:', error);
    return sendError(res, 500, 'Lỗi hệ thống');
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const userId = req.user.id;
    const { content, type, receiverId } = req.body;

    if (!content) {
      return sendError(res, 400, 'Nội dung tin nhắn không được để trống');
    }

    const message = await chatService.saveMessage(conversationId, userId, content, type);

    // Bắn sự kiện socket đến người nhận và người gửi (nếu có các tab khác)
    const io = getIo();
    io.to(`user_${receiverId}`).emit('new_message', message);
    io.to(`user_${userId}`).emit('new_message', message); // Hỗ trợ sync nhiều tab của cùng 1 user

    return sendSuccess(res, message, 'Gửi tin nhắn thành công');
  } catch (error) {
    console.error('Lỗi sendMessage:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi gửi tin nhắn');
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const userId = req.user.id;
    
    await chatService.markMessagesAsRead(conversationId, userId);
    
    // Tùy chọn: Bắn socket báo cho đầu bên kia biết tin nhắn đã được đọc
    // const io = getIo();
    // io.to(`conversation_${conversationId}`).emit('messages_read', { conversationId, readBy: userId });

    return sendSuccess(res, null, 'Đã đánh dấu đọc tin nhắn');
  } catch (error) {
    console.error('Lỗi markAsRead:', error);
    return sendError(res, 500, 'Lỗi hệ thống');
  }
};
