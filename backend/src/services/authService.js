import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../db/knex.js';
import { generateToken } from '../auth/jwt.js';
import { sendVerificationEmail, sendResetPasswordEmail } from './emailService.js';

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

  const { password_hash, verification_token, verification_token_expires_at,
          reset_password_token, reset_password_expires_at, ...userInfo } = user;
  userInfo.role = roleName;

  return { user: userInfo, token };
};

/**
 * Register a new user. Sends verification email instead of auto-login.
 */
export const registerUser = async (email, password, fullName, roleName = 'USER', companyDetails = {}) => {
  const existingUser = await db('users').where({ email }).first();
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Generate a 6-digit OTP code valid for 24 hours
  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

  await db.transaction(async (trx) => {
    let companyId = null;
    if (companyDetails.companyName) {
      const [newCompany] = await trx('companies').insert({
        name: companyDetails.companyName,
        company_size: companyDetails.companySize || null,
        industry: companyDetails.companyIndustry || null,
        city: companyDetails.companyCity || null,
        address: companyDetails.companyAddress || null,
        created_at: trx.fn.now(),
        updated_at: trx.fn.now()
      }).returning('id');
      companyId = newCompany.id || newCompany;
    }

    const [newUser] = await trx('users')
      .insert({
        email,
        password_hash: passwordHash,
        full_name: fullName,
        email_verified: false,
        verification_token: verificationToken,
        verification_token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        company_id: companyId,
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

    return newUser;
  });

  // Send verification email (non-blocking, errors are caught inside service)
  await sendVerificationEmail(email, verificationToken);

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

      return newUser;
    });
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

/**
 * Update user profile information in the database.
 * @param {number} userId
 * @param {object} data
 */
export const updateUserProfile = async (userId, data) => {
  const { fullName, phone, address, bio, avatarUrl, isLookingForJob, companyName, companyLogo, companyWebsite, companyDescription, companySize, companyIndustry, companyCity, companyAddress, contactEmail, contactPhone, contactPublic } = data;

  const updateData = {};
  if (fullName !== undefined) updateData.full_name = fullName;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;
  if (bio !== undefined) updateData.bio = bio;
  if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;
  if (isLookingForJob !== undefined) updateData.is_looking_for_job = isLookingForJob;
  if (contactEmail !== undefined) updateData.contact_email = contactEmail;
  if (contactPhone !== undefined) updateData.contact_phone = contactPhone;
  if (contactPublic !== undefined) updateData.contact_public = contactPublic;

  updateData.updated_at = db.fn.now();

  const [updatedUser] = await db('users')
    .where({ id: userId })
    .update(updateData)
    .returning('*');

  if (!updatedUser) {
    throw new Error('User not found');
  }

  // Handle company updates
  const companyUpdateData = {};
  let updateCompany = false;
  if (companyName !== undefined) { companyUpdateData.name = companyName; updateCompany = true; }
  if (companyLogo !== undefined) { companyUpdateData.logo_url = companyLogo; updateCompany = true; }
  if (companyWebsite !== undefined) { companyUpdateData.website = companyWebsite; updateCompany = true; }
  if (companyDescription !== undefined) { companyUpdateData.description = companyDescription; updateCompany = true; }
  if (companySize !== undefined) { companyUpdateData.company_size = companySize; updateCompany = true; }
  if (companyIndustry !== undefined) { companyUpdateData.industry = companyIndustry; updateCompany = true; }
  if (companyCity !== undefined) { companyUpdateData.city = companyCity; updateCompany = true; }
  if (companyAddress !== undefined) { companyUpdateData.address = companyAddress; updateCompany = true; }

  if (updateCompany) {
    companyUpdateData.updated_at = db.fn.now();
    if (updatedUser.company_id) {
      await db('companies').where({ id: updatedUser.company_id }).update(companyUpdateData);
    } else {
      companyUpdateData.created_at = db.fn.now();
      const [newCompany] = await db('companies').insert(companyUpdateData).returning('id');
      const newId = newCompany.id || newCompany;
      await db('users').where({ id: userId }).update({ company_id: newId });
      updatedUser.company_id = newId;
    }
  }

  const roleName = await getUserRole(updatedUser.id);
  const fullProfile = await getUserProfile(userId);
  return fullProfile;
};

/**
 * Fetch user profile information including package name.
 * @param {number} userId
 */
export const getUserProfile = async (userId) => {
  const user = await db('users')
    .select(
      'users.*', 
      'packages.name as package_name',
      'companies.name as company_name',
      'companies.logo_url as company_logo',
      'companies.website as company_website',
      'companies.description as company_description',
      'companies.company_size as company_size',
      'companies.industry as company_industry',
      'companies.city as company_city',
      'companies.address as company_address',
      'companies.verification_status as company_verification_status',
      'companies.document_url as company_document_url'
    )
    .leftJoin('packages', 'users.package_id', 'packages.id')
    .leftJoin('companies', 'users.company_id', 'companies.id')
    .where({ 'users.id': userId })
    .first();

  if (!user) {
    throw new Error('User not found');
  }

  const roleName = await getUserRole(user.id);

  const { password_hash, verification_token, verification_token_expires_at,
          reset_password_token, reset_password_expires_at, ...userInfo } = user;
  userInfo.role = roleName;

  return userInfo;
};
