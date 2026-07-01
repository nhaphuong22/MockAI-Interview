---
baseline_commit: 0f03175ff859c36c1e1a47a75eca6412cb58f5ca
---

# Story 3.2: AI Highlight Extraction Service

Status: done

## Story

As a recruiter,
I want the system to automatically generate a 1-minute summary and timestamps of key interview moments,
So that I don't have to read the whole transcript.

## Acceptance Criteria (Tiêu chí Chấp nhận)

1. **Khởi tạo dịch vụ Highlight (`highlightService.js`):**
   - Tạo file service mới `backend/src/services/highlightService.js`.
   - Sử dụng định dạng ES Modules (`export const ...`).
   - Triển khai hàm `generateInterviewHighlights(interviewId)` để bóc tách các khoảnh khắc nổi bật và tóm tắt buổi phỏng vấn.

2. **Tích hợp Gemini API trong `geminiService.js`:**
   - Khai báo hàm `generateHighlightsFromGemini({ candidateName, position, qaDetails, totalViolations, isSuspended })` trong `backend/src/services/geminiService.js`.
   - Hàm này sẽ gửi transcript (danh sách câu hỏi và câu trả lời) và lịch sử vi phạm đến Gemini API để phân tích.
   - Nhận kết quả định dạng JSON chuẩn gồm:
     - `highlight_summary`: Văn bản tóm tắt khoảng 1 phút (tập trung vào thái độ, năng lực chuyên môn, điểm nổi bật hoặc cảnh báo gian lận).
     - `is_flagged`: Boolean xác định cuộc phỏng vấn có bị gắn cờ không (dựa trên trạng thái `SUSPENDED` hoặc `totalViolations > 5`).
     - `timestamps_data`: Mảng các mốc thời gian nổi bật, mỗi đối tượng gồm:
       - `timestamp`: giây (ví dụ: `15`, `45`, `120`), đại diện cho vị trí khoảnh khắc bắt đầu trong audio.
       - `label`: mô tả ngắn gọn về khoảnh khắc (ví dụ: "Trả lời mạch lạc về cấu trúc dự án", "Ngập ngừng khi giải thích hook useEffect").
       - `duration`: thời lượng (giây), mặc định là `30`.
       - `type`: phân loại khoảnh khắc (`"STRENGTH"`, `"WEAKNESS"`, `"HESITATION"`, `"VIOLATION"`).
   - Tích hợp cơ chế Mock cho API key kiểm thử (`process.env.GEMINI_API_KEY === 'mock-gemini-key'`) để trả về mock highlights phù hợp.

3. **Ghi nhận dữ liệu vào cơ sở dữ liệu (`interview_highlights`):**
   - Dịch vụ phải truy vấn thông tin buổi phỏng vấn (questions, answers, user, job) để xây dựng transcript trước khi gửi cho Gemini.
   - Lưu kết quả trả về từ Gemini vào bảng `interview_highlights`. Nếu đã tồn tại bản ghi cho `interview_id`, tiến hành cập nhật (`update`), ngược lại thì chèn mới (`insert`).

4. **Tích hợp tự động kích hoạt (Auto-trigger):**
   - Tích hợp lời gọi hàm `generateInterviewHighlights(interviewId)` vào cuối quy trình đánh giá phỏng vấn chạy ngầm trong `processAIEvaluationBackground` (trong `backend/src/services/hrInterviewService.js`).
   - Gọi hàm này ngay sau khi `assessments` được lưu thành công vào cơ sở dữ liệu.
   - Đảm bảo bọc lời gọi trong block `try/catch` để nếu quá trình sinh highlights gặp lỗi, nó không làm sập tiến trình lưu kết quả phỏng vấn chính.

5. **Xác minh & Kiểm thử (Verification):**
   - Viết hoặc tích hợp một test script (ví dụ: `backend/test_highlight.js`) để chạy thử nghiệm việc sinh highlights cho `interview_id: 1` and `interview_id: 2` (suspended), kiểm tra xem dữ liệu trong bảng `interview_highlights` có được cập nhật chính xác hay không.

## Tasks / Subtasks (Nhiệm vụ chi tiết)

- [x] Cập nhật `backend/src/services/geminiService.js`
  - [x] Khai báo hàm `generateHighlightsFromGemini` với prompt cấu hình chi tiết cho Gemini.
  - [x] Thiết lập rào cản prompt (guardrails): Nếu ứng viên vi phạm nhiều hoặc phỏng vấn bị `SUSPENDED`, AI phải nêu rõ cảnh báo gian lận trong tóm tắt và đánh dấu `is_flagged = true`.
  - [x] Thêm logic Mock data nếu API key là `mock-gemini-key`.
