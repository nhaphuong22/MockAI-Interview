import { getCompanyById, toggleCompanyFollow, getCompanyFollowersProfiles } from '../services/companyService.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';
import db from '../db/knex.js';
import cloudinary from '../core/cloudinary.js';
import fs from 'fs';
import { deleteCachePattern } from '../config/redis.js';

/**
 * API lấy danh sách các công ty đã được phê duyệt hoạt động
 * Cho phép tìm kiếm theo tên
 */
export const getCompanies = async (req, res) => {
  try {
    const search = req.query.search || '';
    const query = db('companies').where({ verification_status: 'APPROVED' });
    
    if (search) {
      query.where('name', 'ilike', `%${search}%`);
    }
    
    const list = await query.select('id', 'name', 'tax_code', 'logo_url', 'website', 'address', 'city', 'industry', 'company_size');
    return sendResponse(res, 200, list);
  } catch (error) {
    console.error('Lỗi trong companyController.getCompanies:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi lấy danh sách công ty.');
  }
};

/**
 * API tạo công ty mới (HR gốc đăng ký công ty mới)
 */
export const createCompany = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      name, taxCode, website, logoUrl, description, 
      companySize, industry, city, address, businessType,
      idCardNumber, urls
    } = req.body;

    if (!name || !taxCode) {
      return sendError(res, 400, 'Tên công ty và Mã số thuế là bắt buộc.');
    }

    // Kiểm tra xem MST đã tồn tại chưa
    const existingCompany = await db('companies').where({ tax_code: taxCode }).first();
    if (existingCompany) {
      return sendError(res, 400, `Mã số thuế ${taxCode} đã được đăng ký bởi công ty khác.`);
    }

    // Tạo công ty mới
    const [newCompany] = await db('companies').insert({
      name,
      tax_code: taxCode,
      business_type: businessType || 'ENTERPRISE',
      website: website || null,
      logo_url: logoUrl || null,
      description: description || null,
      company_size: companySize || null,
      industry: industry || null,
      city: city || null,
      address: address || null,
      document_url: urls?.licenseFileUrl || null,
      verification_status: 'PENDING', // Đang chờ Admin duyệt
      creator_id: userId,
      created_at: new Date(),
      updated_at: new Date()
    }).returning('*');

    const newCompanyId = newCompany.id || newCompany;

    // Cập nhật thông tin user: liên kết với công ty này và set join status là APPROVED (vì là chủ/creator), cập nhật giấy tờ
    await db('users').where({ id: userId }).update({
      company_id: newCompanyId,
      company_join_status: 'APPROVED',
      id_card_number: idCardNumber || null,
      id_front_url: urls?.idFrontUrl || null,
      id_back_url: urls?.idBackUrl || null,
      auth_letter_url: urls?.authFileUrl || null,
      updated_at: new Date()
    });

    return sendResponse(res, 201, {
      message: 'Tạo công ty thành công. Hồ sơ đang được chờ Admin kiểm duyệt.',
      company: newCompany
    });
  } catch (error) {
    console.error('Lỗi trong companyController.createCompany:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi tạo công ty.');
  }
};

/**
 * API HR phụ yêu cầu gia nhập một công ty sẵn có
 */
export const joinCompany = async (req, res) => {
  try {
    const userId = req.user.id;
    const { companyId, idCardNumber, urls } = req.body;

    if (!companyId) {
      return sendError(res, 400, 'ID công ty là bắt buộc.');
    }

    const company = await db('companies').where({ id: companyId }).first();
    if (!company) {
      return sendError(res, 404, 'Không tìm thấy công ty yêu cầu.');
    }

    if (company.verification_status !== 'APPROVED') {
      return sendError(res, 400, 'Công ty này chưa được phê duyệt hoạt động trên hệ thống.');
    }

    // Kiểm tra xem user hiện tại đã có công ty APPROVED hay chưa
    const user = await db('users').where({ id: userId }).first();
    if (user.company_id && user.company_join_status === 'APPROVED') {
      return sendError(res, 400, 'Bạn đã liên kết với một công ty khác. Vui lòng rời công ty cũ trước.');
    }

    // Cập nhật yêu cầu gia nhập, cập nhật trạng thái PENDING cho HR Gốc duyệt, cập nhật giấy tờ
    await db('users').where({ id: userId }).update({
      company_id: companyId,
      company_join_status: 'PENDING',
      id_card_number: idCardNumber || null,
      id_front_url: urls?.idFrontUrl || null,
      id_back_url: urls?.idBackUrl || null,
      auth_letter_url: urls?.authFileUrl || null,
      updated_at: new Date()
    });

    return sendResponse(res, 200, {
      message: `Gửi yêu cầu gia nhập công ty ${company.name} thành công. Vui lòng chờ phê duyệt.`
    });
  } catch (error) {
    console.error('Lỗi trong companyController.joinCompany:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi gửi yêu cầu gia nhập.');
  }
};

