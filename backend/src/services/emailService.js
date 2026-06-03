import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Nodemailer transporter using SMTP credentials from .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: parseInt(process.env.SMTP_PORT) === 465, // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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

  await transporter.sendMail({
    from: `"MockAI Interview" <${process.env.SMTP_USER}>`,
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

  await transporter.sendMail({
    from: `"MockAI Interview" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `[MockAI] Thông báo kết quả xét duyệt hồ sơ vị trí "${jobTitle}"`,
    html,
  });
};
