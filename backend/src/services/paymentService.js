import crypto from 'crypto';
import db from '../db/knex.js';

// Hàm sắp xếp tham số chuẩn của VNPAY (chuyển %20 thành +)
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

// Helper to format date as YYYYMMDDHHmmss in GMT+7 (Asia/Ho_Chi_Minh timezone)
function getVnpayDateFormat(date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(date);
  const partValues = {};
  parts.forEach(p => {
    partValues[p.type] = p.value;
  });
  
  return `${partValues.year}${partValues.month}${partValues.day}${partValues.hour}${partValues.minute}${partValues.second}`;
}

/**
 * Service xử lý thanh toán VNPAY
 */
export const paymentService = {
  /**
   * Tạo URL thanh toán VNPAY
   * @param {Object} params
   * @param {number} params.userId - ID người dùng
   * @param {number} params.packageId - ID gói cước muốn mua
   * @param {string} params.ipAddr - Địa chỉ IP của client
   * @returns {Promise<string>} URL thanh toán VNPAY
   */
  createVnpayUrl: async ({ userId, packageId, couponCode, ipAddr, role }) => {
    // 1. Kiểm tra gói cước tồn tại
    const targetPackage = await db('packages').where({ id: packageId, is_active: true }).first();
    if (!targetPackage) {
      throw new Error('Gói cước không tồn tại hoặc đã bị ẩn.');
    }

    // Xác thực vai trò người mua
    const userRoleRecord = await db('user_roles')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .where('user_roles.user_id', userId)
      .select('roles.name')
      .first();
    const userRole = userRoleRecord ? userRoleRecord.name : 'USER';

    if (targetPackage.target_role === 'HR' && userRole !== 'HR') {
      throw new Error('Gói cước này chỉ dành cho Nhà tuyển dụng (HR).');
    }
    if (targetPackage.target_role === 'CANDIDATE' && userRole !== 'USER' && userRole !== 'CANDIDATE') {
      throw new Error('Gói cước này chỉ dành cho Ứng viên (Candidate).');
    }

    // Edge case: Mua gói BUSINESS mà chưa có công ty
    if (targetPackage.name === 'BUSINESS' && targetPackage.target_role === 'HR') {
      const user = await db('users').where({ id: userId }).first();
      if (!user || !user.company_id) {
        throw new Error('Bạn phải tạo hoặc gia nhập một doanh nghiệp trước khi mua gói BUSINESS.');
      }
    }

    let amount = parseFloat(targetPackage.price);
    let appliedCoupon = null;
    let discountAmount = 0;

    // 2. Kiểm tra Coupon (nếu có)
    if (couponCode) {
      const formattedCode = couponCode.trim().toUpperCase();
      const coupon = await db('coupons')
        .where({ code: formattedCode, is_active: true, is_deleted: false })
        .first();

      if (!coupon) {
        throw new Error('Mã giảm giá không hợp lệ hoặc đã bị vô hiệu hóa.');
      }

      if (coupon.applicable_to !== 'ALL' && coupon.applicable_to !== role) {
        throw new Error('Mã giảm giá không áp dụng cho loại tài khoản của bạn.');
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        throw new Error('Mã giảm giá đã hết hạn.');
      }

      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        throw new Error('Mã giảm giá đã đạt giới hạn sử dụng.');
      }

      appliedCoupon = coupon;
      discountAmount = (amount * coupon.discount_percent) / 100;
      
      if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
        discountAmount = coupon.max_discount_amount;
      }
      
      amount = Math.max(0, amount - discountAmount);
    }

    if (parseFloat(targetPackage.price) === 0) {
      throw new Error('Gói cước miễn phí không cần thanh toán qua cổng VNPAY.');
    }

    // Nếu giá sau giảm là 0đ, kích hoạt luôn, không gọi VNPAY
    if (amount === 0) {
      const transactionCode = `FREE${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
      
      await db.transaction(async (trx) => {
        // Tăng usage count của coupon an toàn
        if (appliedCoupon) {
          await trx('coupons')
            .where({ id: appliedCoupon.id })
            .increment('used_count', 1);
        }

        const snapshotBase = {
          package_id: targetPackage.id,
          name: targetPackage.name,
          price_at_purchase: Number(targetPackage.price)
        };
        const snapshotPackage = targetPackage.target_role === 'HR'
          ? {
              ...snapshotBase,
              package_type: 'CREDIT_BUNDLE',
              total_credits: targetPackage.total_credits,
              credit_expiry_days: targetPackage.credit_expiry_days,
              price_per_credit_at_purchase: targetPackage.total_credits > 0
                ? Math.round(Number(targetPackage.price) / targetPackage.total_credits)
                : 0
            }
          : {
              ...snapshotBase,
              package_type: 'SUBSCRIPTION',
              duration_days: targetPackage.duration_days,
              ats_scan_limit: targetPackage.ats_scan_limit,
              ai_practice_limit: targetPackage.ai_practice_limit,
              ai_cover_letter_limit: targetPackage.ai_cover_letter_limit,
              radar_chart_level: targetPackage.radar_chart_level
            };

        // Ghi nhận transaction COMPLETED luôn
        await trx('transactions').insert({
          user_id: userId,
          package_id: packageId,
          amount: 0,
          currency: 'VND',
          payment_method: 'FREE_COUPON',
          transaction_code: transactionCode,
          status: 'COMPLETED',
          coupon_code: appliedCoupon?.code || null,
          discount_amount: discountAmount,
          notes: 'Kích hoạt miễn phí qua mã giảm giá 100%',
          snapshot_package: JSON.stringify(snapshotPackage),
          paid_at: new Date()
        });

        // Kích hoạt quyền lợi (logic kích hoạt tương tự IPN)
        const user = await trx('users').where({ id: userId }).first();
        const now = new Date();
        const expiryDate = new Date(now.getTime() + targetPackage.duration_days * 24 * 60 * 60 * 1000);
        let creditExpiryDate = null;
        if (targetPackage.credit_expiry_days) {
          creditExpiryDate = new Date(now.getTime() + targetPackage.credit_expiry_days * 24 * 60 * 60 * 1000);
        }

        if (targetPackage.target_role === 'HR') {
          let wallet;
          if (targetPackage.name === 'BUSINESS' && user.company_id) {
            wallet = await trx('hr_wallets').where({ company_id: user.company_id }).first();
            const expiryDays = targetPackage.credit_expiry_days || 365;
            const vipExpiryDate = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000);
            await trx('companies').where({ id: user.company_id }).update({
              is_vip: true,
              vip_expired_at: vipExpiryDate,
              updated_at: now
            });
          } else {
            wallet = await trx('hr_wallets').where({ user_id: user.id }).first();
          }

          // Khởi tạo ví tự động nếu chưa tồn tại trong DB (Defensive logic)
          if (!wallet) {
            const walletInsert = targetPackage.name === 'BUSINESS' && user.company_id
              ? { company_id: user.company_id, total_credits: 0, created_at: now, updated_at: now }
              : { user_id: user.id, total_credits: 0, created_at: now, updated_at: now };
            
            const [newWallet] = await trx('hr_wallets').insert(walletInsert).returning('*');
            wallet = newWallet || { id: newWallet };
          }

          if (wallet && targetPackage.total_credits > 0) {
            const walletId = wallet.id || wallet;
            await trx('hr_wallets')
              .where({ id: walletId })
              .increment('total_credits', targetPackage.total_credits);
          }
        } else {
          const existingSub = await trx('user_subscriptions').where({ user_id: user.id }).first();
          if (existingSub) {
            const currentExpiry = existingSub.end_date && new Date(existingSub.end_date) > now
              ? new Date(existingSub.end_date)
              : now;
            const newExpiry = new Date(currentExpiry.getTime() + targetPackage.duration_days * 24 * 60 * 60 * 1000);
            await trx('user_subscriptions').where({ user_id: existingSub.user_id }).update({
              package_id: targetPackage.id,
              end_date: newExpiry,
              updated_at: now
            });
          } else {
            await trx('user_subscriptions').insert({
              user_id: user.id,
              package_id: targetPackage.id,
              start_date: now,
              end_date: expiryDate,
              created_at: now,
              updated_at: now
            });
          }
        }
      });

      return { isFreeActivation: true };
    }

    // 3. Tạo giao dịch PENDING trong database cho VNPAY
    const transactionCode = `MAI${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
    
    await db('transactions').insert({
      user_id: userId,
      package_id: packageId,
      amount: amount,
      currency: 'VND',
      payment_method: 'VNPAY',
      transaction_code: transactionCode,
      status: 'PENDING',
      coupon_code: appliedCoupon ? appliedCoupon.code : null,
      discount_amount: discountAmount,
      notes: 'Nang cap goi cuoc MockAI Pro',
    });

    // 3. Khởi tạo các tham số VNPAY
    const tmnCode = (process.env.VNPAY_TMN_CODE || '').trim();
    const secureSecret = (process.env.VNPAY_SECURE_SECRET || '').trim();
    const paymentUrl = (process.env.VNPAY_PAYMENT_URL || '').trim();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const returnUrl = `${clientUrl}/payment-success`;

    const date = new Date();
    const createDate = getVnpayDateFormat(date);

    let vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: transactionCode,
      vnp_OrderInfo: 'Nang cap goi cuoc MockAI Pro',
      vnp_OrderType: 'other',
      vnp_Amount: Math.round(amount * 100), // VNPAY yêu cầu nhân 100
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr || '127.0.0.1',
      vnp_CreateDate: createDate
    };

    // Sắp xếp và encode tham số chuẩn VNPAY
    const sortedParams = sortObject(vnpParams);
    
    // Tạo chuỗi query (không encode thêm vì sortedParams đã được encode và format +)
    const signData = Object.keys(sortedParams)
      .map((key) => `${key}=${sortedParams[key]}`)
      .join('&');

    // Tạo chữ ký bảo mật HMAC SHA512
    const hmac = crypto.createHmac('sha512', secureSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    // Tạo URL hoàn chỉnh
    const finalPaymentUrl = `${paymentUrl}?${signData}&vnp_SecureHash=${signed}`;
    return { paymentUrl: finalPaymentUrl };
  },

  /**
   * Xử lý kết quả IPN từ VNPAY gửi về ngầm
   * @param {Object} vnpParams - Các tham số nhận được từ VNPAY qua query
   * @returns {Promise<Object>} Trạng thái trả về cho VNPAY (RspCode, Message)
   */
  processVnpayIpn: async (vnpParams) => {
    try {
      const secureHash = vnpParams['vnp_SecureHash'];
      
      // Loại bỏ SecureHash và SecureHashType khỏi danh sách tham số để tính toán lại Hash
      delete vnpParams['vnp_SecureHash'];
      delete vnpParams['vnp_SecureHashType'];

      // Sắp xếp và encode chuẩn VNPAY
      const sortedParams = sortObject(vnpParams);
      
      const signData = Object.keys(sortedParams)
        .map((key) => `${key}=${sortedParams[key]}`)
        .join('&');

      const secureSecret = (process.env.VNPAY_SECURE_SECRET || '').trim();
      const hmac = crypto.createHmac('sha512', secureSecret);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

      // 1. Kiểm tra chữ ký bảo mật
      if (secureHash !== signed) {
        return { RspCode: '97', Message: 'Invalid Checksum' };
      }

      const txnRef = vnpParams['vnp_TxnRef'];
      const vnpAmount = parseFloat(vnpParams['vnp_Amount']) / 100; // Chia lại cho 100

      // 2. Tìm transaction trong DB
      const transaction = await db('transactions').where({ transaction_code: txnRef }).first();
      if (!transaction) {
        return { RspCode: '01', Message: 'Order not found' };
      }

      // 3. Kiểm tra số tiền
      if (parseFloat(transaction.amount) !== vnpAmount) {
        return { RspCode: '04', Message: 'Amount invalid' };
      }

      // 4. Kiểm tra xem đơn hàng đã được cập nhật chưa
      if (transaction.status !== 'PENDING') {
        return { RspCode: '02', Message: 'Order already confirmed' };
      }

      // 5. Kiểm tra gói có còn active không (Admin có thể đã tắt gói trong lúc user thanh toán)
      const activePackage = await db('packages').where({ id: transaction.package_id, is_active: true }).first();
      if (!activePackage) {
        // Gói đã bị tắt — abort giao dịch, không kích hoạt, ghi log để xử lý hoàn tiền thủ công
        await db('transactions').where({ id: transaction.id }).update({
          status: 'FAILED',
          notes: 'Gói dịch vụ đã bị tắt bởi Admin trong lúc thanh toán đang diễn ra.',
          updated_at: new Date()
        });
        return { RspCode: '01', Message: 'Package inactive or not found' };
      }

      // Xác thực lại vai trò người dùng tại thời điểm IPN Webhook
      const userRoleRecord = await db('user_roles')
        .join('roles', 'user_roles.role_id', 'roles.id')
        .where('user_roles.user_id', transaction.user_id)
        .select('roles.name')
        .first();
      const currentRole = userRoleRecord ? userRoleRecord.name : 'USER';

      if (activePackage.target_role === 'HR' && currentRole !== 'HR') {
        await db('transactions').where({ id: transaction.id }).update({
          status: 'FAILED',
          notes: 'Thanh toán thất bại do vai trò người dùng không còn là HR tại thời điểm xác nhận giao dịch.',
          updated_at: new Date()
        });
        return { RspCode: '01', Message: 'User role mismatch' };
      }

      if (activePackage.target_role === 'CANDIDATE' && currentRole !== 'USER' && currentRole !== 'CANDIDATE') {
        await db('transactions').where({ id: transaction.id }).update({
          status: 'FAILED',
          notes: 'Thanh toán thất bại do vai trò người dùng không còn là CANDIDATE tại thời điểm xác nhận giao dịch.',
          updated_at: new Date()
        });
        return { RspCode: '01', Message: 'User role mismatch' };
      }

      const responseCode = vnpParams['vnp_ResponseCode'];
      const isSuccess = responseCode === '00';
      const newStatus = isSuccess ? 'COMPLETED' : 'FAILED';

      await db.transaction(async (trx) => {
        // Tăng used_count của coupon nếu có
        if (isSuccess && transaction.coupon_code) {
          const couponToUpdate = await trx('coupons').where({ code: transaction.coupon_code }).forUpdate().first();
          if (couponToUpdate && couponToUpdate.usage_limit && couponToUpdate.used_count >= couponToUpdate.usage_limit) {
            // Trường hợp cực hiếm: Mã vừa hết lượt sử dụng trong lúc thanh toán
            // Vẫn kích hoạt vì user đã thanh toán tiền, nhưng ghi log cảnh báo
            console.warn(`[Coupon Overflow] Mã ${couponToUpdate.code} đã đạt giới hạn nhưng VNPAY báo thành công.`);
          }
          if (couponToUpdate) {
            await trx('coupons').where({ code: transaction.coupon_code }).increment('used_count', 1);
          }
        }

        // Build snapshot tại thời điểm mua — bảo toàn lịch sử khi giá/tên gói thay đổi sau này
        const snapshotBase = {
          package_id: activePackage.id,
          name: activePackage.name,
          price_at_purchase: Number(activePackage.price)
        };
        const snapshotPackage = activePackage.target_role === 'HR'
          ? {
              ...snapshotBase,
              package_type: 'CREDIT_BUNDLE',
              total_credits: activePackage.total_credits,
              credit_expiry_days: activePackage.credit_expiry_days,
              price_per_credit_at_purchase: activePackage.total_credits > 0
                ? Math.round(Number(activePackage.price) / activePackage.total_credits)
                : 0
            }
          : {
              ...snapshotBase,
              package_type: 'SUBSCRIPTION',
              duration_days: activePackage.duration_days,
              ats_scan_limit: activePackage.ats_scan_limit,
              ai_practice_limit: activePackage.ai_practice_limit,
              ai_cover_letter_limit: activePackage.ai_cover_letter_limit,
              radar_chart_level: activePackage.radar_chart_level
            };
        // Defensive JSON validate before insert
        const snapshotJson = JSON.stringify(snapshotPackage);
        JSON.parse(snapshotJson);

        // Update transaction status + snapshot
        await trx('transactions')
          .where({ id: transaction.id })
          .update({
            status: newStatus,
            snapshot_package: isSuccess ? snapshotJson : null,
            paid_at: isSuccess ? new Date() : null,
            updated_at: new Date()
          });

        // Nếu thanh toán thành công, kích hoạt gói cho User
        if (isSuccess) {
          const pack = activePackage; // Already fetched and validated above
          const now = new Date();
          const expiryDate = new Date(now.getTime() + pack.duration_days * 24 * 60 * 60 * 1000);

          // Tính ngày hết hạn cho Credit (nếu có giới hạn ngày)
          let creditExpiryDate = null;
          if (pack.credit_expiry_days) {
            creditExpiryDate = new Date(now.getTime() + pack.credit_expiry_days * 24 * 60 * 60 * 1000);
          }

          const user = await trx('users').where({ id: transaction.user_id }).first();

          if (pack.target_role === 'HR') {
            let wallet;
            if (pack.name === 'BUSINESS' && user.company_id) {
              wallet = await trx('hr_wallets').where({ company_id: user.company_id }).first();
              const expiryDays = pack.credit_expiry_days || 365;
              const vipExpiryDate = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000);
              await trx('companies').where({ id: user.company_id }).update({
                is_vip: true,
                vip_expired_at: vipExpiryDate,
                updated_at: now
              });
            } else {
              wallet = await trx('hr_wallets').where({ user_id: user.id }).first();
            }

            // Khởi tạo ví tự động nếu chưa tồn tại trong DB (Defensive logic)
            if (!wallet) {
              const walletInsert = pack.name === 'BUSINESS' && user.company_id
                ? { company_id: user.company_id, total_credits: 0, created_at: now, updated_at: now }
                : { user_id: user.id, total_credits: 0, created_at: now, updated_at: now };
              
              const [newWallet] = await trx('hr_wallets').insert(walletInsert).returning('*');
              wallet = newWallet || { id: newWallet };
            }

            if (wallet && pack.total_credits > 0) {
              const walletId = wallet.id || wallet;
              await trx('hr_wallets')
                .where({ id: walletId })
                .increment('total_credits', pack.total_credits);
            }
          } else {
            // Ứng viên: Cập nhật subscription
            const existingSub = await trx('user_subscriptions').where({ user_id: user.id }).first();
            if (existingSub) {
              const currentExpiry = existingSub.end_date && new Date(existingSub.end_date) > now
                ? new Date(existingSub.end_date)
                : now;
              const newExpiry = new Date(currentExpiry.getTime() + pack.duration_days * 24 * 60 * 60 * 1000);
              await trx('user_subscriptions').where({ user_id: existingSub.user_id }).update({
                package_id: pack.id,
                end_date: newExpiry,
                updated_at: now
              });
            } else {
              await trx('user_subscriptions').insert({
                user_id: user.id,
                package_id: pack.id,
                start_date: now,
                end_date: expiryDate,
                created_at: now,
                updated_at: now
              });
            }
          }
        }
      });

      return { RspCode: '00', Message: 'Confirm success' };
    } catch (error) {
      console.error('Lỗi khi xử lý VNPAY IPN:', error);
      return { RspCode: '99', Message: 'Input Required' };
    }
  }
};
