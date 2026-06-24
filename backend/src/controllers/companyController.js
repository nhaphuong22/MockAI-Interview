import { getCompanyById } from '../services/companyService.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';

/**
 * API lấy thông tin chi tiết của một công ty theo ID
 */
export const getCompanyDetail = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return sendError(res, 400, 'ID công ty không hợp lệ.');
    }

    const company = await getCompanyById(id);
    if (!company) {
      return sendError(res, 404, 'Không tìm thấy thông tin công ty.');
    }

    return sendResponse(res, 200, company);
  } catch (error) {
    console.error('Lỗi trong companyController.getCompanyDetail:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi lấy thông tin công ty.');
  }
};
