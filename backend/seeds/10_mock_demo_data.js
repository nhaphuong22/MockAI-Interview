/**
 * Seed data cho kịch bản Demo Quan Software với đầy đủ thông tin chuẩn luồng thực tế.
 * Bao gồm:
 * - 1 Job Senior Frontend Developer (React)
 * - 2 Job Requirements (Knock-out criteria: ReactJS, English)
 * - 15 Candidates với đầy đủ thông tin CV (bảng `cvs` + `applications` + `ai_feedback` JSON)
 * - Đầy đủ 8 câu hỏi phỏng vấn theo đúng cấu trúc 4 giai đoạn AI HR (bảng `interview_questions` + `candidate_answers`)
 * - Trích xuất chính xác tên Dự án/Công ty từ CV vào CÂU HỎI SỐ 5 theo đúng cơ chế AI HR
 * - Tất cả các ứng viên có kết quả phỏng vấn đều có Điểm PV (interview_score) được tính toán chính xác.
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import cloudinary from '../src/core/cloudinary.js';

const createPDFBuffer = (candidateName, candidateEmail, candidatePhone, cvText) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const fontPath = 'C:/Windows/Fonts/arial.ttf';
      const fontBoldPath = 'C:/Windows/Fonts/arialbd.ttf';

      if (fs.existsSync(fontPath)) {
        doc.registerFont('Regular', fontPath);
        doc.registerFont('Bold', fs.existsSync(fontBoldPath) ? fontBoldPath : fontPath);
        doc.font('Regular');
      } else {
        doc.registerFont('Regular', 'Helvetica');
        doc.registerFont('Bold', 'Helvetica-Bold');
        doc.font('Regular');
      }

      const cleanName = candidateName.split('-')[0].trim();

      // Header Banner Accent Ocean Blue
      doc.rect(0, 0, doc.page.width, 110).fill('#0ea5e9');
      doc.fillColor('white').font('Bold').fontSize(20).text(cleanName.toUpperCase(), 40, 25);
      doc.fillColor('white').font('Regular').fontSize(11).text('Vị trí ứng tuyển: Senior Frontend Developer (ReactJS)', 40, 55);
      doc.fillColor('white').font('Regular').fontSize(10).text(`Email: ${candidateEmail}  |  SĐT: ${candidatePhone}`, 40, 78);

      doc.x = 40;
      doc.y = 135;

      // Section Title
      doc.fillColor('#0f172a').font('Bold').fontSize(13).text('HỒ SƠ NĂNG LỰC ỨNG VIÊN (CURRICULUM VITAE)');
      doc.moveDown(0.5);

      // Body text
      doc.fillColor('#334155').font('Regular').fontSize(10.5).text(cvText, {
        lineGap: 5,
        align: 'left'
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

const uploadPDFToCloudinary = (pdfBuffer, publicId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'mock_demo_cvs',
        public_id: `${publicId}.pdf`,
        overwrite: true
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(pdfBuffer);
  });
};

export const seed = async function(knex) {
  const roleHr = await knex('roles').where({ name: 'HR' }).first();
  const roleCandidate = await knex('roles').where({ name: 'CANDIDATE' }).first();
  const passwordHash = await bcrypt.hash('123456', 10);
  
  console.log('[Seed] Bắt đầu khởi tạo dữ liệu mẫu chuẩn luồng 8 câu hỏi AI HR cho Quan Software...');

  // 0. Dọn dẹp dữ liệu cũ
  const existingUsers = await knex('users').where('email', 'like', '%@quansoftware.com').select('id');
  const userIds = existingUsers.map(u => u.id);
  
  if (userIds.length > 0) {
    const existingApps = await knex('applications').whereIn('candidate_id', userIds).select('interview_id');
    const interviewIds = existingApps.map(a => a.interview_id).filter(Boolean);

    if (interviewIds.length > 0) {
      const questions = await knex('interview_questions').whereIn('interview_id', interviewIds).select('id');
      const questionIds = questions.map(q => q.id);
      if (questionIds.length > 0) {
        await knex('candidate_answers').whereIn('interview_question_id', questionIds).del();
      }
      await knex('assessments').whereIn('interview_id', interviewIds).del();
      await knex('interview_questions').whereIn('interview_id', interviewIds).del();
      await knex('interviews').whereIn('id', interviewIds).del();
    }

    await knex('cvs').whereIn('user_id', userIds).del();
    await knex('applications').whereIn('candidate_id', userIds).del();
    await knex('user_roles').whereIn('user_id', userIds).del();
    await knex('hr_profiles').whereIn('user_id', userIds).del();
    await knex('users').whereIn('id', userIds).del();
  }
  await knex('companies').where('email', 'contact@quansoftware.com').del();

  // 1. Tạo Công ty
  const [companyId] = await knex('companies').insert({
    name: 'Quan Software',
    email: 'contact@quansoftware.com',
    tax_code: '0315888999',
    business_type: 'ENTERPRISE',
    is_verified: true,
    verification_status: 'APPROVED',
    banner_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
    city: 'Hồ Chí Minh'
  }).returning('id').then(res => res.map(r => r.id));

  // 2. Tạo Tài khoản HR
  const [hrId] = await knex('users').insert({
    full_name: 'HR Manager Quan',
    email: 'hr@quansoftware.com',
    password_hash: passwordHash,
    is_active: true,
    email_verified: true,
    company_id: companyId
  }).returning('id').then(res => res.map(r => r.id));

  await knex('hr_profiles').insert({
    user_id: hrId,
    company_join_status: 'APPROVED'
  });

  if (roleHr) {
    await knex('user_roles').insert({ user_id: hrId, role_id: roleHr.id });
  }

  // 3. Tạo Bài Đăng Tuyển Dụng (Job)
  const [jobId] = await knex('jobs').insert({
    hr_id: hrId,
    company_id: companyId,
    title: 'Senior Frontend Developer (React)',
    description: `Tham gia thiết kế và phát triển các nền tảng Web Application quy mô lớn sử dụng hệ sinh thái ReactJS/Next.js.
Tối ưu hóa hiệu năng, đảm bảo ứng dụng chạy mượt mà trên đa thiết bị.
Làm việc chặt chẽ cùng team Product và Backend để đưa ra các giải pháp kiến trúc phần mềm linh hoạt.
Môi trường làm việc Agile/Scrum tốc độ cao.`,
    status: 'OPEN',
    approval_status: 'APPROVED',
    enable_ai_screening: true,
    created_at: new Date()
  }).returning('id').then(res => res.map(r => r.id));

  // 4. Tiêu chí Đánh giá Tự động (Knock-out Criteria)
  await knex('job_requirements').insert([
    { job_id: jobId, requirement_text: 'Có kỹ năng lập trình ReactJS', is_mandatory: true },
    { job_id: jobId, requirement_text: 'Có sử dụng tiếng Anh', is_mandatory: true }
  ]);

  // 5. Khởi tạo 15 Ứng viên với thông tin CV & Đánh giá AI chi tiết
  const candidatesConfig = [
    // --- NHÓM 1: Đã qua phỏng vấn với AI ---
    {
      name: 'Nguyễn Văn A - Pass Phỏng Vấn Xuất Sắc',
      email: 'c1@quansoftware.com',
      phone: '0901234567',
      type: 'INTERVIEW_PASS',
      appStatus: 'INTERVIEWED',
      cvText: `Nguyễn Văn A\nEmail: c1@quansoftware.com | SĐT: 0901234567 | Địa chỉ: Quận 1, TP. Hồ Chí Minh\nVị trí: Senior Frontend Developer (ReactJS)\n\nHỌC VẤN:\n- Cử nhân Khoa học Máy tính - ĐH Bách Khoa TP.HCM (2018 - 2022)\n- Chứng chỉ IELTS 7.5 Academic (2023)\n\nKỸ NĂNG CHUYÊN MÔN:\n- Frontend: ReactJS, Next.js, Redux Toolkit, Zustand, HTML5, CSS3, Tailwind CSS, TypeScript.\n- API & Tools: RESTful API, GraphQL, WebSockets, Git, Webpack, Vite.\n- Ngoại ngữ: Tiếng Anh giao tiếp thành thạo (IELTS 7.5).\n\nKINH NGHIỆM LÀM VIỆC:\nSenior Frontend Developer - TechCorp (2022 - Nay)\n- Phát triển và tối ưu hóa hệ thống TechCorp SaaS Web Application phục vụ 100k+ người dùng hàng ngày.\n- Cải thiện tốc độ tải trang (PageSpeed Insights) từ 65 lên 92 điểm nhờ áp dụng Lazy Loading, Code Splitting.\n- Phối hợp trực tiếp với Khách hàng Châu Âu bằng Tiếng Anh.`,
      score: 92,
      aiFeedback: {
        knockout_status: "PASSED",
        knockout_reason: "",
        semantic_score: 92,
        evaluation_summary: "Ứng viên cực kỳ tiềm năng. Đáp ứng xuất sắc toàn bộ tiêu chí cứng (ReactJS & Tiếng Anh). Có tư duy tối ưu hóa hiệu năng bài bản và thành tích đo lường được.",
        positive_notes: [
          "Thành tích đo lường rõ ràng: Tăng PageSpeed từ 65 lên 92 điểm tại TechCorp",
          "Chứng chỉ IELTS 7.5, khả năng giao tiếp Tiếng Anh tốt",
          "Thành thạo hệ sinh thái ReactJS/Next.js và TypeScript"
        ],
        negative_notes: [
          "Kỳ vọng mức lương có thể cao hơn ngân sách dự kiến do trình độ Senior"
        ],
        interview_notes: "Tập trung kiểm tra tư duy System Design ở Frontend và kinh nghiệm làm việc với ứng dụng Realtime.",
        matched_skills: ["ReactJS", "Tiếng Anh (IELTS 7.5)", "Next.js", "TypeScript", "Tailwind CSS", "RESTful API"],
        missing_skills: []
      },
      interviewScore: 90,
      interviewStatus: 'COMPLETED',
      questions: [
        {
          q: "Chào bạn Nguyễn Văn A, chào mừng bạn đến với phỏng vấn AI của Quan Software. Bạn hãy giới thiệu ngắn gọn về bản thân và định hướng nghề nghiệp của mình nhé?",
          expected: "Giới thiệu súc tích, nêu kinh nghiệm 3+ năm ReactJS và học vấn Bách Khoa.",
          ans: "Chào anh/chị, em tên Nguyễn Văn A, tốt nghiệp Bách Khoa TP.HCM. Em có 3 năm làm Senior Frontend với thế mạnh là ReactJS và Next.js. Định hướng 3 năm tới của em là phát triển thành Frontend Architect.",
          score: 95,
          feedback: "Trả lời rõ ràng, lưu khoát, thể hiện định hướng sự nghiệp bài bản."
        },
        {
          q: "Bạn tự nhận thấy đâu là điểm mạnh lớn nhất và hạn chế nào bạn đang nỗ lực khắc phục trong công việc?",
          expected: "Điểm mạnh thể hiện chuyên môn ReactJS/IELTS 7.5, điểm yếu kèm phương án khắc phục.",
          ans: "Điểm mạnh lớn nhất của em là tư duy tối ưu hiệu năng Web và giao tiếp Tiếng Anh trôi chảy (IELTS 7.5). Điểm yếu trước đây là ít tiếp xúc DevOps, nhưng em đang tự học Docker và CI/CD.",
          score: 90,
          feedback: "Tự đánh giá trung thực, có tinh thần cầu tiến."
        },
        {
          q: "Định hướng nghề nghiệp của bạn trong 3 năm tới là gì và tại sao bạn ứng tuyển vị trí Senior Frontend tại Quan Software?",
          expected: "Lý do thuyết phục, gắn liền với sản phẩm SaaS AI của Quan Software.",
          ans: "Em mong muốn nâng cao năng lực thiết kế hệ thống lớn. Quan Software có dòng sản phẩm SaaS AI rất ấn tượng, phù hợp với định hướng làm chủ công nghệ tiên tiến của em.",
          score: 90,
          feedback: "Định hướng rõ ràng, thể hiện sự quan tâm sâu sắc tới công ty."
        },
        {
          q: "Giả sử một trang Dashboard React hiển thị danh sách 10.000 phần tử liên tục nhận dữ liệu Realtime bị giật lag nặng, bạn xử lý thế nào?",
          expected: "Đưa ra phương án Virtual Scroll, Memoization, Throttle WebSocket updates.",
          ans: "Em sẽ dùng Virtual Scroll (react-window) để chỉ render các item trong viewport. Kết hợp useMemo/React.memo để chặn re-render thừa và Throttle các tín hiệu WebSocket 200ms/lần.",
          score: 95,
          feedback: "Giải pháp xuất sắc, tư duy xử lý bài toán hiệu năng thực chiến rất tốt."
        },
        {
          q: "Trong CV bạn ghi đã tham gia phát triển dự án TechCorp SaaS Web Application và tăng PageSpeed từ 65 lên 92 điểm. Bạn đã áp dụng kỹ thuật cụ thể nào?",
          expected: "Nêu chi tiết Webpack Code Splitting, Lazy Loading, Image Optimization.",
          ans: "Tại dự án TechCorp SaaS, em phân tích bundle bằng Webpack Analyzer, chuyển các thư viện nặng sang Dynamic Import, nén ảnh sang định dạng WebP và dùng Service Worker để cache static assets.",
          score: 95,
          feedback: "Trả lời chính xác bối cảnh dự án TechCorp trong CV, dẫn chứng kỹ thuật rất thuyết phục."
        },
        {
          q: "Bạn hãy giải thích về cơ chế Diffing Algorithm và Virtual DOM trong ReactJS?",
          expected: "Giải thích VDOM trong memory, O(n) heuristic diffing dựa trên element type và key.",
          ans: "Virtual DOM là bản sao lightweight của Real DOM lưu ở bộ nhớ. Khi state đổi, React tạo VDOM mới và so sánh với VDOM cũ bằng thuật toán Diffing O(n) với 2 quy tắc: 2 type khác nhau tạo cây mới, và prop key giúp định danh item thay đổi.",
          score: 90,
          feedback: "Hiểu sâu bản chất cốt lõi của ReactJS."
        },
        {
          q: "Kỳ vọng của bạn về mức lương và môi trường làm việc tại Quan Software như thế nào?",
          expected: "Nêu mức lương hợp lý (30-35M) và kỳ vọng văn hóa làm việc.",
          ans: "Em kỳ vọng mức lương khoảng 30 đến 35 triệu VNĐ cùng môi trường làm việc tôn trọng sự chủ động và tạo điều kiện thử nghiệm công nghệ mới.",
          score: 85,
          feedback: "Mức lương phù hợp với trình độ Senior."
        },
        {
          q: "Buổi phỏng vấn đến đây là kết thúc. Bạn có câu hỏi ngược nào dành cho phía nhà tuyển dụng Quan Software không?",
          expected: "Đặt câu hỏi thông minh về quy trình công nghệ/team Frontend.",
          ans: "Em muốn hỏi về quy trình Review Code và CI/CD của team Frontend hiện tại ở Quan Software như thế nào ạ? Em xin cảm ơn anh/chị!",
          score: 90,
          feedback: "Đặt câu hỏi chuyên nghiệp, thái độ vô cùng lịch sự."
        }
      ]
    },
    {
      name: 'Trần Thị B - Pass Phỏng Vấn Giỏi',
      email: 'c2@quansoftware.com',
      phone: '0912345678',
      type: 'INTERVIEW_PASS',
      appStatus: 'INTERVIEWED',
      cvText: `Trần Thị B\nEmail: c2@quansoftware.com | SĐT: 0912345678 | Địa chỉ: Quận 3, TP. Hồ Chí Minh\nVị trí: Frontend Engineer\n\nHỌC VẤN:\n- Cử nhân CNTT - ĐH KHTN TP.HCM (2019 - 2023)\n- Tiếng Anh: TOEIC 850\n\nKỸ NĂNG:\nReactJS, JavaScript ES6+, HTML/CSS, Redux, Axios, REST API, Git.\n\nKINH NGHIỆM:\nFrontend Developer - Software Solutions Co. (2023 - Nay)\n- Phát triển dự án Dashboard Nhà thông minh (Smart Home UI) tại Software Solutions Co. bằng ReactJS và Tailwind.\n- Trao đổi công việc hằng ngày qua Email/Slack bằng Tiếng Anh.`,
      score: 88,
      aiFeedback: {
        knockout_status: "PASSED",
        knockout_reason: "",
        semantic_score: 88,
        evaluation_summary: "Hồ sơ ấn tượng, nền tảng KHTN vững chắc. Đạt tốt tiêu chí ReactJS và giao tiếp Tiếng Anh.",
        positive_notes: [
          "Nền tảng thuật toán và tư duy lập trình tốt từ ĐH KHTN",
          "TOEIC 850, làm việc tốt bằng Tiếng Anh văn phòng"
        ],
        negative_notes: [
          "Kinh nghiệm thực tế khoảng 2 năm, phù hợp Mid-level hơn Senior"
        ],
        interview_notes: "Khảo sát thêm khả năng làm chủ các bài toán State Management phức tạp.",
        matched_skills: ["ReactJS", "Tiếng Anh (TOEIC 850)", "Redux", "REST API", "Tailwind CSS"],
        missing_skills: ["TypeScript"]
      },
      interviewScore: 90,
      interviewStatus: 'COMPLETED',
      questions: [
        {
          q: "Xin chào Trần Thị B, rất vui được làm việc với bạn hôm nay. Bạn hãy giới thiệu đôi chút về bản thân nhé?",
          expected: "Giới thiệu bản thân ngắn gọn, nhấn mạnh ĐH KHTN và kỹ năng ReactJS.",
          ans: "Dạ chào anh/chị, em tốt nghiệp KHTN ngành CNTT. Em có 2 năm kinh nghiệm Frontend chuyên làm về ReactJS và Redux.",
          score: 90,
          feedback: "Giao tiếp tự tin, đúng trọng tâm."
        },
        {
          q: "Bạn nhận thấy đâu là điểm mạnh lớn nhất và khuyết điểm cần cải thiện của mình?",
          expected: "Nêu điểm mạnh tư duy logic KHTN, TOEIC 850 và điểm yếu kinh nghiệm.",
          ans: "Điểm mạnh của em là tư duy logic vững và khả năng đọc hiểu tài liệu Tiếng Anh tốt (TOEIC 850). Điểm yếu là chưa có nhiều cơ hội làm hệ thống Micro-frontend lớn.",
          score: 85,
          feedback: "Trung thực và hiểu rõ năng lực bản thân."
        },
        {
          q: "Định hướng phát triển 3 năm tới và lý do ứng tuyển vào Quan Software là gì?",
          expected: "Mong muốn trở thành Fullstack hoặc Senior Frontend.",
          ans: "Em muốn đào sâu kỹ năng Frontend để trở thành Senior Engineer. Quan Software có môi trường năng động và sản phẩm nhiều thách thức kỹ thuật.",
          score: 88,
          feedback: "Mục tiêu rõ ràng."
        },
        {
          q: "Nếu ứng dụng gặp sự cố rò rỉ bộ nhớ (Memory Leak) rải rác làm đơ ứng dụng sau vài giờ sử dụng, bạn tìm nguyên nhân bằng cách nào?",
          expected: "Sử dụng Chrome Memory Profiler, Heap Snapshot, kiểm tra event listener/timer chưa cleanup.",
          ans: "Em sẽ mở Chrome DevTools tab Memory, chụp Heap Snapshot trước và sau khi thực hiện thao tác. Tìm các unmounted component chưa removeEventListener hoặc chưa clearInterval.",
          score: 95,
          feedback: "Phương pháp gỡ lỗi rất chuẩn xác."
        },
        {
          q: "Trong CV bạn đề cập tới dự án Dashboard Nhà thông minh tại Software Solutions Co. Bạn đã quản lý luồng dữ liệu điều khiển thiết bị IoT từ xa như thế nào?",
          expected: "Trình bày về WebSocket, Redux Toolkit và tối ưu hóa thời gian phản hồi UI.",
          ans: "Ở dự án Dashboard Nhà thông minh tại Software Solutions Co., em dùng WebSocket để lắng nghe sự thay đổi trạng thái thiết bị và đẩy vào Redux Store để UI cập nhật tức thì dưới 100ms.",
          score: 90,
          feedback: "Giải trình dự án tại Software Solutions Co. rất sát với kinh nghiệm thực tế."
        },
        {
          q: "Sự khác biệt giữa Redux Toolkit và React Context API là gì? Khi nào nên dùng giải pháp nào?",
          expected: "Phân biệt Redux cho global state tần suất cao, Context cho UI state đơn giản.",
          ans: "Context API phù hợp cho state đơn giản như Theme, Auth. Redux Toolkit mạnh hơn nhờ middleware, DevTools và tối ưu re-render khi state biến động tần suất cao.",
          score: 90,
          feedback: "Nắm vững kiến thức State Management."
        },
        {
          q: "Kỳ vọng của bạn về mức lương và văn hóa làm việc ở công ty mới?",
          expected: "Mức lương mong muốn khoảng 22-26M.",
          ans: "Em kỳ vọng mức lương tầm 24 triệu VNĐ và môi trường cởi mở, có anh chị Senior hỗ trợ mảng kiến trúc.",
          score: 88,
          feedback: "Phù hợp ngân sách."
        },
        {
          q: "Cảm ơn bạn. Bạn có câu hỏi nào muốn trao đổi thêm với nhà tuyển dụng không?",
          expected: "Hỏi về quy mô team và lộ trình onboarding.",
          ans: "Dạ cho em hỏi team Frontend dự án này hiện có bao nhiêu người và quy trình làm việc theo Scrum như thế nào ạ?",
          score: 90,
          feedback: "Thái độ thiện chí, lịch sự."
        }
      ]
    },
    {
      name: 'Lê Văn C - Vi phạm Chửi Tục',
      email: 'c3@quansoftware.com',
      phone: '0923456789',
      type: 'INTERVIEW_SWEAR',
      appStatus: 'INTERVIEWED',
      cvText: `Lê Văn C\nEmail: c3@quansoftware.com | SĐT: 0923456789 | Địa chỉ: Bình Thạnh, TP. Hồ Chí Minh\nVị trí: ReactJS Developer\n\nKỸ NĂNG: ReactJS, JavaScript, Node.js, English Communication.\nKINH NGHIỆM: 3 năm phát triển ứng dụng ReactJS tại dự án Outsourcing Công ty Alpha.`,
      score: 85,
      aiFeedback: {
        knockout_status: "PASSED",
        knockout_reason: "",
        semantic_score: 85,
        evaluation_summary: "Vòng CV đạt yêu cầu. Kỹ năng ReactJS và Tiếng Anh đáp ứng công việc.",
        positive_notes: ["3 năm kinh nghiệm ReactJS dự án Outsourcing", "Đáp ứng đủ tiêu chí cứng"],
        negative_notes: [],
        interview_notes: "Đánh giá thêm về thái độ làm việc nhóm và văn hóa doanh nghiệp.",
        matched_skills: ["ReactJS", "English Communication", "JavaScript", "Node.js"],
        missing_skills: []
      },
      interviewScore: 0,
      interviewStatus: 'COMPLETED',
      questions: [
        {
          q: "Chào Lê Văn C, mời bạn giới thiệu bản thân trước khi chúng ta bắt đầu bài phỏng vấn nhé?",
          expected: "Giới thiệu bản thân lịch sự.",
          ans: "Chào anh, tôi làm ReactJS được 3 năm rồi, làm dự án Outsourcing tại Công ty Alpha.",
          score: 75,
          feedback: "Trả lời hơi cộc lốc."
        },
        {
          q: "Bạn đánh giá điểm mạnh và điểm yếu trong kỹ năng của mình như thế nào?",
          expected: "Tự đánh giá chuyên môn.",
          ans: "Tôi code nhanh, gặp bài khó là chiến được ngay. Điểm yếu chắc không có gì đáng nói.",
          score: 60,
          feedback: "Thiếu khiêm tốn."
        },
        {
          q: "Định hướng nghề nghiệp của bạn tại sao lại muốn ứng tuyển vị trí này?",
          expected: "Nêu lý do ứng tuyển.",
          ans: "Thì thấy bên này tuyển nên nộp thôi, muốn đổi môi trường lương cao hơn.",
          score: 50,
          feedback: "Hơi hời hợt."
        },
        {
          q: "Giả sử trang web bị giật lag khi render lượng lớn dữ liệu, bạn giải quyết thế nào?",
          expected: "Đưa ra phương án kỹ thuật.",
          ans: "Mẹ kiếp, hỏi cái quái gì mà lằng nhằng vô lý thế? Mấy cái này dev tự biết làm chứ hỏi làm đéo gì!",
          score: 0,
          feedback: "🚨 TỪ CHỐI TỰ ĐỘNG (ZERO TOLERANCE): Ứng viên sử dụng từ ngữ thô tục chửi thề (Mẹ kiếp, đéo gì). Ngắt phỏng vấn và cho 0 điểm."
        },
        {
          q: "Trong CV bạn có làm các dự án Outsourcing tại Công ty Alpha, bạn đã xử lý công việc thế nào?",
          expected: "Chi tiết dự án Công ty Alpha.",
          ans: "Công ty cặn bã đó làm chả ra gì, sếp thì ngu dốt...",
          score: 0,
          feedback: "Tiếp tục xúc phạm thái độ thù địch."
        },
        {
          q: "Bạn giải thích khái niệm Component Lifecycle trong ReactJS?",
          expected: "Lý thuyết Lifecycle.",
          ans: "Không trả lời.",
          score: 0,
          feedback: "Bỏ bài."
        },
        {
          q: "Mức lương mong muốn của bạn?",
          expected: "Mức lương.",
          ans: "Bỏ qua.",
          score: 0,
          feedback: "Không trả lời."
        },
        {
          q: "Bạn có câu hỏi nào không?",
          expected: "Câu hỏi ngược.",
          ans: "Không.",
          score: 0,
          feedback: "Kết thúc."
        }
      ]
    },
    {
      name: 'Phạm Thị D - Vi phạm Gian Lận',
      email: 'c4@quansoftware.com',
      phone: '0934567890',
      type: 'INTERVIEW_CHEAT',
      appStatus: 'INTERVIEWED',
      cvText: `Phạm Thị D\nEmail: c4@quansoftware.com | SĐT: 0934567890 | Địa chỉ: Thủ Đức, TP. Hồ Chí Minh\nVị trí: Frontend Developer\n\nKỸ NĂNG: ReactJS, Vue.js, JavaScript, English Fluent.\nKINH NGHIỆM: 2.5 năm thiết kế UI/UX E-commerce tại Công ty RetailTech.`,
      score: 86,
      aiFeedback: {
        knockout_status: "PASSED",
        knockout_reason: "",
        semantic_score: 86,
        evaluation_summary: "Hồ sơ đạt yêu cầu vòng gửi xe.",
        positive_notes: ["Thành thạo ReactJS và Vue.js", "Kỹ năng Tiếng Anh khá"],
        negative_notes: [],
        interview_notes: "Quan sát kỹ thái độ tự tin khi trả lời phỏng vấn trực tiếp.",
        matched_skills: ["ReactJS", "Vue.js", "English Fluent", "JavaScript"],
        missing_skills: []
      },
      interviewScore: 25,
      interviewStatus: 'COMPLETED',
      questions: [
        {
          q: "Chào Phạm Thị D, bạn hãy giới thiệu về bản thân và kinh nghiệm lập trình của mình nhé?",
          expected: "Giới thiệu bản thân.",
          ans: "Dạ chào anh chị, em làm Frontend 2.5 năm rồi ạ...",
          score: 70,
          feedback: "Phát hiện ánh mắt đảo liên tục khỏi màn hình."
        },
        {
          q: "Điểm mạnh và điểm yếu lớn nhất của bạn là gì?",
          expected: "Điểm mạnh điểm yếu.",
          ans: "(Xì xầm tiếng nói bên ngoài)... Điểm mạnh của em là làm UI nhanh...",
          score: 50,
          feedback: "Cảnh báo gian lận: Có tiếng nói nhỏ nhắc bài bên cạnh."
        },
        {
          q: "Định hướng sự nghiệp của bạn trong thời gian tới?",
          expected: "Định hướng sự nghiệp.",
          ans: "Em muốn phát triển thành Team Lead ạ...",
          score: 50,
          feedback: "Gaze violation x2."
        },
        {
          q: "Nếu hệ thống bị đơ do re-render liên tục, bạn sửa như thế nào?",
          expected: "Phương án tối ưu re-render.",
          ans: "(Đọc theo tài liệu bên cạnh)... Em dùng React memo và useCallback ạ...",
          score: 40,
          feedback: "Trả lời như đọc thuộc lòng bài mẫu từ màn hình phụ."
        },
        {
          q: "Trong CV bạn ghi làm việc tại Công ty RetailTech cho dự án UI/UX E-commerce. Bạn đã đóng góp gì cho dự án?",
          expected: "Kinh nghiệm thực tế dự án RetailTech.",
          ans: "(Quay mặt hẳn sang góc phải hỏi ai đó)... Dạ em dựng trang giỏ hàng với thanh toán...",
          score: 30,
          feedback: "Trích xuất đúng RetailTech nhưng gian lận rõ ràng."
        },
        {
          q: "Khái niệm Hook trong ReactJS là gì?",
          expected: "Khái niệm Hooks.",
          ans: "Hooks là hàm đặc biệt cho phép dùng state...",
          score: 40,
          feedback: "Độ tin cậy thấp."
        },
        {
          q: "Mức lương kỳ vọng của bạn?",
          expected: "Mức lương.",
          ans: "Em mong muốn 20 triệu ạ.",
          score: 60,
          feedback: "Bình thường."
        },
        {
          q: "Bạn có câu hỏi ngược nào không?",
          expected: "Câu hỏi ngược.",
          ans: "Dạ em không có câu hỏi ạ.",
          score: 50,
          feedback: "Hoàn tất phỏng vấn với cảnh báo vi phạm nghiêm trọng."
        }
      ]
    },
    {
      name: 'Hoàng Văn E - Bỏ Thi Giữa Chừng',
      email: 'c5@quansoftware.com',
      phone: '0945678901',
      type: 'INTERVIEW_ABANDON',
      appStatus: 'INTERVIEWED',
      cvText: `Hoàng Văn E\nEmail: c5@quansoftware.com | SĐT: 0945678901 | Địa chỉ: Quận 10, TP. Hồ Chí Minh\nVị trí: Web Developer (React)\n\nKỸ NĂNG: ReactJS, English Working Level.\nKINH NGHIỆM: 2 năm kinh nghiệm Frontend làm tự do (Freelance).`,
      score: 80,
      aiFeedback: {
        knockout_status: "PASSED",
        knockout_reason: "",
        semantic_score: 80,
        evaluation_summary: "CV đạt tiêu chí tối thiểu.",
        positive_notes: ["Biết ReactJS và có giao tiếp Tiếng Anh cơ bản"],
        negative_notes: ["Kinh nghiệm còn mỏng"],
        interview_notes: "Kiểm tra kiến thức cơ bản.",
        matched_skills: ["ReactJS", "English Working Level"],
        missing_skills: ["TypeScript"]
      },
      interviewScore: 18, // Tính điểm cho 2 câu đã trả lời 75 và 70 (145/8 = 18 điểm)
      interviewStatus: 'COMPLETED',
      questions: [
        {
          q: "Chào Hoàng Văn E, hãy giới thiệu ngắn gọn bản thân với nhà tuyển dụng nhé?",
          expected: "Giới thiệu bản thân.",
          ans: "Chào anh chị, em làm Freelance ReactJS được 2 năm rồi ạ.",
          score: 75,
          feedback: "Chào hỏi lịch sự."
        },
        {
          q: "Điểm mạnh và điểm yếu trong công việc của bạn là gì?",
          expected: "Điểm mạnh điểm yếu.",
          ans: "Em tự học tốt nhưng kỹ năng làm việc nhóm chưa nhiều.",
          score: 70,
          feedback: "Đã trả lời."
        },
        {
          q: "Lý do bạn ứng tuyển vào vị trí này tại Quan Software?",
          expected: "Lý do ứng tuyển.",
          ans: null,
          score: 0,
          feedback: "Ứng viên đã thoát ứng dụng (Bỏ thi giữa chừng)."
        },
        {
          q: "Tình huống tối ưu hiệu năng trang web?",
          expected: "Trả lời tình huống.",
          ans: null,
          score: 0,
          feedback: "Chưa trả lời do bỏ thi giữa chừng."
        },
        {
          q: "Trong CV bạn ghi làm các dự án Freelance, dự án nào làm bạn tâm đắc nhất?",
          expected: "Trả lời dự án CV.",
          ans: null,
          score: 0,
          feedback: "Chưa trả lời do bỏ thi giữa chừng."
        },
        {
          q: "Kiến thức về React State Management?",
          expected: "Trả lời kiến thức.",
          ans: null,
          score: 0,
          feedback: "Chưa trả lời do bỏ thi giữa chừng."
        },
        {
          q: "Mức lương kỳ vọng?",
          expected: "Nêu mức lương.",
          ans: null,
          score: 0,
          feedback: "Chưa trả lời do bỏ thi giữa chừng."
        },
        {
          q: "Câu hỏi dành cho công ty?",
          expected: "Đặt câu hỏi.",
          ans: null,
          score: 0,
          feedback: "Chưa trả lời do bỏ thi giữa chừng."
        }
      ]
    },

    // --- NHÓM 2: Đã Pass vòng CV, đang chờ HR duyệt / mời PV ---
    {
      name: 'Ngô Thị F - Pass CV Chờ Duyệt 1',
      email: 'c6@quansoftware.com',
      phone: '0951112223',
      type: 'SCREENING_PASSED',
      appStatus: 'SCREENING_PASSED',
      cvText: `Ngô Thị F\nEmail: c6@quansoftware.com | SĐT: 0951112223 | Địa chỉ: Quận 7, TP. HCM\nVị trí: Frontend Engineer\n\nKỸ NĂNG: ReactJS, Next.js, TypeScript, English B2.\nKINH NGHIỆM: 3 năm xây dựng ứng dụng web bằng ReactJS tại Công ty VinTech.`,
      score: 84,
      aiFeedback: {
        knockout_status: "PASSED",
        knockout_reason: "",
        semantic_score: 84,
        evaluation_summary: "Hồ sơ tốt, có kinh nghiệm Next.js và TypeScript đi kèm ReactJS. Tiếng Anh trình độ B2.",
        positive_notes: ["Sử dụng thành thạo Next.js và TypeScript", "Tiếng Anh B2 giao tiếp tốt"],
        negative_notes: [],
        interview_notes: "Ưu tiên chuyển sang vòng phỏng vấn AI.",
        matched_skills: ["ReactJS", "Tiếng Anh (B2)", "Next.js", "TypeScript"],
        missing_skills: []
      }
    },
    {
      name: 'Vũ Văn G - Pass CV Chờ Duyệt 2',
      email: 'c7@quansoftware.com',
      phone: '0962223334',
      type: 'SCREENING_PASSED',
      appStatus: 'SCREENING_PASSED',
      cvText: `Vũ Văn G\nEmail: c7@quansoftware.com | SĐT: 0962223334 | Địa chỉ: Phú Nhuận, TP. HCM\nVị trí: React Developer\n\nKỸ NĂNG: ReactJS, Redux Toolkit, RESTful API, Conversational English.\nKINH NGHIỆM: 2 năm làm việc dự án Fintech tại BankSoft.`,
      score: 79,
      aiFeedback: {
        knockout_status: "PASSED",
        knockout_reason: "",
        semantic_score: 79,
        evaluation_summary: "Đạt tiêu chí cứng. Có kinh nghiệm làm dự án Fintech liên quan đến bảo mật và số hóa.",
        positive_notes: ["Kinh nghiệm làm Fintech tại BankSoft có tính kỷ luật cao"],
        negative_notes: ["Mức độ hiểu sâu về tối ưu render còn hạn chế"],
        interview_notes: "Hỏi kĩ về các kịch bản bẫy Re-render trong React.",
        matched_skills: ["ReactJS", "Tiếng Anh", "Redux Toolkit", "RESTful API"],
        missing_skills: ["TypeScript"]
      }
    },
    {
      name: 'Đặng Thị H - Pass CV Chờ Duyệt 3',
      email: 'c8@quansoftware.com',
      phone: '0973334445',
      type: 'SCREENING_PASSED',
      appStatus: 'SCREENING_PASSED',
      cvText: `Đặng Thị H\nEmail: c8@quansoftware.com | SĐT: 0973334445 | Địa chỉ: Quận 4, TP. HCM\nVị trí: Frontend Developer\n\nKỸ NĂNG: ReactJS, Zustand, Tailwind CSS, English Intermediate.\nKINH NGHIỆM: 2.5 năm thiết kế ứng dụng thương mại điện tử tại ShopeeLab.`,
      score: 82,
      aiFeedback: {
        knockout_status: "PASSED",
        knockout_reason: "",
        semantic_score: 82,
        evaluation_summary: "Hồ sơ ứng viên sáng giá. Sử dụng Zustand hiện đại cho State Management thay vì Redux cồng kềnh.",
        positive_notes: ["Tư duy chọn stack hiện đại (Zustand, Tailwind CSS)", "Dự án e-commerce quy mô lớn tại ShopeeLab"],
        negative_notes: [],
        interview_notes: "Khai thác thêm kinh nghiệm tối ưu hóa trải nghiệm mua hàng và giỏ hàng.",
        matched_skills: ["ReactJS", "Tiếng Anh", "Zustand", "Tailwind CSS"],
        missing_skills: ["GraphQL"]
      }
    },
    {
      name: 'Bùi Văn I - Pass CV Chờ Duyệt 4',
      email: 'c9@quansoftware.com',
      phone: '0984445556',
      type: 'SCREENING_PASSED',
      appStatus: 'SCREENING_PASSED',
      cvText: `Bùi Văn I\nEmail: c9@quansoftware.com | SĐT: 0984445556 | Địa chỉ: Tân Bình, TP. HCM\nVị trí: ReactJS Web Developer\n\nKỸ NĂNG: ReactJS, JavaScript, HTML5/CSS3, Basic English.\nKINH NGHIỆM: 1.5 năm lập trình Frontend tại WebMotion.`,
      score: 74,
      aiFeedback: {
        knockout_status: "PASSED",
        knockout_reason: "",
        semantic_score: 74,
        evaluation_summary: "Đạt đủ tiêu chí sàn. Kinh nghiệm ở mức Mid-Junior.",
        positive_notes: ["Đủ tiêu chí cứng cơ bản"],
        negative_notes: ["Tiếng Anh vừa đủ đọc viết, giao tiếp phản xạ chưa trôi chảy"],
        interview_notes: "Cần kiểm tra phản xạ giao tiếp Tiếng Anh thực tế.",
        matched_skills: ["ReactJS", "Basic English", "JavaScript"],
        missing_skills: ["TypeScript", "Next.js"]
      }
    },
    {
      name: 'Đỗ Thị K - Pass CV Chờ Duyệt 5',
      email: 'c10@quansoftware.com',
      phone: '0995556667',
      type: 'SCREENING_PASSED',
      appStatus: 'SCREENING_PASSED',
      cvText: `Đỗ Thị K\nEmail: c10@quansoftware.com | SĐT: 0995556667 | Địa chỉ: Quận 12, TP. HCM\nVị trí: Frontend Software Engineer\n\nKỸ NĂNG: ReactJS, Redux, English Professional.\nKINH NGHIỆM: 2 năm kinh nghiệm dự án Outsourcing Nhật Bản tại FPT Software.`,
      score: 76,
      aiFeedback: {
        knockout_status: "PASSED",
        knockout_reason: "",
        semantic_score: 76,
        evaluation_summary: "Đạt tiêu chí tuyển dụng. Có kinh nghiệm tuân thủ quy trình chặt chẽ của dự án Outsourcing.",
        positive_notes: ["Kỹ năng làm việc chuyên nghiệp tại FPT Software, chịu được áp lực cao"],
        negative_notes: ["Chưa có nhiều dấu ấn cá nhân trong dự án"],
        interview_notes: "Đánh giá mức độ chủ động trong công việc.",
        matched_skills: ["ReactJS", "English Professional", "Redux"],
        missing_skills: []
      }
    },

    // --- NHÓM 3: Rớt Knock-out do thiếu tiêu chí bắt buộc ---
    {
      name: 'Lý Văn L - Rớt (Thiếu ReactJS)',
      email: 'c11@quansoftware.com',
      phone: '0906667778',
      type: 'REJECT_KNOCKOUT',
      appStatus: 'REJECTED',
      cvText: `Lý Văn L\nEmail: c11@quansoftware.com | SĐT: 0906667778 | Địa chỉ: Tân Bình, TP. Hồ Chí Minh\nVị trí: Angular / PHP Developer\n\nHỌC VẤN: Cử nhân ĐH Công Nghệ Thông Tin\nKỸ NĂNG: Angular 14, PHP Laravel, MySQL, English Intermediate.\nKINH NGHIỆM: 3 năm lập trình Web bằng Angular và Laravel tại Công ty PHPGroup. Chưa từng có kinh nghiệm lập trình ReactJS.`,
      score: 40,
      aiFeedback: {
        knockout_status: "REJECTED",
        knockout_reason: "LOẠI TỰ ĐỘNG (Knock-out): CV ứng viên hoàn toàn thiếu kỹ năng bắt buộc ReactJS (Ứng viên chỉ làm việc với Angular & PHP).",
        semantic_score: 40,
        evaluation_summary: "Hồ sơ bị loại tự động ở Vòng gửi xe vì thiếu kỹ năng nòng cốt ReactJS theo yêu cầu của chiến dịch.",
        positive_notes: ["Có 3 năm kinh nghiệm phát triển Web bằng Angular tại PHPGroup"],
        negative_notes: ["Không có kỹ năng ReactJS", "Phải đào tạo lại toàn bộ từ đầu nếu nhận"],
        interview_notes: "Không đề xuất phỏng vấn.",
        matched_skills: ["English Intermediate"],
        missing_skills: ["ReactJS"]
      }
    },
    {
      name: 'Mai Thị M - Rớt (Thiếu Tiếng Anh)',
      email: 'c12@quansoftware.com',
      phone: '0917778889',
      type: 'REJECT_KNOCKOUT',
      appStatus: 'REJECTED',
      cvText: `Mai Thị M\nEmail: c12@quansoftware.com | SĐT: 0917778889 | Địa chỉ: Gò Vấp, TP. Hồ Chí Minh\nVị trí: Senior Frontend Developer\n\nKỸ NĂNG: ReactJS chuyên sâu, Redux, HTML5, CSS3, Webpack.\nNGOẠI NGỮ: Không sử dụng được Tiếng Anh (Chỉ giao tiếp Tiếng Việt).`,
      score: 45,
      aiFeedback: {
        knockout_status: "REJECTED",
        knockout_reason: "LOẠI TỰ ĐỘNG (Knock-out): Ứng viên xác nhận không giao tiếp được Tiếng Anh, vi phạm tiêu chí bắt buộc của dự án quốc tế.",
        semantic_score: 45,
        evaluation_summary: "Ứng viên vững chuyên môn ReactJS nhưng không đạt tiêu chí ngoại ngữ bắt buộc.",
        positive_notes: ["Chuyên môn ReactJS sâu"],
        negative_notes: ["Không đáp ứng tiêu chí Tiếng Anh bắt buộc"],
        interview_notes: "Tự động loại ở Vòng gửi xe.",
        matched_skills: ["ReactJS"],
        missing_skills: ["Tiếng Anh"]
      }
    },

    // --- NHÓM 4: Rớt do Nộp sai ngành (Wrong Major) ---
    {
      name: 'Trịnh Văn N - Rớt (Kế toán)',
      email: 'c13@quansoftware.com',
      phone: '0928889990',
      type: 'REJECT_WRONG_MAJOR',
      appStatus: 'REJECTED',
      cvText: `Trịnh Văn N\nEmail: c13@quansoftware.com | SĐT: 0928889990 | Địa chỉ: Quận 5, TP. HCM\nVị trí: Chuyên viên Kế Toán Tổng Hợp\n\nHỌC VẤN: Cử nhân Tài chính Kế toán - ĐH Kinh Tế TP.HCM\nKỸ NĂNG: Excel nâng cao, Phần mềm MISA, Báo cáo thuế, Kiểm toán nội bộ.`,
      score: 20,
      aiFeedback: {
        knockout_status: "REJECTED",
        knockout_reason: "LOẠI TỰ ĐỘNG (Knock-out): Hồ sơ thuộc chuyên ngành Kế toán / Kiểm toán, hoàn toàn không có kỹ năng IT hoặc ReactJS.",
        semantic_score: 20,
        evaluation_summary: "Hồ sơ ứng viên nộp nhầm vị trí tuyển dụng chuyên môn IT.",
        positive_notes: [],
        negative_notes: ["Không thuộc ngành IT", "Thiếu hoàn toàn các từ khóa chuyên môn"],
        interview_notes: "Loại ngay lập tức.",
        matched_skills: [],
        missing_skills: ["ReactJS", "Tiếng Anh IT", "Lập trình Web"]
      }
    },
    {
      name: 'Đinh Thị O - Rớt (Marketing)',
      email: 'c14@quansoftware.com',
      phone: '0939990001',
      type: 'REJECT_WRONG_MAJOR',
      appStatus: 'REJECTED',
      cvText: `Đinh Thị O\nEmail: c14@quansoftware.com | SĐT: 0939990001 | Địa chỉ: Bình Thạnh, TP. HCM\nVị trí: Digital Marketing Specialist\n\nHỌC VẤN: Cử nhân Marketing - ĐH Văn Lang\nKỸ NĂNG: Facebook Ads, Google SEO, Content Creation, TikTok Marketing.`,
      score: 15,
      aiFeedback: {
        knockout_status: "REJECTED",
        knockout_reason: "LOẠI TỰ ĐỘNG (Knock-out): Hồ sơ thuộc ngành Marketing & Ads, không liên quan đến lập trình phần mềm.",
        semantic_score: 15,
        evaluation_summary: "Hồ sơ nộp không khớp vị trí kỹ sư phần mềm.",
        positive_notes: [],
        negative_notes: ["Sai lĩnh vực chuyên môn"],
        interview_notes: "Loại tự động.",
        matched_skills: [],
        missing_skills: ["ReactJS", "Lập trình Frontend"]
      }
    },

    // --- NHÓM 5: Rớt do CV Thô tục (Zero Tolerance) ---
    {
      name: 'Tô Văn P - Rớt (CV Thô Tục)',
      email: 'c15@quansoftware.com',
      phone: '0940001112',
      type: 'REJECT_TOXIC_CV',
      appStatus: 'REJECTED',
      cvText: `Tô Văn P\nEmail: c15@quansoftware.com | SĐT: 0940001112 | Địa chỉ: Quận 8, TP. HCM\nVị trí: Coder ReactJS\n\nKỸ NĂNG: ReactJS, JS.\nKINH NGHIỆM: Đã làm việc tại công ty cũ nhưng sếp ngu quá chửi thề nghỉ việc. Mẹ kiếp công ty cũ toàn lũ ăn gian nói dối.`,
      score: 0,
      aiFeedback: {
        knockout_status: "REJECTED",
        knockout_reason: "🚨 LOẠI VI PHẠM (Zero Tolerance): CV chứa ngôn từ xúc phạm thô tục, chửi thề công kích sếp và công ty cũ.",
        semantic_score: 0,
        evaluation_summary: "Phát hiện thái độ thù địch và ngôn từ độc hại trong CV. Ép điểm về 0 tuyệt đối và đưa vào danh sách đen.",
        positive_notes: [],
        negative_notes: ["Sử dụng ngôn từ thô tục trong CV", "Vi phạm đạo đức nghề nghiệp nghiêm trọng"],
        interview_notes: "CẤM PHỎNG VẤN - Đưa vào Blacklist hệ thống.",
        matched_skills: [],
        missing_skills: ["Văn hóa ứng xử chuyên nghiệp"]
      }
    }
  ];

  for (let cIdx = 0; cIdx < candidatesConfig.length; cIdx++) {
    const c = candidatesConfig[cIdx];

    // 5.1 Tạo User
    const [userId] = await knex('users').insert({
      full_name: c.name,
      email: c.email,
      password_hash: passwordHash,
      is_active: true,
      email_verified: true
    }).returning('id').then(res => res.map(r => r.id));

    if (roleCandidate) {
      await knex('user_roles').insert({ user_id: userId, role_id: roleCandidate.id });
    }

    // Đường dẫn Cloudinary RAW PDF đầy đủ chi tiết CV (Học vấn, Kỹ năng, Dự án, Tiếng Anh...) đã khởi tạo thành công
    const rawCloudinaryUrls = [
      'https://res.cloudinary.com/drbfpvper/raw/upload/v1784648702/mock_demo_cvs/cv_candidate_1_v2.pdf',
      'https://res.cloudinary.com/drbfpvper/raw/upload/v1784648704/mock_demo_cvs/cv_candidate_2_v2.pdf',
      'https://res.cloudinary.com/drbfpvper/raw/upload/v1784648705/mock_demo_cvs/cv_candidate_3_v2.pdf',
      'https://res.cloudinary.com/drbfpvper/raw/upload/v1784648706/mock_demo_cvs/cv_candidate_4_v2.pdf',
      'https://res.cloudinary.com/drbfpvper/raw/upload/v1784648707/mock_demo_cvs/cv_candidate_5_v2.pdf',
      'https://res.cloudinary.com/drbfpvper/raw/upload/v1784648708/mock_demo_cvs/cv_candidate_6_v2.pdf',
      'https://res.cloudinary.com/drbfpvper/raw/upload/v1784648709/mock_demo_cvs/cv_candidate_7_v2.pdf',
      'https://res.cloudinary.com/drbfpvper/raw/upload/v1784648711/mock_demo_cvs/cv_candidate_8_v2.pdf',
      'https://res.cloudinary.com/drbfpvper/raw/upload/v1784648712/mock_demo_cvs/cv_candidate_9_v2.pdf',
      'https://res.cloudinary.com/drbfpvper/raw/upload/v1784648713/mock_demo_cvs/cv_candidate_10_v2.pdf',
      'https://res.cloudinary.com/drbfpvper/raw/upload/v1784648714/mock_demo_cvs/cv_candidate_11_v2.pdf',
      'https://res.cloudinary.com/drbfpvper/raw/upload/v1784648715/mock_demo_cvs/cv_candidate_12_v2.pdf',
      'https://res.cloudinary.com/drbfpvper/raw/upload/v1784648716/mock_demo_cvs/cv_candidate_13_v2.pdf',
      'https://res.cloudinary.com/drbfpvper/raw/upload/v1784648717/mock_demo_cvs/cv_candidate_14_v2.pdf',
      'https://res.cloudinary.com/drbfpvper/raw/upload/v1784648718/mock_demo_cvs/cv_candidate_15_v2.pdf'
    ];
    const cvFileUrl = rawCloudinaryUrls[cIdx] || `https://res.cloudinary.com/drbfpvper/raw/upload/v1784648702/mock_demo_cvs/cv_candidate_1_v2.pdf`;

    // 5.2 Tạo CV record trong bảng `cvs`
    const [cvId] = await knex('cvs').insert({
      user_id: userId,
      file_url: cvFileUrl,
      parsed_text: c.cvText,
      ats_score: c.score,
      ai_feedback: JSON.stringify(c.aiFeedback),
      created_at: new Date(),
      updated_at: new Date()
    }).returning('id').then(res => res.map(r => r.id));

    // 5.3 Tạo Application record trong bảng `applications`
    const [appId] = await knex('applications').insert({
      candidate_id: userId,
      cv_id: cvId,
      job_id: jobId,
      status: c.appStatus,
      cv_score: c.score,
      interview_score: c.interviewScore !== undefined ? c.interviewScore : null,
      total_score: c.interviewScore !== undefined && c.interviewScore !== null ? Math.round((c.score + c.interviewScore) / 2) : c.score,
      ai_summary: c.aiFeedback.matched_skills ? c.aiFeedback.matched_skills.slice(0, 3).join(', ') : 'Chưa cập nhật',
      candidate_name: c.name,
      candidate_email: c.email,
      candidate_phone: c.phone,
      created_at: new Date(),
      updated_at: new Date()
    }).returning('id').then(res => res.map(r => r.id));

    // 5.4 Nếu ứng viên thuộc nhóm phỏng vấn AI -> Khởi tạo 8 câu hỏi match với CV vào `interview_questions` & `candidate_answers`
    if (c.type.startsWith('INTERVIEW_') && c.questions && c.questions.length > 0) {
      const [interviewId] = await knex('interviews').insert({
        user_id: userId,
        job_id: jobId,
        type: 'HR_SCREENING',
        status: c.interviewStatus,
        started_at: new Date(),
        ended_at: new Date()
      }).returning('id').then(res => res.map(r => r.id));

      // Cập nhật interview_id cho application
      await knex('applications').where({ id: appId }).update({ interview_id: interviewId });

      const qaDetailsList = [];

      for (let idx = 0; idx < c.questions.length; idx++) {
        const qItem = c.questions[idx];
        
        // Chèn vào bảng `interview_questions`
        const [qId] = await knex('interview_questions').insert({
          interview_id: interviewId,
          question_text: qItem.q,
          expected_answer: qItem.expected,
          score_weight: idx === 3 || idx === 4 || idx === 5 ? 2 : 1,
          order_index: (idx + 1) * 10,
          created_at: new Date(),
          updated_at: new Date()
        }).returning('id').then(res => res.map(r => r.id));

        // Chèn vào bảng `candidate_answers` nếu ứng viên có câu trả lời
        if (qItem.ans !== null) {
          const gazePenalty = c.type === 'INTERVIEW_CHEAT' ? 10 : 0;
          const gazeCount = c.type === 'INTERVIEW_CHEAT' ? 2 : 0;

          await knex('candidate_answers').insert({
            interview_question_id: qId,
            answer_text: qItem.ans,
            ai_feedback: qItem.feedback,
            score: qItem.score,
            gaze_violations: gazeCount,
            gaze_score_penalty: gazePenalty,
            created_at: new Date(),
            updated_at: new Date()
          });
        }

        qaDetailsList.push({
          q: qItem.q,
          a: qItem.ans || 'Chưa trả lời (Đã thoát giữa chừng)',
          score: qItem.score || 0,
          feedback: qItem.feedback
        });
      }

      // Tạo báo cáo tổng quan Assessment
      let overallScore = c.interviewScore;
      let feedbackSummary = '';
      let swearFlag = c.type === 'INTERVIEW_SWEAR';
      let cheatFlag = c.type === 'INTERVIEW_CHEAT';

      if (c.type === 'INTERVIEW_PASS') {
        feedbackSummary = 'Ứng viên trả lời rất xuất sắc, hiểu sâu về ReactJS, Virtual DOM và kỹ thuật Memoization. Câu hỏi số 5 giải trình dự án TechCorp/Software Solutions rất thuyết phục. Kỹ năng giao tiếp Tiếng Anh tốt, thái độ chuyên nghiệp.';
      } else if (swearFlag) {
        feedbackSummary = '🚨 TỪ CHỐI TỰ ĐỘNG (ZERO TOLERANCE): Ứng viên có hành vi văng tục, sử dụng ngôn từ thô lỗ ở câu hỏi tình huống số 4. Hệ thống tự động ngắt phỏng vấn và chấm 0 điểm tuyệt đối.';
      } else if (cheatFlag) {
        feedbackSummary = '⚠️ CẢNH BÁO GIAN LẬN: Ứng viên liên tục quay mặt sang hướng khác, phát hiện âm thanh người thứ 2 nhắc bài ở câu hỏi số 2 và số 5. Trả lời ngập ngừng như đọc tài liệu. Tổng điểm trừ gian lận còn 25.';
      } else if (c.type === 'INTERVIEW_ABANDON') {
        feedbackSummary = 'Ứng viên đã thoát giữa chừng ở câu hỏi số 3. Điểm trung bình phỏng vấn tính trên 2 câu đã trả lời là 18/100.';
      }

      await knex('assessments').insert({
        interview_id: interviewId,
        overall_score: overallScore || 0,
        feedback_summary: feedbackSummary,
        radar_skills: JSON.stringify({
          "Chuyên môn": swearFlag ? 0 : (cheatFlag ? 2 : 9),
          "Thái độ": swearFlag ? 0 : (cheatFlag ? 3 : 9),
          "Giao tiếp": swearFlag ? 0 : (cheatFlag ? 4 : 8)
        }),
        qa_details: JSON.stringify(qaDetailsList)
      });
    }
  }

  console.log('[Seed] Dữ liệu mẫu Quan Software với đầy đủ Điểm phỏng vấn cho ứng viên Hoàng Văn E đã hoàn tất!');
};
