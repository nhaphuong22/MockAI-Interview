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
  createVnpayUrl: async ({ userId, packageId, ipAddr }) => {
    // 1. Kiểm tra gói cước tồn tại
    const targetPackage = await db('packages').where({ id: packageId, is_active: true }).first();
    if (!targetPackage) {
      throw new Error('Gói cước không tồn tại hoặc đã bị ẩn.');
    }

    const amount = parseFloat(targetPackage.price);
    if (amount <= 0) {
      throw new Error('Gói cước miễn phí không cần thanh toán qua cổng VNPAY.');
    }

    // 2. Tạo giao dịch PENDING trong database
    const transactionCode = `MAI${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
    
    await db('transactions').insert({
      user_id: userId,
      package_id: packageId,
      amount: amount,
      currency: 'VND',
      payment_method: 'VNPAY',
      transaction_code: transactionCode,
      status: 'PENDING',
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
    return finalPaymentUrl;
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

      // 5. Cập nhật trạng thái giao dịch và kích hoạt gói cho User
      const responseCode = vnpParams['vnp_ResponseCode'];
      const isSuccess = responseCode === '00';
      const newStatus = isSuccess ? 'COMPLETED' : 'FAILED';

      await db.transaction(async (trx) => {
        // Cập nhật trạng thái transaction
        await trx('transactions')
          .where({ id: transaction.id })
          .update({
            status: newStatus,
            paid_at: isSuccess ? new Date() : null,
            updated_at: new Date()
          });

        // Nếu thanh toán thành công, kích hoạt VIP cho User
        if (isSuccess) {
          const pack = await trx('packages').where({ id: transaction.package_id }).first();
          if (pack) {
            const now = new Date();
            const vipExpiry = new Date(now.getTime() + pack.duration_days * 24 * 60 * 60 * 1000);

            await trx('users')
              .where({ id: transaction.user_id })
              .update({
                package_id: transaction.package_id,
                vip_expiry: vipExpiry,
                updated_at: new Date()
              });
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
