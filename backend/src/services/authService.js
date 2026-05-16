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

  // Generate JWT
  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  // Return user info (excluding password) and token
  const { password_hash, ...userInfo } = user;
  
  return {
    user: userInfo,
    token
  };
};
