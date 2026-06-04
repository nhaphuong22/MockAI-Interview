import { sendResponse, sendError } from '../ultils/responseHelper.js';
import db from '../db/knex.js';

// Get current verification status for HR
export const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await db('users').where({ id: userId }).first();

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendResponse(res, 200, {
      status: user.company_verification_status || 'UNVERIFIED',
      companyName: user.company_name,
      documentUrl: user.company_document_url
    });
  } catch (error) {
    console.error('getVerificationStatus error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// HR uploads document
export const submitVerification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { companyName, documentUrl } = req.body;

    if (!companyName || !documentUrl) {
      return sendError(res, 400, 'Tên công ty và tài liệu chứng minh là bắt buộc');
    }

    await db('users').where({ id: userId }).update({
      company_name: companyName,
      company_document_url: documentUrl,
      company_verification_status: 'PENDING',
      updated_at: new Date()
    });

    return sendResponse(res, 200, { message: 'Đã nộp hồ sơ xác thực thành công' });
  } catch (error) {
    console.error('submitVerification error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// Admin gets all pending verifications
export const getPendingVerifications = async (req, res) => {
  try {
    const pendingUsers = await db('users')
      .where({ company_verification_status: 'PENDING' })
      .select('id', 'email', 'full_name', 'company_name', 'company_document_url', 'created_at');

    return sendResponse(res, 200, pendingUsers);
  } catch (error) {
    console.error('getPendingVerifications error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// Admin approves or rejects
export const reviewVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return sendError(res, 400, 'Trạng thái không hợp lệ');
    }

    const updatedUser = await db('users')
      .where({ id })
      .update({
        company_verification_status: status,
        updated_at: new Date()
      });

    if (!updatedUser) {
      return sendError(res, 404, 'Không tìm thấy hồ sơ');
    }

    return sendResponse(res, 200, { message: `Đã ${status === 'APPROVED' ? 'phê duyệt' : 'từ chối'} hồ sơ` });
  } catch (error) {
    console.error('reviewVerification error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};
