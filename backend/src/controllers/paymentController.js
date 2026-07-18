import db from '../db/knex.js';
import { paymentService } from '../services/paymentService.js';

/**
 * Lấy danh sách gói thanh toán theo Role
 */
export const getPackages = async (req, res) => {
  try {
    const role = req.user?.role?.toUpperCase() === 'HR' ? 'HR' : 'CANDIDATE';
    const db = (await import('../db/knex.js')).default;
    
    const packages = await db('packages')
      .where({ is_active: true, target_role: role })
      .orderBy('sort_order', 'asc');

    return res.status(200).json({
      success: true,
      data: packages
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách packages:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi tải gói cước.'
    });
  }
};

/**
 * Controller xử lý các yêu cầu thanh toán
 */
export const createPaymentUrl = async (req, res) => {
  try {
    const { packageId } = req.body;
    const userId = req.user.id; // Lấy từ authMiddleware (authenticateToken)
    
    // Thu thập địa chỉ IP của client
    const ipAddr = 
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    if (!packageId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin gói cước (packageId).'
      });
    }

    const paymentUrl = await paymentService.createVnpayUrl({
      userId,
      packageId: parseInt(packageId),
      ipAddr
    });

    return res.status(200).json({
      success: true,
      paymentUrl
    });
  } catch (error) {
    console.error('Lỗi khi khởi tạo URL thanh toán VNPAY:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi khởi tạo thanh toán.'
    });
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN-ONLY CONTROLLERS
// ─────────────────────────────────────────────────────────────

/**
 * [Admin] Lấy tất cả gói dịch vụ (Candidate + HR) kèm metric bán hàng.
 * Dùng Subquery thay vì LEFT JOIN để tránh Table Scan gây nghẽn DB khi transactions lớn.
 */
export const getAllPackagesForAdmin = async (req, res) => {
  try {
    const packages = await db('packages as p')
      .select([
        'p.*',
        // Subquery: DB engine sẽ dùng idx_transactions_package_status để Index Scan
        db('transactions as t')
          .count('t.id')
          .whereRaw('t.package_id = p.id')
          .andWhere('t.status', 'COMPLETED')
          .as('total_sold')
      ])
      .orderBy('p.target_role', 'asc')
      .orderBy('p.sort_order', 'asc');

    return res.status(200).json({
      success: true,
      data: packages
    });
  } catch (error) {
    console.error('[Admin] Lỗi khi lấy danh sách packages:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi tải danh sách gói dịch vụ.'
    });
  }
};

/**
 * [Admin] Bật/Tắt trạng thái gói dịch vụ — RPC-style, an toàn.
 * Backend tự đảo ngược is_active, dùng Row-level Lock (.forUpdate) để
 * chống race condition khi 2 admin click đồng thời.
 */
export const togglePackageStatus = async (req, res) => {
  const { id } = req.params;
  const packageId = parseInt(id);

  if (!packageId || isNaN(packageId)) {
    return res.status(400).json({ success: false, message: 'Package ID không hợp lệ.' });
  }

  try {
    const updatedData = await db.transaction(async (trx) => {
      // Lock dòng này để tránh race condition khi 2 admin click toggle cùng lúc
      const pkg = await trx('packages').where({ id: packageId }).forUpdate().first();
      if (!pkg) return null;

      const nextState = !pkg.is_active;
      await trx('packages').where({ id: packageId }).update({
        is_active: nextState,
        updated_at: new Date()
      });

      return { id: packageId, is_active: nextState, name: pkg.name };
    });

    if (!updatedData) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gói dịch vụ.' });
    }

    return res.status(200).json({
      success: true,
      message: `Gói "${updatedData.name}" đã được ${updatedData.is_active ? 'kích hoạt' : 'tắt'} thành công.`,
      data: updatedData
    });
  } catch (error) {
    console.error('[Admin] Lỗi khi toggle trạng thái package:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi cập nhật trạng thái gói.'
    });
  }
};

/**
 * [Admin] Lấy lịch sử giao dịch toàn hệ thống — có pagination bắt buộc.
 * Trả về snapshot_package để bảo toàn lịch sử khi tên/giá gói thay đổi sau này.
 */
