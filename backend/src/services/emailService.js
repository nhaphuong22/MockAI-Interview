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
 * Gửi email thông báo cho HR khi có ứng viên ứng tuyển
 * @param {string} toEmail - Email của HR nhận
 * @param {string} hrName - Tên HR
 * @param {string} candidateName - Tên Ứng viên
 * @param {string} jobTitle - Tiêu đề công việc
 * @param {number} cvScore - Điểm CV được đánh giá bởi AI
 * @param {string} coverLetter - Cover Letter của ứng viên
 */
export const sendJobApplicationEmail = async (toEmail, hrName, candidateName, jobTitle, cvScore, coverLetter) => {
  const dashboardUrl = `${FRONTEND_URL}/hr/dashboard`;

  await sendMail({
    from: `"${APP_NAME}" <${process.env.SMTP_USER || 'noreply@mockai.io'}>`,
    to: toEmail,
    subject: `[${APP_NAME}] Đơn ứng tuyển mới: ${candidateName} - vị trí ${jobTitle}`,
    text: `Chào ${hrName},\n\nỨng viên ${candidateName} đã ứng tuyển vào vị trí "${jobTitle}".\nĐiểm đánh giá CV của AI: ${cvScore}/100.\nThư xin việc:\n${coverLetter || 'Không có'}\n\nVui lòng truy cập trang quản trị để xem chi tiết: ${dashboardUrl}\n\nTrân trọng,\nĐội ngũ ${APP_NAME}`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="background: #0ea5e9; display: inline-block; padding: 12px 20px; border-radius: 12px; margin-bottom: 16px;">
            <span style="color: white; font-size: 20px; font-weight: 800;">${APP_NAME}</span>
          </div>
          <h1 style="color: #0f172a; font-size: 22px; margin: 0;">Đơn ứng tuyển mới nhận được</h1>
        </div>
        <div style="background: white; border-radius: 12px; padding: 28px; box-shadow: 0 2px 12px rgba(14,165,233,0.07);">
          <p style="color: #334155; margin-top: 0; font-size: 16px;">Chào <strong>${hrName}</strong>,</p>
          <p style="color: #64748b;">Hệ thống vừa ghi nhận một hồ sơ ứng tuyển mới cho tin đăng của bạn:</p>
          
          <div style="margin: 20px 0; padding: 20px; background: #f0f9ff; border-radius: 12px; border-left: 4px solid #0ea5e9;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #64748b; padding-bottom: 8px; width: 120px; font-weight: 600;">Ứng viên:</td>
                <td style="color: #0f172a; padding-bottom: 8px; font-weight: 700;">${candidateName}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding-bottom: 8px; font-weight: 600;">Vị trí:</td>
                <td style="color: #0f172a; padding-bottom: 8px; font-weight: 700;">${jobTitle}</td>
              </tr>
              <tr>
                <td style="color: #64748b; font-weight: 600;">Điểm AI Match:</td>
                <td>
                  <span style="background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 6px; font-weight: 800; font-size: 14px;">
                    ${cvScore} / 100
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <p style="color: #0f172a; font-weight: 700; margin-top: 24px; margin-bottom: 8px;">Thư giới thiệu (Cover Letter):</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; color: #475569; font-style: italic; white-space: pre-wrap; font-size: 14px; min-height: 50px;">
            ${coverLetter ? coverLetter.replace(/\\n/g, '<br/>') : 'Ứng viên không gửi kèm thư giới thiệu.'}
          </div>

          <div style="text-align: center; margin: 32px 0 10px 0;">
            <a href="${dashboardUrl}" style="background: linear-gradient(135deg, #0ea5e9, #38bdf8); color: white; text-decoration: none; padding: 14px 30px; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(14,165,233,0.25);">
              💼 Xem Chi Tiết Trên Dashboard
            </a>
          </div>
        </div>
        <p style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 20px;">Email này được gửi tự động từ hệ thống MockAI Interview. Vui lòng không trả lời trực tiếp email này.</p>
      </div>
    `,
  });
};

/**
 * Send application result email to candidate.
 * @param {string} toEmail - Recipient email address
 * @param {string} candidateName - Name of the candidate
 * @param {string} jobTitle - Title of the job
 * @param {string} customMessage - Custom message from HR
 */
export const sendApplicationResultEmail = async (toEmail, candidateName, jobTitle, customMessage) => {
  await sendMail({
    from: `"${APP_NAME}" <${process.env.SMTP_USER || 'noreply@mockai.io'}>`,
    to: toEmail,
    subject: `[${APP_NAME}] Kết quả hồ sơ ứng tuyển - ${jobTitle}`,
    text: `Chào ${candidateName},\n\n${customMessage}\n\nTrân trọng,\nĐội ngũ ${APP_NAME}`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="background: #0ea5e9; display: inline-block; padding: 12px 20px; border-radius: 12px; margin-bottom: 16px;">
            <span style="color: white; font-size: 20px; font-weight: 800;">${APP_NAME}</span>
          </div>
          <h1 style="color: #0f172a; font-size: 22px; margin: 0;">Kết quả hồ sơ ứng tuyển</h1>
        </div>
        <div style="background: white; border-radius: 12px; padding: 28px; box-shadow: 0 2px 12px rgba(14,165,233,0.07); text-align: left;">
          <p style="color: #334155; margin-top: 0;">Chào <strong>${candidateName}</strong>,</p>
          <p style="color: #334155;">Cảm ơn bạn đã quan tâm và ứng tuyển cho vị trí <strong>${jobTitle}</strong> tại ${APP_NAME}.</p>
          
          <div style="margin: 24px 0; padding: 20px; background: #f8fafc; border-left: 4px solid #0ea5e9; border-radius: 0 8px 8px 0;">
            <p style="color: #334155; margin: 0; white-space: pre-wrap;">${customMessage}</p>
          </div>

          <p style="color: #64748b; margin-bottom: 0;">Chúc bạn thành công trên con đường sự nghiệp của mình!</p>
        </div>
        <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">Trân trọng,<br>Đội ngũ ${APP_NAME}</p>
      </div>
    `,
  });
};


