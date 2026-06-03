import db from '../db/knex.js';
import { verifyToken } from '../auth/jwt.js';
import { sendError } from '../ultils/responseHelper.js';

/**
 * Middleware: Yêu cầu người dùng phải đăng nhập (Xác thực JWT Token)
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không thể truy cập: Vui lòng cung cấp mã xác thực JWT' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({ message: 'Mã xác thực không hợp lệ hoặc đã hết hạn' });
    }

    // Truy vấn thông tin người dùng từ DB kèm theo vai trò (Role) từ bảng user_roles & roles
    const user = await db('users')
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'user_roles.role_id', 'roles.id')
      .select('users.*', 'roles.name as role')
      .where('users.id', decoded.id)
      .first();

    if (!user) {
      return res.status(404).json({ message: 'Tài khoản không tồn tại trên hệ thống' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Tài khoản này hiện đang bị khóa' });
    }

    // Loại bỏ password_hash trước khi gắn thông tin user vào request
    const { password_hash, ...userInfo } = user;
    req.user = userInfo;
    
    next();
  } catch (error) {
    console.error('Lỗi xác thực middleware:', error);
    res.status(500).json({ message: 'Lỗi xác thực hệ thống bên trong' });
  }
};

/**
 * Middleware: Yêu cầu quyền quản trị viên (ADMIN)
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Truy cập bị từ chối: Quyền quản trị viên hệ thống là bắt buộc' });
  }
  next();
};

/**
 * Middleware to authenticate JWT token from request headers (decoded payload only)
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

/**
 * Middleware to restrict access based on user roles
 * @param {Array<string>} allowedRoles - List of allowed roles
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return sendError(res, 401, 'Unauthorized: User role not found');
    }

    const userRole = req.user.role.toUpperCase();
    const hasRole = allowedRoles.some(role => role.toUpperCase() === userRole);

    if (!hasRole) {
      return sendError(res, 403, 'Forbidden: You do not have permission to access this resource');
    }

    next();
  };
};

