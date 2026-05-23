import { verifyToken } from '../auth/jwt.js';
import { sendError } from '../ultils/responseHelper.js';

/**
 * Middleware to authenticate JWT token from request headers
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return sendError(res, 401, 'Access token is required');
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return sendError(res, 403, 'Invalid or expired token');
  }
};
