## Deferred from: code review (2026-06-29) - 3-1-database-schema-and-mock-data-for-highlights.md

- Nguy cơ lỗi reset sequence khi bảng rỗng [backend/seeds/08_sample_interview_highlights.js:109] - Lệnh setval của PG có thể bị lỗi khi MAX(id) trả về NULL. Tuy nhiên do dữ liệu được nạp trước khi chạy lệnh, lỗi này không xảy ra trên thực tế. Đây là pattern đã có của dự án.

## Deferred from: code review (2026-06-29) - 3-3-hr-candidate-highlights-dashboard.md

- Heuristic 30s scroll cứng nhắc trong handleTimestampClick [frontend/src/pages/recruiter/components/ApplicationDetailModal.jsx:108] - Heuristic chia 30 giây để tìm questionIndex do db schema không lưu thời gian cụ thể của từng câu hỏi.
- Thiếu check ownership chặt chẽ ở backend controller khi job_id là null [backend/src/controllers/hrInterviewController.js:189] - HR được bỏ qua ownership check nếu interview.job_id là null, tuy nhiên trên thực tế phỏng vấn thật luôn có job_id.

## Deferred from: code review (2026-06-29) - 3-4-audio-slicing-api-and-embedded-playback.md

- Rò rỉ JWT Token qua URL Query Parameter [frontend/src/api/hrInterviewApi.js:47] - Truyền JWT token qua URL query parameter `?token=...` để thẻ `<audio>` load trực tiếp có rủi ro bảo mật (lộ token qua access logs, referer header). Tuy nhiên đây là giới hạn thiết kế của HTML5 Audio và đã được chấp nhận do độ phức tạp của giải pháp thay thế.


