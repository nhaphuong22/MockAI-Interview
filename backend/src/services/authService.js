import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../db/knex.js';
import { generateToken } from '../auth/jwt.js';

import { sendVerificationEmail, sendResetPasswordEmail, sendCompanyEmailOtp } from './emailService.js';
import { deleteCachePattern } from '../config/redis.js';


// ─── Helper ────────────────────────────────────────────────────────────────────

/**
 * Get the RBAC role name for a given user ID.
 * @param {number} userId
 * @returns {Promise<string>}
 */
const getUserRole = async (userId) => {
  const userRole = await db('user_roles')
    .join('roles', 'user_roles.role_id', 'roles.id')
    .where('user_roles.user_id', userId)
    .select('roles.name')
    .first();
  return userRole ? userRole.name : 'USER';
};

// ─── Public Services ───────────────────────────────────────────────────────────

/**
 * Authenticate user with email and password.
 * Throws if credentials are invalid or email is not verified.
 */
export const loginUser = async (email, password) => {
  const user = await db('users').where({ email }).first();
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Require email verification before allowing login
  if (!user.email_verified) {
    throw new Error('Email not verified');
  }

  const roleName = await getUserRole(user.id);
  const token = generateToken({ id: user.id, email: user.email, role: roleName });

  const fullProfile = await getUserProfile(user.id);

  return { user: fullProfile, token };
};

/**
 * Register a new user. Sends verification email instead of auto-login.
 */
export const registerUser = async (email, password, fullName, roleName = 'USER', gender = 'OTHER') => {
  const existingUser = await db('users').where({ email }).first();
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Generate a 6-digit OTP code valid for 24 hours
  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

  await db.transaction(async (trx) => {
    const [newUser] = await trx('users')
      .insert({
        email,
        password_hash: passwordHash,
        full_name: fullName,
        email_verified: false,
        verification_token: verificationToken,
        verification_token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      })
      .returning('*');

    const role = await trx('roles').where({ name: roleName }).first();
    if (!role) {
      throw new Error(`Role ${roleName} does not exist`);
    }

    await trx('user_roles').insert({
      user_id: newUser.id,
      role_id: role.id,
      created_at: trx.fn.now(),
      updated_at: trx.fn.now(),
    });

    if (roleName === 'HR') {
      await trx('hr_profiles').insert({
        user_id: newUser.id,
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      });
      await trx('hr_wallets').insert({
        user_id: newUser.id, // Ví mặc định của HR freelance (chưa liên kết cty)
        total_job_credits: 0,
        total_ai_credits: 0,
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      });
    } else {
      await trx('candidate_profiles').insert({
        user_id: newUser.id,
        gender: gender,
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      });
    }

    return newUser;
  });

  // Send verification email (non-blocking, errors are caught inside service)
  await sendVerificationEmail(email, verificationToken);

  // Clear Users list cache so the admin dashboard immediately sees the new user
  await deleteCachePattern('users:list:*');

  return { message: 'Registration successful. Please check your email to verify your account.' };
};

/**
 * Verify user email using the token from the verification link.
 * @param {string} token
 */
export const verifyEmail = async (token, email = null) => {
  console.log('[verifyEmail service] Querying for token:', token, 'email:', email);
  console.log('[verifyEmail service] Current timestamp:', new Date().toISOString());

  if (email) {
    const userByEmail = await db('users').where({ email }).first();
    if (userByEmail && userByEmail.email_verified) {
      console.log('[verifyEmail service] User is already verified:', email);
      return { message: 'Email verified successfully. You can now log in.' };
    }
  }

  const user = await db('users').where({ verification_token: token }).first();
  console.log('[verifyEmail service] User matching token:', user ? { id: user.id, email: user.email, expires: user.verification_token_expires_at } : 'NOT FOUND');

  if (!user) {
    throw new Error('Incorrect verification token');
  }

  const expiresAt = new Date(user.verification_token_expires_at);
  const now = new Date();
  if (expiresAt < now) {
    throw new Error('Expired verification token');
  }

  await db('users').where({ id: user.id }).update({
    email_verified: true,
    verification_token: null,
    verification_token_expires_at: null,
    updated_at: new Date(),
  });

  return { message: 'Email verified successfully. You can now log in.' };
};

/**
 * Resend the email verification link.
 * @param {string} email
 */
export const resendVerificationEmail = async (email) => {
  const user = await db('users').where({ email }).first();

  if (!user) {
    // Return generic message to avoid user enumeration
    return { message: 'If this email is registered, a new verification link has been sent.' };
  }

  if (user.email_verified) {
    throw new Error('Email is already verified');
  }

  // Generate a 6-digit OTP code valid for 24 hours
  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db('users').where({ id: user.id }).update({
    verification_token: verificationToken,
    verification_token_expires_at: verificationExpires,
    updated_at: db.fn.now(),
  });

  await sendVerificationEmail(email, verificationToken);

  return { message: 'If this email is registered, a new verification link has been sent.' };
};

