---
baseline_commit: 0f03175ff859c36c1e1a47a75eca6412cb58f5ca
---

# Story 3.3: HR Candidate Highlights Dashboard

Status: done

## Story

As a recruiter,
I want to view a concise card summary of candidate highlights on the applicant detail page,
So that I can screen them in 1 minute.

## Acceptance Criteria (Tiêu chí Chấp nhận)

1. **API Endpoint ở Backend (`GET /api/interviews/hr/highlights/:interviewId`):**
   - Khai báo endpoint mới trong `backend/src/routes/interviewRoutes.js`.
   - Chỉ cho phép người dùng có vai trò `HR` hoặc `ADMIN` đã xác thực truy cập.
   - Triển khai handler `getHRInterviewHighlightsHandler` trong `backend/src/controllers/hrInterviewController.js`:
     - Truy vấn bản ghi từ bảng `interview_highlights` dựa trên `interviewId`.
     - Trả về JSON chứa: tóm tắt highlights (`highlight_summary`), cờ flagged (`is_flagged`), và mảng mốc thời gian (`timestamps_data` đã được parse từ JSONB).

2. **Frontend API Client:**
   - Khai báo hàm `getHRInterviewHighlightsApi(interviewId)` trong `frontend/src/api/hrInterviewApi.js` để gọi lên endpoint mới.

3. **Giao diện Card Highlights trên HR Detail Modal (`ApplicationDetailModal.jsx`):**
   - Sử dụng TanStack Query (`useQuery`) để tự động fetch highlights khi HR xem tab Phỏng vấn AI (`viewMode === "pv"`) và đơn ứng tuyển có liên kết với một `interview_id`.
   - **Tóm tắt 1 phút (AI Highlight Summary):**
     - Renders một box giao diện Glassmorphism cao cấp sử dụng tông màu xanh nước biển chủ đạo (Ocean Blue).
     - Hiển thị icon robot AI lấp lánh (`Sparkles`) để tạo điểm nhấn hiện đại.
   - **Thanh mốc thời gian Timeline (Interactive Highlights Timestamps):**
     - Hiển thị timeline các khoảnh khắc nổi bật có dạng danh sách bullet points đẹp mắt.
     - Mỗi khoảnh khắc có icon đại diện phù hợp (`STRENGTH` -> `TrendingUp` hoặc icon check, `WEAKNESS` -> `AlertTriangle`, `HESITATION` -> `Clock`, `VIOLATION` -> `XCircle`).
     - Có micro-animations (hover shadow, scale nhẹ) trên mỗi phần tử.
     - Click vào một mốc thời gian timeline sẽ kích hoạt hiệu ứng cuộn mượt mà (`scrollIntoView` với `behavior: "smooth"`) sang phần transcript câu hỏi tương ứng ở cột bên trái, đồng thời nhấp nháy highlight chớp tắt màu xanh để HR định vị nhanh câu trả lời đó.
   - **Cảnh báo gian lận (Fraud Warning Banner):**
     - Nếu `isFlagged === true` hoặc trạng thái phỏng vấn là `SUSPENDED`, hiển thị một banner cảnh báo màu đỏ chói nổi bật (có hiệu ứng nhấp nháy pulse nhẹ và icon `AlertTriangle`), nêu rõ lý do cảnh báo gian lận để HR phát hiện tức thì.

4. **Định vị câu hỏi tương ứng trong Transcript:**
   - Cập nhật phần render transcript ở cột bên trái của `ApplicationDetailModal.jsx` để gán unique ID: `id={`qa-question-${qa.index}`}` cho mỗi khối câu hỏi, cho phép cuộn mượt đến chính xác câu hỏi đó.

5. **Đảm bảo chất lượng & Linting:**
   - Chạy kiểm thử thủ công và tự động đảm bảo dữ liệu hiển thị chính xác.
   - Chạy lệnh lint dự án: `pnpm -C frontend run lint` không phát sinh bất kỳ lỗi nào.

## Tasks / Subtasks (Nhiệm vụ chi tiết)

- [x] Cài đặt API Backend
  - [x] Khai báo route `/hr/highlights/:interviewId` trong `backend/src/routes/interviewRoutes.js`.
  - [x] Viết handler `getHRInterviewHighlightsHandler` trong `backend/src/controllers/hrInterviewController.js`.
  - [x] Đảm bảo cơ chế phân quyền bảo mật (chỉ cho phép HR/Admin).
- [x] Cập nhật Frontend API Client
  - [x] Thêm hàm `getHRInterviewHighlightsApi` vào `frontend/src/api/hrInterviewApi.js`.
