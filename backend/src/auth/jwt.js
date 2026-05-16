import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.JWT_SECRET || 'supersecretmockai2026';

export const generateToken = (payload) => {
  return jwt.sign(payload, secret, { expiresIn: '1d' });
};

export const verifyToken = (token) => {
  return jwt.verify(token, secret);
};
