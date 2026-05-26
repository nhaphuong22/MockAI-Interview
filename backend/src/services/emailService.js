import nodemailer from 'nodemailer';

const APP_NAME = 'MockAI Interview';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Create a nodemailer transporter.
 * Falls back to console logging if SMTP is not configured.
 */
const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587', 10),
      secure: parseInt(SMTP_PORT || '587', 10) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  // Development fallback: use nodemailer's test account simulation
  return null;
};

/**
 * Send email or log to console if SMTP is not configured.
 * @param {object} mailOptions - nodemailer mail options
 */
const sendMail = async (mailOptions) => {
  const transporter = createTransporter();

  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error('\n========== [EmailService] ERROR — Gửi email thất bại ==========');
      console.error('Chi tiết lỗi:', err.message);
      console.error('Lưu ý: Có thể do tài khoản Mailtrap hết dung lượng (quota giới hạn)');
      console.error('hoặc mạng của bạn đang chặn cổng SMTP (Port 2525/587).');
      console.error('Hệ thống tự động in thông tin email ra terminal để phát triển (DEV):');
      console.error(`  Gửi đến: ${mailOptions.to}`);
      console.error(`  Tiêu đề: ${mailOptions.subject}`);
      if (mailOptions.text) console.error(`  Nội dung:\n${mailOptions.text}`);
      console.error('===============================================================\n');
    }
  } else {
    // No SMTP configured — log details to terminal for development testing
    console.log('\n========== [EmailService] DEV MODE — Chưa cấu hình SMTP ==========');
    console.log('SMTP chưa được cấu hình hoặc thiếu biến môi trường trong .env.');
    console.log('Hệ thống tự động in thông tin email ra terminal để phát triển (DEV):');
    console.log(`  Gửi đến: ${mailOptions.to}`);
    console.log(`  Tiêu đề: ${mailOptions.subject}`);
    if (mailOptions.text) console.log(`  Nội dung:\n${mailOptions.text}`);
    console.log('===============================================================\n');
  }
};

/**
 * Send email verification link to newly registered user.
 * @param {string} toEmail - Recipient email address
 * @param {string} token - Verification token
 */
export const sendVerificationEmail = async (toEmail, token) => {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}&email=${encodeURIComponent(toEmail)}`;

  await sendMail({
    from: `"${APP_NAME}" <${process.env.SMTP_USER || 'noreply@mockai.io'}>`,
    to: toEmail,
    subject: `[${APP_NAME}] Mã xác thực tài khoản của bạn`,
    text: `Chào mừng bạn đến với ${APP_NAME}!\n\nMã xác thực (OTP) của bạn là: ${token}\n\nVui lòng nhập mã này vào trang xác thực để kích hoạt tài khoản của bạn (mã có hiệu lực trong 24 giờ).\n\nHoặc bạn cũng có thể click vào liên kết sau để xác thực trực tiếp:\n${verifyUrl}\n\nNếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.\n\nTrân trọng,\nĐội ngũ ${APP_NAME}`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f8fafc; padding: 32px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="background: #0ea5e9; display: inline-block; padding: 12px 20px; border-radius: 12px; margin-bottom: 16px;">
            <span style="color: white; font-size: 20px; font-weight: 800;">${APP_NAME}</span>
          </div>
          <h1 style="color: #0f172a; font-size: 22px; margin: 0;">Xác thực tài khoản</h1>
        </div>
        <div style="background: white; border-radius: 12px; padding: 28px; box-shadow: 0 2px 12px rgba(14,165,233,0.07); text-align: center;">
          <p style="color: #334155; text-align: left; margin-top: 0;">Chào mừng bạn đến với <strong>${APP_NAME}</strong>!</p>
          <p style="color: #64748b; text-align: left;">Sử dụng mã xác thực (OTP) bên dưới để kích hoạt tài khoản của bạn. Mã này có hiệu lực trong <strong>24 giờ</strong>:</p>
          
          <div style="margin: 24px 0; padding: 16px; background: #f0f9ff; border: 2px dashed #0ea5e9; border-radius: 12px; display: inline-block;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0ea5e9;">${token}</span>
          </div>

          <p style="color: #64748b; text-align: left;">Hoặc nhấp vào nút bên dưới để xác thực trực tiếp:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${verifyUrl}" style="background: linear-gradient(135deg, #0ea5e9, #38bdf8); color: white; text-decoration: none; padding: 12px 30px; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block;">
              ✉ Xác Thực Email Trực Tiếp
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: left; margin-bottom: 0;">Nếu nút không hoạt động, bạn có thể copy link sau:<br><a href="${verifyUrl}" style="color: #0ea5e9; word-break: break-all;">${verifyUrl}</a></p>
        </div>
        <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
      </div>
    `,
  });
};

/**
 * Send password reset link to user.
 * @param {string} toEmail - Recipient email address
 * @param {string} token - Reset password token
 */
export const sendResetPasswordEmail = async (toEmail, token) => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  await sendMail({
    from: `"${APP_NAME}" <${process.env.SMTP_USER || 'noreply@mockai.io'}>`,
    to: toEmail,
    subject: `[${APP_NAME}] Đặt lại mật khẩu của bạn`,
    text: `Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản ${APP_NAME}.\n\nMã xác nhận (OTP) của bạn là: ${token}\n\nNhấp vào liên kết sau hoặc nhập mã trên trang Đặt lại mật khẩu (có hiệu lực trong 1 giờ):\n\n${resetUrl}\n\nNếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.\n\nTrân trọng,\nĐội ngũ ${APP_NAME}`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f8fafc; padding: 32px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="background: #0ea5e9; display: inline-block; padding: 12px 20px; border-radius: 12px; margin-bottom: 16px;">
            <span style="color: white; font-size: 20px; font-weight: 800;">${APP_NAME}</span>
          </div>
          <h1 style="color: #0f172a; font-size: 22px; margin: 0;">Đặt lại mật khẩu</h1>
        </div>
        <div style="background: white; border-radius: 12px; padding: 28px; box-shadow: 0 2px 12px rgba(14,165,233,0.07); text-align: center;">
          <p style="color: #334155; text-align: left; margin-top: 0;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${toEmail}</strong>.</p>
          <p style="color: #64748b; text-align: left;">Sử dụng mã xác nhận (OTP) bên dưới để đặt lại mật khẩu. Mã này có hiệu lực trong <strong>1 giờ</strong>:</p>
          
          <div style="margin: 24px 0; padding: 16px; background: #f0f9ff; border: 2px dashed #0ea5e9; border-radius: 12px; display: inline-block;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0ea5e9;">${token}</span>
          </div>

          <p style="color: #64748b; text-align: left;">Hoặc nhấp vào nút bên dưới để đặt lại trực tiếp:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #0ea5e9, #38bdf8); color: white; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block;">
              🔒 Đặt lại mật khẩu
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 13px; text-align: left; margin-bottom: 0;">Nếu nút không hoạt động, hãy sao chép và dán liên kết sau vào trình duyệt:<br><a href="${resetUrl}" style="color: #0ea5e9; word-break: break-all;">${resetUrl}</a></p>
        </div>
        <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi.</p>
      </div>
    `,
  });
};
