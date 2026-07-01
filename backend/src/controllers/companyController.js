import { getCompanyById, toggleCompanyFollow, getCompanyFollowersProfiles } from '../services/companyService.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';
import db from '../db/knex.js';
import cloudinary from '../core/cloudinary.js';
import fs from 'fs';
import { deleteCachePattern } from '../config/redis.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendCompanyInvitationEmail } from '../services/emailService.js';
import { encrypt, decrypt } from '../ultils/encryptionHelper.js';

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

    // Cập nhật thông tin user: liên kết với công ty này và set join status là APPROVED (vì là chủ/creator), cập nhật giấy tờ và mã hóa thông tin nhạy cảm
    await db('users').where({ id: userId }).update({
      company_id: newCompanyId,
      company_join_status: 'APPROVED',
      id_card_number: encrypt(idCardNumber) || null, // Mã hóa AES-256
      id_front_url: urls?.idFrontUrl || null,
      id_front_public_id: urls?.idFrontPublicId || null,
      id_back_url: urls?.idBackUrl || null,
      id_back_public_id: urls?.idBackPublicId || null,
      auth_letter_url: urls?.authFileUrl || null,
      auth_letter_public_id: urls?.authFilePublicId || null,
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
 * API lấy danh sách thành viên hiện tại của công ty (HR phụ có status APPROVED)
 */
export const getCompanyMembers = async (req, res) => {
  try {
    const userId = req.user.id;
    const me = await db('users').where({ id: userId }).first();
    if (!me || !me.company_id) {
      return sendError(res, 400, 'Bạn chưa liên kết với công ty nào.');
    }

    const members = await db('users')
      .where({ company_id: me.company_id, company_join_status: 'APPROVED', is_active: true })
      .select('id', 'email', 'full_name', 'phone', 'gender', 'created_at');

    return sendResponse(res, 200, members);
  } catch (error) {
    console.error('Lỗi trong companyController.getCompanyMembers:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi lấy danh sách thành viên.');
  }
};

/**
 * API HR gốc gửi lời mời tham gia công ty (Cách A)
 */
export const inviteCompanyMember = async (req, res) => {
  try {
    const creatorId = req.user.id;
    const { email } = req.body;

    if (!email) {
      return sendError(res, 400, 'Email là bắt buộc.');
    }

    const myCompany = await db('companies').where({ creator_id: creatorId }).first();
    if (!myCompany) {
      return sendError(res, 403, 'Bạn không phải là HR gốc của bất kỳ doanh nghiệp nào.');
    }

    // Kiểm tra tài khoản đích
    const targetUser = await db('users').where({ email }).first();
    if (targetUser) {
      if (targetUser.company_id) {
        return sendError(res, 400, 'Email này hiện đang thuộc về một doanh nghiệp khác.');
      }
      // Nếu đã có tài khoản và đang tự do -> Gửi mail lời mời liên kết (isAlreadyRegistered = true)
    }

    // Race Condition: Hủy toàn bộ token PENDING cũ của email này
    await db('company_invitations')
      .where({ email, status: 'PENDING' })
      .update({ status: 'CANCELLED', updated_at: new Date() });

    // Tạo token UUID v4 mới
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 giờ

    await db('company_invitations').insert({
      company_id: myCompany.id,
      email,
      token,
      status: 'PENDING',
      expires_at: expiresAt,
      created_at: new Date(),
      updated_at: new Date()
    });

    const isAlreadyRegistered = !!targetUser;
    await sendCompanyInvitationEmail(email, myCompany.name, token, isAlreadyRegistered);

    return sendResponse(res, 201, { message: 'Đã gửi lời mời thành công.' });
  } catch (error) {
    console.error('Lỗi trong companyController.inviteCompanyMember:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi gửi lời mời.');
  }
};

/**
 * API lấy danh sách lời mời đang chờ của công ty
 */
export const getCompanyInvitations = async (req, res) => {
  try {
    const creatorId = req.user.id;
    const myCompany = await db('companies').where({ creator_id: creatorId }).first();
    if (!myCompany) {
      return sendError(res, 403, 'Bạn không phải là HR gốc.');
    }

    const invitations = await db('company_invitations')
      .where({ company_id: myCompany.id, status: 'PENDING' })
      .orderBy('created_at', 'desc');

    return sendResponse(res, 200, invitations);
  } catch (error) {
    console.error('Lỗi trong companyController.getCompanyInvitations:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi lấy danh sách lời mời.');
  }
};

/**
 * API hủy lời mời của công ty
 */
export const cancelCompanyInvitation = async (req, res) => {
  try {
    const creatorId = req.user.id;
    const { invitationId } = req.params;

    const myCompany = await db('companies').where({ creator_id: creatorId }).first();
    if (!myCompany) {
      return sendError(res, 403, 'Bạn không phải là HR gốc.');
    }

    const invitation = await db('company_invitations').where({ id: invitationId, company_id: myCompany.id }).first();
    if (!invitation) {
      return sendError(res, 404, 'Không tìm thấy lời mời.');
    }

    await db('company_invitations').where({ id: invitationId }).update({
      status: 'CANCELLED',
      updated_at: new Date()
    });

    return sendResponse(res, 200, { message: 'Đã hủy lời mời thành công.' });
  } catch (error) {
    console.error('Lỗi trong companyController.cancelCompanyInvitation:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi hủy lời mời.');
  }
};

/**
 * API verify token lời mời (công khai)
 */
export const verifyInvitationToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return sendError(res, 400, 'Token là bắt buộc.');
    }

    const invitation = await db('company_invitations').where({ token }).first();
    if (!invitation) {
      return sendError(res, 404, 'Lời mời không tồn tại hoặc đã bị hủy.');
    }

    if (invitation.status !== 'PENDING') {
      return sendResponse(res, 200, { 
        valid: false, 
        reason: invitation.status === 'ACCEPTED' ? 'ACCEPTED' : 'CANCELLED',
        message: invitation.status === 'ACCEPTED' ? 'Lời mời này đã được sử dụng.' : 'Lời mời này đã bị hủy bỏ.'
      });
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return sendResponse(res, 200, { 
        valid: false, 
        reason: 'EXPIRED',
        message: 'Lời mời này đã hết hạn (chỉ có hiệu lực trong 24 giờ).' 
      });
    }

    const company = await db('companies').where({ id: invitation.company_id }).select('name').first();
    const targetUser = await db('users').where({ email: invitation.email }).first();

    return sendResponse(res, 200, {
      valid: true,
      email: invitation.email,
      companyName: company?.name,
      isAlreadyRegistered: !!targetUser
    });
  } catch (error) {
    console.error('Lỗi trong companyController.verifyInvitationToken:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi xác thực token.');
  }
};

