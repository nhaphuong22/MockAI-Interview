# HÀNH TRÌNH SỬ DỤNG VÀ HƯỚNG DẪN VẬN HÀNH HỆ THỐNG MOCKAI-INTERVIEW
## TÀI LIỆU HƯỚNG DẪN SỬ DỤNG CHI TIẾT (USER MANUAL & INSTALLATION GUIDE)

---

## 📋 MỤC LỤC (TABLE OF CONTENTS)

- **I. DELIVERABLE PACKAGE** (Các thành phần bàn giao của dự án)
- **II. INSTALLATION GUIDES** (Hướng dẫn thiết lập và chạy hệ thống)
- **III. USER MANUAL** (Tài liệu hướng dẫn sử dụng chi tiết)
  - **1. Overview** (Tổng quan hệ thống MockAI-Interview)
  - **2. User Manual Guide for Guest**
    - **2.1. Search & Filter Job Posts**
      - a) Show the list of jobs.
      - b) Filter jobs by criteria (location, job type, category).
      - c) Search jobs by keyword.
    - **2.2. View Employer's Information**
      - a) Show company profile details.
    - **2.3. View Job Post Details**
      - a) Show detailed description & requirements of a job.
    - **2.4. Register**
      - a) Register as Candidate.
      - b) Register as Recruiter.
  - **3. User Manual Guide for Candidate**
    - **3.1. Login & Identity Management**
      - a) Login into the platform.
      - b) Forgot Password (recover via email).
    - **3.2. Profile Management**
      - a) View Candidate profile.
      - b) Edit profile details & declare skills.
    - **3.3. CV & AI ATS Management**
      - a) Upload CV (PDF format).
      - b) View AI CV Parsing & Skill Extraction.
      - c) View AI ATS Scoring & detailed feedback.
    - **3.4. AI Practice Interview**
      - a) Start an AI Practice Interview session.
      - b) Record and answer AI questions via voice.
      - c) View detailed AI Assessment.
      - d) View personalized Learning Path.
    - **3.5. Job Application & Real Interview**
      - a) Apply to a Job Post.
      - b) Take a Real AI Interview for applied job.
      - c) View Application Status & Interview Schedules.
    - **3.6. Community Interaction**
      - a) Read community blog posts.
      - b) Write and manage personal blog posts.
  - **4. User Manual Guide for Employer (HR / Recruiter)**
    - **4.1. Company Settings**
      - a) Update company profile information.
    - **4.2. Job Post Management**
      - a) Create a new Job Post.
      - b) View and update posted jobs (edit or deactivate).
    - **4.3. Candidate Management**
      - a) View list of candidates applied for a job.
      - b) View candidate details (Resume & Cover Letter).
      - c) Evaluate candidate's AI ATS Score & AI Interview result.
      - d) Update application status.
    - **4.4. Interview Scheduling & Communication**
      - a) Schedule a face-to-face or online interview.
      - b) Send automated notification email to candidates.
      - c) Chat real-time with candidates.
  - **5. User Manual Guide for Administrator**
    - **5.1. System & Security Management**
      - a) Manage system users (activate/deactivate).
      - b) Configure RBAC (Roles & Permissions).
    - **5.2. Content Moderation**
      - a) Moderate blog posts (approve or reject).
    - **5.3. Financial & System Configuration**
      - a) Manage pricing packages.
      - b) Track transactions history (VNPAY payments).
      - c) Manage system email templates.
    - **5.4. Feedback & Violation Reports**
      - a) Manage user feedback logs.
      - b) Review and resolve report violations.

---

## I. DELIVERABLE PACKAGE

Deliverable Package (Gói sản phẩm bàn giao) của dự án **MockAI-Interview** bao gồm các thành phần sau:

1.  **Mã nguồn toàn bộ dự án (Project Source Code)**
    *   **Backend Source Code (`/backend`)**: Xây dựng bằng Node.js, Express, Knex.js kết nối PostgreSQL.
    *   **Frontend Source Code (`/frontend`)**: Xây dựng bằng React 19, Vite, Tailwind CSS v4, Zustand và TanStack Query.
    *   **Monorepo Config**: Tập tin cấu hình gốc `package.json`, `pnpm-workspace.yaml`, và lockfile `pnpm-lock.yaml`.
2.  **Cơ sở dữ liệu (Database Artifacts)**
    *   **Database Migrations (`/backend/migrations`)**: Các tệp tin định nghĩa cấu trúc 34 bảng cơ sở dữ liệu PostgreSQL.
    *   **Database Seeds (`/backend/seeds`)**: Dữ liệu mẫu ban đầu phục vụ chạy thử nghiệm hệ thống (tài khoản mẫu, dữ liệu danh mục ngành nghề, địa điểm, vai trò, quyền hạn).
3.  **Tài liệu kỹ thuật và thiết kế (System Documentation)**
    *   `docs/DATABASE_SCHEMA.md`: Tài liệu cấu trúc cơ sở dữ liệu chi tiết của 34 bảng.
    *   `docs/DATABASE_EXPLANATION.md`: Giải thích chi tiết các mối quan hệ thực thể và sơ đồ logic.
    *   `docs/ai_interview_voice_spec.md`: Tài liệu thiết kế kỹ thuật, biểu đồ tuần tự (Sequence Diagram), biểu đồ lớp (Class Diagram) và truy vấn SQL của phân hệ phỏng vấn thoại AI.
    *   `docs/package_diagram.md`: Sơ đồ các package của hệ thống.
4.  **Tệp cấu hình môi trường mẫu (Environment Configuration)**
    *   `.env.example` (thư mục gốc, `/frontend`, `/backend`): Chứa các biến môi trường mẫu cần thiết.

