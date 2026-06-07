# MockAI-Interview

## What This Is

MockAI-Interview là một nền tảng hỗ trợ việc làm toàn diện (Job Support Platform) tích hợp trí tuệ nhân tạo (AI) cao cấp. Hệ thống giúp ứng viên tối ưu hóa hồ sơ năng lực (chấm điểm ATS CV), luyện tập phỏng vấn giọng nói trực tiếp với AI ảo 3D, và giúp nhà tuyển dụng (HR) quản lý, đánh giá hồ sơ ứng viên hiệu quả dựa trên công nghệ AI.

## Core Value

Cung cấp trải nghiệm luyện tập phỏng vấn ảo bằng AI 3D trực quan sinh động và hệ thống tự động chấm điểm, đánh giá năng lực ứng viên chính xác giúp rút ngắn thời gian tuyển dụng.

## Requirements

### Validated

*   ✓ [AUTH-BASE] Xác thực người dùng cơ bản bằng email/mật khẩu và JWT.
*   ✓ [JOB-BASE] Quản lý bài đăng tuyển dụng (Jobs) cơ bản ở backend.
*   ✓ [BLOG-BASE] Hệ thống tin tức và chia sẻ kinh nghiệm (Blogs).
*   ✓ [CV-BASE] Lưu trữ dữ liệu CV và chấm điểm ATS cơ bản bằng AI ở backend.
*   ✓ [INTERVIEW-BASE] Thiết lập và lưu trữ thông tin lịch sử phỏng vấn cơ bản ở backend.

### Active

*   **[APPLY-UI-01]** Hoàn thiện giao diện phía Candidate: Trang danh sách công việc, chi tiết công việc, và Modal tải lên file CV (PDF) kèm Cover Letter.
*   **[APPLY-ATS-02]** Hiển thị điểm ATS Score và phản hồi chi tiết từ AI (AI Feedback) trực tiếp trên trang cá nhân của Candidate sau khi nộp đơn thành công.
*   **[APPLY-HR-03]** Xây dựng giao diện HR Dashboard: Xem danh sách ứng viên nộp đơn cho từng công việc, sắp xếp và lọc ứng viên dựa trên điểm ATS của CV.
*   **[APPLY-NOTI-04]** Hệ thống gửi email tự động xác nhận cho Candidate và thông báo cho HR kèm tệp PDF đánh giá CV khi có lượt ứng tuyển mới.
*   **[INTERVIEW-3D-05]** Tích hợp mô hình 3D (Three.js/Fiber) làm người ảo phỏng vấn (AI Interviewer Avatar) có khẩu hình (lipsync) và chuyển động phản hồi theo giọng nói của AI.
*   **[INTERVIEW-REALTIME-06]** Nâng cấp luồng phỏng vấn thời gian thực: Đồng bộ audio ghi âm từ Candidate gửi lên backend (STT) và phát lại audio phản hồi từ AI (TTS) kết hợp chuyển động của Avatar 3D.

### Out of Scope

*   [PAYMENT] Module thanh toán nâng cấp tài khoản (Packages & Transactions) — Chưa triển khai ở giai đoạn này.
*   [CHAT-LIVE] Nhắn tin realtime giữa HR và Candidate qua Socket.io — Đóng băng để tập trung vào phỏng vấn AI.
*   [WEBRTC-STREAM] Stream audio liên tục qua WebRTC — Tạm hoãn, sử dụng cơ chế ghi âm audio ngắn (chuyển đổi STT/TTS qua file) để đảm bảo độ chính xác của AI.

## Context

*   **Môi trường kỹ thuật**: Dự án được tổ chức dạng Monorepo sử dụng pnpm. Backend dùng Express 5, Knex và PostgreSQL. Frontend dùng React 19, Vite, Tailwind v4, Zustand và TanStack Query.
*   **Đồ họa & Hiệu ứng**: Dự án đã cài đặt sẵn các thư viện `three`, `@react-three/fiber`, `@react-three/drei`, `framer-motion` và `gsap` để tạo giao diện 3D chuyển động premium.
*   **Màu chủ đạo (Ocean Blue)**: Primary `#0ea5e9`, Secondary `#38bdf8`.

## Constraints

*   **Tech Stack**: Sử dụng đúng cấu trúc React 19 + Zustand cho UI State và TanStack Query cho Server State.
*   **Auth Gate Protocol**: Người dùng chưa đăng nhập chỉ được xem Landing Page; cố truy cập trang khác phải block navigation, hiển thị Toast cảnh báo và không tự động mở Auth Modal.
*   **AI Models**: Sử dụng Sonnet cho các tác vụ phân tích, chấm điểm và xử lý chính.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| AI Interview Questions | AI tự động sinh câu hỏi phỏng vấn dựa trên CV và ngữ cảnh JD của Job, không dùng ngân hàng câu hỏi cứng. | — Pending |
| Socket.io Roles | Socket.io chỉ dùng cho real-time notifications (thông báo ứng tuyển mới cho HR, thông báo trạng thái cho Candidate), không dùng stream voice trực tiếp. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-07 after initialization*
