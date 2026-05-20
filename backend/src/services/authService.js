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