/**
 * Gửi email báo cáo đánh giá CV kèm đính kèm tệp PDF cho Candidate hoặc HR
 * @param {string} toEmail - Email nhận
 * @param {string} recipientName - Tên người nhận
 * @param {string} candidateName - Tên Ứng viên
 * @param {string} jobTitle - Tiêu đề công việc
 * @param {number} cvScore - Điểm số đánh giá
 * @param {string} pdfReportUrl - URL tệp PDF báo cáo trên Cloudinary
 * @param {boolean} isHr - Gửi cho HR hay Candidate
 */
export const sendApplicationReportEmail = async (toEmail, recipientName, candidateName, jobTitle, cvScore, pdfReportUrl, isHr = false, pdfBuffer = null) => {
  const cleanName = candidateName.replace(/[^a-zA-Z0-9_]/g, '_');
  const subject = isHr
    ? `[${APP_NAME}] Báo cáo ATS CV: Ứng viên ${candidateName} - vị trí ${jobTitle}`
    : `[${APP_NAME}] Xác nhận nộp đơn và Báo cáo đánh giá CV - Vị trí ${jobTitle}`;

  const greeting = `Chào ${recipientName},`;
  const introText = isHr
    ? `Hệ thống gửi đến bạn tệp PDF báo cáo đánh giá CV chi tiết của ứng viên <strong>${candidateName}</strong> ứng tuyển vào vị trí <strong>${jobTitle}</strong>.`
    : `Cảm ơn bạn đã nộp đơn ứng tuyển vào vị trí <strong>${jobTitle}</strong>. Dưới đây là kết quả đánh giá CV sơ bộ bằng công nghệ AI của hệ thống.`;

  await sendMail({
    from: `"${APP_NAME}" <${process.env.SMTP_USER || 'noreply@mockai.io'}>`,
    to: toEmail,
    subject: subject,
    text: `${greeting}\n\n${isHr ? `Hồ sơ mới của ${candidateName} nộp vào vị trí ${jobTitle}` : `Đơn ứng tuyển của bạn vào vị trí ${jobTitle} đã được ghi nhận`}.\nĐiểm đánh giá CV của AI: ${cvScore}/100.\nTệp PDF báo cáo chi tiết được đính kèm trong thư này.\n\nTrân trọng,\nĐội ngũ ${APP_NAME}`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="background: #0ea5e9; display: inline-block; padding: 12px 20px; border-radius: 12px; margin-bottom: 16px;">
            <span style="color: white; font-size: 20px; font-weight: 800;">${APP_NAME}</span>
          </div>
          <h1 style="color: #0f172a; font-size: 20px; margin: 0;">Báo Cáo Đánh Giá ATS CV</h1>
        </div>
        <div style="background: white; border-radius: 12px; padding: 28px; box-shadow: 0 2px 12px rgba(14,165,233,0.07);">
          <p style="color: #334155; margin-top: 0; font-size: 15px;">${greeting}</p>
          <p style="color: #64748b; line-height: 1.6;">${introText}</p>
          
          <div style="margin: 24px 0; padding: 20px; background: #f0f9ff; border-radius: 12px; border-left: 4px solid #0ea5e9; text-align: center;">
            <div style="color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Điểm Số CV ATS</div>
            <div style="font-size: 36px; font-weight: 800; color: #0ea5e9;">${cvScore} <span style="font-size: 16px; color: #64748b; font-weight: 400;">/ 100</span></div>
          </div>

          <p style="color: #64748b; line-height: 1.6;">Báo cáo chi tiết bao gồm điểm mạnh, điểm yếu và các khuyến nghị cải thiện cụ thể đã được tạo dưới định dạng PDF và đính kèm trực tiếp trong email này.</p>
          
          <div style="text-align: center; margin-top: 24px;">
            <a href="${pdfReportUrl}" style="background: #0f172a; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 13px; display: inline-block;">
              📥 Tải Báo Cáo PDF Trực Tiếp
            </a>
          </div>
        </div>
        <p style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 20px;">Email này được gửi tự động từ hệ thống MockAI Interview. Vui lòng không trả lời trực tiếp email này.</p>
      </div>
    `,
    attachments: [
      {
        filename: `MockAI_ATS_Report_${cleanName}.pdf`,
        ...(pdfBuffer ? { content: pdfBuffer } : { path: pdfReportUrl })
      }
    ]
  });
};

/**
 * Gửi email thông báo cập nhật trạng thái đơn ứng tuyển cho ứng viên
 * @param {string} toEmail - Email nhận
 * @param {string} candidateName - Tên ứng viên
 * @param {string} jobTitle - Tiêu đề công việc
 * @param {string} status - Trạng thái đơn tuyển (SUBMITTED, REVIEWING, INTERVIEWED, ACCEPTED, REJECTED)
 */
export const sendApplicationStatusUpdateEmail = async (toEmail, candidateName, jobTitle, status) => {
  const statusLabels = {
    SUBMITTED: 'Mới tiếp nhận',
    REVIEWING: 'Đang xem hồ sơ',
    INTERVIEWED: 'Mời phỏng vấn',
    ACCEPTED: 'Đạt / Trúng tuyển',
    REJECTED: 'Từ chối'
  };

  const statusColors = {
    SUBMITTED: '#0ea5e9', // Blue
    REVIEWING: '#eab308', // Yellow
    INTERVIEWED: '#a855f7', // Purple
    ACCEPTED: '#10b981', // Emerald
    REJECTED: '#f43f5e' // Rose
  };

  const statusLabel = statusLabels[status] || status;
  const statusColor = statusColors[status] || '#64748b';
  const loginUrl = `${FRONTEND_URL}/`;

  await sendMail({
    from: `"${APP_NAME}" <${process.env.SMTP_USER || 'noreply@mockai.io'}>`,
    to: toEmail,
    subject: `[${APP_NAME}] Cập nhật trạng thái đơn ứng tuyển - Vị trí ${jobTitle}`,
    text: `Chào ${candidateName},\n\nHồ sơ ứng tuyển của bạn cho vị trí "${jobTitle}" đã được cập nhật thành: ${statusLabel}.\n\nVui lòng đăng nhập vào hệ thống để xem chi tiết: ${loginUrl}\n\nTrân trọng,\nĐội ngũ ${APP_NAME}`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f8fafc; padding: 32px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="background: #0ea5e9; display: inline-block; padding: 12px 20px; border-radius: 12px; margin-bottom: 16px;">
            <span style="color: white; font-size: 20px; font-weight: 800;">${APP_NAME}</span>
          </div>
          <h1 style="color: #0f172a; font-size: 20px; margin: 0;">Trạng Thế Ứng Tuyển Thay Đổi</h1>
        </div>
        <div style="background: white; border-radius: 12px; padding: 28px; box-shadow: 0 2px 12px rgba(14,165,233,0.07);">
          <p style="color: #334155; margin-top: 0; font-size: 15px;">Chào <strong>${candidateName}</strong>,</p>
          <p style="color: #64748b; line-height: 1.6;">Chúng tôi muốn thông báo rằng hồ sơ ứng tuyển của bạn cho vị trí <strong>${jobTitle}</strong> đã được cập nhật trạng thái mới:</p>
          
          <div style="margin: 24px 0; padding: 16px; background: #f8fafc; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0;">
            <div style="color: #94a3b8; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 6px;">Trạng Thái Hiện Tại</div>
            <span style="background: ${statusColor}15; color: ${statusColor}; padding: 6px 16px; border-radius: 9999px; font-weight: 800; font-size: 14px; border: 1px solid ${statusColor}30; display: inline-block;">
              ${statusLabel}
            </span>
          </div>

          <p style="color: #64748b; line-height: 1.6; font-size: 14px;">Bạn có thể theo dõi tiến trình ứng tuyển, nhận xét của nhà tuyển dụng hoặc luyện tập phỏng vấn ảo trực tiếp trên hệ thống của chúng tôi.</p>
          
          <div style="text-align: center; margin: 28px 0 8px 0;">
            <a href="${loginUrl}" style="background: linear-gradient(135deg, #0ea5e9, #38bdf8); color: white; text-decoration: none; padding: 12px 30px; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(14,165,233,0.25);">
              🌐 Đi tới MockAI Interview
            </a>
          </div>
        </div>
        <p style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 20px;">Email này được gửi tự động từ hệ thống MockAI Interview. Vui lòng không trả lời trực tiếp email này.</p>
      </div>
    `
  });
};