---

## II. INSTALLATION GUIDES

Hướng dẫn cài đặt và thiết lập dự án trên môi trường Local Development (máy tính cá nhân).

### 1. Yêu cầu hệ thống (System Prerequisites)
*   **Node.js**: Phiên bản v18.0.0 hoặc v20.0.0 trở lên.
*   **pnpm**: Phiên bản v9.0.0 trở lên (Trình quản lý package hiệu năng cao).
*   **PostgreSQL**: Phiên bản v15 hoặc v16 đã cài đặt và đang chạy cục bộ (hoặc một Cloud Instance PostgreSQL như Supabase, Aiven).

### 2. Các bước thiết lập Cơ sở dữ liệu (Database Setup)
1.  Mở hệ quản trị cơ sở dữ liệu PostgreSQL (pgAdmin hoặc terminal).
2.  Tạo một cơ sở dữ liệu mới có tên: `mockai_interview`.
3.  Sao chép tệp cấu hình môi trường tại thư mục `/backend`:
    ```bash
    cp backend/.env.example backend/.env
    ```
4.  Cập nhật giá trị kết nối cơ sở dữ liệu trong tệp `backend/.env`:
    ```env
    DATABASE_URL=postgres://username:password@localhost:5432/mockai_interview
    # Hoặc khai báo riêng lẻ các thông số kết nối:
    DB_HOST=127.0.0.1
    DB_USER=your_postgres_username
    DB_PASSWORD=your_postgres_password
    DB_NAME=mockai_interview
    DB_PORT=5432
    ```

### 3. Cài đặt thư viện và khởi chạy dự án (Installation & Launch)
Hệ thống sử dụng cơ chế Monorepo Workspace (pnpm). Thực hiện các lệnh sau tại **Thư mục gốc (Root Directory)**:

1.  **Cài đặt toàn bộ dependencies** cho cả frontend và backend:
    ```bash
    pnpm install
    ```
2.  **Khởi tạo cơ sở dữ liệu** (Migrations & Seeds):
    ```bash
    # Chạy migrations tạo 34 bảng trong DB
    pnpm --filter backend run db:migrate
    
    # Chèn dữ liệu thử nghiệm ban đầu (Roles, Permissions, Locations...)
    pnpm --filter backend run db:seed
    ```
3.  **Cấu hình biến môi trường cho Frontend**:
    *   Sao chép tệp cấu hình tại `/frontend`:
        ```bash
        cp frontend/.env.example frontend/.env
        ```
    *   Cấu hình cổng API trỏ đến Backend:
        ```env
        VITE_API_URL=http://localhost:5000
        VITE_SOCKET_URL=http://localhost:5000
        ```
4.  **Khởi chạy đồng thời cả Backend và Frontend** ở chế độ phát triển:
    ```bash
    pnpm dev
    ```
    *   **Backend Server** sẽ chạy tại: [http://localhost:5000](http://localhost:5000)
    *   **Frontend Client** sẽ chạy tại: [http://localhost:5173](http://localhost:5173) (hoặc cổng tiếp theo khả dụng)

---

## III. USER MANUAL

### 1. Overview (Tổng quan hệ thống)
**MockAI-Interview** là nền tảng kết nối ứng viên và nhà tuyển dụng tích hợp AI cao cấp. Hệ thống giúp ứng viên tối ưu hóa hồ sơ năng lực (chấm điểm ATS CV), luyện tập phỏng vấn giọng nói trực tiếp với AI ảo, và giúp nhà tuyển dụng (HR) quản lý, đánh giá hồ sơ ứng viên hiệu quả dựa trên công nghệ AI.

---

### 2. User Manual Guide for Guest

Khách vãng lai (Guest) là người dùng chưa thực hiện đăng nhập vào hệ thống. Theo cấu hình bảo mật của dự án, Guest chỉ được phép xem Landing Page, tìm kiếm, lọc và xem thông tin chi tiết của tin tuyển dụng và doanh nghiệp. Nếu Guest cố gắng truy cập các tính năng nội bộ, hệ thống sẽ chặn điều hướng và yêu cầu đăng nhập.

#### 2.1. Search & Filter Job Posts

##### a) Show the list of jobs.
*   **Mô tả**: Hiển thị danh sách các tin tuyển dụng đang hoạt động trên hệ thống.
*   **Các bước thực hiện**:
    *   **Bước 1**: Truy cập trang chủ hệ thống MockAI-Interview.
    *   **Bước 2**: Trên thanh điều hướng (Navbar), nhấn vào mục **Việc làm** (Jobs).
    *   **Bước 3**: Hệ thống tự động tải và hiển thị danh sách toàn bộ các tin tuyển dụng đang mở.
*   **Kết quả mong đợi**: Danh sách việc làm hiển thị trực quan dưới dạng thẻ (Cards) chứa thông tin cơ bản: Tên công việc, logo & tên công ty, mức lương, địa điểm.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh chụp màn hình trang Danh sách việc làm]**

##### b) Filter jobs by criteria (location, job type, category).
*   **Mô tả**: Lọc danh sách công việc theo các tiêu chí cụ thể để thu hẹp kết quả tìm kiếm.
*   **Các bước thực hiện**:
    *   **Bước 1**: Tại trang danh sách việc làm, tìm khu vực bộ lọc (thường nằm ở thanh bên trái - Sidebar).
    *   **Bước 2**: Tích chọn các tiêu chí lọc: Địa điểm (Hà Nội, TP.HCM...), Hình thức (Full-time, Part-time, Remote), hoặc Ngành nghề (IT, Marketing...).
    *   **Bước 3**: Hệ thống tự động gửi request lọc và tải lại danh sách việc làm phù hợp.
*   **Kết quả mong đợi**: Danh sách việc làm được cập nhật chỉ hiển thị những công việc khớp với các tiêu chí đã chọn.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh chụp màn hình thanh bộ lọc Sidebar đang hoạt động]**

