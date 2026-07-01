import {
  loginUser,
  registerUser,
  loginGoogleUser,
  updateUserProfile,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  getUserProfile,
  requestCompanyEmailOtp,
  verifyCompanyEmailOtp,
  resendCompanyEmailOtp,
} from '../services/authService.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';
import cloudinary from '../core/cloudinary.js';
import fs from 'fs';
import db from '../db/knex.js';

// ─── Register ──────────────────────────────────────────────────────────────────

export const register = async (req, res) => {
  try {
    const { email, password, fullName, role, gender } = req.body;

    if (!email || !password || !fullName) {
      return sendError(res, 400, 'Vui lòng cung cấp đầy đủ thông tin bắt buộc (Email, Mật khẩu, Họ tên).');
    }

    if (password.length < 6) {
      return sendError(res, 400, 'Mật khẩu phải chứa ít nhất 6 ký tự.');
    }

    let roleName = 'USER';
    if (role === 'recruiter') {
      roleName = 'HR';
    } else if (role === 'admin') {
      return sendError(res, 403, 'Bạn không có quyền đăng ký tài khoản Quản trị viên.');
    }

    // Block public emails for HR
    if (roleName === 'HR') {
      const publicDomains = [
        'gmail.com', 'yahoo.com', 'yahoo.com.vn', 'hotmail.com',
        'outlook.com', 'icloud.com', 'aol.com', 'protonmail.com'
      ];
      const emailDomain = email.split('@')[1]?.toLowerCase();
      if (publicDomains.includes(emailDomain)) {
        return sendError(res, 400, 'Vui lòng sử dụng email công ty để đăng ký tài khoản Nhà tuyển dụng.');
      }
    }

    const result = await registerUser(email, password, fullName, roleName, gender);

    return sendResponse(res, 201, 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.', result);
  } catch (error) {
    if (error.message === 'Email already registered') {
      return sendError(res, 400, 'Email is already in use');
    }
    console.error('Register controller error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// ─── Login ─────────────────────────────────────────────────────────────────────

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required');
    }

    const result = await loginUser(email, password);
    return sendResponse(res, 200, result);
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return sendError(res, 401, 'Invalid credentials');
    }
    if (error.message === 'Email not verified') {
      return sendError(res, 403, 'Email not verified. Please check your inbox and verify your email first.');
    }
    console.error('Login controller error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// ─── Google OAuth ──────────────────────────────────────────────────────────────

export const loginGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return sendError(res, 400, 'ID Token is required');
    }

    const result = await loginGoogleUser(idToken);
    return sendResponse(res, 200, result);
  } catch (error) {
    if (
      error.message === 'Invalid Google Token' ||
      error.message === 'Token client ID mismatch' ||
      error.message === 'Token issuer mismatch'
    ) {
      return sendError(res, 401, error.message);
    }
    console.error('Google login controller error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// ─── Email Verification ────────────────────────────────────────────────────────

export const verifyEmailController = async (req, res) => {
  try {
    const { token, email } = req.body;
    console.log('[VerifyEmailController] Received token:', token, 'email:', email, 'Type:', typeof token, 'Length:', token ? token.length : 0);

    if (!token) {
      return sendError(res, 400, 'Verification token is required');
    }

    const trimmedToken = token.trim();
    console.log('[VerifyEmailController] Trimmed token:', trimmedToken, 'Length:', trimmedToken.length);

    const result = await verifyEmail(trimmedToken, email);
    console.log('[VerifyEmailController] Verification successful for token:', trimmedToken, 'email:', email);
    return sendResponse(res, 200, result);
  } catch (error) {
    console.error('[VerifyEmailController] Error verifying token:', token, 'Error:', error.message);
    if (
      error.message === 'Incorrect verification token' ||
      error.message === 'Expired verification token' ||
      error.message === 'Invalid or expired verification token'
    ) {
      const displayError = error.message === 'Expired verification token'
        ? 'Mã xác thực đã hết hạn.'
        : 'Mã xác thực không chính xác hoặc đã hết hạn.';
      return sendError(res, 400, displayError);
    }
    console.error('Verify email controller error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

export const resendVerificationEmailController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 400, 'Email is required');
    }

    const result = await resendVerificationEmail(email);
    return sendResponse(res, 200, result);
  } catch (error) {
    if (error.message === 'Email is already verified') {
      return sendError(res, 400, error.message);
    }
    console.error('Resend verification controller error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// ─── Forgot / Reset Password ───────────────────────────────────────────────────

export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 400, 'Email is required');
    }

    const result = await forgotPassword(email);
    return sendResponse(res, 200, result);
  } catch (error) {
    console.error('Forgot password controller error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return sendError(res, 400, 'Token and new password are required');
    }

    if (password.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters');
    }

    const result = await resetPassword(token, password);
    return sendResponse(res, 200, result);
  } catch (error) {
    if (error.message === 'Invalid or expired reset token') {
      return sendError(res, 400, error.message);
    }
    console.error('Reset password controller error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// ─── Change Password ───────────────────────────────────────────────────────────

export const changePasswordController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 400, 'Current password and new password are required');
    }

    if (newPassword.length < 6) {
      return sendError(res, 400, 'New password must be at least 6 characters');
    }

    const result = await changePassword(userId, currentPassword, newPassword);
    return sendResponse(res, 200, result);
  } catch (error) {
    if (error.message === 'Current password is incorrect') {
      return sendError(res, 400, 'Current password is incorrect');
    }
    if (error.message === 'Cannot change password for OAuth accounts') {
      return sendError(res, 400, 'Cannot change password for Google-authenticated accounts');
    }
    if (error.message === 'User not found') {
      return sendError(res, 404, 'User not found');
    }
    console.error('Change password controller error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// ─── Profile Update ────────────────────────────────────────────────────────────

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phone, address, bio, avatarUrl, coverUrl, gender, isLookingForJob, companyName, companyLogo, companyWebsite, companyDescription, companySize, companyIndustry, companyCity, companyAddress, contactEmail, contactPhone, contactPublic, linkedinUrl, githubUrl, portfolioUrl } = req.body;

    const result = await updateUserProfile(userId, { fullName, phone, address, bio, avatarUrl, coverUrl, gender, isLookingForJob, companyName, companyLogo, companyWebsite, companyDescription, companySize, companyIndustry, companyCity, companyAddress, contactEmail, contactPhone, contactPublic, linkedinUrl, githubUrl, portfolioUrl });
    return sendResponse(res, 200, result);
  } catch (error) {
    if (error.message === 'User not found') {
      return sendError(res, 404, 'User not found');
    }
    console.error('Update profile controller error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// ─── Company Profile OTP Verification ───────────────────────────────────────────

export const requestCompanyOtpController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contactEmail, companyData } = req.body;
    const result = await requestCompanyEmailOtp(userId, contactEmail, companyData);
    return sendResponse(res, 200, result);
  } catch (error) {
    console.error('Request company OTP controller error:', error);
    return sendError(res, error.message.includes('Vui lòng') || error.message.includes('Email này') ? 400 : 500, error.message);
  }
};

