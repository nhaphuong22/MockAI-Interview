import { getCompanyById, toggleCompanyFollow, getCompanyFollowersProfiles } from '../services/companyService.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';
import db from '../db/knex.js';

/**
 * API lấy thông tin chi tiết của một công ty theo ID
 * Trả về thêm follower_count và is_following cho người dùng hiện tại
 */
export const getCompanyDetail = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return sendError(res, 400, 'ID công ty không hợp lệ.');
    }

    // Truyền userId để kiểm tra trạng thái follow (có thể null nếu chưa đăng nhập)
    const requestingUserId = req.user?.id || null;

    const company = await getCompanyById(id, requestingUserId);
    if (!company) {
      return sendError(res, 404, 'Không tìm thấy thông tin công ty.');
    }

    return sendResponse(res, 200, company);
  } catch (error) {
    console.error('Lỗi trong companyController.getCompanyDetail:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi lấy thông tin công ty.');
  }
};

/**
 * API Toggle Follow / Unfollow một công ty
 * Chỉ ứng viên (USER) mới có quyền follow
 */
export const toggleFollowCompany = async (req, res) => {
  try {
    const companyId = parseInt(req.params.id);
    if (isNaN(companyId)) {
      return sendError(res, 400, 'ID công ty không hợp lệ.');
    }

    // Chỉ ứng viên mới được follow
    const userRole = req.user?.role?.toUpperCase();
    if (userRole === 'HR' || userRole === 'ADMIN') {
      return sendError(res, 403, 'Chỉ ứng viên mới có thể theo dõi công ty.');
    }

    const userId = req.user.id;
    const result = await toggleCompanyFollow(companyId, userId);

    return sendResponse(res, 200, {
      ...result,
      message: result.is_following ? 'Đã theo dõi công ty thành công!' : 'Đã bỏ theo dõi công ty.',
    });
  } catch (error) {
    console.error('Lỗi trong companyController.toggleFollowCompany:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi cập nhật trạng thái theo dõi.');
  }
};

/**
 * API lấy danh sách những ứng viên đang theo dõi công ty
 * Yêu cầu quyền HR và HR phải thuộc công ty này (được kiểm tra thêm)
 */
export const getCompanyFollowers = async (req, res) => {
  try {
    const companyId = parseInt(req.params.id);
    if (isNaN(companyId)) {
      return sendError(res, 400, 'ID công ty không hợp lệ.');
    }

    // Kiểm tra quyền: Chỉ cho phép HR hoặc ADMIN xem danh sách
    const userRole = req.user?.role?.toUpperCase();
    if (userRole !== 'HR' && userRole !== 'ADMIN') {
      return sendError(res, 403, 'Bạn không có quyền xem danh sách này.');
    }

    // (Tùy chọn) Kiểm tra HR này có thuộc companyId đang request không
    if (userRole === 'HR') {
      const hrUser = await db('users').where({ id: req.user.id }).first();
      if (hrUser && hrUser.company_id !== companyId) {
        return sendError(res, 403, 'Bạn chỉ có quyền xem danh sách theo dõi của công ty mình.');
      }
    }

    const followers = await getCompanyFollowersProfiles(companyId);

    return sendResponse(res, 200, followers);
  } catch (error) {
    console.error('Lỗi trong companyController.getCompanyFollowers:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi lấy danh sách theo dõi.');
  }
};
