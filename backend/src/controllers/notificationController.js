import db from '../db/knex.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';

/**
 * Lấy danh sách thông báo của người dùng hiện tại
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const list = await db('notifications')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');

    const formatted = list.map(item => {
      // Xác định class CSS hoặc icon thích hợp dựa trên type (dành cho frontend)
      let color = 'text-blue-600 bg-blue-50';
      if (item.type === 'APPLICATION_UPDATE') color = 'text-green-600 bg-green-50';
      else if (item.type === 'SYSTEM_NOTICE') color = 'text-yellow-600 bg-yellow-50';
      else if (item.type === 'INTERVIEW_INVITE') color = 'text-purple-600 bg-purple-50';

      return {
        id: item.id,
        type: item.type === 'APPLICATION_UPDATE' ? 'application' : item.type.toLowerCase(),
        title: item.title,
        content: item.content,
        link: item.link,
        time: item.created_at,
        isRead: !!item.is_read,
        color
      };
    });

    return sendResponse(res, 200, formatted);
  } catch (error) {
    console.error('Lỗi trong getNotifications controller:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi lấy danh sách thông báo.');
  }
};

/**
 * Đánh dấu một thông báo là đã đọc
 */
export const markAsRead = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(id)) {
      return sendError(res, 400, 'ID thông báo không hợp lệ.');
    }

    const affected = await db('notifications')
      .where({ id, user_id: userId })
      .update({
        is_read: true,
        read_at: new Date(),
        updated_at: new Date()
      });

    if (!affected) {
      return sendError(res, 404, 'Không tìm thấy thông báo hoặc bạn không phải người sở hữu.');
    }

    return sendResponse(res, 200, { id }, 'Đã đánh dấu đã đọc thông báo.');
  } catch (error) {
    console.error('Lỗi trong markAsRead controller:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi cập nhật trạng thái thông báo.');
  }
};

/**
 * Đánh dấu tất cả thông báo của người dùng là đã đọc
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await db('notifications')
      .where({ user_id: userId, is_read: false })
      .update({
        is_read: true,
        read_at: new Date(),
        updated_at: new Date()
      });

    return sendResponse(res, 200, null, 'Đã đánh dấu đã đọc tất cả thông báo.');
  } catch (error) {
    console.error('Lỗi trong markAllAsRead controller:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi cập nhật tất cả thông báo.');
  }
};