##### c) Search jobs by keyword.
*   **Mô tả**: Tìm kiếm việc làm nhanh bằng cách gõ từ khóa.
*   **Các bước thực hiện**:
    *   **Bước 1**: Định vị ô tìm kiếm (Search Bar) ở đầu trang Việc làm hoặc Landing Page.
    *   **Bước 2**: Nhập từ khóa cần tìm (Ví dụ: "React", "Nodejs", "BA").
    *   **Bước 3**: Nhấn phím Enter hoặc nút **Tìm kiếm**.
*   **Kết quả mong đợi**: Hệ thống hiển thị các tin tuyển dụng có tiêu đề hoặc mô tả chứa từ khóa tìm kiếm.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh chụp màn hình thanh Search Bar đang nhập từ khóa]**

#### 2.2. View Employer's Information

##### a) Show company profile details.
*   **Mô tả**: Xem thông tin chi tiết giới thiệu về doanh nghiệp tuyển dụng.
*   **Các bước thực hiện**:
    *   **Bước 1**: Nhấp vào tên công ty hoặc logo công ty hiển thị trên tin tuyển dụng.
    *   **Bước 2**: Hệ thống chuyển hướng đến trang giới thiệu chi tiết của doanh nghiệp.
*   **Kết quả mong đợi**: Hiển thị đầy đủ thông tin: Tên công ty, quy mô, website, địa chỉ, ảnh bìa, logo và mô tả chi tiết, kèm danh sách các tin tuyển dụng đang hoạt động của công ty đó.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh chụp màn hình trang Profile Doanh nghiệp]**

#### 2.3. View Job Post Details

##### a) Show detailed description & requirements of a job.
*   **Mô tả**: Xem mô tả công việc, yêu cầu tuyển dụng và quyền lợi chi tiết của một vị trí.
*   **Các bước thực hiện**:
    *   **Bước 1**: Tại trang danh sách việc làm, nhấp chuột vào tiêu đề hoặc thẻ của công việc mong muốn.
    *   **Bước 2**: Hệ thống hiển thị trang thông tin chi tiết của công việc đó.
*   **Kết quả mong đợi**: Xem được đầy đủ các phần: Mô tả công việc (JD), Yêu cầu (Requirements), Quyền lợi (Benefits), Danh sách kỹ năng yêu cầu (Tags), Hạn nộp hồ sơ.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh chụp chi tiết tin tuyển dụng]**

#### 2.4. Register

##### a) Register as Candidate.
*   **Mô tả**: Khách vãng lai tạo tài khoản mới với vai trò là Ứng viên (Candidate).
*   **Các bước thực hiện**:
    *   **Bước 1**: Trên Navbar, nhấp chọn nút **Đăng ký** (Register).
    *   **Bước 2**: Nhập thông tin: Họ tên, Email, Mật khẩu, Số điện thoại. Chọn vai trò là **Ứng viên / Candidate**.
    *   **Bước 3**: Nhấn nút **Đăng ký tài khoản**.
*   **Kết quả mong đợi**: Hệ thống tạo tài khoản, mã hóa mật khẩu bằng bcryptjs, và hiển thị thông báo đăng ký thành công.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Form Đăng Ký - Tab Ứng viên]**

##### b) Register as Recruiter.
*   **Mô tả**: Tạo tài khoản mới với vai trò Nhà tuyển dụng (HR / Recruiter) để đăng tin tuyển dụng.
*   **Các bước thực hiện**:
    *   **Bước 1**: Nhấp chọn nút **Đăng ký** trên Navbar.
    *   **Bước 2**: Nhập thông tin liên hệ và chọn vai trò là **Nhà tuyển dụng / Recruiter**.
    *   **Bước 3**: Hệ thống hiển thị thêm trường thông tin yêu cầu: **Chọn/Nhập tên Công ty**.
    *   **Bước 4**: Nhấn nút **Đăng ký tài khoản**.
*   **Kết quả mong đợi**: Tài khoản HR được tạo thành công, được liên kết với ID công ty tương ứng.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Form Đăng Ký - Tab Nhà tuyển dụng]**

---

### 3. User Manual Guide for Candidate

Candidate là ứng viên sử dụng nền tảng để tối ưu hóa CV, luyện tập phỏng vấn ảo với AI và ứng tuyển vào các công việc mong muốn.

#### 3.1. Login & Identity Management

##### a) Login into the platform.
*   **Mô tả**: Đăng nhập tài khoản để truy cập các tính năng nội bộ.
*   **Các bước thực hiện**:
    *   **Bước 1**: Nhấp chọn nút **Đăng nhập** trên Navbar.
    *   **Bước 2**: Nhập Email và Mật khẩu.
    *   **Bước 3**: Nhấp nút **Đăng nhập**.
*   **Kết quả mong đợi**: Đăng nhập thành công, hệ thống lưu JWT token vào LocalStorage, hiển thị Toast chào mừng và chuyển hướng đến trang Dashboard Ứng viên.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Form Đăng Nhập thực tế]**

##### b) Forgot Password (recover via email).
*   **Mô tả**: Khôi phục mật khẩu tài khoản qua email xác nhận.
*   **Các bước thực hiện**:
    *   **Bước 1**: Tại form Đăng nhập, nhấp liên kết **Quên mật khẩu?**.
    *   **Bước 2**: Nhập email đã đăng ký tài khoản và nhấp **Gửi link khôi phục**.
    *   **Bước 3**: Mở email cá nhân, nhấp vào link khôi phục mật khẩu được gửi từ hệ thống.
    *   **Bước 4**: Nhập mật khẩu mới tại giao diện đặt lại mật khẩu và lưu.
