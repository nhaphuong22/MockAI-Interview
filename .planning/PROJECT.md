# MockAI-Interview

## What This Is

MockAI-Interview là một nền tảng hỗ trợ việc làm toàn diện (Job Support Platform) tích hợp trí tuệ nhân tạo (AI) cao cấp. Hệ thống giúp ứng viên tối ưu hóa hồ sơ năng lực (chấm điểm ATS CV), luyện tập phỏng vấn giọng nói trực tiếp với AI ảo 3D, và giúp nhà tuyển dụng (HR) quản lý, đánh giá hồ sơ ứng viên hiệu quả dựa trên công nghệ AI.

## Core Value

Cung cấp trải nghiệm luyện tập phỏng vấn ảo bằng AI 3D trực quan sinh động và hệ thống tự động chấm điểm, đánh giá năng lực ứng viên chính xác giúp rút ngắn thời gian tuyển dụng.

## Requirements

### Validated

- ✓ **APPLY-01**: Luồng nộp CV dạng tệp PDF của ứng viên hoạt động tốt.
- ✓ **APPLY-02**: Trích xuất text từ tệp CV PDF để chấm điểm tự động.
- ✓ **APPLY-03**: AI chấm điểm ATS, đánh giá kỹ năng chuyên môn và trả về điểm số chi tiết.
- ✓ **APPLY-04**: Gửi email thông báo kết quả chấm điểm CV tự động cho ứng viên.
- ✓ **HR-01**: HR Dashboard hiển thị danh sách ứng viên và xếp hạng theo điểm ATS.
- ✓ **HR-02**: Tự động chuyển đổi trạng thái xem CV của ứng viên (Đã nhận, Đang xem xét, Đạt, Không đạt).
- ✓ **HR-03**: Xuất danh sách ứng viên và báo cáo kết quả sang tệp CSV.
- ✓ **INT-01**: Phòng phỏng vấn ảo 3D render mượt mà model Avatar 3D (X Interviewer).
- ✓ **INT-02**: Lipsync viseme tự động theo âm lượng giọng nói AI thời gian thực (Web Audio API).
- ✓ **INT-03**: AI phỏng vấn giọng nói: Tự động tổng hợp câu hỏi động dựa trên CV và JD.
- ✓ **INT-04**: Đánh giá và hiển thị năng lực ứng viên qua 5 khía cạnh bằng SVG Radar Chart.
- ✓ **EYE-01**: Webcam camera của ứng viên hiển thị trực tiếp và ổn định.
- ✓ **EYE-02**: Tích hợp MediaPipe Face Landmarker client-side ở tần suất 10 FPS để tiết kiệm CPU.
- ✓ **EYE-03**: Phát hiện hướng nhìn của mắt và góc xoay đầu (yaw, pitch) lệch tâm liên tục quá 1.5 giây.
- ✓ **EYE-04**: Banner cảnh báo Warning nhấp nháy đỏ trên UI và Pause phiên phỏng vấn khi camera mất kết nối.
- ✓ **EYE-05**: Gửi số lần vi phạm `gazeViolations` lên backend để trừ 10 điểm cho mỗi lần vi phạm (tối đa 50 điểm) khi submit.
- ✓ **JOB-01**: Thiết kế lại giao diện Jobs Candidate (Ocean Blue Grid layout, Framer Motion).
- ✓ **JOB-02**: Biểu mẫu điền thông tin cá nhân Stepper 2 bước trong modal ứng tuyển, pre-filled từ profile.
- ✓ **JOB-03**: Cập nhật DB migration và API backend lưu trữ/lấy thông tin ứng tuyển tùy chỉnh.
- ✓ **JOB-04**: Chặn Candidate chưa đăng nhập truy cập các route trong, báo Toast cảnh báo và không tự mở modal.

### Active

- *(None - Tất cả các yêu cầu của v1.0, v3.0 và v4.0 đã được hoàn thành)*

### Out of Scope

- **CV Parser Docx/Image**: Hiện tại chỉ hỗ trợ phân tích định dạng tệp PDF để đảm bảo tính ổn định của thư viện `pdf-parse`.
- **Real-time Messaging Chat logs**: Giao tiếp realtime sử dụng Socket.io được tập trung cho phiên phỏng vấn và đồng bộ HR-Candidate, lược bỏ bảng chat log tin nhắn dư thừa.
- **Thanh toán trực tuyến**: Các gói cước và bảng transactions đã tạo sẵn cơ sở dữ liệu nhưng chưa kích hoạt logic thanh toán Stripe/PayOS trong giai đoạn này.
- **Mô phỏng Avatar3D nâng cao & 3 AI styles (Phases 3.1 & 3.2.1)**: Đã bị hủy bỏ theo yêu cầu của người dùng để tập trung tối ưu hóa luồng ứng tuyển.
- **Chuẩn bị triển khai Production (Phase 4)**: Đã bị hủy bỏ theo yêu cầu của người dùng.

## Context

- **Technical Environment**: React 19, Vite, Tailwind CSS v4, Zustand, TanStack Query, Node.js, Express, PostgreSQL, Knex.js.
- **AI Models**: Groq Cloud / OpenAI được sử dụng làm API cốt lõi để chấm điểm và phân tích.
- **Client Side AI**: Sử dụng MediaPipe tasks-vision WASM trực tiếp từ trình duyệt của candidate để theo dõi camera.

## Constraints

- **Primary Color**: Ocean Blue (`#0ea5e9` Primary, `#38bdf8` Secondary) bắt buộc trên toàn bộ UI/UX. Nghiêm cấm sử dụng màu tím hoặc violet.
- **Auth Gate Gatekeeper**: Khóa hoàn toàn Candidate chưa đăng nhập chỉ được xem Landing Page. Cố ý truy cập các trang khác phải chặn route, bắn Toast cảnh báo và không tự động bật Auth Modal.
- **State Separation**: Zustand chỉ dùng lưu token auth và UI states. TanStack Query quản lý toàn bộ dữ liệu máy chủ (server state caching).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Chấm điểm động AI | Bảng `question_bank` bị xóa; AI tự tạo câu hỏi phỏng vấn theo CV + JD ngữ cảnh để tối ưu hóa tính cá nhân hóa. | ✓ Good |
| MediaPipe 10 FPS | Giới hạn phân tích camera xuống 10 FPS để tránh block main thread làm gián đoạn ghi âm. | ✓ Good |

---
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
*Last updated: 2026-06-18 after milestone v4.0 completion*
