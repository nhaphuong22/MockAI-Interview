import { createJob } from '../services/jobService.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';

/**
 * Đăng tin tuyển dụng mới kèm theo các yêu cầu chi tiết
 */
export const createNewJob = async (req, res) => {
  try {
    const { title, description, requirements, status, detailed_requirements } = req.body;
    const hrId = req.user.id;

    // 1. Kiểm tra validation cơ bản cho job title
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return sendError(res, 400, 'Tiêu đề tin tuyển dụng (title) là bắt buộc và không được để trống.');
    }

    // 2. Kiểm tra validation cho status nếu có
    const VALID_STATUSES = ['OPEN', 'CLOSED'];
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return sendError(res, 400, 'Trạng thái (status) không hợp lệ. Chỉ chấp nhận: OPEN hoặc CLOSED.');
    }

    // 3. Kiểm tra validation cho detailed_requirements nếu có
    if (detailed_requirements !== undefined) {
      if (!Array.isArray(detailed_requirements)) {
        return sendError(res, 400, 'Yêu cầu chi tiết (detailed_requirements) phải là một mảng.');
      }

      for (let i = 0; i < detailed_requirements.length; i++) {
        const reqItem = detailed_requirements[i];
        if (!reqItem.requirement_text || typeof reqItem.requirement_text !== 'string' || reqItem.requirement_text.trim() === '') {
          return sendError(res, 400, `Yêu cầu chi tiết tại vị trí ${i} thiếu nội dung (requirement_text) hợp lệ.`);
        }
        if (reqItem.is_mandatory !== undefined && typeof reqItem.is_mandatory !== 'boolean') {
          return sendError(res, 400, `Trường bắt buộc (is_mandatory) tại vị trí ${i} phải là kiểu boolean.`);
        }
      }
    }

    // 4. Gọi service tạo job
    const result = await createJob({
      hrId,
      title: title.trim(),
      description,
      requirements,
      status,
      detailedRequirements: detailed_requirements || []
    });

    return sendResponse(res, 201, result);
  } catch (error) {
    console.error('Lỗi trong jobController.createNewJob:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi đăng tin tuyển dụng.');
  }
};
