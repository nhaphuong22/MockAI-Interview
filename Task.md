# MockAI - Nền tảng Hỗ trợ Việc làm Toàn diện tích hợp AI

Dự án xây dựng hệ sinh thái hỗ trợ việc làm hiện đại, sử dụng trí tuệ nhân tạo để tối ưu hóa hồ sơ năng lực, luyện tập phỏng vấn thực tế và xây dựng lộ trình sự nghiệp cá nhân hóa dựa trên dữ liệu thị trường.

## 🛠 Ngăn Xếp Công Nghệ (Tech Stack)

- **Frontend:** React 19, Vite, Tailwind CSS v4, Zustand (UI State), TanStack Query (Server State), Framer Motion, Three.js.
- **Backend:** Node.js, Express.js.
- **Database:** PostgreSQL (Knex.js).
- **AI & ML:**
  - `whisper-node` (Speech-to-Text)
  - `node-llama-cpp` (Llama-3 model)
  - `pdf-parse` (CV Extraction & Analysis)
- **Real-time & Storage:** Socket.io, JWT, AWS S3/Cloudinary.

---

## 👥 Phân Công Nhiệm Vụ (5 Phân hệ - 5 Thành viên)

### 1. Quân - Module phỏng vấn kiến thức giữa ứng viên với AI (Chỉ test kiến thức)
- Sau khi ứng viên nộp CV lên hệ thống thì AI sẽ dựa vào CV và requirements của vị trí ứng tuyển để đặt câu hỏi cho ứng viên.
- Sau khi hoàn tất buổi phỏng vấn với AI thì AI sẽ dựa vào câu trả lời của ứng viên để đánh giá sau đó gửi về cho HR và xếp hạng danh sách ứng viên và update trên giao diện của HR.

### 2. Phương - Module luyện tập Phỏng vấn Giọng nói & Tương tác AI (AI Voice Engine & Interaction)
- Module sẽ bao gồm các kỹ năng phỏng vấn như là xin chào, small talk, giao tiếp cơ bản trước khi đi vào phỏng vấn chuyên sâu về kỹ năng, điểm mạnh điểm yếu, câu hỏi chuyên môn, và kết thúc buổi phỏng vấn. Tương tác giữa user và AI sẽ là voice/video (có thể tắt camera).
- User sẽ đưa CV vào và lựa chọn vị trí muốn ứng tuyển sau đó hệ thống AI sẽ đưa ra danh sách để cho phép user luyện tập phỏng vấn thông qua giọng nói (user và AI sẽ trò chuyện với nhau).
- Sau khi hoàn tất buổi phỏng vấn với AI thì AI sẽ dựa vào câu trả lời của ứng viên để đánh giá sau đó đưa ra lộ trình luyện tập phỏng vấn và hướng dẫn cách trả lời các câu hỏi phỏng vấn cho ứng viên để có thể trả lời phỏng vấn tốt hơn.

### 3. Khánh - Module giao diện và chức năng cho HR đăng bài ứng tuyển
- HR sẽ đăng bài ứng tuyển lên hệ thống.
- Hệ thống sẽ dựa vào bài đăng tuyển để đưa ra danh sách các câu hỏi phỏng vấn.
- HR sẽ xem danh sách các ứng viên và đánh giá.
- HR sẽ xem danh sách các bài đánh giá CV và chấm điểm CV.

### 4. Huy - Module Đánh giá CV, chấm điểm CV và gợi ý chỉnh sửa CV & Blog Cộng đồng
- User sẽ upload CV lên hệ thống.
- Hệ thống sẽ dựa vào CV và yêu cầu của vị trí ứng tuyển để đánh giá CV và chấm điểm CV.
- Sau khi đánh giá CV thì hệ thống sẽ đưa ra lộ trình luyện tập phỏng vấn và hướng dẫn cách trả lời các câu hỏi phỏng vấn cho ứng viên để có thể trả lời phỏng vấn tốt hơn.
- Ứng viên có thể upload CV của mình và yêu cầu AI chấm điểm theo vị trí mà mình muốn ứng tuyển để AI chấm điểm.
- Có thể đánh giá CV một cách tổng quan và đưa ra nhận xét tổng quan về CV.
- Phát triển các tính năng cộng đồng: Viết blog chia sẻ, lưu nháp, đăng tải ảnh bìa, xem danh sách bài viết cộng đồng (Community Feed) và xem chi tiết bài đăng.

