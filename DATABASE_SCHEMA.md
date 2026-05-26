# Tài liệu cấu trúc Cơ sở dữ liệu (Database Schema) - MockAI-Interview

Tài liệu này cung cấp danh sách đầy đủ toàn bộ các bảng trong cơ sở dữ liệu của dự án **MockAI-Interview**, kèm theo chức năng chi tiết và mối quan hệ giữa các bảng. Hệ thống sử dụng cơ sở dữ liệu **PostgreSQL** kết hợp với **Knex.js** để quản lý migrations và truy vấn.

---

## 📂 BẢNG TỔNG HỢP CÁC BẢNG (DATABASE TABLES OVERVIEW)

| STT | Tên Bảng (Table Name) | Phân hệ (Module) | Chức năng chính (Functionality) | Khoá ngoại & Quan hệ chính (Relationships) |
|---|---|---|---|---|
| 1 | `users` | Core / Auth | Lưu trữ thông tin tài khoản người dùng và thông tin cá nhân. | `company_id` -> `companies` (N-1) |
| 2 | `roles` | Core / Admin | Định nghĩa các vai trò trong hệ thống (ADMIN, HR, USER). | (Không có) |
| 3 | `permissions` | Core / Admin | Danh sách các quyền hạn chi tiết trong hệ thống. | (Không có) |
| 4 | `role_permissions` | Core / Admin | Bảng trung gian gán quyền hạn chi tiết cho từng vai trò. | `role_id` -> `roles`, `permission_id` -> `permissions` |
| 5 | `user_roles` | Core / Admin | Bảng gán vai trò trực tiếp cho người dùng (RBAC). | `user_id` -> `users`, `role_id` -> `roles` |
| 6 | `password_resets` | Core / Auth | Quản lý token khôi phục mật khẩu khi người dùng quên. | (Không có) |
| 7 | `companies` | HR / Job | Thông tin chi tiết của công ty/doanh nghiệp. | (Không có) |
| 8 | `categories` | HR / Job | Lĩnh vực ngành nghề công việc (ví dụ: IT, Marketing). | (Không có) |
| 9 | `skills` | Core / CV | Danh mục kỹ năng chung của hệ thống (ví dụ: React, SQL). | (Không có) |
| 10 | `locations` | HR / Job | Danh mục các địa điểm/tỉnh thành làm việc. | (Không có) |
| 11 | `job_types` | HR / Job | Hình thức làm việc (Full-time, Part-time, Remote, Intern). | (Không có) |
| 12 | `jobs` | HR / Job | Tin tuyển dụng do nhà tuyển dụng (HR) đăng tải. | `hr_id` -> `users`, `company_id` -> `companies`, `category_id` -> `categories`, `location_id` -> `locations`, `job_type_id` -> `job_types` |
| 13 | `job_skills` | HR / Job | Bảng trung gian liên kết các kỹ năng yêu cầu trong tin tuyển dụng. | `job_id` -> `jobs`, `skill_id` -> `skills` |
| 14 | `user_skills` | Candidate / CV | Bảng trung gian liên kết kỹ năng và trình độ của ứng viên. | `user_id` -> `users`, `skill_id` -> `skills` |
| 15 | `job_requirements` | HR / Job | Yêu cầu công việc chi tiết của từng tin tuyển dụng. | `job_id` -> `jobs` |
| 16 | `cvs` | Candidate / CV | Lưu trữ tệp CV, điểm số ATS và văn bản trích xuất từ CV. | `user_id` -> `users` |
| 17 | `cv_skills` | Candidate / CV | Kỹ năng chuyên môn do AI bóc tách trực tiếp từ CV ứng viên. | `cv_id` -> `cvs` |
| 18 | `cv_evaluations` | Candidate / CV | Nhận xét chi tiết và điểm số của AI theo từng tiêu chí CV. | `cv_id` -> `cvs` |
| 19 | `interviews` | AI Interview | Buổi phỏng vấn giữa ứng viên và AI (Thật hoặc Luyện tập). | `user_id` -> `users`, `cv_id` -> `cvs`, `job_id` -> `jobs` |
| 20 | `interview_questions`| AI Interview | Bộ câu hỏi phỏng vấn động được AI tạo riêng theo CV và JD. | `interview_id` -> `interviews` |
| 21 | `candidate_answers` | AI Interview | Câu trả lời, điểm số, file ghi âm và phản hồi AI cho từng câu hỏi. | `interview_question_id` -> `interview_questions` |
| 22 | `interview_messages`| AI Interview | Nhật ký transcript trò chuyện văn bản realtime giữa AI và ứng viên. | `interview_id` -> `interviews` |
| 23 | `assessments` | AI Interview | Đánh giá tổng hợp cuối buổi phỏng vấn (điểm, nhận xét, lộ trình). | `interview_id` -> `interviews` (1-1) |
| 24 | `voice_sessions` | AI Voice | Theo dõi phiên thoại phỏng vấn giọng nói (kết nối, thời lượng, ghi âm). | `interview_id` -> `interviews` |
| 25 | `saved_jobs` | Engagement | Danh sách các tin tuyển dụng được ứng viên lưu lại. | `user_id` -> `users`, `job_id` -> `jobs` |
| 26 | `company_followers` | Engagement | Theo dõi các công ty của ứng viên. | `user_id` -> `users`, `company_id` -> `companies` |
| 27 | `job_alerts` | Engagement | Cấu hình nhận thông báo việc làm phù hợp tự động. | `user_id` -> `users` |
| 28 | `applications` | Recruiter / HR | Hồ sơ ứng tuyển của ứng viên vào tin tuyển dụng. | `user_id` -> `users`, `job_id` -> `jobs`, `cv_id` -> `cvs` |
| 29 | `notifications` | Engagement | Thông báo hệ thống gửi đến người dùng. | `user_id` -> `users` |
| 30 | `conversations` | Messaging | Cuộc hội thoại trực tiếp giữa HR và ứng viên. | `sender_id` -> `users`, `receiver_id` -> `users` |
| 31 | `messages` | Messaging | Tin nhắn chi tiết trong cuộc trò chuyện trực tiếp giữa HR - ứng viên. | `conversation_id` -> `conversations`, `sender_id` -> `users` |
| 32 | `interview_schedules`| Recruiter / HR | Lịch hẹn phỏng vấn trực tiếp/online giữa HR và ứng viên. | `application_id` -> `applications`, `interviewer_id` -> `users` |
| 33 | `hr_evaluations` | Recruiter / HR | HR đánh giá chi tiết ứng viên sau buổi phỏng vấn trực tiếp. | `interview_schedule_id` -> `interview_schedules`, `interviewer_id` -> `users` |
| 34 | `cv_templates` | Content | Danh mục các mẫu CV hệ thống cung cấp cho ứng viên. | (Không có) |
| 35 | `blogs` | Community | Bài viết chia sẻ kinh nghiệm cộng đồng (gồm bản nháp, duyệt bài). | `user_id` -> `users`, `category_id` -> `categories` |
| 36 | `feedbacks` | Core / Admin | Phản hồi lỗi hoặc ý kiến đóng góp của người dùng. | `user_id` -> `users` |
| 37 | `reports` | Core / Admin | Các báo cáo vi phạm nội dung hoặc tin tuyển dụng. | `reporter_id` -> `users` |
| 38 | `packages` | Business | Danh sách gói dịch vụ thanh toán (Tin tuyển dụng, Tài khoản Premium). | (Không có) |
| 39 | `transactions` | Business | Lịch sử giao dịch thanh toán của người dùng qua VNPAY/Thẻ. | `user_id` -> `users`, `package_id` -> `packages` |
| 40 | `offers` | Recruiter / HR | Lời mời nhận việc (Job Offer) do nhà tuyển dụng gửi ứng viên. | `application_id` -> `applications`, `hr_id` -> `users` |
| 41 | `email_templates` | Core / System | Mẫu email tự động gửi của hệ thống. | (Không có) |