*   **Kết quả mong đợi**: Mật khẩu được cập nhật thành công, người dùng có thể đăng nhập bằng mật khẩu mới.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Giao diện Nhập Email Quên Mật Khẩu]**

#### 3.2. Profile Management

##### a) View Candidate profile.
*   **Mô tả**: Xem thông tin cá nhân và hồ sơ năng lực hiển thị trên hệ thống.
*   **Các bước thực hiện**:
    *   **Bước 1**: Nhấp vào ảnh đại diện (avatar) cá nhân góc trên bên phải, chọn mục **Trang cá nhân**.
*   **Kết quả mong đợi**: Giao diện hiển thị thông tin: Ảnh đại diện, Họ tên, Vị trí hiện tại, Số điện thoại, Email, Danh sách kỹ năng đã khai báo, và Lịch sử các CV đã tải lên.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Giao diện Trang cá nhân Ứng viên]**

##### b) Edit profile details & declare skills.
*   **Mô tả**: Chỉnh sửa thông tin liên hệ và cập nhật bộ kỹ năng chuyên môn tự khai báo.
*   **Các bước thực hiện**:
    *   **Bước 1**: Tại Trang cá nhân, nhấn nút **Chỉnh sửa thông tin** (Edit Profile).
    *   **Bước 2**: Thay đổi thông tin cá nhân hoặc tải lên ảnh đại diện mới.
    *   **Bước 3**: Trong mục **Kỹ năng**, tìm kiếm và chọn các kỹ năng chuyên môn phù hợp, chọn mức độ thành thạo (Intern, Junior, Senior...).
    *   **Bước 4**: Nhấp nút **Lưu thay đổi**.
*   **Kết quả mong đợi**: Thông tin và kỹ năng của ứng viên được cập nhật vào bảng `user_skills` và hiển thị ngay trên UI.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Form Chỉnh sửa Profile & Thêm Kỹ năng]**

#### 3.3. CV & AI ATS Management

##### a) Upload CV (PDF format).
*   **Mô tả**: Tải hồ sơ CV PDF lên hệ thống để lưu trữ và phân tích.
*   **Các bước thực hiện**:
    *   **Bước 1**: Truy cập trang **Quản lý CV** (My Resumes).
    *   **Bước 2**: Nhấp nút **Tải lên CV mới** (Upload CV).
    *   **Bước 3**: Chọn file PDF từ máy tính của bạn và nhấn **Xác nhận**.
*   **Kết quả mong đợi**: File CV được tải lên Cloudinary thành công, hệ thống tự động bóc tách text thô của file PDF bằng thư viện `pdf-parse`.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Giao diện Tải lên CV]**

##### b) View AI CV Parsing & Skill Extraction.
*   **Mô tả**: Xem danh sách kỹ năng chuyên môn do AI bóc tách trực tiếp từ văn bản CV.
*   **Các bước thực hiện**:
    *   **Bước 1**: Sau khi tải CV lên, hệ thống tự động gọi AI phân tích.
    *   **Bước 2**: Nhấp vào nút **Chi tiết CV** (View Details) trên CV tương ứng.
*   **Kết quả mong đợi**: Hệ thống hiển thị bảng danh sách các kỹ năng chuyên môn mà AI đã tự động phát hiện và trích xuất từ CV.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Giao diện Kỹ năng trích xuất bởi AI]**

##### c) View AI ATS Scoring & detailed feedback.
*   **Mô tả**: Xem điểm chấm ATS và nhận xét điểm mạnh/điểm yếu của CV do AI đánh giá.
*   **Các bước thực hiện**:
    *   **Bước 1**: Nhấp vào nút **Xem đánh giá ATS** (ATS Report) trên CV tương ứng.
*   **Kết quả mong đợi**: Hiển thị điểm số ATS tổng quan (từ 0 - 100) và các nhận xét đánh giá chi tiết theo 4 tiêu chí chuẩn: Bố cục, Kinh nghiệm làm việc, Học vấn, Sự tương thích Kỹ năng.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Giao diện Điểm ATS CV và Nhận xét của AI]**

#### 3.4. AI Practice Interview

##### a) Start an AI Practice Interview session.
*   **Mô tả**: Khởi tạo phòng phỏng vấn thử nghiệm ảo bằng AI dựa trên vị trí công việc tùy chỉnh.
*   **Các bước thực hiện**:
    *   **Bước 1**: Chọn mục **Luyện phỏng vấn AI** trên menu điều hướng.
    *   **Bước 2**: Chọn cấu hình: Chọn một CV đã tải lên, nhập vị trí muốn luyện tập (Ví dụ: Backend Developer), chọn mức độ (Junior).
    *   **Bước 3**: Nhấn nút **Bắt đầu phỏng vấn**.
*   **Kết quả mong đợi**: Hệ thống gọi API, tạo 5 câu hỏi phỏng vấn động phù hợp với CV và Vị trí đã cấu hình. Màn hình phỏng vấn được khởi chạy.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Trang Thiết lập Buổi phỏng vấn luyện tập]**

