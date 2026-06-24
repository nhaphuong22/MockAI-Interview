import { sendResponse, sendError } from '../ultils/responseHelper.js';
import db from '../db/knex.js';

// Get current verification status for HR
export const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await db('users')
      .leftJoin('companies', 'users.company_id', 'companies.id')
      .where({ 'users.id': userId })
      .select('users.*', 'companies.verification_status', 'companies.name as company_name', 'companies.document_url')
      .first();

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendResponse(res, 200, {
      status: user.verification_status || 'UNVERIFIED',
      companyName: user.company_name,
      documentUrl: user.document_url
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

    const user = await db('users').where({ id: userId }).first();

    if (user.company_id) {
      await db('companies').where({ id: user.company_id }).update({
        name: companyName,
        document_url: documentUrl,
        verification_status: 'PENDING',
        updated_at: new Date()
      });
    } else {
      const [newCompany] = await db('companies').insert({
        name: companyName,
        document_url: documentUrl,
        verification_status: 'PENDING',
        created_at: new Date(),
        updated_at: new Date()
      }).returning('id');
      const newId = newCompany.id || newCompany;
      await db('users').where({ id: userId }).update({ company_id: newId });
    }

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
      .join('companies', 'users.company_id', 'companies.id')
      .where({ 'companies.verification_status': 'PENDING' })
      .select('users.id', 'users.email', 'users.full_name', 'companies.name as company_name', 'companies.document_url as company_document_url', 'companies.created_at');

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

    const user = await db('users').where({ id }).first();
    if (!user || !user.company_id) {
      return sendError(res, 404, 'Không tìm thấy hồ sơ');
    }

    await db('companies')
      .where({ id: user.company_id })
      .update({
        verification_status: status,
        updated_at: new Date()
      });

    return sendResponse(res, 200, { message: `Đã ${status === 'APPROVED' ? 'phê duyệt' : 'từ chối'} hồ sơ` });
  } catch (error) {
    console.error('reviewVerification error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};
