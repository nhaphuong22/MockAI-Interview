import { 
  fetchUsersList, 
  fetchUserDetail, 
  createNewUser, 
  updateUserDetail, 
  toggleStatus, 
  removeUser 
} from '../services/userService.js';

/**
 * 1. Lấy danh sách toàn bộ người dùng (Phân trang, Tìm kiếm, Lọc)
 * GET /api/users
 */
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { search, role, status } = req.query;

    const result = await fetchUsersList({ page, limit, search, role, status });
    return res.status(200).json(result);

  } catch (error) {
    console.error('Lỗi khi lấy danh sách user:', error);
    return res.status(500).json({ message: 'Không thể lấy danh sách người dùng' });
  }
};

/**
 * 2. Lấy thông tin chi tiết một người dùng
 * GET /api/users/:id
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const formattedUser = await fetchUserDetail(Number(id));
    return res.status(200).json(formattedUser);

  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    console.error('Lỗi lấy chi tiết user:', error);
    return res.status(500).json({ message: 'Lỗi truy vấn thông tin người dùng' });
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

    const result = await createNewUser({ email, password, full_name, role, phone, address });
    return res.status(201).json({
      message: 'Tạo tài khoản thành công',
      user: result
    });

  } catch (error) {
    if (error.message === 'Email này đã tồn tại trên hệ thống') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Lỗi khi tạo user:', error);
    return res.status(500).json({ message: error.message || 'Không thể tạo tài khoản mới' });
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

    await updateUserDetail(Number(id), { name, phone, bio, address, dateOfBirth, role });
    return res.status(200).json({ message: 'Cập nhật thông tin người dùng thành công' });

  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    console.error('Lỗi cập nhật thông tin user:', error);
    return res.status(500).json({ message: error.message || 'Không thể cập nhật thông tin' });
  }
};

/**
 * 5. Khóa hoặc kích hoạt lại tài khoản người dùng
 * PATCH /api/users/:id/status
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const adminUserId = req.user.id;

    const newStatus = await toggleStatus(Number(id), adminUserId);
    return res.status(200).json({
      message: newStatus ? 'Kích hoạt tài khoản thành công' : 'Đã khóa tài khoản thành công',
      is_active: newStatus
    });

  } catch (error) {
    if (
      error.message === 'Bạn không thể tự khóa hoặc vô hiệu hóa tài khoản quản trị viên hiện tại của mình!'
    ) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'User not found') {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    console.error('Lỗi khi khóa/kích hoạt user:', error);
    return res.status(500).json({ message: 'Không thể cập nhật trạng thái tài khoản' });
  }
};

/**
 * 6. Xóa người dùng ra khỏi hệ thống
 * DELETE /api/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminUserId = req.user.id;

    await removeUser(Number(id), adminUserId);
    return res.status(200).json({ message: 'Xóa tài khoản người dùng ra khỏi hệ thống thành công' });

  } catch (error) {
    if (
      error.message === 'Bạn không thể tự xóa tài khoản quản trị viên hiện tại của mình!'
    ) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'User not found') {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    console.error('Lỗi khi xóa user:', error);
    return res.status(500).json({ message: 'Không thể xóa tài khoản này' });
  }
};