##### b) Record and answer AI questions via voice.
*   **Mô tả**: Trả lời từng câu hỏi phỏng vấn bằng giọng nói thực tế thông qua Microphone.
*   **Các bước thực hiện**:
    *   **Bước 1**: Lắng nghe AI phát âm câu hỏi (hoặc đọc câu hỏi hiển thị dạng text trên màn hình).
    *   **Bước 2**: Nhấn giữ nút **Bắt đầu nói** (Microphone Icon) và phát âm câu trả lời của mình.
    *   **Bước 3**: Thả nút ra, hệ thống tự động chuyển giọng nói thành văn bản (Speech-to-Text) và lưu tệp ghi âm.
    *   **Bước 4**: Nhấn **Nộp câu trả lời / Tiếp tục** để chuyển sang câu hỏi kế tiếp.
*   **Kết quả mong đợi**: Câu trả lời được ghi nhận và hiển thị dưới dạng văn bản tức thời, chuyển câu hỏi tiếp theo mượt mà.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Giao diện Phòng phỏng vấn khi đang ghi âm giọng nói]**

##### c) View detailed AI Assessment.
*   **Mô tả**: Xem đánh giá toàn diện buổi phỏng vấn sau khi hoàn thành.
*   **Các bước thực hiện**:
    *   **Bước 1**: Sau khi hoàn thành câu hỏi phỏng vấn cuối cùng, nhấn **Kết thúc phỏng vấn**.
    *   **Bước 2**: Giao diện tự động chuyển sang trang báo cáo kết quả đánh giá phỏng vấn.
*   **Kết quả mong đợi**: Hiển thị điểm số phỏng vấn tổng kết, biểu đồ mạng nhện **Radar Chart** đánh giá các khía cạnh (Chuyên môn, Giao tiếp, Tư duy, Sự tự tự tin) và nhận xét chi tiết cho từng câu trả lời.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Giao diện Kết quả Đánh giá Phỏng vấn & Biểu đồ Radar Chart]**

##### d) View personalized Learning Path.
*   **Mô tả**: Đọc lộ trình học tập, luyện tập nâng cao kỹ năng do AI đề xuất sau buổi phỏng vấn.
*   **Các bước thực hiện**:
    *   **Bước 1**: Tại trang Báo cáo kết quả phỏng vấn, kéo xuống mục **Lộ trình học tập đề xuất** (Suggested Learning Path).
*   **Kết quả mong đợi**: Hiển thị lộ trình chia theo từng tuần/giai đoạn cụ thể kèm tài liệu/khóa học và kỹ năng cần cải thiện dựa trên các câu trả lời bị điểm thấp.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Mục Lộ trình tự học do AI cá nhân hóa]**

#### 3.5. Job Application & Real Interview

##### a) Apply to a Job Post.
*   **Mô tả**: Nộp đơn ứng tuyển vào một tin tuyển dụng cụ thể kèm theo CV của mình.
*   **Các bước thực hiện**:
    *   **Bước 1**: Truy cập trang Chi tiết công việc muốn ứng tuyển.
    *   **Bước 2**: Nhấn nút **Ứng tuyển ngay** (Apply Now).
    *   **Bước 3**: Lựa chọn file CV muốn nộp và nhập Cover Letter (Thư giới thiệu).
    *   **Bước 4**: Nhấn nút **Gửi hồ sơ**.
*   **Kết quả mong đợi**: Tạo mới một bản ghi ứng tuyển trong database, trạng thái hồ sơ là Chờ duyệt (`PENDING`).
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Popup Chọn CV Ứng Tuyển]**

##### b) Take a Real AI Interview for applied job.
*   **Mô tả**: Tiến hành phỏng vấn AI thực tế cho vị trí đã ứng tuyển để lấy điểm gửi cho HR đánh giá.
*   **Các bước thực hiện**:
    *   **Bước 1**: Sau khi nộp hồ sơ, nhấp vào nút **Bắt đầu Phỏng vấn ứng tuyển AI** hiển thị trên popup thông báo.
    *   **Bước 2**: Thực hiện trả lời bộ câu hỏi động do AI sinh ra dựa trên JD tuyển dụng của vị trí đó (các bước trả lời bằng giọng nói tương tự phỏng vấn luyện tập).
*   **Kết quả mong đợi**: Hoàn thành phỏng vấn, điểm số phỏng vấn ứng tuyển được cập nhật trực tiếp vào hệ thống quản lý của HR.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Popup Yêu Cầu Phỏng Vấn Thực Tế Sau Khi Nộp Hồ Sơ]**

##### c) View Application Status & Interview Schedules.
*   **Mô tả**: Xem tiến độ hồ sơ ứng tuyển và xem thông tin lịch hẹn phỏng vấn trực tiếp từ HR.
*   **Các bước thực hiện**:
    *   **Bước 1**: Nhấp vào menu **Lịch sử ứng tuyển** (My Applications).
    *   **Bước 2**: Xem cột **Trạng thái** của các công việc đã nộp.
    *   **Bước 3**: Nếu có lịch hẹn phỏng vấn trực tiếp, xem chi tiết lịch hẹn tại thẻ công việc tương ứng.
*   **Kết quả mong đợi**: Người dùng theo dõi được hồ sơ đang ở trạng thái nào (Accepted, Rejected, Reviewing) và nắm được lịch hẹn phỏng vấn (Thời gian, Địa điểm, Link meeting).
*   *Hình ảnh minh họa gợi ý*: **[Chèn Giao diện Lịch sử Ứng tuyển & Lịch Hẹn Phỏng Vấn trực quan]**

#### 3.6. Community Interaction

##### a) Read community blog posts.
*   **Mô tả**: Xem và đọc các bài chia sẻ kinh nghiệm trên trang Blog cộng đồng.
*   **Các bước thực hiện**:
    *   **Bước 1**: Nhấp vào mục **Cộng đồng / Blog** trên thanh điều hướng.
    *   **Bước 2**: Nhấp vào bài viết muốn đọc trong danh sách hiển thị.