/**
 * API chấp nhận lời mời (công khai hoặc bắt đăng nhập nếu đã có tài khoản)
 */
export const acceptCompanyInvitation = async (req, res) => {
  try {
    const { token, password, fullName, gender, phone } = req.body;
    if (!token) {
      return sendError(res, 400, 'Token là bắt buộc.');
    }

    const invitation = await db('company_invitations').where({ token, status: 'PENDING' }).first();
    if (!invitation) {
      return sendError(res, 404, 'Lời mời không tồn tại hoặc đã hết hiệu lực.');
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return sendError(res, 400, 'Lời mời này đã hết hạn.');
    }

    const targetUser = await db('users').where({ email: invitation.email }).first();

    if (targetUser) {
      // 1. Nếu đã có tài khoản -> Yêu cầu Đăng nhập (Authenticated)
      if (!req.user || req.user.email !== invitation.email) {
        return sendError(res, 401, 'Vui lòng đăng nhập bằng tài khoản nhận thư mời để liên kết doanh nghiệp.');
      }

      await db.transaction(async (trx) => {
        // Cập nhật thông tin liên kết công ty
        await trx('users').where({ id: targetUser.id }).update({
          company_id: invitation.company_id,
          company_join_status: 'APPROVED',
          is_active: true,
          updated_at: new Date()
        });

        // Cập nhật trạng thái lời mời
        await trx('company_invitations').where({ id: invitation.id }).update({
          status: 'ACCEPTED',
          updated_at: new Date()
        });
      });

      return sendResponse(res, 200, { message: 'Liên kết doanh nghiệp thành công.' });
    } else {
      // 2. Chưa có tài khoản -> Đăng ký mới dưới trướng công ty
      if (!password || !fullName) {
        return sendError(res, 400, 'Vui lòng nhập mật khẩu và họ tên để kích hoạt tài khoản.');
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      await db.transaction(async (trx) => {
        // Tạo tài khoản mới
        const [newUser] = await trx('users')
          .insert({
            email: invitation.email,
            password_hash: passwordHash,
            full_name: fullName,
            gender: gender || 'OTHER',
            phone: phone || null,
            company_id: invitation.company_id,
            company_join_status: 'APPROVED',
            email_verified: true,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          })
          .returning('*');

        // Gán quyền HR
        const hrRole = await trx('roles').where({ name: 'HR' }).first();
        if (!hrRole) {
          throw new Error('Vai trò HR không tồn tại trong hệ thống.');
        }

        await trx('user_roles').insert({
          user_id: newUser.id,
          role_id: hrRole.id,
          created_at: new Date(),
          updated_at: new Date()
        });

        // Cập nhật trạng thái lời mời
        await trx('company_invitations').where({ id: invitation.id }).update({
          status: 'ACCEPTED',
          updated_at: new Date()
        });
      });

      return sendResponse(res, 201, { message: 'Kích hoạt tài khoản thành công.' });
    }
  } catch (error) {
    console.error('Lỗi trong companyController.acceptCompanyInvitation:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi chấp nhận lời mời.');
  }
};

/**
 * API HR gốc xóa thành viên khỏi công ty (Gỡ liên kết, không khóa tài khoản)
 */
export const removeCompanyMember = async (req, res) => {
  try {
    const creatorId = req.user.id;
    const { userId } = req.params;

    // Lấy công ty của HR gốc
    const myCompany = await db('companies').where({ creator_id: creatorId }).first();
    if (!myCompany) {
      return sendError(res, 403, 'Bạn không có quyền thực hiện hành động này.');
    }

    // Kiểm tra xem user phụ đó có đúng là thuộc công ty này hay không
    const userToRemove = await db('users')
      .where({ id: userId, company_id: myCompany.id })
      .first();

    if (!userToRemove) {
      return sendError(res, 404, 'Không tìm thấy thành viên tương ứng trong doanh nghiệp của bạn.');
    }

    if (userToRemove.id === creatorId) {
      return sendError(res, 400, 'Bạn không thể tự xóa mình ra khỏi công ty. Hãy dùng tính năng Xóa doanh nghiệp.');
    }

    // Hủy liên kết (gỡ company_id và reset status, giữ nguyên is_active = true)
    await db('users').where({ id: userId }).update({
      company_id: null,
      company_join_status: null,
      updated_at: new Date()
    });

    return sendResponse(res, 200, { message: 'Đã gỡ thành viên khỏi công ty thành công.' });
  } catch (error) {
    console.error('Lỗi trong companyController.removeCompanyMember:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi gỡ thành viên.');
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

    // Check chống spam: Nếu bị từ chối trong vòng 24 giờ đối với công ty này
    if (user.company_rejected_id === parseInt(companyId) && user.company_rejected_at) {
      const hoursSinceReject = (new Date() - new Date(user.company_rejected_at)) / (60 * 60 * 1000);
      if (hoursSinceReject < 24) {
        const hoursLeft = Math.ceil(24 - hoursSinceReject);
        return sendError(res, 400, `Yêu cầu liên kết của bạn với doanh nghiệp này đã bị từ chối gần đây. Vui lòng thử lại sau ${hoursLeft} giờ.`);
      }
    }

    // Cập nhật yêu cầu gia nhập, cập nhật trạng thái PENDING cho HR Gốc duyệt, cập nhật giấy tờ
    await db('users').where({ id: userId }).update({
      company_id: companyId,
      company_join_status: 'PENDING',
      id_card_number: encrypt(idCardNumber) || null, // Mã hóa AES-256
      id_front_url: urls?.idFrontUrl || null,
      id_front_public_id: urls?.idFrontPublicId || null,
      id_back_url: urls?.idBackUrl || null,
      id_back_public_id: urls?.idBackPublicId || null,
      auth_letter_url: urls?.authFileUrl || null,
      auth_letter_public_id: urls?.authFilePublicId || null,
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

    // Phê duyệt và lên lịch xóa tài liệu nhạy cảm sau 30 ngày (Audit Trail)
    await db('users').where({ id: userId }).update({
      company_join_status: 'APPROVED',
      scheduled_delete_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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

    // Từ chối (xét join status thành REJECTED, reset company_id = null, ghi nhận thông tin chống spam và lên lịch xóa tài liệu sau 30 ngày)
    await db('users').where({ id: userId }).update({
      company_id: null,
      company_join_status: 'REJECTED',
      company_rejected_id: myCompany.id,
      company_rejected_at: new Date(),
      scheduled_delete_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
          return { url: result.secure_url, publicId: result.public_id };
        } finally {
          await fs.promises.unlink(file.path).catch(e => console.error(e));
        }
      }
      return null;
    };

    const urls = {};

    if (files?.authFile) {
      const uploadRes = await uploadToCloudinary(files.authFile, 'company_docs/auth_letters');
      if (uploadRes) {
        urls.authFileUrl = uploadRes.url;
        urls.authFilePublicId = uploadRes.publicId;
      }
    }
    if (files?.idFrontFile) {
      const uploadRes = await uploadToCloudinary(files.idFrontFile, 'company_docs/id_cards');
      if (uploadRes) {
        urls.idFrontUrl = uploadRes.url;
        urls.idFrontPublicId = uploadRes.publicId;
      }
    }
    if (files?.idBackFile) {
      const uploadRes = await uploadToCloudinary(files.idBackFile, 'company_docs/id_cards');
      if (uploadRes) {
        urls.idBackUrl = uploadRes.url;
        urls.idBackPublicId = uploadRes.publicId;
      }
    }
    if (files?.licenseFile) {
      const uploadRes = await uploadToCloudinary(files.licenseFile, 'company_docs/licenses');
      if (uploadRes) {
        urls.licenseFileUrl = uploadRes.url;
        urls.licenseFilePublicId = uploadRes.publicId;
      }
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

/**
 * Tác vụ dọn dẹp các lời mời PENDING đã quá hạn 30 ngày và các tài liệu nhạy cảm đến hạn xóa (scheduled_delete_at < NOW)
 */
export const cleanupExpiredInvitations = async () => {
  try {
    // 1. Dọn dẹp company_invitations
    const limitDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 ngày trước
    const count = await db('company_invitations')
      .where('status', 'PENDING')
      .andWhere('expires_at', '<', limitDate)
      .delete();
    if (count > 0) {
      console.log(`[Database Cleanup] Đã tự động xóa ${count} lời mời tuyển dụng quá hạn 30 ngày.`);
    }

    // 2. Dọn dẹp tài liệu nhạy cảm của nhân sự (scheduled_delete_at < NOW)
    const usersToClean = await db('users')
      .whereNotNull('scheduled_delete_at')
      .andWhere('scheduled_delete_at', '<', new Date());

    if (usersToClean.length > 0) {
      console.log(`[Privacy Cleanup] Tìm thấy ${usersToClean.length} tài khoản đến hạn xóa tài liệu xác minh nhạy cảm.`);
      
      // Xử lý chạy nền bất đồng bộ để tránh nghẽn hệ thống
      setImmediate(async () => {
        for (const userToClean of usersToClean) {
          try {
            // Xóa file trên Cloudinary bằng public_id lưu sẵn
            if (userToClean.id_front_public_id) {
              await cloudinary.uploader.destroy(userToClean.id_front_public_id).catch(e => console.error(e));
            }
            if (userToClean.id_back_public_id) {
              await cloudinary.uploader.destroy(userToClean.id_back_public_id).catch(e => console.error(e));
            }
            if (userToClean.auth_letter_public_id) {
              await cloudinary.uploader.destroy(userToClean.auth_letter_public_id).catch(e => console.error(e));
            }

            // Cập nhật reset DB về null
            await db('users').where({ id: userToClean.id }).update({
              id_card_number: null,
              id_front_url: null,
              id_front_public_id: null,
              id_back_url: null,
              id_back_public_id: null,
              auth_letter_url: null,
              auth_letter_public_id: null,
              scheduled_delete_at: null,
              updated_at: new Date()
            });

            console.log(`[Privacy Cleanup] Đã dọn dẹp vĩnh viễn tài liệu nhạy cảm của user ID: ${userToClean.id}`);
          } catch (errClean) {
            console.error(`[Privacy Cleanup] Lỗi dọn dẹp tài liệu cho user ID: ${userToClean.id}:`, errClean);
          }
        }
      });
    }
  } catch (error) {
    console.error('Lỗi khi chạy tác vụ dọn dẹp Database:', error);
  }
};