export const verifyCompanyOtpController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contactEmail, otp } = req.body;

    if (!contactEmail || !otp) {
      return sendError(res, 400, 'Thiếu email hoặc mã OTP');
    }

    const result = await verifyCompanyEmailOtp(userId, contactEmail, otp);
    return sendResponse(res, 200, result);
  } catch (error) {
    console.error('Verify company OTP controller error:', error);
    return sendError(res, 400, error.message);
  }
};

export const resendCompanyOtpController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contactEmail } = req.body;

    if (!contactEmail) {
      return sendError(res, 400, 'Thiếu email liên hệ');
    }

    const result = await resendCompanyEmailOtp(userId, contactEmail);
    return sendResponse(res, 200, result);
  } catch (error) {
    console.error('Resend company OTP controller error:', error);
    return sendError(res, 400, error.message);
  }
};

// ─── Profile Fetch ─────────────────────────────────────────────────────────────

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await getUserProfile(userId);
    return sendResponse(res, 200, result);
  } catch (error) {
    if (error.message === 'User not found') {
      return sendError(res, 404, 'User not found');
    }
    console.error('Get profile controller error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// ─── Upload Avatar ─────────────────────────────────────────────────────────────

export const uploadAvatarController = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'Vui lòng chọn một ảnh để tải lên');
    }

    // Upload local file to Cloudinary using shared configuration
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: 'avatars',
    });

    const avatarUrl = uploadResult.secure_url;
    await updateUserProfile(req.user.id, { avatarUrl });
    return sendResponse(res, 200, { avatarUrl });
  } catch (error) {
    console.error('Upload avatar controller error:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi tải ảnh lên');
  } finally {
    // Ensure temporary local file is always cleaned up
    if (req.file && req.file.path) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete temporary local avatar file:', unlinkError);
      }
    }
  }
};

// ─── Upload Cover ──────────────────────────────────────────────────────────────

export const uploadCoverController = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'Vui lòng chọn một ảnh bìa để tải lên');
    }

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: 'covers',
    });

    const coverUrl = uploadResult.secure_url;
    await updateUserProfile(req.user.id, { coverUrl });
    return sendResponse(res, 200, { coverUrl });
  } catch (error) {
    console.error('Upload cover controller error:', error);
    return sendError(res, 500, 'Lỗi hệ thống khi tải ảnh bìa lên');
  } finally {
    if (req.file && req.file.path) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete temporary local cover file:', unlinkError);
      }
    }
  }
};

// ─── Logout ────────────────────────────────────────────────────────────────────

export const logout = async (req, res) => {
  // JWT is stateless — client must delete the token.
  // This endpoint exists for consistency and future token-blacklist support.
  return sendResponse(res, 200, { message: 'Logged out successfully' });
};
// ─── Verification & Privacy ───────────────────────────────────────────────────

export const acceptPrivacyAgreementController = async (req, res) => {
  try {
    const userId = req.user.id;
    const agreed = req.body.agreed !== undefined ? !!req.body.agreed : true;

    // Update the user
    await db('users')
      .where({ id: userId })
      .update({
        privacy_agreed: agreed,
        privacy_agreed_at: agreed ? db.fn.now() : null
      });

    // Fetch the updated user to return (including roles and details)
    const updatedUser = await getUserProfile(userId);

    res.json({
      message: 'Đã chấp nhận thoả thuận dữ liệu cá nhân',
      user: updatedUser
    });
  } catch (error) {
    import('fs').then(fs => fs.writeFileSync('privacy_error.log', String(error.stack || error)));
    console.error('Accept privacy agreement error:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật thoả thuận dữ liệu.', error: String(error) });
  }
};