---

## 🛠️ CHI TIẾT CHỨC NĂNG & QUAN HỆ CÁC PHÂN HỆ (MODULE DETAILS)

### 👤 1. Phân hệ Xác thực & Phân quyền (Auth & RBAC)

#### `users`
*   **Chức năng**: Lưu trữ tài khoản và thông tin cá nhân của toàn bộ thành viên hệ thống.
*   **Quan hệ**: 
    *   Liên kết nhiều-nhiều với `roles` qua bảng `user_roles`.
    *   Liên kết một-nhiều với `cvs`, `interviews`, `jobs`, `applications`.
*   **Các trường cốt lõi**: `id`, `email`, `password` (đã hash), `first_name`, `last_name`, `phone`, `avatar_url`, `is_active`, `company_id`.

#### `roles`, `permissions`, `role_permissions`, `user_roles`
*   **Chức năng**: Cấu hình phân quyền dựa trên vai trò (Role-Based Access Control - RBAC). Có 3 vai trò mặc định: `ADMIN` (Quản trị hệ thống), `HR` (Nhà tuyển dụng), và `USER` (Ứng viên).
*   **Quan hệ**: 
    *   `role_permissions` liên kết `roles` với `permissions` để xác định vai trò nào được thực hiện hành động nào.
    *   `user_roles` liên kết `users` với `roles`.

