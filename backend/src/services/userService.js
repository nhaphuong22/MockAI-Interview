import db from '../db/knex.js';
import { deleteCachePattern } from '../config/redis.js';
import bcrypt from 'bcryptjs';
import { mapRoleToClient, mapRoleToDb, ROLES } from '../data/roles.js';
import { 
  findById, 
  findByEmail, 
  insertUser, 
  updateUser, 
  deleteUser, 
  assignRole, 
  removeRoles,
  getBaseQuery
} from '../models/userModel.js';
import { NotFoundError, ValidationError } from '../core/customErrors.js';

/**
 * Lấy danh sách toàn bộ người dùng kèm phân trang, tìm kiếm và lọc
 */
export const fetchUsersList = async ({ page = 1, limit = 10, search, role, status }) => {
  const offset = (page - 1) * limit;

  // Sử dụng getBaseQuery() từ userModel thay vì truy vấn Knex thô
  const query = getBaseQuery()
    .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
    .leftJoin('roles', 'user_roles.role_id', 'roles.id')
    .select([
      'users.id',
      'users.email',
      'users.full_name',
      'users.phone',
      'users.avatar_url',
      'users.is_active',
      'users.created_at',
      'roles.name as db_role',
      db.raw('(SELECT COALESCE(MAX(ats_score), 0) FROM cvs WHERE cvs.user_id = users.id) as cv_score'),
      db.raw('(SELECT COUNT(*) FROM interviews WHERE interviews.user_id = users.id) as interview_count'),
      db.raw("(SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE transactions.user_id = users.id AND transactions.status = 'COMPLETED') as total_paid")
    ]);

  // Áp dụng tìm kiếm theo tên hoặc email
  if (search) {
    query.where((builder) => {
      builder.where('users.full_name', 'ILIKE', `%${search}%`)
             .orWhere('users.email', 'ILIKE', `%${search}%`);
    });
  }

  // Áp dụng bộ lọc Vai trò (Role)
  if (role && role !== 'All') {
    const dbRole = mapRoleToDb(role);
    query.where('roles.name', dbRole);
  }

  // Áp dụng bộ lọc Trạng thái (Status)
  if (status && status !== 'All') {
    const isActive = status === 'Active';
    query.where('users.is_active', isActive);
  }

  // Nhân bản query để đếm tổng số bản ghi trước khi phân trang
  const countQuery = db.select(db.raw('COUNT(*) as total')).from(query.as('subquery')).first();
  const countResult = await countQuery;
  const totalUsers = parseInt(countResult?.total || 0);

  // Lấy dữ liệu với phân trang và sắp xếp mới nhất lên đầu
  const users = await query
    .orderBy('users.created_at', 'desc')
    .limit(limit)
    .offset(offset);

  // Ánh xạ dữ liệu để trả về định dạng Front-end mong muốn
  const formattedUsers = users.map(user => ({
    id: user.id,
    name: user.full_name || 'Chưa Cập Nhật',
    email: user.email,
    avatar: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
    role: mapRoleToClient(user.db_role),
    status: user.is_active ? 'Active' : 'Banned',
    joinDate: new Date(user.created_at).toISOString().split('T')[0],
    cvScore: parseInt(user.cv_score),
    interviewCount: parseInt(user.interview_count),
    totalPaid: parseInt(user.total_paid).toLocaleString('vi-VN') + 'đ'
  }));

  return {
    users: formattedUsers,
    pagination: {
      totalItems: totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      limit
    }
  };
};

/**
 * Lấy thông tin chi tiết một người dùng
 */
export const fetchUserDetail = async (id) => {
  const user = await getBaseQuery()
    .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
    .leftJoin('roles', 'user_roles.role_id', 'roles.id')
    .select([
      'users.*',
      'roles.name as db_role',
      db.raw('(SELECT COALESCE(MAX(ats_score), 0) FROM cvs WHERE cvs.user_id = users.id) as cv_score'),
      db.raw('(SELECT COUNT(*) FROM interviews WHERE interviews.user_id = users.id) as interview_count'),
      db.raw("(SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE transactions.user_id = users.id AND transactions.status = 'COMPLETED') as total_paid")
    ])
    .where('users.id', id)
    .first();

  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng');
  }

  return {
    id: user.id,
    name: user.full_name || 'Chưa Cập Nhật',
    email: user.email,
    phone: user.phone || '',
    avatar: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
    role: mapRoleToClient(user.db_role),
    status: user.is_active ? 'Active' : 'Banned',
    joinDate: new Date(user.created_at).toISOString().split('T')[0],
    cvScore: parseInt(user.cv_score),
    interviewCount: parseInt(user.interview_count),
    totalPaid: parseInt(user.total_paid).toLocaleString('vi-VN') + 'đ',
    bio: user.bio || '',
    address: user.address || '',
    dateOfBirth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : ''
  };
};

