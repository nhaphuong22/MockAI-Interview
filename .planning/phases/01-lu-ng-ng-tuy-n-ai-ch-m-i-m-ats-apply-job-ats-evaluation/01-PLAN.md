---
phase: 01
plan_id: 01-PLAN
title: Kế hoạch thực thi Phase 1 - Luồng Ứng Tuyển & AI Chấm Điểm ATS
wave: 1
depends_on: []
files_modified:
  - backend/src/controllers/applicationController.js
  - backend/src/services/cvService.js
  - backend/src/services/emailService.js
  - frontend/src/components/shared/CustomToast.jsx
  - frontend/src/store/useUiStore.js
  - frontend/src/routes/candidate.jsx
  - frontend/src/pages/candidate/JobsList.jsx
  - frontend/src/pages/candidate/JobDetail.jsx
  - frontend/src/components/candidate/ApplyJobModal.jsx
  - frontend/src/pages/candidate/Profile.jsx
  - frontend/src/components/candidate/AtsReportDashboard.jsx
autonomous: true
requirements:
  - APPLY-01
  - APPLY-02
  - APPLY-03
  - APPLY-04
  - NOTI-01
---

# Plan: Luồng Ứng Tuyển & AI Chấm Điểm ATS

## Objective
Hoàn thiện luồng ứng tuyển CV của ứng viên (Candidate), tích hợp AI parse PDF & chấm điểm ATS tự động, gửi email thông báo kèm PDF đánh giá, hiển thị điểm số trên trang cá nhân của ứng viên và bảo vệ các trang nội bộ bằng Custom Toast Auth Gate.

## Must Haves
- Ứng viên chưa đăng nhập chỉ được xem Landing Page; cố truy cập trang khác phải bị chặn, hiển thị Custom Toast (z-index 9999, biến mất sau 4 giây, không tự mở Auth Modal).
- Chấm điểm ATS CV dựa trên JD công việc ngay khi nộp đơn, lưu kết quả chấm điểm (overall score, strengths, weaknesses, improvements) và tệp PDF báo cáo lên Cloudinary.
- Gửi email xác nhận tự động đính kèm file PDF đánh giá CV cho cả Candidate và HR.
- Hiển thị kết quả ATS chi tiết chia làm 3 tab trên trang cá nhân của Candidate.

## Tasks

### Task 1: Xây dựng Custom Toast Component và Custom Store cho Auth Gate (Frontend)
<task>
<read_first>
- `frontend/src/store/useUiStore.js`
- `frontend/src/App.jsx`
</read_first>
<action>
- Tạo hoặc cập nhật `frontend/src/store/useUiStore.js` để quản lý danh sách Toast: thêm trạng thái `toasts: []` và các hàm `addToast(message, type)`, `removeToast(id)`.
- Tạo component `frontend/src/components/shared/CustomToast.jsx` sử dụng `framer-motion` và Tailwind CSS. Thiết kế dạng Glassmorphism, màu sắc chủ đạo Ocean Blue (`#0ea5e9`), cố định `z-[9999]`, hỗ trợ tự động xóa toast sau 4 giây ( countdown timer chạy mờ dưới đáy toast).
- Bọc `ToastContainer` hoặc component Toast tương đương vào root component trong `frontend/src/App.jsx` hoặc layout chung.
</action>
<acceptance_criteria>
- Hàm `addToast` đẩy thêm phần tử vào mảng `toasts` với id ngẫu nhiên, tự động trigger `removeToast` sau 4000ms.
- Component Toast xuất hiện mượt mà (slide in từ phải sang), có thanh đếm ngược chạy hết trong 4s và biến mất (fade out). z-index là 9999.
</acceptance_criteria>
</task>

### Task 2: Áp dụng Protected Route & Chặn Auth Gate tại Router (Frontend)
<task>
<read_first>
- `frontend/src/routes/candidate.jsx`
- `frontend/src/routes/index.jsx`
- `frontend/src/store/useAuthStore.js`
</read_first>
<action>
- Cập nhật cơ chế Route Guard (ví dụ bọc các candidate/recruiter routes trong `<ProtectedRoute>`).
- Khi người dùng chưa đăng nhập (`!isAuthenticated`) cố click vào các link nội bộ (như Jobs, Profile, v.v.):
  1. Chặn hành động chuyển trang (`e.preventDefault()` hoặc redirect).
  2. Kích hoạt gọi `addToast("Yêu cầu đăng nhập để dùng được tính năng này", "warning")` thông qua `useUiStore`.
  3. KHÔNG tự động kích hoạt hiển thị Modal Auth (giữ trạng thái đóng).
</action>
<acceptance_criteria>
- Click link bảo mật khi chưa đăng nhập sẽ ngăn chặn chuyển hướng trang.
- Toast thông báo *"Yêu cầu đăng nhập để dùng được tính năng này"* hiển thị ở góc phải màn hình trong 4 giây. Giao diện Auth Modal không tự động mở ra.
</acceptance_criteria>
</task>

### Task 3: Xây dựng Giao diện Danh sách Jobs và Chi tiết Job (Frontend)
<task>
<read_first>
- `frontend/src/pages/candidate/JobsList.jsx`
- `frontend/src/pages/candidate/JobDetail.jsx`
</read_first>
<action>
- Xây dựng component `JobsList.jsx` hiển thị danh sách công việc dạng Grid sử dụng Tailwind, gọi API danh sách qua React Query.
- Xây dựng component `JobDetail.jsx` hiển thị thông tin mô tả, yêu cầu công việc. Thiết kế hộp thông tin bên phải dạng Glassmorphism kèm nút "Ứng tuyển ngay" (màu Ocean Blue).
</action>
<acceptance_criteria>
- Giao diện render chính xác danh sách và chi tiết công việc mà không bị crash.
- Nút ứng tuyển hiển thị đúng màu Ocean Blue (`#0ea5e9`), hover phóng to nhẹ (`scale-102`).
</acceptance_criteria>
</task>

