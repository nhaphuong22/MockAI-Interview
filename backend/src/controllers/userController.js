import db from '../db/knex.js';
import bcrypt from 'bcryptjs';

// Hàm hỗ trợ ánh xạ vai trò từ DB -> Client
const mapRoleToClient = (dbRole) => {
  if (dbRole === 'ADMIN') return 'Admin';
  if (dbRole === 'HR') return 'Recruiter';
  return 'Candidate';
};

// Hàm hỗ trợ ánh xạ vai trò từ Client -> DB
const mapRoleToDb = (clientRole) => {
  if (clientRole === 'Admin') return 'ADMIN';
  if (clientRole === 'Recruiter') return 'HR';
  return 'USER';
};

/**
 * 1. Lấy danh sách toàn bộ người dùng (Phân trang, Tìm kiếm, Lọc)
 * GET /api/users
 */
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { search, role, status } = req.query;

    // Khởi tạo truy vấn cơ bản
    const query = db('users')
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

    res.status(200).json({
      users: formattedUsers,
      pagination: {
        totalItems: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
        limit
      }
    });

  } catch (error) {
    console.error('Lỗi khi lấy danh sách user:', error);
    res.status(500).json({ message: 'Không thể lấy danh sách người dùng' });
  }
};

/**
 * 2. Lấy thông tin chi tiết một người dùng
 * GET /api/users/:id
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db('users')
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
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const formattedUser = {
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

    res.status(200).json(formattedUser);
  } catch (error) {
    console.error('Lỗi lấy chi tiết user:', error);
    res.status(500).json({ message: 'Lỗi truy vấn thông tin người dùng' });
  }
};

/**
 * 3. Tạo mới một người dùng (Admin tạo)
 * POST /api/users
 */
export const createUser = async (req, res) => {
  try {
    const { email, password, full_name, role, phone, address } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email và Mật khẩu là bắt buộc' });
    }

    // Kiểm tra email trùng lặp
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ message: 'Email này đã tồn tại trên hệ thống' });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const dbRoleName = mapRoleToDb(role || 'Candidate');

    // Thực hiện transaction để đảm bảo toàn vẹn dữ liệu ở cả bảng users và user_roles
    const newUser = await db.transaction(async (trx) => {
      // 1. Thêm vào bảng users
      const [insertedUser] = await trx('users')
        .insert({
          email,
          password_hash,
          full_name,
          phone,
          address,
          role: dbRoleName, // Đồng bộ trường role cũ
          is_active: true,
          email_verified: true,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');

      // 2. Lấy role ID từ bảng roles
      const roleRecord = await trx('roles').where({ name: dbRoleName }).first();
      if (!roleRecord) {
        throw new Error(`Vai trò ${dbRoleName} không tồn tại trên hệ thống`);
      }

      // 3. Gán quyền vào bảng user_roles
      await trx('user_roles').insert({
        user_id: insertedUser.id,
        role_id: roleRecord.id,
        created_at: new Date(),
        updated_at: new Date()
      });

      return insertedUser;
    });

    res.status(201).json({
      message: 'Tạo tài khoản thành công',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.full_name,
        role: role || 'Candidate'
      }
    });

  } catch (error) {
    console.error('Lỗi khi tạo user:', error);
    res.status(500).json({ message: error.message || 'Không thể tạo tài khoản mới' });
  }
};

/**
 * 4. Cập nhật thông tin người dùng (Bao gồm gán vai trò)
 * PUT /api/users/:id
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, bio, address, dateOfBirth, role } = req.body;

    const user = await db('users').where({ id }).first();
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const dbRoleName = role ? mapRoleToDb(role) : null;

    await db.transaction(async (trx) => {
      // 1. Cập nhật bảng users
      const updateData = {
        updated_at: new Date()
      };
      if (name !== undefined) updateData.full_name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (bio !== undefined) updateData.bio = bio;
      if (address !== undefined) updateData.address = address;
      if (dateOfBirth !== undefined) updateData.date_of_birth = dateOfBirth ? new Date(dateOfBirth) : null;
      if (dbRoleName) updateData.role = dbRoleName; // Đồng bộ hóa trường role cũ

      await trx('users').where({ id }).update(updateData);

      // 2. Nếu có đổi vai trò, thực hiện đổi trong bảng user_roles
      if (dbRoleName) {
        const roleRecord = await trx('roles').where({ name: dbRoleName }).first();
        if (!roleRecord) {
          throw new Error('Vai trò cung cấp không hợp lệ');
        }

        // Xóa phân quyền cũ của user
        await trx('user_roles').where({ user_id: id }).del();

        // Gán phân quyền mới
        await trx('user_roles').insert({
          user_id: id,
          role_id: roleRecord.id,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    });

    res.status(200).json({ message: 'Cập nhật thông tin người dùng thành công' });

  } catch (error) {
    console.error('Lỗi cập nhật thông tin user:', error);
    res.status(500).json({ message: error.message || 'Không thể cập nhật thông tin' });
  }
};

/**
 * 5. Khóa hoặc kích hoạt lại tài khoản người dùng
 * PATCH /api/users/:id/status
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db('users').where({ id }).first();
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Toggle trạng thái is_active
    const newStatus = !user.is_active;

    await db('users').where({ id }).update({
      is_active: newStatus,
      updated_at: new Date()
    });

    res.status(200).json({
      message: newStatus ? 'Kích hoạt tài khoản thành công' : 'Đã khóa tài khoản thành công',
      is_active: newStatus
    });

  } catch (error) {
    console.error('Lỗi khi khóa/kích hoạt user:', error);
    res.status(500).json({ message: 'Không thể cập nhật trạng thái tài khoản' });
  }
};

/**
 * 6. Xóa người dùng ra khỏi hệ thống
 * DELETE /api/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Ngăn chặn admin tự xóa chính mình
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Bạn không thể tự xóa tài khoản quản trị viên hiện tại của mình!' });
    }

    const user = await db('users').where({ id }).first();
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Xóa user (database sẽ tự động cascade xóa liên kết ở user_roles, cvs, interviews...)
    await db('users').where({ id }).del();

    res.status(200).json({ message: 'Xóa tài khoản người dùng ra khỏi hệ thống thành công' });

  } catch (error) {
    console.error('Lỗi khi xóa user:', error);
    res.status(500).json({ message: 'Không thể xóa tài khoản này' });
  }
};
