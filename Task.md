# Hệ Thống Phỏng Vấn Giả Lập AI (AI Mock Interview Platform)

Dự án xây dựng nền tảng phỏng vấn trực tuyến tích hợp trí tuệ nhân tạo để hỗ trợ ứng viên luyện tập kỹ năng trả lời và nhận phản hồi chi tiết dựa trên CV cá nhân.

## 🛠 Ngăn Xếp Công Nghệ (Tech Stack)

- **Frontend:** ReactJS + Vite app, Tailwind CSS, Lucide Icons, Chart.js/Recharts (Radar Chart), Three.js, React bits.
- **Backend:** Node.js, Express.js.
- **Database:** PostgreSQL.
- **AI & ML:**
  - `whisper-node` (Speech-to-Text)
  - `node-llama-cpp` (Llama-3 model)
  - `pdf-parse` (CV Extraction)
- **Real-time & Storage:** WebRTC/WebSockets, JWT, AWS S3/Cloudinary.

---

## 👥 Phân Công Nhiệm Vụ & Các Module

### 1. Phương - Module Core Phỏng vấn Thực chiến (In-Interview: AI Voice Engine)

Đây là trái tim của dự án, đòi hỏi xử lý thời gian thực với độ trễ thấp.

**Frontend (ReactJS):**

- Quản lý luồng WebRTC để lấy audio từ microphone
- Thiết kế giao diện phòng phỏng vấn (animation sóng âm khi user nói và khi AI phản hồi)
- Nút chọn "Phong cách HR" (Thân thiện / Áp lực)

**Backend (Node.js):**

- Xử lý audio stream
- Điều phối luồng dữ liệu liên tục giữa Frontend và các AI Engine

**AI:**

- Tích hợp mô hình Whisper để nhận diện giọng nói (STT)
- Kết nối text với Llama-3 để AI suy luận câu hỏi tiếp theo dựa trên context CV
- Để tránh việc AI phản hồi quá chậm làm gãy nhịp giao tiếp, có thể nghiên cứu đấu nối qua các dịch vụ tối ưu tốc độ sinh text như Groq API thay vì chạy model local quá nặng

### 2. Quân - Module Sàng lọc & Tối ưu CV (Pre-Interview: CV Processing)

Quân phụ trách "cửa ải" đầu tiên, giúp ứng viên tút tát lại CV trước khi vào phỏng vấn.

**Frontend (ReactJS):**

- Làm giao diện kéo thả upload file PDF
- Form nhập hoặc paste Job Description (JD)
- Xây dựng UI hiển thị hai cột (CV gốc - CV gợi ý sửa)
- Bôi đỏ các từ khóa bị thiếu

**Backend (Node.js):**

- Tích hợp thư viện (ví dụ: pdf-parse) để trích xuất text từ file PDF
- Tiền xử lý văn bản trước khi đẩy qua AI

**AI:**

- Tối ưu prompt cho Llama-3 để đóng vai hệ thống ATS
- So khớp kỹ năng trong CV với JD
- Đối chiếu với các tiêu chuẩn sàng lọc khắt khe từ các chương trình Fresher (như FPT Software hay các tập đoàn lớn)
- Đưa ra đánh giá độ khớp và gợi ý dùng "Action Verbs" để viết lại kinh nghiệm làm việc

### 3. A - Module Admin: Quản trị Hệ thống & Phân tích (Admin Portal & Analytics)

#### 1. Frontend (ReactJS)

- **Admin Dashboard:** Giao diện tổng quan (tách biệt hoàn toàn với giao diện của ứng viên), hiển thị các chỉ số hệ thống như: Tổng số user đăng ký, số lượt phỏng vấn diễn ra trong ngày/tuần, lưu lượng sử dụng hệ thống.
- **Quản lý Người dùng (User Management):** Bảng danh sách user, cho phép Admin xem thông tin, phân quyền (User/Instructor/Admin), hoặc khóa tài khoản (Block/Ban) nếu có dấu hiệu spam.
- **Quản lý Ngân hàng dữ liệu (Prompt & Question CMS):** Giao diện cho phép Admin tinh chỉnh các "Câu lệnh mồi" (System Prompts) của Llama-3, hoặc thêm/sửa/xóa các bộ câu hỏi mẫu cho từng ngành nghề (Frontend, Backend, BA, v.v.).

#### 2. Backend (Node.js)

