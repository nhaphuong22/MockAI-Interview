import knex from '../db/knex.js';

/**
 * Lấy danh sách các cuộc hội thoại của một người dùng
 * Kèm theo thông tin người chat cùng và tin nhắn cuối cùng
 */
export const getUserConversations = async (userId) => {
  // Lấy danh sách ID cuộc hội thoại mà user tham gia
  const conversations = await knex('conversations')
    .where('participant_one', userId)
    .orWhere('participant_two', userId)
    .orderBy('last_message_at', 'desc');

  // Lấy chi tiết thông tin người còn lại và tin nhắn cuối
  const result = await Promise.all(
    conversations.map(async (conv) => {
      const otherUserId = conv.participant_one === userId ? conv.participant_two : conv.participant_one;
      
      const otherUser = await knex('users')
        .where('id', otherUserId)
        .select('id', 'full_name', 'email', 'avatar_url', 'role')
        .first();

      const lastMessage = await knex('messages')
        .where('conversation_id', conv.id)
        .orderBy('created_at', 'desc')
        .first();

      // Đếm số tin nhắn chưa đọc
      const unreadCountObj = await knex('messages')
        .where('conversation_id', conv.id)
        .andWhere('sender_id', otherUserId)
        .andWhere('is_read', false)
        .count('* as count')
        .first();

      return {
        ...conv,
        other_user: otherUser,
        last_message: lastMessage || null,
        unread_count: parseInt(unreadCountObj.count, 10)
      };
    })
  );

  return result;
};

/**
 * Lấy danh sách tin nhắn của một cuộc hội thoại
 */
export const getConversationMessages = async (conversationId, userId, limit = 50, offset = 0) => {
  // Kiểm tra quyền (user phải thuộc cuộc hội thoại)
  const conv = await knex('conversations').where('id', conversationId).first();
  if (!conv || (conv.participant_one !== userId && conv.participant_two !== userId)) {
    throw new Error('Bạn không có quyền xem cuộc hội thoại này');
  }

  const messages = await knex('messages')
    .where('conversation_id', conversationId)
    .orderBy('created_at', 'asc')
    .limit(limit)
    .offset(offset);

  return messages;
};

/**
 * Đánh dấu đã đọc tất cả tin nhắn trong một cuộc hội thoại
 */
export const markMessagesAsRead = async (conversationId, userId) => {
  await knex('messages')
    .where('conversation_id', conversationId)
    .andWhereNot('sender_id', userId)
    .andWhere('is_read', false)
    .update({
      is_read: true,
      read_at: new Date()
    });
};

/**
 * Tạo mới tin nhắn và lưu vào database
 */
export const saveMessage = async (conversationId, senderId, content, type = 'TEXT') => {
  // 1. Lưu tin nhắn
  const [messageId] = await knex('messages').insert({
    conversation_id: conversationId,
    sender_id: senderId,
    content,
    type,
    created_at: new Date()
  }).returning('id');

  const id = typeof messageId === 'object' ? messageId.id : messageId;

  const savedMessage = await knex('messages').where('id', id).first();

  // 2. Cập nhật thời gian last_message_at của cuộc hội thoại
  await knex('conversations')
    .where('id', conversationId)
    .update({ last_message_at: new Date() });

  return savedMessage;
};

/**
 * Lấy hoặc tạo cuộc hội thoại mới giữa 2 người
 */
export const getOrCreateConversation = async (userId1, userId2, applicationId = null) => {
  const p1 = Math.min(userId1, userId2);
  const p2 = Math.max(userId1, userId2);

  let conv = await knex('conversations')
    .where('participant_one', p1)
    .andWhere('participant_two', p2)
    .first();

  if (!conv) {
    const [insertId] = await knex('conversations').insert({
      participant_one: p1,
      participant_two: p2,
      application_id: applicationId,
      last_message_at: new Date()
    }).returning('id');
    
    const id = typeof insertId === 'object' ? insertId.id : insertId;
    conv = await knex('conversations').where('id', id).first();
  }

  return conv;
};