/**
 * Gửi email chứa mã OTP để xác thực email liên hệ của công ty
 * @param {string} toEmail - Email đích
 * @param {string} otp - Mã OTP 6 số
 */
export const sendCompanyEmailOtp = async (toEmail, otp) => {
  await sendMail({
    from: `"${APP_NAME}" <${process.env.SMTP_USER || 'noreply@mockai.io'}>`,
    to: toEmail,
    subject: `[${APP_NAME}] Mã OTP xác thực email công ty`,
    text: `Xin chào,\n\nBạn đang cập nhật hồ sơ công ty trên hệ thống. Mã OTP xác thực email của bạn là: ${otp}\n\nMã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.\n\nNếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.\n\nTrân trọng,\nĐội ngũ ${APP_NAME}`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f8fafc; padding: 32px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="background: #0ea5e9; display: inline-block; padding: 12px 20px; border-radius: 12px; margin-bottom: 16px;">
            <span style="color: white; font-size: 20px; font-weight: 800;">${APP_NAME}</span>
          </div>
          <h1 style="color: #0f172a; font-size: 20px; margin: 0;">Xác Thực Email Liên Hệ</h1>
        </div>
        <div style="background: white; border-radius: 12px; padding: 28px; box-shadow: 0 2px 12px rgba(14,165,233,0.07);">
          <p style="color: #334155; margin-top: 0; font-size: 15px;">Xin chào,</p>
          <p style="color: #64748b; line-height: 1.6;">Hệ thống nhận được yêu cầu cập nhật hồ sơ công ty của bạn. Để đảm bảo tính bảo mật, vui lòng sử dụng mã OTP sau để xác nhận email liên hệ mới:</p>
          
          <div style="margin: 24px 0; padding: 20px; background: #f8fafc; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0;">
            <div style="color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Mã Xác Thực OTP</div>
            <div style="font-size: 32px; font-weight: 800; color: #0ea5e9; letter-spacing: 4px;">
              ${otp}
            </div>
          </div>

          <p style="color: #64748b; line-height: 1.6; font-size: 14px;">Mã này có hiệu lực trong <strong>5 phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.</p>
          <p style="color: #64748b; line-height: 1.6; font-size: 14px; margin-bottom: 0;">Nếu bạn không thực hiện yêu cầu này, hãy đổi mật khẩu tài khoản và báo cáo với chúng tôi ngay lập tức.</p>
        </div>
        <p style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 20px;">Email này được gửi tự động từ hệ thống MockAI Interview. Vui lòng không trả lời trực tiếp email này.</p>
      </div>
    `
  });
};