#### `password_resets`
*   **Chức năng**: Lưu trữ các mã token bảo mật có thời hạn để xác thực quá trình đổi mật khẩu khi người dùng yêu cầu.

---

### 💼 2. Phân hệ Tin tuyển dụng & Doanh nghiệp (Job & Recruitment)

#### `companies`
*   **Chức năng**: Thông tin giới thiệu của doanh nghiệp (tên, logo, quy mô, website, mô tả).
*   **Quan hệ**: Một công ty có nhiều nhà tuyển dụng (`users`) và nhiều tin tuyển dụng (`jobs`).

#### `jobs`, `categories`, `locations`, `job_types`
*   **Chức năng**: Quản lý tin đăng tuyển dụng của HR. AI sử dụng trường `description` và `requirements` trong bảng `jobs` để trích xuất ngữ cảnh đưa ra câu hỏi phỏng vấn thật.
*   **Quan hệ**:
    *   `jobs` thuộc về một `hr_id` (`users`), một `company_id` (`companies`).
    *   Liên kết với ngành nghề (`categories`), địa điểm (`locations`), và loại hình công việc (`job_types`).

#### `job_skills` & `job_requirements`
*   **Chức năng**:
    *   `job_skills`: Liên kết các kỹ năng chuyên môn cần thiết (Skills) cho tin tuyển dụng đó.
    *   `job_requirements`: Định nghĩa chi tiết các yêu cầu công việc (bắt buộc hay tùy chọn).

---

### 📄 3. Phân hệ Hồ sơ năng lực (CV & ATS Scoring)

#### `cvs`
*   **Chức năng**: Lưu tệp CV ứng viên tải lên, chứa điểm chấm ATS (`ats_score`), nhận xét tổng quan (`ai_feedback`) và văn bản thô bóc tách từ file PDF (`parsed_text`).
*   **Quan hệ**: Thuộc về một `user_id`. Liên kết một-nhiều với `cv_skills` và `cv_evaluations`.

#### `cv_skills` & `cv_evaluations`
*   **Chức năng**:
    *   `cv_skills`: Danh sách kỹ năng chuyên môn do AI bóc tách trực tiếp từ CV (ví dụ: Node.js, kinh nghiệm 2 năm).
    *   `cv_evaluations`: Điểm số chi tiết và nhận xét của AI theo từng tiêu chí đánh giá tiêu chuẩn (Học vấn, Kinh nghiệm làm việc, Kỹ năng cứng, Kỹ năng mềm).

#### `user_skills`
*   **Chức năng**: Danh sách kỹ năng ứng viên tự khai báo trên trang cá nhân kèm mức độ thành thạo (`proficiency_level`).

---

### 🤖 4. Phân hệ Phỏng vấn AI & Ghi âm (AI Interview & Voice)

