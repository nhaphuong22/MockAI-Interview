import { sendResponse, sendError } from '../ultils/responseHelper.js';
import db from '../db/knex.js';

// Get current verification status for HR
export const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await db('users').where({ id: userId }).first();
    const hrProfile = await db('hr_profiles').where({ user_id: userId }).first() || {};

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
      joinStatus: hrProfile.company_join_status,
      isCreator: company.creator_id === userId,
      verificationStatus: company.verification_status,
      rejectReason: company.reject_reason,
      taxCode: company.tax_code,
      documentUrl: company.document_url,
      hasUploadedDocs: !!hrProfile.id_front_url // Check if user has uploaded docs
    });
  } catch (error) {
    console.error('getVerificationStatus error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};



// Admin gets all verifications (PENDING, APPROVED, SUSPENDED)
export const getAllVerifications = async (req, res) => {
  try {
    const allCompanies = await db('companies')
      .leftJoin('users', 'companies.creator_id', 'users.id')
      .leftJoin('hr_profiles', 'users.id', 'hr_profiles.user_id')
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
        'companies.verification_status',
        'companies.created_at',
        'hr_profiles.auth_letter_url',
        'hr_profiles.id_front_url',
        'hr_profiles.id_back_url',
        'companies.business_type as company_business_type',
        'users.id as hr_id',
        'users.email as hr_email',
        'users.full_name as hr_name'
      );

    return sendResponse(res, 200, allCompanies);
  } catch (error) {
    console.error('getAllVerifications error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

import { scanIdCard } from '../services/fptAiService.js';
import { sendCompanyRejectionEmail, sendCompanyApprovalEmail } from '../services/emailService.js';

export const scanIdCardController = async (req, res) => {
  try {
    const { id } = req.params; // companyId
    const company = await db('companies')
      .leftJoin('users', 'companies.creator_id', 'users.id')
      .where({ 'companies.id': id })
      .select('users.id_front_url')
      .first();
      
    if (!company) {
      return sendError(res, 404, 'Không tìm thấy hồ sơ công ty');
    }

    if (!company.id_front_url) {
      return sendError(res, 400, 'Công ty này không tải lên CCCD mặt trước');
    }

    const data = await scanIdCard(company.id_front_url);
    return sendResponse(res, 200, data);
  } catch (error) {
    console.error('scanIdCardController error:', error);
    return sendError(res, 500, 'Lỗi khi gọi API eKYC');
  }
};

// Admin approves or rejects
export const reviewVerification = async (req, res) => {
  try {
    const { id } = req.params; // companyId
    const { status, reject_reason } = req.body; // 'APPROVED' or 'SUSPENDED'

    if (!['APPROVED', 'SUSPENDED', 'REJECTED'].includes(status)) {
      return sendError(res, 400, 'Trạng thái không hợp lệ');
    }

    const company = await db('companies')
      .leftJoin('users', 'companies.creator_id', 'users.id')
      .select('companies.*', 'users.email as hr_email')
      .where('companies.id', id)
      .first();

    if (!company) {
      return sendError(res, 404, 'Không tìm thấy hồ sơ công ty');
    }

    const updates = {
      verification_status: status === 'REJECTED' ? 'SUSPENDED' : status,
      updated_at: new Date()
    };

    if (status === 'SUSPENDED' || status === 'REJECTED') {
      updates.reject_reason = reject_reason || '';
    }

    await db('companies')
      .where({ id })
      .update(updates);

    // Khi Admin Phê duyệt hoặc Từ chối/Đình chỉ, lên lịch xóa tài liệu định danh nhạy cảm của người đại diện (HR gốc) sau 30 ngày
    if (company.creator_id) {
      await db('users')
        .where({ id: company.creator_id })
        .update({
          scheduled_delete_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updated_at: new Date()
        });
    }

    if (company.hr_email) {
      if ((status === 'SUSPENDED' || status === 'REJECTED') && reject_reason) {
        await sendCompanyRejectionEmail(company.hr_email, company.name, reject_reason).catch(e => console.error(e));
      } else if (status === 'APPROVED') {
        await sendCompanyApprovalEmail(company.hr_email, company.name).catch(e => console.error(e));
      }
    }

    return sendResponse(res, 200, { message: `Đã ${status === 'APPROVED' ? 'phê duyệt' : 'từ chối'} hồ sơ công ty thành công` });
  } catch (error) {
    console.error('reviewVerification error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};