/**
 * API lấy danh sách các HR phụ đang xin gia nhập công ty của HR gốc
 */
export const getJoinRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Lấy công ty do HR này làm creator
    const myCompany = await db('companies').where({ creator_id: userId }).first();
    if (!myCompany) {
      return sendError(res, 403, 'Bạn không phải là HR gốc (chủ sở hữu) của bất kỳ công ty nào.');
    }

    const requests = await db('users')
      .where({ company_id: myCompany.id, company_join_status: 'PENDING' })
      .select('id', 'email', 'full_name', 'phone', 'created_at', 'id_front_url', 'id_back_url', 'auth_letter_url');

    return sendResponse(res, 200, requests);
  } catch (error) {
    console.error('Lỗi trong companyController.getJoinRequests:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi lấy danh sách yêu cầu.');
  }
};

/**
 * API HR gốc phê duyệt HR phụ
 */
export const approveJoinRequest = async (req, res) => {
  try {
    const creatorId = req.user.id;
    const { userId } = req.params;

    // Lấy công ty của HR gốc
    const myCompany = await db('companies').where({ creator_id: creatorId }).first();
    if (!myCompany) {
      return sendError(res, 403, 'Bạn không có quyền thực hiện hành động này.');
    }

    // Kiểm tra xem user phụ đó có đúng là đang xin gia nhập công ty này hay không
    const userToApprove = await db('users')
      .where({ id: userId, company_id: myCompany.id, company_join_status: 'PENDING' })
      .first();

    if (!userToApprove) {
      return sendError(res, 404, 'Không tìm thấy yêu cầu gia nhập tương ứng.');
    }

    // Phê duyệt
    await db('users').where({ id: userId }).update({
      company_join_status: 'APPROVED',
      updated_at: new Date()
    });

    return sendResponse(res, 200, { message: 'Đã phê duyệt thành viên thành công.' });
  } catch (error) {
    console.error('Lỗi trong companyController.approveJoinRequest:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi phê duyệt thành viên.');
  }
};

/**
 * API HR gốc từ chối HR phụ gia nhập
 */
export const rejectJoinRequest = async (req, res) => {
  try {
    const creatorId = req.user.id;
    const { userId } = req.params;

    // Lấy công ty của HR gốc
    const myCompany = await db('companies').where({ creator_id: creatorId }).first();
    if (!myCompany) {
      return sendError(res, 403, 'Bạn không có quyền thực hiện hành động này.');
    }

    // Kiểm tra xem user phụ đó có đúng là đang xin gia nhập công ty này hay không
    const userToReject = await db('users')
      .where({ id: userId, company_id: myCompany.id, company_join_status: 'PENDING' })
      .first();

    if (!userToReject) {
      return sendError(res, 404, 'Không tìm thấy yêu cầu gia nhập tương ứng.');
    }

    // Từ chối (xét join status thành REJECTED và reset company_id = null)
    await db('users').where({ id: userId }).update({
      company_id: null,
      company_join_status: 'REJECTED',
      updated_at: new Date()
    });

    return sendResponse(res, 200, { message: 'Đã từ chối yêu cầu gia nhập.' });
  } catch (error) {
    console.error('Lỗi trong companyController.rejectJoinRequest:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi từ chối yêu cầu.');
  }
};

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

// ─── Verification Docs Upload ──────────────────────────────────────────────────