/**
 * Initiate forgot-password flow. Sends reset link to user's email.
 * @param {string} email
 */
export const forgotPassword = async (email) => {
  const user = await db('users').where({ email }).first();

  // Always return success to prevent user enumeration attacks
  if (!user) {
    return { message: 'If this email is registered, a password reset link has been sent.' };
  }

  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db('users').where({ id: user.id }).update({
    reset_password_token: resetToken,
    reset_password_expires_at: resetExpires,
    updated_at: new Date(),
  });

  await sendResetPasswordEmail(email, resetToken);

  return { message: 'If this email is registered, a password reset link has been sent.' };
};

/**
 * Reset user password using the token from the reset email link.
 * @param {string} token
 * @param {string} newPassword
 */
export const resetPassword = async (token, newPassword) => {
  const user = await db('users')
    .where({ reset_password_token: token })
    .where('reset_password_expires_at', '>', new Date())
    .first();

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await db('users').where({ id: user.id }).update({
    password_hash: passwordHash,
    reset_password_token: null,
    reset_password_expires_at: null,
    updated_at: new Date(),
  });

  return { message: 'Password has been reset successfully. You can now log in with your new password.' };
};

/**
 * Change password for an authenticated user.
 * @param {number} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await db('users').where({ id: userId }).first();
  if (!user) {
    throw new Error('User not found');
  }

  // Google OAuth users may not have a password_hash
  if (!user.password_hash) {
    throw new Error('Cannot change password for OAuth accounts');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  const salt = await bcrypt.genSalt(10);
  const newPasswordHash = await bcrypt.hash(newPassword, salt);

  await db('users').where({ id: userId }).update({
    password_hash: newPasswordHash,
    updated_at: new Date(),
  });

  return { message: 'Password changed successfully.' };
};

export const loginGoogleUser = async (idToken) => {
  if (!idToken) {
    throw new Error('ID Token is required');
  }

  // 1. Verify token with Google's endpoint
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
  if (!response.ok) {
    throw new Error('Invalid Google Token');
  }

  const payload = await response.json();

  // 2. Validate client ID and issuer
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    throw new Error('Google Client ID is not configured on the server');
  }

  if (payload.aud !== googleClientId) {
    throw new Error('Token client ID mismatch');
  }

  const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
  if (!validIssuers.includes(payload.iss)) {
    throw new Error('Token issuer mismatch');
  }

  const email = payload.email;
  const fullName = payload.name || email.split('@')[0];
  const avatarUrl = payload.picture
    ? payload.picture.replace(/=s\d+(-c)?$/, '=s384-c')
    : null;

  // 3. Find user in database
  let user = await db('users').where({ email }).first();
  let roleName = 'USER';

  if (!user) {
    // Register user automatically with USER (candidate) role
    const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(randomPassword, salt);

    user = await db.transaction(async (trx) => {
      // Create user record
      const [newUser] = await trx('users')
        .insert({
          email,
          password_hash: passwordHash,
          full_name: fullName,
          avatar_url: avatarUrl || null,
          email_verified: true,
          created_at: trx.fn.now(),
          updated_at: trx.fn.now()
        })
        .returning('*');

      // Find role ID
      const role = await trx('roles').where({ name: roleName }).first();
      if (!role) {
        throw new Error(`Role ${roleName} does not exist`);
      }

      // Assign role to user
      await trx('user_roles').insert({
        user_id: newUser.id,
        role_id: role.id,
        created_at: trx.fn.now(),
        updated_at: trx.fn.now()
      });

      // Google user is initially Candidate
      await trx('candidate_profiles').insert({
        user_id: newUser.id,
        gender: 'OTHER',
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      });

      return newUser;
    });

    // Clear Users list cache so the admin dashboard immediately sees the new Google user
    await deleteCachePattern('users:list:*');
  } else {
    // Get existing user's role
    const userRole = await db('user_roles')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .where('user_roles.user_id', user.id)
      .select('roles.name')
      .first();
    
    roleName = userRole ? userRole.name : 'USER';

    // Update avatar with Google's picture if candidate hasn't uploaded a custom avatar yet
    if ((!user.avatar_url || user.avatar_url.trim() === "") && avatarUrl) {
      const [updatedUser] = await db('users')
        .where({ id: user.id })
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date()
        })
        .returning('*');
      user = updatedUser;
    }
  }

  // 4. Generate JWT
  const token = generateToken({ id: user.id, email: user.email, role: roleName });

  // Return user info (excluding password) and token
  const { password_hash, ...userInfo } = user;

  return {
    user: userInfo,
    token
  };
};

export const updateUserProfile = async (userId, data) => {
  const { fullName, phone, address, bio, avatarUrl, coverUrl, gender, isLookingForJob, contactPhone, contactPublic, linkedinUrl, githubUrl, portfolioUrl } = data;

  const roleName = await getUserRole(userId);

  // Update Core Users fields
  const userUpdate = {};
  if (fullName !== undefined) userUpdate.full_name = fullName;
  if (avatarUrl !== undefined) userUpdate.avatar_url = avatarUrl;
  
  if (Object.keys(userUpdate).length > 0) {
    userUpdate.updated_at = db.fn.now();
    await db('users').where({ id: userId }).update(userUpdate);
  }

  // Update Specific Profile fields
  if (roleName === 'HR') {
    const hrUpdate = {};
    if (Object.keys(hrUpdate).length > 0) {
      hrUpdate.updated_at = db.fn.now();
      await db('hr_profiles').where({ user_id: userId }).update(hrUpdate);
    }
  } else { // CANDIDATE
    const candidateUpdate = {};
    if (phone !== undefined) candidateUpdate.phone = phone;
    if (address !== undefined) candidateUpdate.address = address;
    if (bio !== undefined) candidateUpdate.bio = bio;
    if (gender !== undefined) candidateUpdate.gender = gender;
    if (coverUrl !== undefined) candidateUpdate.cover_url = coverUrl;
    if (isLookingForJob !== undefined) candidateUpdate.is_looking_for_job = isLookingForJob;
    if (linkedinUrl !== undefined) candidateUpdate.linkedin_url = linkedinUrl;
    if (githubUrl !== undefined) candidateUpdate.github_url = githubUrl;
    if (portfolioUrl !== undefined) candidateUpdate.portfolio_url = portfolioUrl;
    
    if (Object.keys(candidateUpdate).length > 0) {
      candidateUpdate.updated_at = db.fn.now();
      await db('candidate_profiles').where({ user_id: userId }).update(candidateUpdate);
    }
  }

  const fullProfile = await getUserProfile(userId);
  return fullProfile;
};

export const getUserProfile = async (userId) => {
  const roleName = await getUserRole(userId);
  let user = await db('users').where({ id: userId }).first();

  if (!user) {
    throw new Error('User not found');
  }

  // Join extra profile data based on role
  if (roleName === 'HR' || roleName === 'ADMIN') {
    const hrProfile = await db('hr_profiles').where({ user_id: userId }).first() || {};
    const wallet = await db('hr_wallets').where({ user_id: userId }).first() || {};
    user = { ...user, ...hrProfile, ...wallet };
  } else {
    const candidateProfile = await db('candidate_profiles').where({ user_id: userId }).first() || {};
    const sub = await db('user_subscriptions')
        .leftJoin('packages', 'user_subscriptions.package_id', 'packages.id')
        .where({ 'user_subscriptions.user_id': userId })
        .select('user_subscriptions.*', 'packages.name as package_name')
        .first() || {};
    user = { ...user, ...candidateProfile, ...sub };
  }

  const { password_hash, verification_token, verification_token_expires_at,
          reset_password_token, reset_password_expires_at, ...userInfo } = user;
  userInfo.role = roleName;

  // Mask PII Security (ẩn URL ảnh CCCD và che số CCCD)
  if (roleName === 'HR' || roleName === 'ADMIN') {
    if (userInfo.id_front_url) userInfo.id_front_url = '[PROTECTED_PRIVATE_DATA]';
    if (userInfo.id_back_url) userInfo.id_back_url = '[PROTECTED_PRIVATE_DATA]';
    if (userInfo.auth_letter_url) userInfo.auth_letter_url = '[PROTECTED_PRIVATE_DATA]';
  } else {
    if (userInfo.id_card_number) {
      const id = userInfo.id_card_number;
      userInfo.id_card_number = '*'.repeat(Math.max(0, id.length - 4)) + id.slice(-4);
    }
  }

  if (user.company_id) {
    const company = await db('companies').where({ id: user.company_id }).first();
    if (company) {
      userInfo.company_name = company.name;
      userInfo.company_logo = company.logo_url;
      userInfo.company_website = company.website;
      userInfo.company_description = company.description;
      userInfo.company_size = company.company_size;
      userInfo.company_industry = company.industry;
      userInfo.company_city = company.city;
      userInfo.company_address = company.address;
      userInfo.company_verification_status = company.verification_status;
      userInfo.company_document_url = company.document_url;
      userInfo.company_tax_code = company.tax_code;
      userInfo.company_is_tax_code_public = company.is_tax_code_public;
    }

    // HR belong to a company use company wallet
    if (roleName === 'HR') {
      const companyWallet = await db('hr_wallets').where({ company_id: user.company_id }).first();
      if (companyWallet) {
         userInfo.total_job_credits = companyWallet.total_job_credits;
         userInfo.total_ai_credits = companyWallet.total_ai_credits;
      }
    }
  }

  return userInfo;
};

// ─── Company Email OTP ────────────────────────────────────────────────────────

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const requestCompanyEmailOtp = async (userId, contactEmail, companyData) => {
  if (!contactEmail) throw new Error('Vui lòng cung cấp email liên hệ');

  // Check if contactEmail is already used by another user
  const emailExists = await db('users')
    .where(function() {
      this.where('email', contactEmail).orWhere('contact_email', contactEmail);
    })
    .andWhere('id', '!=', userId)
    .first();

  if (emailExists) {
    throw new Error('Email này đã được sử dụng bởi một tài khoản hoặc công ty khác');
  }

  const existing = await db('company_email_otps').where({ user_id: userId }).first();
  if (existing) {
    const diffInSeconds = (new Date() - new Date(existing.updated_at)) / 1000;
    if (diffInSeconds < 60) {
      throw new Error(`Vui lòng đợi ${Math.ceil(60 - diffInSeconds)} giây trước khi yêu cầu mã mới`);
    }
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  if (existing) {
    await db('company_email_otps').where({ user_id: userId }).update({
      email: contactEmail,
      otp_hash: otpHash,
      pending_data: companyData,
      attempts: 0,
      expires_at: expiresAt,
      updated_at: new Date()
    });
  } else {
    await db('company_email_otps').insert({
      user_id: userId,
      email: contactEmail,
      otp_hash: otpHash,
      pending_data: companyData,
      attempts: 0,
      expires_at: expiresAt,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  await sendCompanyEmailOtp(contactEmail, otp);
  return { message: 'OTP đã được gửi đến email của bạn' };
};

export const verifyCompanyEmailOtp = async (userId, contactEmail, otp) => {
  const otpRecord = await db('company_email_otps').where({ user_id: userId, email: contactEmail }).first();
  if (!otpRecord) throw new Error('Không tìm thấy yêu cầu xác thực OTP nào');

  if (new Date() > new Date(otpRecord.expires_at)) {
    throw new Error('Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.');
  }

  if (otpRecord.attempts >= 5) {
    throw new Error('Bạn đã nhập sai quá 5 lần. Vui lòng gửi lại mã mới.');
  }

  const isMatch = await bcrypt.compare(otp, otpRecord.otp_hash);
  if (!isMatch) {
    await db('company_email_otps').where({ id: otpRecord.id }).increment('attempts', 1);
    throw new Error('Mã OTP không hợp lệ');
  }

  // OTP is correct. Update profile using pending_data
  let pendingData = typeof otpRecord.pending_data === 'string' ? JSON.parse(otpRecord.pending_data) : otpRecord.pending_data;
  if (typeof pendingData === 'string') {
    pendingData = JSON.parse(pendingData);
  }

  // Double check if contactEmail is still not used by someone else
  const emailExists = await db('users')
    .where(function() {
      this.where('email', contactEmail).orWhere('contact_email', contactEmail);
    })
    .andWhere('id', '!=', userId)
    .first();

  if (emailExists) {
    throw new Error('Email này đã được sử dụng bởi một tài khoản hoặc công ty khác');
  }

  // Call updateUserProfile to save user profile changes
  await updateUserProfile(userId, pendingData);

  // Update contact email and mark as verified
  await db('users').where({ id: userId }).update({
    contact_email: pendingData.contactEmail || contactEmail,
    contact_email_verified: true
  });

  // Delete OTP record
  await db('company_email_otps').where({ id: otpRecord.id }).del();

  const user = await getUserProfile(userId);
  return user;
};

export const resendCompanyEmailOtp = async (userId, contactEmail) => {
  const otpRecord = await db('company_email_otps').where({ user_id: userId, email: contactEmail }).first();
  if (!otpRecord) throw new Error('Không có yêu cầu xác thực OTP nào cần gửi lại');

  // Check 60s cooldown
  const diffInSeconds = (new Date() - new Date(otpRecord.updated_at)) / 1000;
  if (diffInSeconds < 60) {
    throw new Error(`Vui lòng đợi ${Math.ceil(60 - diffInSeconds)} giây trước khi gửi lại`);
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await db('company_email_otps').where({ id: otpRecord.id }).update({
    otp_hash: otpHash,
    attempts: 0,
    expires_at: expiresAt,
    updated_at: new Date()
  });

  await sendCompanyEmailOtp(contactEmail, otp);
  return { message: 'OTP đã được gửi lại' };
};
