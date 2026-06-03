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
      console.error('Lưu ý: Vui lòng kiểm tra lại cấu hình Gmail và Mật khẩu ứng dụng (App Password) trong .env');
      console.error('hoặc kết nối mạng/cổng SMTP (Port 465/587) đang bị chặn.');
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

/**
 * Builds a premium HTML email template
 * @param {string} title - Email title for the header band
 * @param {string} accentColor - Hex color for the header band
 * @param {string} bodyHtml - Inner HTML content for the body
 */
const buildEmailHtml = (title, accentColor, bodyHtml) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header Band -->
          <tr>
            <td style="background:linear-gradient(135deg,${accentColor},${accentColor}cc);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">MockAI Interview</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Nền tảng phỏng vấn AI thông minh</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                Email này được gửi tự động từ hệ thống MockAI Interview.<br/>
                Vui lòng không trả lời trực tiếp email này.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/**
 * Send approval email to a candidate (HIRED)
 * @param {object} options
 * @param {string} options.toEmail - Candidate email address
 * @param {string} options.candidateName - Candidate full name
 * @param {string} options.jobTitle - Job title they applied for
 * @param {string} options.companyName - Company name
 * @param {string} options.customMessage - Optional custom message from HR
 */
export const sendApprovalEmail = async ({ toEmail, candidateName, jobTitle, companyName = 'Nhà tuyển dụng', customMessage = '' }) => {
  const bodyHtml = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#10b981,#34d399);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:28px;">✓</span>
      </div>
      <h2 style="margin:0;color:#065f46;font-size:24px;font-weight:700;">Chúc mừng! Bạn đã được tuyển dụng</h2>
    </div>

    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Xin chào <strong>${candidateName}</strong>,
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Chúng tôi rất vui được thông báo rằng hồ sơ ứng tuyển của bạn cho vị trí <strong>"${jobTitle}"</strong> tại <strong>${companyName}</strong> đã được <span style="color:#059669;font-weight:700;">CHẤP THUẬN</span>.
    </p>

    <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;padding:20px 24px;margin:24px 0;">
      <p style="margin:0;color:#064e3b;font-size:14px;font-weight:600;">📋 Thông tin ứng tuyển:</p>
      <p style="margin:8px 0 0;color:#065f46;font-size:14px;">Vị trí: <strong>${jobTitle}</strong></p>
      <p style="margin:4px 0 0;color:#065f46;font-size:14px;">Trạng thái: <strong style="color:#059669;">✅ Đã được tuyển dụng</strong></p>
    </div>

    ${customMessage ? `
    <div style="background:#f0f9ff;border-left:4px solid #0ea5e9;border-radius:0 8px 8px 0;padding:16px 20px;margin:16px 0;">
      <p style="margin:0 0 6px;color:#0369a1;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Lời nhắn từ Nhà Tuyển Dụng:</p>
      <p style="margin:0;color:#1e40af;font-size:14px;line-height:1.7;">${customMessage}</p>
    </div>` : ''}

    <p style="color:#374151;font-size:15px;line-height:1.7;margin:24px 0 0;">
      Đội tuyển dụng sẽ liên hệ với bạn sớm để thông báo các bước tiếp theo. Chúc mừng một lần nữa!
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:8px 0 0;">
      Trân trọng,<br/>
      <strong>${companyName}</strong>
    </p>
  `;

  const html = buildEmailHtml('Thông báo kết quả tuyển dụng - Đạt', '#10b981', bodyHtml);

  await sendMail({
    from: `"MockAI Interview" <${process.env.SMTP_USER || 'noreply@mockai.io'}>`,
    to: toEmail,
    subject: `🎉 [MockAI] Chúc mừng! Bạn đã vượt qua vòng xét duyệt hồ sơ cho vị trí "${jobTitle}"`,
    html,
  });
};

/**
 * Send rejection email to a candidate (REJECTED)
 * @param {object} options
 * @param {string} options.toEmail - Candidate email address
 * @param {string} options.candidateName - Candidate full name
 * @param {string} options.jobTitle - Job title they applied for
 * @param {string} options.companyName - Company name
 * @param {string} options.customMessage - Optional custom message from HR
 */
export const sendRejectionEmail = async ({ toEmail, candidateName, jobTitle, companyName = 'Nhà tuyển dụng', customMessage = '' }) => {
  const bodyHtml = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#f43f5e,#fb7185);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:28px;">✗</span>
      </div>
      <h2 style="margin:0;color:#9f1239;font-size:22px;font-weight:700;">Thông báo kết quả xét duyệt hồ sơ</h2>
    </div>

    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Xin chào <strong>${candidateName}</strong>,
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Cảm ơn bạn đã dành thời gian ứng tuyển vào vị trí <strong>"${jobTitle}"</strong> tại <strong>${companyName}</strong>. Sau khi xem xét kỹ lưỡng, chúng tôi rất tiếc phải thông báo rằng hồ sơ của bạn <span style="color:#e11d48;font-weight:700;">chưa phù hợp</span> với yêu cầu hiện tại của vị trí này.
    </p>

    <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:12px;padding:20px 24px;margin:24px 0;">
      <p style="margin:0;color:#881337;font-size:14px;font-weight:600;">📋 Thông tin ứng tuyển:</p>
      <p style="margin:8px 0 0;color:#9f1239;font-size:14px;">Vị trí: <strong>${jobTitle}</strong></p>
      <p style="margin:4px 0 0;color:#9f1239;font-size:14px;">Trạng thái: <strong style="color:#e11d48;">❌ Chưa đạt yêu cầu</strong></p>
    </div>

    ${customMessage ? `
    <div style="background:#f0f9ff;border-left:4px solid #0ea5e9;border-radius:0 8px 8px 0;padding:16px 20px;margin:16px 0;">
      <p style="margin:0 0 6px;color:#0369a1;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Nhận xét từ Nhà Tuyển Dụng:</p>
      <p style="margin:0;color:#1e40af;font-size:14px;line-height:1.7;">${customMessage}</p>
    </div>` : ''}

    <p style="color:#374151;font-size:15px;line-height:1.7;margin:24px 0 0;">
      Chúng tôi trân trọng sự quan tâm của bạn và hy vọng sẽ có cơ hội hợp tác với bạn trong tương lai. Chúc bạn tìm được công việc phù hợp!
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:8px 0 0;">
      Trân trọng,<br/>
      <strong>${companyName}</strong>
    </p>
  `;

  const html = buildEmailHtml('Thông báo kết quả tuyển dụng - Chưa đạt', '#f43f5e', bodyHtml);

  await sendMail({
    from: `"MockAI Interview" <${process.env.SMTP_USER || 'noreply@mockai.io'}>`,
    to: toEmail,
    subject: `[MockAI] Thông báo kết quả xét duyệt hồ sơ vị trí "${jobTitle}"`,
    html,
  });
};
