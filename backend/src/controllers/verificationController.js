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

    if (!user.company_id) {
      return sendResponse(res, 200, {
        company: null,
        joinStatus: null,
        isCreator: false,
        verificationStatus: 'UNVERIFIED',
        taxCode: null,
        documentUrl: null
      });
    }

    const company = await db('companies').where({ id: user.company_id }).first();
    if (!company) {
      return sendResponse(res, 200, {
        company: null,
        joinStatus: null,
        isCreator: false,
        verificationStatus: 'UNVERIFIED',
        taxCode: null,
        documentUrl: null
      });
    }

    return sendResponse(res, 200, {
      company: {
        id: company.id,
        name: company.name,
        logoUrl: company.logo_url,
        website: company.website,
        address: company.address,
        city: company.city,
        industry: company.industry,
        companySize: company.company_size,
        description: company.description
      },
      joinStatus: user.company_join_status,
      isCreator: company.creator_id === userId,
      verificationStatus: company.verification_status,
      taxCode: company.tax_code,
      documentUrl: company.document_url
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
    const { companyName, taxCode, documentUrl } = req.body;

    if (!companyName || !taxCode || !documentUrl) {
      return sendError(res, 400, 'Tên công ty, Mã số thuế và tài liệu chứng minh là bắt buộc.');
    }

    const user = await db('users').where({ id: userId }).first();

    if (user.company_id) {
      const company = await db('companies').where({ id: user.company_id }).first();
      if (!company) {
        return sendError(res, 404, 'Không tìm thấy thông tin công ty liên kết.');
      }

      // Kiểm tra quyền: Chỉ creator mới được submit xác minh
      if (company.creator_id !== userId) {
        return sendError(res, 403, 'Chỉ HR quản lý (chủ sở hữu) mới có quyền gửi xác minh công ty.');
      }

      await db('companies').where({ id: user.company_id }).update({
        name: companyName,
        tax_code: taxCode,
        document_url: documentUrl,
        verification_status: 'PENDING',
        updated_at: new Date()
      });
    } else {
      // Tạo công ty mới
      const [newCompany] = await db('companies').insert({
        name: companyName,
        tax_code: taxCode,
        document_url: documentUrl,
        verification_status: 'PENDING',
        creator_id: userId,
        created_at: new Date(),
        updated_at: new Date()
      }).returning('id');
      const newId = newCompany.id || newCompany;
      await db('users').where({ id: userId }).update({ 
        company_id: newId,
        company_join_status: 'APPROVED',
        updated_at: new Date()
      });
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
    const pendingCompanies = await db('companies')
      .leftJoin('users', 'companies.creator_id', 'users.id')
      .where({ 'companies.verification_status': 'PENDING' })
      .select(
        'companies.id as company_id',
        'companies.name as company_name',
        'companies.tax_code as company_tax_code',
        'companies.document_url as company_document_url',
        'companies.website as company_website',
        'companies.city as company_city',
        'companies.address as company_address',
        'companies.industry as company_industry',
        'companies.company_size as company_size',
        'companies.created_at',
        'users.id as hr_id',
        'users.email as hr_email',
        'users.full_name as hr_name'
      );

    return sendResponse(res, 200, pendingCompanies);
  } catch (error) {
    console.error('getPendingVerifications error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// Admin approves or rejects
export const reviewVerification = async (req, res) => {
  try {
    const { id } = req.params; // companyId
    const { status } = req.body; // 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return sendError(res, 400, 'Trạng thái không hợp lệ');
    }

    const company = await db('companies').where({ id }).first();
    if (!company) {
      return sendError(res, 404, 'Không tìm thấy hồ sơ công ty');
    }

    await db('companies')
      .where({ id })
      .update({
        verification_status: status,
        updated_at: new Date()
      });

    return sendResponse(res, 200, { message: `Đã ${status === 'APPROVED' ? 'phê duyệt' : 'từ chối'} hồ sơ công ty thành công` });
  } catch (error) {
    console.error('reviewVerification error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};