### Task 4: Hoàn thiện API Apply Job, Parse PDF & AI Chấm Điểm ATS (Backend)
<task>
<read_first>
- `backend/src/controllers/applicationController.js`
- `backend/src/services/cvService.js`
</read_first>
<action>
- Cập nhật hàm `applyJob` trong `backend/src/controllers/applicationController.js`:
  1. Nhận tệp CV PDF tải lên qua Multer.
  2. Parse tệp PDF thành text thô bằng `pdf-parse`.
  3. Gọi `evaluateCV(cvText, jobJD)` để nhận kết quả đánh giá (ATS score, strengths, weaknesses, improvements).
  4. Tạo tệp PDF báo cáo đánh giá chi tiết bằng `pdfkit` (tông màu Ocean Blue, font chữ Unicode tiếng Việt).
  5. Upload tệp PDF vừa tạo lên Cloudinary dưới dạng raw resource.
  6. Ghi record vào database: bảng `cvs` lưu `ats_score`, `ai_feedback`, `file_url` (tệp CV), và `pdf_report_url` (URL báo cáo đánh giá trên Cloudinary).
</action>
<acceptance_criteria>
- API `POST /api/applications/apply/:jobId` tiếp nhận file PDF, trả về JSON chứa điểm số và nhận xét chi tiết của AI.
- Nếu tệp không chứa text (dưới 50 ký tự), trả về mã lỗi 400 yêu cầu kiểm tra lại tệp PDF.
</acceptance_criteria>
</task>

### Task 5: Tích hợp Gửi Email Báo Cáo Tự Động & Thông Báo Realtime (Backend)
<task>
<read_first>
- `backend/src/controllers/applicationController.js`
- `backend/src/services/emailService.js`
- `backend/src/socket.js`
</read_first>
<action>
- Cập nhật `backend/src/services/emailService.js` (hàm `sendJobApplicationEmail`): Cấu hình gửi mail thông qua SMTP, sử dụng `nodemailer` đính kèm file PDF đánh giá lấy từ Cloudinary (hoặc buffer trực tiếp) gửi cho Candidate và HR.
- Gọi hàm gửi email trong controller sau khi hoàn tất lưu dữ liệu.
- Gọi `broadcastNewApplication` trong `backend/src/socket.js` để đẩy event Socket.io cho HR Dashboard.
</action>
<acceptance_criteria>
- Email gửi thành công có tệp đính kèm PDF báo cáo đánh giá và nội dung email dạng HTML chuyên nghiệp tông xanh dương.
- Event Socket.io `new_application` được emit thành công tới `hr_room`.
</acceptance_criteria>
</task>

### Task 6: Modal Upload CV và Hiển thị ATS Dashboard của Candidate (Frontend)
<task>
<read_first>
- `frontend/src/components/candidate/ApplyJobModal.jsx`
- `frontend/src/pages/candidate/Profile.jsx`
- `frontend/src/components/candidate/AtsReportDashboard.jsx`
</read_first>
<action>
- Xây dựng `ApplyJobModal.jsx` sử dụng `react-dropzone` kéo thả tệp PDF. Hiển thị màn hình chờ mượt mà khi backend đang xử lý chấm điểm.
- Xây dựng `AtsReportDashboard.jsx` hiển thị kết quả ATS Score trên trang cá nhân của ứng viên. Thiết kế 3 tab:
  - Tab 1: Tổng quan ATS (Circular Progress Bar màu Ocean Blue).
  - Tab 2: Điểm mạnh & Điểm yếu.
  - Tab 3: Khuyến nghị AI để cải thiện CV.
  - Nút Tải báo cáo PDF tải trực tiếp từ URL Cloudinary lưu trong database.
</action>
<acceptance_criteria>
- Kéo thả file PDF hoạt động mượt mà, hiển thị spinner loading khi đang xử lý.
- Điểm ATS Score hiển thị dạng vòng tròn tiến trình chạy động từ 0 đến điểm thực tế.
- Các tab chuyển đổi nhanh chóng, không bị reload trang. Nút tải báo cáo PDF mở tab mới tải file từ Cloudinary.
</acceptance_criteria>
</task>

## Artifacts this phase produces
- `frontend/src/components/shared/CustomToast.jsx`
- `frontend/src/store/useUiStore.js`
- `frontend/src/components/candidate/ApplyJobModal.jsx`
- `frontend/src/components/candidate/AtsReportDashboard.jsx`
- `.planning/phases/01-lu-ng-ng-tuy-n-ai-ch-m-i-m-ats-apply-job-ats-evaluation/01-PLAN.md`

## Verification Criteria
1. Chặn truy cập trang protected khi chưa đăng nhập, hiển thị Custom Toast (z-index 9999, tự biến mất sau 4s), và Auth Modal không tự động mở.
2. Ứng viên nộp CV PDF và Cover Letter thành công, backend parse PDF và chấm điểm ATS tương thích thành công.
3. Nhận email thông báo đính kèm file PDF báo cáo đánh giá chi tiết (cho cả Candidate và HR).
4. Trang cá nhân ứng viên hiển thị ATS Score Dashboard dạng 3 tab chi tiết, biểu đồ progress bar tròn hoạt động và nút tải PDF báo cáo trỏ về URL Cloudinary hoạt động chính xác.

---
*Phase plan defined: 2026-06-07*
*Last updated: 2026-06-07 after initial definition*