### 5. Sang - Module giao diện và chức năng cho Admin hệ thống để quản lý các users & Kiểm duyệt nội dung
- Admin hệ thống sẽ quản lý các users (phân quyền RBAC, kích hoạt/khóa tài khoản).
- Admin hệ thống sẽ quản lý các bài đăng tuyển (kiểm duyệt duyệt/ẩn các tin tuyển dụng của HR).
- Admin hệ thống sẽ quản trị các bài viết cộng đồng (kiểm duyệt duyệt/từ chối các bài blog của ứng viên đăng tải).
- Admin hệ thống sẽ quản lý các bài luyện tập phỏng vấn và xem biểu đồ Analytics tổng hợp hệ thống.

---

## 📅 LỘ TRÌNH PHÁT TRIỂN FULL-STACK (5 GIAI ĐOẠN - FE & BE)

### GIAI ĐOẠN 1: Thiết lập & Khởi tạo (Core Setup & Shells)
*   **Quân (AI Knowledge)**:
    *   *BE*: Viết API khởi tạo lượt phỏng vấn mới (`/api/interviews/init`), xác thực quyền của Candidate và liên kết Job ID.
    *   *FE*: Thiết kế màn hình chào mừng (Welcome UI) của phòng phỏng vấn kiến thức, hiển thị quy chế phòng thi.
*   **Phương (AI Voice)**:
    *   *BE*: Viết API đăng ký phiên Voice Session mới trong `voice_sessions`.
    *   *FE*: Thiết kế màn hình chọn thiết bị mic và kiểm tra âm thanh đầu vào.
*   **Khánh (HR Module)**:
    *   *BE*: Viết API tạo tin tuyển dụng (`/api/jobs`) và lưu các yêu cầu chi tiết vào bảng `job_requirements`.
    *   *FE*: Thiết kế Form đăng tin tuyển dụng phía HR.
*   **Huy (CV & Candidate Blog)**:
    *   *BE*: Viết API upload CV thô (`pdf-parse`) và API lưu bài viết nháp (`/api/blogs/draft`).
    *   *FE*: Thiết kế giao diện drag-and-drop tải CV và Form soạn thảo bài viết nháp (Markdown Editor) của ứng viên.
*   **Sang (Admin Module)**:
    *   *BE*: API CRUD User cơ bản, gán role mặc định vào `user_roles`.
    *   *FE*: Giao diện quản lý danh sách Users ở Admin Dashboard.

---

### GIAI ĐOẠN 2: Xử lý Dữ liệu & Đăng tải (Data Processing & Blog Submit)
*   **Quân (AI Knowledge)**:
    *   *BE*: Prompt AI sinh câu hỏi phỏng vấn động lưu vào `interview_questions`.
    *   *FE*: Giao diện danh sách câu hỏi phỏng vấn dạng thẻ thông tin (Card layout).
*   **Phương (AI Voice)**:
    *   *BE*: API nhận file ghi âm ngắn và tích hợp thư viện Speech-to-Text.
    *   *FE*: Nút ghi âm microphone và hiệu ứng đang thu âm.
*   **Khánh (HR Module)**:
    *   *BE*: API sửa/xóa/đóng/mở tin tuyển dụng.
    *   *FE*: Trang quản lý tin tuyển dụng của HR Dashboard.
*   **Huy (CV & Candidate Blog)**:
    *   *BE*: API chấm điểm CV và API tải ảnh bìa, gửi yêu cầu duyệt bài viết (`/api/blogs/:id/submit`).
    *   *FE*: Giao diện hiển thị kỹ năng CV và giao diện upload ảnh bìa, điền thẻ (tags), danh mục (category) bài viết.
*   **Sang (Admin Module)**:
    *   *BE*: API kích hoạt/khóa tài khoản người dùng (`is_active` toggle).
    *   *FE*: Các nút bấm toggle trạng thái hoạt động của User và hiển thị quyền hạn.

---

### GIAI ĐOẠN 3: Tương tác Động & Phê duyệt (Dynamic Feedback & Admin Review)
*   **Quân (AI Knowledge)**:
    *   *BE*: API nhận câu trả lời chat, gọi AI chấm điểm và sinh câu hỏi tiếp theo.
    *   *FE*: Khung chat phỏng vấn thời gian thực dạng nhắn tin qua lại với AI.