#### `interviews`
*   **Chức năng**: Quản lý phiên phỏng vấn. Gồm 2 loại chính: `PRACTICE` (Ứng viên tự luyện tập giọng nói/văn bản với AI) và `REAL` (Phỏng vấn ứng tuyển thực tế gắn liền với một tin tuyển dụng).
*   **Quan hệ**: Liên kết với `user_id`, `cv_id` (nếu dùng CV làm ngữ cảnh), và `job_id` (nếu phỏng vấn ứng tuyển).

#### `interview_questions` & `candidate_answers`
*   **Chức năng**:
    *   `interview_questions`: Các câu hỏi phỏng vấn được AI tự động sinh ngẫu nhiên/tùy biến dựa trên CV của ứng viên và JD tuyển dụng.
    *   `candidate_answers`: Lưu trữ câu trả lời của ứng viên cho từng câu hỏi, điểm số do AI đánh giá (`score`), nhận xét chi tiết (`ai_feedback`), và tệp ghi âm giọng nói (`audio_url`).

#### `interview_messages`
*   **Chức năng**: Lưu nhật ký hội thoại dạng text nhắn tin qua lại thời gian thực giữa ứng viên và AI.

#### `assessments`
*   **Chức năng**: Đánh giá tổng hợp toàn bộ buổi phỏng vấn. Bao gồm điểm tổng (`overall_score`), nhận xét chung (`feedback_summary`), và lộ trình luyện tập tiếp theo (`learning_path`) dạng JSON.

#### `voice_sessions`
*   **Chức năng**: Theo dõi phiên kết nối thoại phỏng vấn giọng nói. Gồm trạng thái kết nối (`status`: CONNECTED, DISCONNECTED, ERROR), tổng thời lượng cuộc gọi (`duration_seconds`), và file ghi âm tổng hợp (`recording_url`).

---

### ✉️ 5. Phân hệ Tương tác & Ứng tuyển (Applications & Messaging)

#### `applications`
*   **Chức năng**: Quản lý hồ sơ ứng tuyển của candidate vào tin tuyển dụng. Chứa điểm phỏng vấn (`interview_score`), điểm CV (`cv_score`), trạng thái duyệt (`status`: PENDING, REVIEWING, ACCEPTED, REJECTED).
*   **Quan hệ**: Liên kết `user_id` (Candidate), `job_id`, và `cv_id` đã nộp.

#### `conversations` & `messages`
*   **Chức năng**: Hệ thống chat realtime giữa Nhà tuyển dụng (HR) và Ứng viên (Candidate) sau khi ứng tuyển hoặc khi HR chủ động liên hệ. Tích hợp giao tiếp qua Socket.io.

#### `interview_schedules` & `hr_evaluations`
*   **Chức năng**:
    *   `interview_schedules`: Lịch hẹn phỏng vấn trực tiếp do HR lên lịch hẹn cho ứng viên.
    *   `hr_evaluations`: Chứa đánh giá chuyên môn, nhận xét và điểm số của HR chấm cho ứng viên sau cuộc gặp trực tiếp.

---

### 💳 6. Phân hệ Thương mại & Cộng đồng (Business & Community)

#### `packages` & `transactions`
*   **Chức năng**:
    *   `packages`: Các gói dịch vụ của hệ thống (ví dụ: gói Premium cho ứng viên luyện tập không giới hạn, gói đăng tin cho doanh nghiệp).
    *   `transactions`: Lưu lịch sử thanh toán qua cổng VNPAY của người dùng.

#### `blogs`
*   **Chức năng**: Bài đăng cộng đồng do ứng viên viết chia sẻ kinh nghiệm, hỗ trợ lưu nháp (`status = DRAFT`) và cơ chế kiểm duyệt trước khi hiển thị công khai (`PUBLISHED`).

#### `feedbacks`, `reports`, `offers`, `email_templates`
*   **Chức năng**: Các bảng tiện ích quản trị hệ thống, xử lý báo cáo vi phạm, gửi thư mời nhận việc tự động và quản lý các template email giao dịch.