export const uploadVerificationDocsController = async (req, res) => {
  try {
    const files = req.files;

    // Helper to upload a single file to Cloudinary and delete local temp file
    const uploadToCloudinary = async (fileArray, folder) => {
      if (fileArray && fileArray.length > 0) {
        const file = fileArray[0];
        try {
          const result = await cloudinary.uploader.upload(file.path, { folder });
          return result.secure_url;
        } finally {
          await fs.promises.unlink(file.path).catch(e => console.error(e));
        }
      }
      return null;
    };

    const urls = {};

    if (files?.authFile) {
      urls.authFileUrl = await uploadToCloudinary(files.authFile, 'company_docs/auth_letters');
    }
    if (files?.idFrontFile) {
      urls.idFrontUrl = await uploadToCloudinary(files.idFrontFile, 'company_docs/id_cards');
    }
    if (files?.idBackFile) {
      urls.idBackUrl = await uploadToCloudinary(files.idBackFile, 'company_docs/id_cards');
    }
    if (files?.licenseFile) {
      urls.licenseFileUrl = await uploadToCloudinary(files.licenseFile, 'company_docs/licenses');
    }

    return sendResponse(res, 200, {
      message: 'Tải lên tài liệu thành công.',
      urls
    });
  } catch (error) {
    console.error('Lỗi tải lên tài liệu xác minh:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi tải lên tài liệu.');
  }
};

/**
 * API HR phụ rời khỏi công ty hiện tại
 */
export const leaveCompany = async (req, res) => {
  try {
    const userId = req.user.id;

    // Tìm thông tin user
    const user = await db('users').where({ id: userId }).first();
    if (!user) {
      return sendError(res, 404, 'Không tìm thấy thông tin tài khoản.');
    }

    if (!user.company_id) {
      return sendError(res, 400, 'Bạn chưa liên kết với bất kỳ doanh nghiệp nào.');
    }

    // Kiểm tra xem user có phải là chủ sở hữu (HR gốc) của công ty hay không
    const company = await db('companies').where({ id: user.company_id }).first();
    if (company && company.creator_id === userId) {
      return sendError(res, 400, 'Bạn là người tạo (HR gốc) của công ty này. Bạn không thể rời đi. Vui lòng chọn Xóa doanh nghiệp nếu muốn xóa hoàn toàn.');
    }

    // Tiến hành rời công ty (reset company_id và company_join_status)
    await db('users').where({ id: userId }).update({
      company_id: null,
      company_join_status: null,
      updated_at: new Date()
    });

    return sendResponse(res, 200, { message: 'Đã rời khỏi doanh nghiệp thành công.' });
  } catch (error) {
    console.error('Lỗi trong companyController.leaveCompany:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi rời công ty.');
  }
};

/**
 * API HR gốc xóa công ty và toàn bộ dữ liệu liên quan
 */
export const deleteCompany = async (req, res) => {
  try {
    const userId = req.user.id;

    // Tìm công ty do user này sở hữu làm creator
    const company = await db('companies').where({ creator_id: userId }).first();
    if (!company) {
      return sendError(res, 403, 'Bạn không phải là chủ sở hữu (HR gốc) của bất kỳ doanh nghiệp nào.');
    }

    await db.transaction(async (trx) => {
      // 1. Cập nhật reset company liên kết của toàn bộ HR thành viên thuộc công ty này về null
      await trx('users').where({ company_id: company.id }).update({
        company_id: null,
        company_join_status: null,
        updated_at: new Date()
      });

      // 2. Xóa các tin tuyển dụng liên quan
      await trx('jobs').where({ company_id: company.id }).delete();
      
      // 3. Xóa công ty khỏi bảng companies
      await trx('companies').where({ id: company.id }).delete();
    });

    // Xóa cache liên quan
    await deleteCachePattern('jobs:*');
    await deleteCachePattern('companies:*');

    return sendResponse(res, 200, { message: 'Xóa doanh nghiệp và tất cả tin tuyển dụng liên quan thành công.' });
  } catch (error) {
    console.error('Lỗi trong companyController.deleteCompany:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi xóa doanh nghiệp.');
  }
};