- **Bảo mật & Phân quyền (RBAC - Role-Based Access Control):** Xây dựng Middleware để chặn các route nhạy cảm, đảm bảo chỉ tài khoản có role Admin mới gọi được các API quản trị.
- **Quản lý Giới hạn (Rate Limiting & Quota):** Xây dựng cơ chế giới hạn số lần phỏng vấn của mỗi user (ví dụ: mỗi ngày chỉ được tạo 3 phòng phỏng vấn) để tránh server bị quá tải do chạy model AI liên tục.
- **Audit Logs:** Lưu vết toàn bộ hoạt động của hệ thống (ai đã đăng nhập, ai đã sửa prompt, lỗi server xảy ra lúc nào) để dễ dàng trace bug (truy vết lỗi).

#### 3. Tích hợp AI trong quản trị

Đừng để Admin phải làm việc chân tay, hãy dùng chính AI để giúp Admin quản lý hệ thống thông minh hơn:

- **Phân tích Xu hướng Toàn cục (Global Trend Analysis):** Thay vì chỉ đánh giá 1 user, AI sẽ tổng hợp data của tất cả các cuộc phỏng vấn trong tháng và xuất ra báo cáo xu hướng. Ví dụ: "Tháng này có 500 sinh viên phỏng vấn vị trí ReactJS, nhưng 70% đều trả lời sai câu hỏi về Redux". Dữ liệu này cực kỳ quý giá cho các trung tâm đào tạo.
- **Tự động làm giàu Ngân hàng câu hỏi (Auto-generate Question Bank):** Admin chỉ cần đưa vào hệ thống một file JD mới (Ví dụ: tuyển dụng Data Engineer), AI sẽ tự động phân tích và "đẻ" ra một bộ 50 câu hỏi phỏng vấn tiêu chuẩn kèm barem chấm điểm, sau đó tự động lưu vào Database dùng chung cho hệ thống.

### 4. Khánh - Module Không gian Technical (In-Interview: Mini IDE & Code Evaluation)

Khánh sẽ phụ trách một tab đặc biệt trong phòng phỏng vấn dành riêng cho dân IT.

**Frontend (ReactJS):**

- Tích hợp một bộ Code Editor (ví dụ: Monaco Editor) ngay bên cạnh màn hình phỏng vấn
- Hỗ trợ highlight cú pháp cho các ngôn ngữ phổ biến như Java, Python, Javascript

**Backend (Node.js):**

- Xây dựng một môi trường an toàn (sandbox) để lưu trữ lại các đoạn code ứng viên vừa viết
- Đồng bộ realtime giữa màn hình của ứng viên và dữ liệu đẩy về backend

**AI:**

- Dùng AI để phân tích đoạn code ứng viên đang gõ
- Kiểm tra code chạy đúng hay sai
- Phân tích tư duy giải thuật
- Đẩy signal (tín hiệu) sang cho module của Phương để AI (HR) cất giọng hỏi xoáy: "Tại sao bạn lại dùng vòng lặp ở đây mà không tối ưu bằng Map/Filter?"

### 5. Huy - Module Đánh giá Đa chiều & Báo cáo PDF (Post-Interview: Assessment & Report)

Huy lo phần "Hậu kỳ", tổng hợp kết quả để đưa ra giá trị thực tế nhất cho người học.

**Frontend (ReactJS):**

- Sử dụng các thư viện (như Recharts hoặc Chart.js) để vẽ biểu đồ Radar 5 cánh (Chuyên môn, Logic, Tự tin, Giải quyết vấn đề, Culture fit)
- Xây dựng UI hiển thị Lộ trình học tập (Learning Path) với các keyword ôn tập

**Backend (Node.js):**

- Gom toàn bộ dữ liệu từ Quân (Điểm CV), Phương (Transcript phỏng vấn), Khánh (Kết quả code)
- Tích hợp engine tạo file PDF (như puppeteer hoặc pdfkit) để render báo cáo

**AI:**

- Quét toàn bộ nội dung cuộc trò chuyện để trích xuất các "lỗ hổng kiến thức" của ứng viên
- Sinh tự động các lời khuyên chuyên môn
- Chấm điểm số cuối cùng để in vào báo cáo

---

## 🔄 Quy trình hoạt động (Workflow)

1. **User Foundation:** Đăng nhập và upload CV.
2. **AI Input (CV):** Trích xuất thông tin kỹ năng từ CV.
3. **Core System:** Mở phòng phỏng vấn, stream âm thanh ứng viên.
4. **AI Input (STT):** Chuyển giọng nói ứng viên thành văn bản.
5. **AI Output (LLM):** Llama-3 phân tích văn bản và đưa ra câu hỏi tiếp theo hoặc đánh giá.
6. **Reporting:** Hiển thị kết quả dưới dạng biểu đồ và nhận xét.
7. **Admin:** Theo dõi toàn bộ chỉ số hoạt động của hệ thống.