*   **Kết quả mong đợi**: Bài viết hiển thị đầy đủ tiêu đề, nội dung chi tiết, hình ảnh và tác giả.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Trang Đọc Blog Cộng Đồng]**

##### b) Write and manage personal blog posts.
*   **Mô tả**: Viết bài viết mới để chia sẻ kinh nghiệm cá nhân lên cộng đồng.
*   **Các bước thực hiện**:
    *   **Bước 1**: Truy cập mục **Quản lý Blog của tôi**.
    *   **Bước 2**: Nhấp nút **Viết bài mới**. Nhập tiêu đề, nội dung, chọn chuyên mục và ảnh bìa.
    *   **Bước 3**: Nhấn nút **Gửi duyệt** để gửi bài viết tới Admin kiểm duyệt (hoặc **Lưu nháp** để sửa đổi sau).
*   **Kết quả mong đợi**: Bài viết được lưu vào database ở trạng thái Chờ duyệt (`PENDING`) hoặc Nháp (`DRAFT`).
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Trình soạn thảo viết bài Blog]**

---

### 4. User Manual Guide for Employer (HR / Recruiter)

Employer là tài khoản đại diện cho nhà tuyển dụng (HR) thực hiện đăng tin, lọc ứng viên và thiết lập lịch hẹn phỏng vấn.

#### 4.1. Company Settings

##### a) Update company profile information.
*   **Mô tả**: Cập nhật thông tin mô tả chi tiết của doanh nghiệp.
*   **Các bước thực hiện**:
    *   **Bước 1**: Nhấp vào menu **Thông tin công ty** (Company Info) trong Dashboard của HR.
    *   **Bước 2**: Nhập thông tin: Website, quy mô nhân sự, địa chỉ trụ sở chính, viết mô tả giới thiệu công ty và tải lên ảnh bìa, logo mới.
    *   **Bước 3**: Nhấn nút **Cập nhật thông tin**.
*   **Kết quả mong đợi**: Thông tin của công ty được cập nhật thành công, hiển thị đồng bộ trên trang thông tin doanh nghiệp.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Giao diện Cập nhật Hồ sơ Công ty]**

#### 4.2. Job Post Management

##### a) Create a new Job Post.
*   **Mô tả**: Đăng tuyển tin việc làm mới lên hệ thống kèm yêu cầu kỹ năng chi tiết.
*   **Các bước thực hiện**:
    *   **Bước 1**: Trong Dashboard HR, chọn mục **Đăng tin tuyển dụng** (Post a Job).
    *   **Bước 2**: Nhập tiêu đề công việc, chọn ngành nghề, địa điểm, hình thức làm việc và mức lương.
    *   **Bước 3**: Nhập chi tiết Mô tả công việc (JD) và các Yêu cầu (Requirements) cụ thể.
    *   **Bước 4**: Chọn các kỹ năng yêu cầu trong hộp lựa chọn tag kỹ năng (Skills).
    *   **Bước 5**: Nhấn nút **Đăng tin**.
*   **Kết quả mong đợi**: Tin tuyển dụng được đăng thành công, lưu vào bảng `jobs` và hiển thị trên trang tìm việc làm của ứng viên.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Form Đăng tin tuyển dụng mới]**

##### b) View and update posted jobs (edit or deactivate).
*   **Mô tả**: Xem lại các tin tuyển dụng đã đăng để chỉnh sửa nội dung hoặc dừng tuyển dụng.
*   **Các bước thực hiện**:
    *   **Bước 1**: Truy cập mục **Tin tuyển dụng đã đăng** (Posted Jobs).
    *   **Bước 2**: Xem danh sách các tin đăng, nhấn nút **Chỉnh sửa** (Edit) tại tin đăng muốn thay đổi.
    *   **Bước 3**: Tiến hành cập nhật thông tin và nhấn **Lưu cập nhật**. (Hoặc nhấn **Ẩn tin đăng** nếu muốn đóng tin tuyển dụng).
*   **Kết quả mong đợi**: Nội dung tin đăng được cập nhật hoặc tin đăng được gỡ khỏi trang tìm việc công khai.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Giao diện Quản lý Tin đã đăng]**

#### 4.3. Candidate Management

##### a) View list of candidates applied for a job.
*   **Mô tả**: Xem danh sách tất cả các ứng viên đã nộp hồ sơ vào một tin tuyển dụng cụ thể.
*   **Các bước thực hiện**:
    *   **Bước 1**: Truy cập trang quản lý các tin tuyển dụng đã đăng.
    *   **Bước 2**: Nhấp vào nút **Xem ứng viên** (Applicants) tại tin tuyển dụng tương ứng.
*   **Kết quả mong đợi**: Giao diện hiển thị bảng danh sách ứng viên đã nộp hồ sơ gồm họ tên, ngày nộp, trạng thái hồ sơ.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Danh sách Ứng viên nộp hồ sơ]**

##### b) View candidate details (Resume & Cover Letter).
*   **Mô tả**: Xem thông tin cá nhân chi tiết và thư giới thiệu, tải file CV của một ứng viên cụ thể.
*   **Các bước thực hiện**:
    *   **Bước 1**: Tại danh sách ứng viên, nhấp chuột vào họ tên ứng viên mong muốn.
*   **Kết quả mong đợi**: Hiển thị trang chi tiết ứng tuyển, hiển thị thư giới thiệu (Cover Letter) và nút để xem/tải tệp CV PDF của ứng viên.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Trang chi tiết hồ sơ ứng cử viên]**