export const getTransactionsForAdmin = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const { user_type, status, search } = req.query;

    // Build base query
    let query = db('transactions as t')
      .join('users as u', 'u.id', 't.user_id')
      .select([
        't.id',
        't.transaction_code',
        't.amount',
        't.currency',
        't.status',
        't.payment_method',
        't.snapshot_package',
        't.paid_at',
        't.created_at',
        'u.id as user_id',
        'u.full_name as user_name',
        'u.email as user_email',
        'u.role as user_type'
      ])
      .orderBy('t.created_at', 'desc');

    // Apply filters
    if (user_type) {
      query = query.whereRaw('UPPER(u.role) = ?', [user_type.toUpperCase()]);
    }
    if (status) {
      query = query.whereRaw('UPPER(t.status) = ?', [status.toUpperCase()]);
    }
    if (search) {
      query = query.where((builder) => {
        builder
          .whereILike('u.full_name', `%${search}%`)
          .orWhereILike('u.email', `%${search}%`)
          .orWhereILike('t.transaction_code', `%${search}%`);
      });
    }

    // Run count and paginated data concurrently
    const [countResult, rows] = await Promise.all([
      query.clone().clearSelect().clearOrder().count('t.id as total').first(),
      query.limit(limit).offset(offset)
    ]);

    const total = parseInt(countResult?.total || 0);
    const totalPages = Math.ceil(total / limit);

    // Parse snapshot_package JSON safely for each row
    const data = rows.map((row) => {
      let snapshot = null;
      if (row.snapshot_package) {
        try {
          snapshot = typeof row.snapshot_package === 'string'
            ? JSON.parse(row.snapshot_package)
            : row.snapshot_package;
        } catch {
          snapshot = null;
        }
      }
      return { ...row, snapshot_package: snapshot };
    });

    return res.status(200).json({
      success: true,
      data,
      meta: { total, page, limit, totalPages }
    });
  } catch (error) {
    console.error('[Admin] Lỗi khi lấy lịch sử giao dịch:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi tải lịch sử giao dịch.'
    });
  }
};

/**
 * [Admin] Cập nhật giá của một gói dịch vụ.
 * Validate giá > 0, dùng db.transaction + forUpdate để đảm bảo tính nhất quán.
 * Snapshot_package đã lưu trong transactions sẽ KHÔNG bị ảnh hưởng (bảo toàn lịch sử).
 */
export const updatePackagePrice = async (req, res) => {
  const { id } = req.params;
  const packageId = parseInt(id);
  const { price } = req.body;

  if (!packageId || isNaN(packageId)) {
    return res.status(400).json({ success: false, message: 'Package ID không hợp lệ.' });
  }

  const newPrice = parseFloat(price);
  if (isNaN(newPrice) || newPrice < 0) {
    return res.status(400).json({ success: false, message: 'Giá phải là số không âm.' });
  }

  try {
    const updatedData = await db.transaction(async (trx) => {
      const pkg = await trx('packages').where({ id: packageId }).forUpdate().first();
      if (!pkg) return null;

      await trx('packages').where({ id: packageId }).update({
        price: newPrice,
        updated_at: new Date()
      });

      return { id: packageId, name: pkg.name, price: newPrice };
    });

    if (!updatedData) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gói dịch vụ.' });
    }

    return res.status(200).json({
      success: true,
      message: `Đã cập nhật giá gói "${updatedData.name}" thành ${Number(newPrice).toLocaleString('vi-VN')}đ.`,
      data: updatedData
    });
  } catch (error) {
    console.error('[Admin] Lỗi khi cập nhật giá package:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi cập nhật giá gói.'
    });
  }
};

/**
 * Xử lý callback IPN từ VNPAY (API Public gọi ngầm từ VNPAY)
 */
export const handleVnpayIpn = async (req, res) => {
  try {
    const vnpParams = { ...req.query };
    
    // Xử lý IPN và nhận về kết quả chuẩn VNPAY (RspCode, Message)
    const result = await paymentService.processVnpayIpn(vnpParams);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Lỗi khi xử lý VNPAY IPN Controller:', error);
    return res.status(500).json({
      RspCode: '99',
      Message: 'Lỗi hệ thống không xác định'
    });
  }
};