- [x] Thiết kế Giao diện Highlights trong `ApplicationDetailModal.jsx`
  - [x] Thêm hook `useQuery` để fetch highlights khi ở tab `"pv"`.
  - [x] Cập nhật phần render transcript ở cột bên trái: thêm thuộc tính `id={`qa-question-${qa.index || (i+1)}`}` vào thẻ div câu hỏi.
  - [x] Viết hàm `handleTimestampClick(timestamp)` để thực hiện scroll mượt mà tới câu hỏi tương ứng và chớp nháy highlight màu xanh.
  - [x] Thiết kế và hiển thị box **Tóm tắt 1 phút** sử dụng tông màu Ocean Blue và Glassmorphism.
  - [x] Renders timeline các khoảnh khắc nổi bật kèm các loại icon tương ứng.
  - [x] Thiết kế **Fraud Warning Banner** màu đỏ nhấp nháy nếu ứng viên bị cờ (`is_flagged = true`).
- [x] Xác minh & Kiểm thử (Verification)
  - [x] Mở trình duyệt giả lập hoặc HR Dashboard để kiểm chứng giao diện hoạt động chính xác.
  - [x] Kiểm tra click vào mốc thời gian có scroll sang câu hỏi tương ứng ở cột bên trái không.
  - [x] Chạy lint: `pnpm -C frontend run lint`.

### Review Findings (Kết quả đánh giá mã nguồn)

- [x] [Review][Patch] Khả năng lỗi NaN nếu item.timestamp bị thiếu hoặc null [frontend/src/pages/recruiter/components/ApplicationDetailModal.jsx:734]
- [x] [Review][Defer] Heuristic 30s scroll cứng nhắc trong handleTimestampClick [frontend/src/pages/recruiter/components/ApplicationDetailModal.jsx:108] — deferred, pre-existing
- [x] [Review][Defer] Thiếu check ownership chặt chẽ ở backend controller khi job_id là null [backend/src/controllers/hrInterviewController.js:189] — deferred, pre-existing

## Dev Notes (Ghi chú phát triển)

- **Tông màu thiết kế (Ocean Blue):** Primary color: `#0ea5e9` và Secondary color: `#38bdf8`.
- **Cơ chế scroll & highlight:** Để scroll mượt mà và làm nổi bật câu hỏi, sử dụng CSS transitions và class nhấp nháy trong React state hoặc class dynamic.

### Project Structure Notes (Cấu trúc dự án)

- `backend/src/routes/interviewRoutes.js`
- `backend/src/controllers/hrInterviewController.js`
- `frontend/src/api/hrInterviewApi.js`
- `frontend/src/pages/recruiter/components/ApplicationDetailModal.jsx`

### References (Tài liệu tham khảo)

- Dịch vụ Highlights: [highlightService.js](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/backend/src/services/highlightService.js)
- Chi tiết tuyển dụng: [ManageApplications.jsx](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/frontend/src/pages/recruiter/ManageApplications.jsx)

## Dev Agent Record

### Agent Model Used

Gemini 3.5 Flash (High)

### Debug Log References

- Không phát sinh lỗi trong quá trình chạy linter `pnpm -C frontend run lint` (0 errors, 175 warnings từ các file khác).
- eslint chạy riêng cho file `ApplicationDetailModal.jsx` đạt kết quả sạch hoàn toàn (0 warnings, 0 errors).

### Completion Notes List

- Sửa lỗi import thiếu icon `Sparkles` và `XCircle` từ `lucide-react` trong file `ApplicationDetailModal.jsx`.
- Cập nhật hiệu ứng click mốc thời gian: kích hoạt cuộn mượt và highlight câu hỏi tương ứng bằng class `animate-pulse bg-sky-100 ring-2 ring-[#0ea5e9]` trong 2 giây để nhà tuyển dụng định vị nhanh.
- Thiết kế giao diện Timeline mốc thời gian nổi bật: thay thế các chấm dot bằng các icon trực quan cho từng loại (`TrendingUp` cho `STRENGTH`, `AlertTriangle` cho `WEAKNESS`, `Clock` cho `HESITATION`, `XCircle` cho `VIOLATION`), phối màu sắc hài hòa và thêm hiệu ứng transition mượt mà, scale nhẹ (`hover:scale-[1.02] hover:translate-x-1`) khi hover.
- Banner Cảnh Báo Gian Lận hoạt động chính xác, nhấp nháy pulse màu đỏ nổi bật đối với các cuộc phỏng vấn có `isFlagged === true` hoặc status là `SUSPENDED`.

### File List

- `frontend/src/pages/recruiter/components/ApplicationDetailModal.jsx`