##### c) Evaluate candidate's AI ATS Score & AI Interview result.
*   **Mô tả**: HR xem và đánh giá năng lực ứng viên thông qua điểm CV do AI chấm và kết quả buổi phỏng vấn AI.
*   **Các bước thực hiện**:
    *   **Bước 1**: Tại trang chi tiết hồ sơ ứng viên, quan sát bảng điểm so sánh: **Điểm CV ATS** và **Điểm Phỏng vấn AI**.
    *   **Bước 2**: Nhấp vào nút **Xem chi tiết phỏng vấn AI** để xem văn bản transcript các câu trả lời và nghe tệp ghi âm giọng nói thực tế của ứng viên.
*   **Kết quả mong đợi**: HR nắm bắt được điểm số và đánh giá của AI về ứng viên một cách toàn diện và trực quan.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Báo cáo điểm ATS CV và Lịch sử phỏng vấn AI của ứng viên dành cho HR]**

##### d) Update application status.
*   **Mô tả**: Cập nhật trạng thái ứng tuyển của ứng viên (Đạt, Từ chối, Đang xem xét).
*   **Các bước thực hiện**:
    *   **Bước 1**: Tại trang thông tin ứng viên, chọn trạng thái mong muốn từ hộp lựa chọn trạng thái (ACCEPTED, REJECTED, REVIEWING).
    *   **Bước 2**: Nhấn nút **Xác nhận cập nhật**.
*   **Kết quả mong đợi**: Trạng thái ứng tuyển trong database được cập nhật. Trạng thái hiển thị mới được đồng bộ sang trang Lịch sử ứng tuyển của Ứng viên.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Thao tác chọn thay đổi trạng thái hồ sơ]**

#### 4.4. Interview Scheduling & Communication

##### a) Schedule a face-to-face or online interview.
*   **Mô tả**: HR lên lịch hẹn phỏng vấn vòng tiếp theo với ứng viên.
*   **Các bước thực hiện**:
    *   **Bước 1**: Nhấp chọn nút **Lên lịch phỏng vấn** (Schedule Interview) trên trang hồ sơ ứng viên.
    *   **Bước 2**: Nhập thông tin lịch hẹn: Ngày giờ phỏng vấn, Hình thức (Trực tiếp / Online), Địa điểm hoặc Link phòng họp (Google Meet/Zoom), người phụ trách phỏng vấn.
    *   **Bước 3**: Nhấn nút **Lưu lịch hẹn**.
*   **Kết quả mong đợi**: Lịch hẹn được lưu thành công vào bảng `interview_schedules`.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Giao diện Hộp thoại Đặt lịch hẹn phỏng vấn]**

##### b) Send automated notification email to candidates.
*   **Mô tả**: Hệ thống tự động gửi email thông báo chi tiết lịch hẹn phỏng vấn cho ứng viên.
*   **Các bước thực hiện**:
    *   **Bước 1**: Sau khi thực hiện xong việc lên lịch phỏng vấn (UC 4.4.a), nhấn nút **Gửi Email thông báo**.
    *   **Bước 2**: Hệ thống tự động tạo thư và gửi email qua dịch vụ Nodemailer theo mẫu template tương ứng.
*   **Kết quả mong đợi**: Hệ thống hiển thị thông báo "Email đã được gửi đi". Ứng viên nhận được thư thông báo lịch hẹn chi tiết trong hòm thư cá nhân.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh chụp giao diện thông báo gửi email thành công]**

##### c) Chat real-time with candidates.
*   **Mô tả**: Trò chuyện trực tuyến thời gian thực với ứng viên qua cửa sổ Chat.
*   **Các bước thực hiện**:
    *   **Bước 1**: Nhấp vào biểu tượng **Nhắn tin** (Chat Icon) tại thẻ thông tin của ứng viên.
    *   **Bước 2**: Nhập nội dung tin nhắn và nhấn phím **Gửi**.
*   **Kết quả mong đợi**: Tin nhắn được chuyển đi tức thời thông qua Socket.io và hiển thị ngay trên màn hình chat của ứng viên mà không cần tải lại trang.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Khung Chat Real-time giữa HR và Ứng Viên]**

---

### 5. User Manual Guide for Administrator

Administrator (Admin) có toàn quyền quản trị, kiểm duyệt nội dung, quản lý cấu hình hệ thống và tài chính.

#### 5.1. System & Security Management

##### a) Manage system users (activate/deactivate).
*   **Mô tả**: Quản lý trạng thái hoạt động của các tài khoản người dùng trên hệ thống.
*   **Các bước thực hiện**:
    *   **Bước 1**: Đăng nhập tài khoản Admin, truy cập **Trang quản trị** (Admin Portal).
    *   **Bước 2**: Chọn mục **Quản lý tài khoản** (User Management).
    *   **Bước 3**: Tìm kiếm tài khoản cần xử lý, nhấn nút **Khóa tài khoản** (Deactivate) để chặn quyền đăng nhập hoặc **Mở khóa** (Activate) để khôi phục.
*   **Kết quả mong đợi**: Trạng thái `is_active` của người dùng được cập nhật trong database. Tài khoản bị khóa sẽ không thể truy cập hệ thống ở các phiên tiếp theo.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Bảng Danh sách Tài khoản & Nút khóa tài khoản]**

##### b) Configure RBAC (Roles & Permissions).
*   **Mô tả**: Quản lý vai trò (Roles) và gán quyền hạn chi tiết (Permissions) cho từng vai trò trong hệ thống.
*   **Các bước thực hiện**:
    *   **Bước 1**: Tại Trang quản trị, chọn mục **Quản lý quyền hạn** (Role-Based Access Control).
    *   **Bước 2**: Xem bảng phân quyền chi tiết của các vai trò ADMIN, HR, CANDIDATE.
    *   **Bước 3**: Tích chọn hoặc bỏ chọn các quyền hạn cụ thể (ví dụ: tạo tin tuyển dụng, xóa blog...) cho từng vai trò và nhấn **Lưu cấu hình**.