- [x] Tạo file service mới `backend/src/services/highlightService.js`
  - [x] Triển khai hàm `generateInterviewHighlights(interviewId)`.
  - [x] Lấy dữ liệu từ bảng `interviews`, `interview_questions`, `candidate_answers`, và `users`.
  - [x] Chuyển đổi dữ liệu Q&A thành định dạng transcript đầu vào cho Gemini.
  - [x] Gọi `generateHighlightsFromGemini` để lấy kết quả tóm tắt và mốc thời gian.
  - [x] Thực hiện chèn/cập nhật kết quả vào bảng `interview_highlights`.
- [x] Tích hợp vào `backend/src/services/hrInterviewService.js`
  - [x] Import `generateInterviewHighlights` vào file.
  - [x] Gọi hàm trong `processAIEvaluationBackground` ngay sau khi lưu assessment thành công.
  - [x] Đặt trong block `try/catch` an toàn.
- [x] Tạo script kiểm thử và chạy thử nghiệm
  - [x] Tạo file `backend/test_highlight.js` để chạy thử service với `interviewId: 1` và `interviewId: 2`.
  - [x] Đảm bảo script in ra log kết quả highlights được sinh ra và lưu vào DB thành công.
  - [x] Chạy kiểm thử linting: `pnpm -C frontend run lint` (hoặc chạy lint chung) để đảm bảo tính toàn vẹn của mã nguồn.

### Review Findings

- [x] [Review][Patch] Thiếu tham số vi phạm chuyển tab (totalTabViolations) trong dịch vụ Highlight [backend/src/services/hrInterviewService.js:268]

## Dev Notes (Ghi chú phát triển)

- **Prompt Engineering cho Gemini:** Prompt gửi lên Gemini hướng dẫn rõ cấu trúc JSON trả về. Cung cấp đầy đủ bối cảnh về số lỗi vi phạm (`totalViolations`) và trạng thái phỏng vấn (`isSuspended`) để AI đánh giá sự trung thực chính xác.
- **Audio Highlights Mapping:** Vì mỗi câu hỏi phỏng vấn tương ứng với một tệp âm thanh ghi âm riêng (đường dẫn lưu trong `candidate_answers.audio_url`), mốc thời gian `timestamp` trong `timestamps_data` được ánh xạ tương đối để HR Dashboard sử dụng sau này.

### Project Structure Notes (Cấu trúc dự án)

- File service highlight được đặt tại `backend/src/services/highlightService.js`.
- File kiểm thử đặt tại `backend/test_highlight.js`.

### References (Tài liệu tham khảo)

- Cấu trúc bảng và migrations: [DATABASE_SCHEMA.md](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/DATABASE_SCHEMA.md)
- Quản lý API AI: [geminiService.js](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/backend/src/services/geminiService.js)
- Quy trình đánh giá HR: [hrInterviewService.js](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/backend/src/services/hrInterviewService.js)

## Dev Agent Record

### Agent Model Used

Gemini 3.5 Flash (High)

### Debug Log References

- New service created: `backend/src/services/highlightService.js`
- Test script created: `backend/test_highlight.js`
- Command `node test_highlight.js` executed successfully, generating expected mock JSON structures and successfully saving/updating postgres DB records (id: 1 and id: 2).
- Linting command `pnpm -C frontend run lint` completed successfully with 0 errors.

### Completion Notes List

- Triển khai hàm `generateHighlightsFromGemini` tích hợp prompt chi tiết phân tích transcript phỏng vấn và các lỗi vi phạm, xuất cấu trúc JSON chuẩn hóa.
- Xây dựng `highlightService.js` truy vấn thông tin buổi phỏng vấn (questions, answers, user, job) và thực hiện upsert dữ liệu an toàn vào bảng `interview_highlights`.
- Tích hợp lời gọi hàm Highlights vào quy trình chấm điểm phỏng vấn chạy ngầm của HR (`processAIEvaluationBackground`) bọc trong khối `try/catch` an toàn.
- Xác minh bằng script kiểm thử tự động, in log kết quả chính xác cho cả trường hợp phỏng vấn bình thường (id: 1) và bị đình chỉ (id: 2).

### File List

- `backend/src/services/geminiService.js`
- `backend/src/services/highlightService.js`
- `backend/src/services/hrInterviewService.js`
- `backend/test_highlight.js`

## Change Log

### [2026-06-29]
- Xây dựng dịch vụ Highlights bằng AI tự động bóc tách từ transcript cuộc phỏng vấn và mốc thời gian qua Gemini API.