*   **Phương (AI Voice)**:
    *   *BE*: API chuyển văn bản của AI thành âm thanh thoại (Text-to-Speech).
    *   *FE*: Hiệu ứng sóng âm Ocean Blue chuyển động theo giọng phát của AI.
*   **Khánh (HR Module)**:
    *   *BE*: API lấy danh sách hồ sơ nộp vào Job (kèm điểm CV & điểm phỏng vấn).
    *   *FE*: Giao diện danh sách ứng viên nộp hồ sơ phía HR Dashboard.
*   **Huy (CV & Candidate Blog)**:
    *   *BE*: API gọi AI phân tích điểm yếu CV và API lấy chi tiết bài viết blog, tăng lượt xem.
    *   *FE*: Biểu đồ Radar CV và trang xem chi tiết bài đăng blog (Blog Detail) phía ứng viên.
*   **Sang (Admin Module)**:
    *   *BE*: API Admin ẩn/hiện tin tuyển dụng và API Admin duyệt/từ chối bài viết cộng đồng (`/api/admin/blogs/:id/review`).
    *   *FE*: Giao diện Admin duyệt tin tuyển dụng và giao diện Admin duyệt bài viết (`ManageBlog.jsx` có nút Duyệt/Từ chối).

---

### GIAI ĐOẠN 4: Thời gian thực & Bảng tin (Realtime & Community Feed)
*   **Quân (AI Knowledge)**:
    *   *BE*: API tổng hợp điểm phỏng vấn, cập nhật `interview_score` trong `applications`.
    *   *FE*: Trang kết quả phỏng vấn và vị trí xếp hạng của Candidate trong Job.
*   **Phương (AI Voice)**:
    *   *BE*: Logic hội thoại thoại hoàn chỉnh và AI sinh lộ trình ôn tập.
    *   *FE*: Trang hiển thị kết quả phỏng vấn giọng nói và lộ trình ôn luyện.
*   **Khánh (HR Module)**:
    *   *BE*: Server Socket.io chat realtime giữa HR và Candidate.
    *   *FE*: Hộp thoại Chat Realtime trực tiếp trong HR Dashboard.
*   **Huy (CV & Candidate Blog)**:
    *   *BE*: API xuất PDF báo cáo sửa CV và API lấy danh sách các bài blog đã xuất bản (`/api/blogs/published`).
    *   *FE*: Nút bấm tải báo cáo PDF và trang Bảng tin Cộng đồng (Community Feed Layout) hiển thị danh sách blog dạng lưới (Grid Cards).
*   **Sang (Admin Module)**:
    *   *BE*: API tổng hợp số liệu tăng trưởng của toàn hệ thống.
    *   *FE*: Biểu đồ thống kê Admin Analytics (đăng ký mới, số lượt phỏng vấn...).

---

### GIAI ĐOẠN 5: Chống gian lận & Phân quyền (Security & Configurations)
*   **Quân (AI Knowledge)**:
    *   *BE*: API phát hiện gian lận (đếm số lần chuyển tab) và tự động hủy kết quả.
    *   *FE*: Lắng nghe sự kiện chuyển tab trình duyệt và hiện cảnh báo.
*   **Phương (AI Voice)**:
    *   *BE*: Cấu hình tối ưu độ trễ âm thanh STT-TTS, dọn dẹp âm thanh tạm.
    *   *FE*: Tối ưu UI sóng âm 3D mượt mà khi AI nói chuyện.
*   **Khánh (HR Module)**:
    *   *BE*: API gửi email tự động (Nodemailer) báo kết quả duyệt ứng viên.
    *   *FE*: Nút duyệt ứng viên Đạt/Không đạt kèm điền mẫu email nhanh.
*   **Huy (CV & Candidate Blog)**:
    *   *BE*: Xử lý lỗi Parser CV khi file hỏng và API lấy bài viết liên quan (Related posts).
    *   *FE*: Toast thông báo lỗi file CV và bộ lọc bài viết theo tags và category ở trang Cộng đồng.
*   **Sang (Admin Module)**:
    *   *BE*: API cập nhật ma trận quyền hạn `role_permissions` trực tiếp.
    *   *FE*: Bảng ma trận checkbox để Admin cấu hình phân quyền trực tiếp cho các Role.