*   **Kết quả mong đợi**: Quyền truy cập được cập nhật lập tức và áp dụng cho tất cả người dùng thuộc vai trò đó.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Bảng Cấu hình Phân Quyền Vai Trò RBAC]**

#### 5.2. Content Moderation

##### a) Moderate blog posts (approve or reject).
*   **Mô tả**: Kiểm duyệt nội dung các bài viết blog cộng đồng do thành viên gửi lên trước khi xuất bản.
*   **Các bước thực hiện**:
    *   **Bước 1**: Chọn mục **Kiểm duyệt bài viết** (Blog Moderation) trong Trang quản trị.
    *   **Bước 2**: Nhấp xem chi tiết bài viết có trạng thái Chờ duyệt (`PENDING`).
    *   **Bước 3**: Nhấn nút **Phê duyệt** (Approve) để công khai bài viết, hoặc nhấn nút **Từ chối** (Reject) kèm lý do phản hồi nếu bài viết vi phạm quy chuẩn.
*   **Kết quả mong đợi**: Bài viết được cập nhật trạng thái `PUBLISHED` (được hiển thị công khai trên trang cộng đồng) hoặc `REJECTED`.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Giao diện Danh sách bài viết chờ duyệt của Admin]**

#### 5.3. Financial & System Configuration

##### a) Manage pricing packages.
*   **Mô tả**: Thay đổi thông tin, giá tiền của các gói dịch vụ (Tin tuyển dụng, Tài khoản Premium).
*   **Các bước thực hiện**:
    *   **Bước 1**: Chọn mục **Cấu hình gói dịch vụ** (Manage Packages) trong Trang quản trị.
    *   **Bước 2**: Nhấp nút **Chỉnh sửa** tại gói dịch vụ mong muốn, thay đổi các thông số (Giá tiền, thời hạn, quyền lợi).
    *   **Bước 3**: Nhấn **Lưu cấu hình**.
*   **Kết quả mong đợi**: Thông tin gói dịch vụ mới được cập nhật trên database và giao diện mua gói của người dùng.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Form Chỉnh sửa Gói Dịch Vụ]**

##### b) Track transactions history (VNPAY payments).
*   **Mô tả**: Xem danh sách và thống kê lịch sử thanh toán hóa đơn của người dùng qua cổng VNPAY.
*   **Các bước thực hiện**:
    *   **Bước 1**: Chọn mục **Lịch sử giao dịch** (Transactions Log) trong Trang quản trị.
*   **Kết quả mong đợi**: Danh sách hóa đơn chi tiết hiển thị: Mã giao dịch, tài khoản thực hiện, số tiền thanh toán, cổng thanh toán, thời gian giao dịch và trạng thái (Thành công/Thất bại).
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Bảng Thống kê Giao Dịch Thanh Toán]**

##### c) Manage system email templates.
*   **Mô tả**: Chỉnh sửa nội dung mẫu của các email tự động gửi của hệ thống.
*   **Các bước thực hiện**:
    *   **Bước 1**: Chọn mục **Mẫu Email** (Email Templates) trong Trang quản trị.
    *   **Bước 2**: Chọn mẫu email muốn sửa (Ví dụ: Email lịch hẹn phỏng vấn, Email khôi phục mật khẩu).
    *   **Bước 3**: Thay đổi tiêu đề, nội dung HTML mẫu và nhấn **Cập nhật**.
*   **Kết quả mong đợi**: Nội dung mẫu email mới được áp dụng cho các email tự động gửi đi tiếp theo.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Giao diện Soạn thảo Mẫu Email của Admin]**

#### 5.4. Feedback & Violation Reports

##### a) Manage user feedback logs.
*   **Mô tả**: Tiếp nhận và xem danh sách các phản hồi góp ý, báo lỗi từ người dùng.
*   **Các bước thực hiện**:
    *   **Bước 1**: Chọn mục **Hộp thư Phản hồi** (Feedback Portal) trong Trang quản trị.
    *   **Bước 2**: Nhấp xem chi tiết từng phản hồi để ghi nhận lỗi kỹ thuật hoặc góp ý.
*   **Kết quả mong đợi**: Admin xem được đầy đủ nội dung phản hồi, thông tin liên hệ của người dùng gửi để phản hồi xử lý.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Giao diện Danh sách Phản Hồi]**

##### b) Review and resolve report violations.
*   **Mô tả**: Kiểm tra và xử lý các báo cáo vi phạm nội dung (ví dụ: tin tuyển dụng lừa đảo, blog spam).
*   **Các bước thực hiện**:
    *   **Bước 1**: Chọn mục **Báo cáo vi phạm** (Reported Violations) trong Trang quản trị.
    *   **Bước 2**: Nhấp xem thông tin báo cáo: Tài khoản báo cáo, Nội dung bị báo cáo, lý do báo cáo.
    *   **Bước 3**: Tiến hành xử lý: Ẩn/xóa nội dung vi phạm, hoặc cảnh cáo tài khoản vi phạm. Nhấp **Đã xử lý** để cập nhật trạng thái báo cáo.
*   **Kết quả mong đợi**: Báo cáo được xử lý, nội dung vi phạm bị gỡ bỏ khỏi hệ thống để đảm bảo tính an toàn và minh bạch.
*   *Hình ảnh minh họa gợi ý*: **[Chèn Ảnh Danh sách Báo cáo vi phạm chờ xử lý]**

---
*Tài liệu được cập nhật và biên soạn phục vụ báo cáo hoàn thiện dự án MockAI-Interview.*
