import bcrypt from 'bcryptjs';
import db from '../db/knex.js';
import { generateToken } from '../auth/jwt.js';

export const loginUser = async (email, password) => {
  // Find user
  const user = await db('users').where({ email }).first();
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Get user role from RBAC system
  const userRole = await db('user_roles')
    .join('roles', 'user_roles.role_id', 'roles.id')
    .where('user_roles.user_id', user.id)
    .select('roles.name')
    .first();
  
  const roleName = userRole ? userRole.name : 'USER';

  // Generate JWT
  const token = generateToken({ id: user.id, email: user.email, role: roleName });

  // Return user info (excluding password) and token
  const { password_hash, ...userInfo } = user;
  userInfo.role = roleName;
  
  return {
    user: userInfo,
    token
  };
};

export const registerUser = async (email, password, fullName, roleName = 'USER') => {
  // Check if email already exists
  const existingUser = await db('users').where({ email }).first();
  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Execute in a transaction to ensure atomic registration
  const user = await db.transaction(async (trx) => {
    // 1. Create user record
    const [newUser] = await trx('users')
      .insert({
        email,
        password_hash: passwordHash,
        full_name: fullName,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    // 2. Find role ID
    const role = await trx('roles').where({ name: roleName }).first();
    if (!role) {
      throw new Error(`Role ${roleName} does not exist`);
    }

    // 3. Assign role to user
    await trx('user_roles').insert({
      user_id: newUser.id,
      role_id: role.id,
      created_at: new Date(),
      updated_at: new Date()
    });

    return newUser;
  });

  // Generate JWT for direct login after registration
  const token = generateToken({ id: user.id, email: user.email, role: roleName });

  // Return user info (excluding password) and token
  const { password_hash, ...userInfo } = user;
  userInfo.role = roleName;

  return {
    user: userInfo,
    token
  };
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
  const avatarUrl = payload.picture;

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
          created_at: new Date(),
          updated_at: new Date()
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
        created_at: new Date(),
        updated_at: new Date()
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
  }

  // 4. Generate JWT
  const token = generateToken({ id: user.id, email: user.email, role: roleName });

  // Return user info (excluding password) and token
  const { password_hash, ...userInfo } = user;
  userInfo.role = roleName;

  return {
    user: userInfo,
    token
  };
};

/**
 * Update user profile information in the database
 * @param {number} userId 
 * @param {object} data 
 * @returns {Promise<object>} updated user details without password
 */
export const updateUserProfile = async (userId, data) => {
  const { fullName, phone, address, bio, avatarUrl } = data;

  const updateData = {};
  if (fullName !== undefined) updateData.full_name = fullName;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;
  if (bio !== undefined) updateData.bio = bio;
  if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;

  updateData.updated_at = new Date();

  // Perform update in database
  const [updatedUser] = await db('users')
    .where({ id: userId })
    .update(updateData)
    .returning('*');

  if (!updatedUser) {
    throw new Error('User not found');
  }

  // Get user role from RBAC system
  const userRole = await db('user_roles')
    .join('roles', 'user_roles.role_id', 'roles.id')
    .where('user_roles.user_id', updatedUser.id)
    .select('roles.name')
    .first();

  const roleName = userRole ? userRole.name : 'USER';

  const { password_hash, ...userInfo } = updatedUser;
  userInfo.role = roleName;

  return userInfo;
};


