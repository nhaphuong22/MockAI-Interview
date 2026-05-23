import { verifyToken } from './jwt.js';
import { sendError } from '../ultils/responseHelper.js';

/**
 * Middleware to verify JWT token
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = verifyToken(token);
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid token');
    }
    return sendError(res, 401, 'Authentication failed');
  }
};

/**
 * Middleware to check if user has specific role(s)
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 403, 'Access denied. Insufficient permissions');
    }

    next();
  };
};