/**
 * Tạo mới một người dùng (Admin tạo)
 */
export const createNewUser = async ({ email, password, full_name, role, phone, address }) => {
  // Kiểm tra email trùng lặp qua userModel
  const existingUser = await findByEmail(email);
  if (existingUser) {
    throw new ValidationError('Email này đã tồn tại trên hệ thống');
  }

  // Mã hóa mật khẩu
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const dbRoleName = mapRoleToDb(role || 'Candidate');

  // Thực hiện transaction qua các Model
  const newUser = await db.transaction(async (trx) => {
    // 1. Thêm vào bảng users qua userModel
    const [insertedUser] = await insertUser({
      email,
      password_hash,
      full_name,
      phone,
      address,
      is_active: true,
      email_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    }, trx);

    // 2. Lấy role ID từ bảng roles
    const roleRecord = await trx('roles').where({ name: dbRoleName }).first();
    if (!roleRecord) {
      throw new ValidationError(`Vai trò ${dbRoleName} không tồn tại trên hệ thống`);
    }

    // 3. Gán quyền vào bảng user_roles qua userModel
    await assignRole(insertedUser.id, roleRecord.id, trx);

    return insertedUser;
  });

  // Clear Users list cache
  await deleteCachePattern('users:list:*');

  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.full_name,
    role: role || 'Candidate'
  };
};

/**
 * Cập nhật thông tin người dùng
 */
export const updateUserDetail = async (id, { name, phone, bio, address, dateOfBirth, role }) => {
  const user = await findById(id);
  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng');
  }

  const dbRoleName = role ? mapRoleToDb(role) : null;

  await db.transaction(async (trx) => {
    // 1. Cập nhật bảng users qua userModel
    const updateData = {
      updated_at: new Date()
    };
    if (name !== undefined) updateData.full_name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (address !== undefined) updateData.address = address;
    if (dateOfBirth !== undefined) updateData.date_of_birth = dateOfBirth ? new Date(dateOfBirth) : null;

    await updateUser(id, updateData, trx);

    // 2. Nếu có đổi vai trò, thực hiện đổi trong bảng user_roles
    if (dbRoleName) {
      const roleRecord = await trx('roles').where({ name: dbRoleName }).first();
      if (!roleRecord) {
        throw new ValidationError('Vai trò cung cấp không hợp lệ');
      }

      // Xóa phân quyền cũ của user qua userModel
      await removeRoles(id, trx);

      // Gán phân quyền mới qua userModel
      await assignRole(id, roleRecord.id, trx);
    }
  });

  // Clear Users list cache
  await deleteCachePattern('users:list:*');

  return true;
};

/**
 * Khóa hoặc kích hoạt lại tài khoản người dùng
 */
export const toggleStatus = async (id, adminUserId) => {
  if (parseInt(id) === adminUserId) {
    throw new ValidationError('Bạn không thể tự khóa hoặc vô hiệu hóa tài khoản quản trị viên hiện tại của mình!');
  }

  const user = await findById(id);
  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng');
  }

  const newStatus = !user.is_active;

  await updateUser(id, {
    is_active: newStatus,
    updated_at: new Date()
  });

  // Clear Users list cache
  await deleteCachePattern('users:list:*');

  return newStatus;
};

/**
 * Xóa người dùng ra khỏi hệ thống
 */
export const removeUser = async (id, adminUserId) => {
  if (parseInt(id) === adminUserId) {
    throw new ValidationError('Bạn không thể tự xóa tài khoản quản trị viên hiện tại của mình!');
  }

  const user = await findById(id);
  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng');
  }

  await deleteUser(id);

  // Clear Users list cache
  await deleteCachePattern('users:list:*');

  return true;
};
