# Phase 1: Luồng Ứng Tuyển & AI Chấm Điểm ATS (Apply Job & ATS Evaluation) - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase này hoàn thiện luồng ứng tuyển CV cho Candidate từ frontend đến backend bao gồm: duyệt danh sách/chi tiết công việc, tải lên file CV PDF, điền cover letter. Backend thực hiện parse PDF, gọi AI chấm điểm độ tương thích ATS Score, trả kết quả hiển thị trực tiếp trên trang cá nhân của Candidate, đồng thời tự động gửi email thông báo đính kèm file PDF đánh giá chi tiết cho Candidate và HR.

</domain>

<decisions>
## Implementation Decisions

### ATS Evaluation Feedback display format
- **D-01:** Hiển thị kết quả ATS dạng Dashboard chi tiết cho Candidate. Giao diện phân chia làm 3 Tab rõ ràng:
  - Tab 1: Tổng quan ATS (Hiển thị điểm tổng quát ATS Score dạng progress bar tròn Ocean Blue kèm nhận xét chung).
  - Tab 2: Phân tích Điểm mạnh & Điểm yếu (Danh sách dạng gạch đầu dòng do AI phân tích).
  - Tab 3: Khuyến nghị AI (Các kỹ năng, từ khóa cần cải thiện để CV khớp hơn với JD).

### Email notification flow
- **D-02:** Khi Candidate nộp hồ sơ thành công, hệ thống gửi email xác nhận cho Candidate và email thông báo ứng tuyển mới cho HR. Cả hai email đều **đính kèm tệp PDF báo cáo đánh giá CV chi tiết** do AI tạo ra để đảm bảo độ tin cậy và chuyên nghiệp.

### PDF Report Processing
- **D-03:** Tệp PDF báo cáo đánh giá được tạo sẵn **một lần duy nhất** ngay sau khi AI chấm điểm xong ở backend (sử dụng `pdfkit`). Tệp này được tải lên Cloudinary, lưu trữ URL vào cột `pdf_report_url` trong bảng `cvs` hoặc `applications`. Khi gửi email hoặc khi người dùng click tải về, backend chỉ cần trả về liên kết trực tiếp này để tải xuống tức thì (instant download).

### Toast Notification Component
- **D-04:** Tự xây dựng Custom Toast bằng **Framer Motion và Tailwind CSS** cho Auth Gate. Toast hiển thị cảnh báo *"Yêu cầu đăng nhập để dùng được tính năng này"* có z-index `9999`, tự động biến mất sau `4` giây và tuyệt đối **không tự động mở Auth Modal** (để người dùng tự bấm nút Đăng nhập trên Navbar).

### the agent's Discretion
- Không có. Các quyết định đã được làm rõ hoàn toàn qua thảo luận.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Project Context
- `.planning/PROJECT.md` — Định nghĩa phạm vi, ràng buộc và quyết định kiến trúc chính của dự án.
- `.planning/REQUIREMENTS.md` — Chi tiết các yêu cầu chức năng (APPLY-01 đến APPLY-04, HR-01, INT-01, NOTI-01).
- `.planning/ROADMAP.md` — Lộ trình phase và success criteria nghiệm thu.

### Codebase Architecture & Conventions
- `.planning/codebase/STACK.md` — Chi tiết công nghệ sử dụng.
- `.planning/codebase/ARCHITECTURE.md` — Cấu trúc Monorepo và luồng request chính.
- `.planning/codebase/CONVENTIONS.md` — Quy chuẩn đặt tên, phân tách state và giao thức Auth Gate.
- `.planning/codebase/INTEGRATIONS.md` — Cấu hình Cloudinary, Knex DB và JWT.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/src/services/cvService.js` (hàm `evaluateCV`): Đã được xây dựng để gọi LLM chấm điểm CV dựa trên JD, chỉ cần tích hợp thêm vào controller.
- `backend/src/services/emailService.js` (hàm `sendJobApplicationEmail`): Cấu hình gửi mail thông báo.
- `backend/src/socket.js` (hàm `sendRealtimeNotification` và `broadcastNewApplication`): Gửi thông báo socket real-time.
- `frontend/src/api/axiosClient.js`: Cấu hình Axios HttpClient tự động gắn JWT Token từ localStorage.

### Established Patterns
- Express Route -> Controller -> Knex để truy vấn.
- JWT middleware (`authenticateToken` ở backend) để bảo mật route.
- React Router DOM v7 định nghĩa cây router, Zustand quản lý auth token.

### Integration Points
- API Endpoint: `POST /api/applications/apply/:jobId` (gọi đến `applyJob` ở backend).
- Component UI:
  - `frontend/src/pages/candidate/` (Trang danh sách/chi tiết công việc).
  - Modal nộp đơn: `ApplyJobModal` bọc trong giao diện Candidate.

</code_context>

<specifics>
## Specific Ideas

- **Giao diện progress bar tròn**: Ở Tab tổng quan ATS trên giao diện Candidate, sử dụng SVG hoặc thư viện CSS vẽ vòng tròn tiến trình hiển thị điểm số ATS (màu Ocean Blue `#0ea5e9`), có animation chạy từ 0 đến điểm số thực tế khi component được render.

</specifics>

<deferred>
## Deferred Ideas

- Ý tưởng phân tích camera cảm xúc của ứng viên và video interview realtime: Đã được chuyển hẳn vào mục **Out of Scope** để đảm bảo thời gian phát triển các tính năng cốt lõi.

</deferred>

---

*Phase: 01-Luồng Ứng Tuyển & AI Chấm Điểm ATS (Apply Job & ATS Evaluation)*
*Context gathered: 2026-06-07*
