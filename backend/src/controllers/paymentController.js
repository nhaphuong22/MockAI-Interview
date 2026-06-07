import { paymentService } from '../services/paymentService.js';

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
