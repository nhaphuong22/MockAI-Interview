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
    const { packageId, couponCode } = req.body;
    const userId = req.user.id; // Lấy từ authMiddleware (authenticateToken)
    const role = req.user?.role?.toUpperCase() === 'HR' ? 'HR' : 'CANDIDATE';

    // Thu thập địa chỉ IP của client (chuẩn hóa IPv4 cho Vercel Serverless)
    let rawIp =
      req.headers['x-forwarded-for'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      '127.0.0.1';
    
    if (typeof rawIp === 'string' && rawIp.includes(',')) {
      rawIp = rawIp.split(',')[0].trim();
    }
    if (typeof rawIp === 'string' && rawIp.includes('::ffff:')) {
      rawIp = rawIp.replace('::ffff:', '');
    }
    const ipAddr = typeof rawIp === 'string' && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(rawIp) ? rawIp : '127.0.0.1';

    if (!packageId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin gói cước (packageId).'
      });
    }

    const result = await paymentService.createVnpayUrl({
      userId,
      packageId: parseInt(packageId),
      couponCode: couponCode ? couponCode.trim().toUpperCase() : null,
      ipAddr,
      role
    });

    if (result.isFreeActivation) {
      return res.status(200).json({
        success: true,
        isFreeActivation: true,
        message: 'Gói cước đã được kích hoạt thành công.'
      });
    }

    return res.status(200).json({
      success: true,
      paymentUrl: result.paymentUrl
    });
  } catch (error) {
    console.error('Lỗi khi khởi tạo URL thanh toán VNPAY:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi khởi tạo thanh toán.'
    });
  }
};

/**
 * Endpoint kiểm tra mã giảm giá
 */
export const validateCoupon = async (req, res) => {
  try {
    const { code, packageId } = req.body;
    const role = req.user?.role?.toUpperCase() === 'HR' ? 'HR' : 'CANDIDATE';

    if (!code || !packageId) {
      return res.status(400).json({ success: false, message: 'Thiếu mã giảm giá hoặc ID gói cước.' });
    }

    const db = (await import('../db/knex.js')).default;
    const targetPackage = await db('packages').where({ id: parseInt(packageId), is_active: true, target_role: role }).first();
    if (!targetPackage) {
      return res.status(404).json({ success: false, message: 'Gói cước không tồn tại hoặc đã bị ẩn.' });
    }

    const coupon = await db('coupons')
      .where({ code: code.trim().toUpperCase(), is_active: true, is_deleted: false })
      .first();

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.' });
    }

    // Role check
    if (coupon.applicable_to !== 'ALL' && coupon.applicable_to !== role) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá không áp dụng cho loại tài khoản của bạn.' });
    }

    // Expiry check
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết hạn.' });
    }

    // Usage limit check
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã đạt giới hạn sử dụng.' });
    }

    // Calculate discount
    const packagePrice = parseFloat(targetPackage.price);
    let discountAmount = (packagePrice * coupon.discount_percent) / 100;

    if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
      discountAmount = coupon.max_discount_amount;
    }

    const finalPrice = Math.max(0, packagePrice - discountAmount);

    return res.status(200).json({
      success: true,
      data: {
        code: coupon.code,
        discount_percent: coupon.discount_percent,
        discount_amount: discountAmount,
        final_price: finalPrice
      }
    });
  } catch (error) {
    console.error('Lỗi khi validate coupon:', error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi kiểm tra mã giảm giá.' });
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
      .leftJoin('user_roles as ur', 'u.id', 'ur.user_id')
      .leftJoin('roles as r', 'ur.role_id', 'r.id')
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
        'r.name as user_type'
      ])
      .orderBy('t.created_at', 'desc');

    // Apply filters
    if (user_type) {
      query = query.whereRaw('UPPER(r.name) = ?', [user_type.toUpperCase()]);
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

// ─────────────────────────────────────────────────────────────
// ADMIN COUPON CONTROLLERS
// ─────────────────────────────────────────────────────────────

/**
 * [Admin] Lấy danh sách mã giảm giá (chưa bị xóa mềm)
 */
export const getCouponsForAdmin = async (req, res) => {
  try {
    const coupons = await db('coupons')
      .where({ is_deleted: false })
      .orderBy('created_at', 'desc');
    return res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    console.error('[Admin] Lỗi khi lấy danh sách coupons:', error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi tải mã giảm giá.' });
  }
};

/**
 * [Admin] Tạo mã giảm giá mới
 */
export const createCoupon = async (req, res) => {
  try {
    const { code, discount_percent, max_discount_amount, usage_limit, applicable_to, expires_at } = req.body;

    if (!code || !discount_percent) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mã và phần trăm giảm giá' });
    }

    const formattedCode = code.trim().toUpperCase();
    const discount = parseInt(discount_percent);

    // Validate percent
    if (isNaN(discount) || discount < 1 || discount > 100) {
      return res.status(400).json({ success: false, message: 'Phần trăm giảm giá phải từ 1 đến 100' });
    }

    // Kiểm tra trùng mã (trên các mã chưa bị xóa mềm)
    const existing = await db('coupons')
      .where({ code: formattedCode, is_deleted: false })
      .first();

    if (existing) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá này đã tồn tại trên hệ thống' });
    }

    // Validate date
    let expDate = null;
    if (expires_at) {
      expDate = new Date(expires_at);
      if (expDate <= new Date()) {
        return res.status(400).json({ success: false, message: 'Ngày hết hạn phải lớn hơn ngày hiện tại' });
      }
    }

    const [newId] = await db('coupons').insert({
      code: formattedCode,
      discount_percent: discount,
      max_discount_amount: max_discount_amount ? parseInt(max_discount_amount) : null,
      usage_limit: usage_limit ? parseInt(usage_limit) : null,
      applicable_to: applicable_to || 'ALL',
      expires_at: expDate
    }).returning('id');

    return res.status(201).json({ success: true, id: newId?.id || newId });
  } catch (error) {
    console.error('[Admin] Lỗi khi tạo coupon:', error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi tạo mã giảm giá.' });
  }
};

/**
 * [Admin] Bật/Tắt trạng thái coupon
 */
export const toggleCouponStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedData = await db.transaction(async (trx) => {
      const coupon = await trx('coupons').where({ id, is_deleted: false }).forUpdate().first();
      if (!coupon) return null;

      const nextState = !coupon.is_active;
      await trx('coupons').where({ id }).update({
        is_active: nextState,
        updated_at: new Date()
      });

      return { id, is_active: nextState, code: coupon.code };
    });

    if (!updatedData) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá' });
    }

    return res.status(200).json({
      success: true,
      message: `Mã "${updatedData.code}" đã được ${updatedData.is_active ? 'bật' : 'tắt'} thành công.`,
      data: updatedData
    });
  } catch (error) {
    console.error('[Admin] Lỗi khi toggle trạng thái coupon:', error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi cập nhật trạng thái.' });
  }
};

/**
 * [Admin] Soft delete coupon
 */
export const deleteCoupon = async (req, res) => {
  const { id } = req.params;

  try {
    const coupon = await db('coupons').where({ id, is_deleted: false }).first();
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá' });
    }

    await db('coupons').where({ id }).update({
      is_deleted: true,
      is_active: false,
      updated_at: new Date()
    });

    return res.json({ success: true, message: 'Xóa mã giảm giá thành công (Soft Delete)' });
  } catch (error) {
    console.error('[Admin] Lỗi khi xóa coupon:', error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi xóa mã giảm giá.' });
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
