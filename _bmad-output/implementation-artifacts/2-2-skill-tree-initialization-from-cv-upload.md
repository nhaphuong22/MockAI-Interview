# Story 2.2: Skill Tree Initialization from CV Upload

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want my skill tree to initialize and light up matching skills immediately when I upload my CV for the first time,
so that I see my starting profile graph.

## Acceptance Criteria (Tiêu chí Chấp nhận)

1. **Tạo service quản lý Skill Tree:** Tạo file `backend/src/services/skillTreeService.js` để định nghĩa logic khởi tạo và cập nhật cây kỹ năng.
2. **Logic Phân loại Career Track (Định hướng công việc):**
   - Tự động xác định Career Track của ứng viên dựa trên vị trí ứng tuyển (`job_title`).
   - Nếu `job_title` chứa các từ khóa backend (như 'backend', 'node', 'java', 'python', 'golang', 'c#', 'php', 'ruby'...), chọn **Backend Developer** làm Career Track mặc định.
   - Các trường hợp còn lại, mặc định chọn **Frontend Developer** làm Career Track.
3. **Mở khoá các kỹ năng từ CV (Unlock Skills):**
   - So khớp danh sách kỹ năng đã được AI bóc tách (`matched_skills` trong kết quả đánh giá CV) với các nút (nodes) kỹ năng trong cây mặc định của Career Track đã chọn.
   - Nếu phát hiện khớp kỹ năng (không phân biệt chữ hoa/thường và bỏ qua khoảng trắng/ký tự đặc biệt), chuyển trạng thái kỹ năng đó thành `'unlocked'` và gán điểm số ban đầu bằng điểm số ATS đánh giá CV (`semantic_score`).
4. **Tích hợp vào Luồng Ứng tuyển (Apply Job Flow):**
   - Trong `backend/src/controllers/applicationController.js`, tích hợp hàm khởi tạo cây kỹ năng từ `skillTreeService.js` ngay sau khi CV được tải lên và lưu trữ thành công vào bảng `cvs`.
   - **Bảo vệ dữ liệu:** Chỉ thực hiện khởi tạo nếu ứng viên **chưa có** cây kỹ năng trong hệ thống (kiểm tra tồn tại trong bảng `user_skill_trees` trước khi chèn mới). Không ghi đè cây kỹ năng nếu ứng viên đã có tiến trình luyện tập trước đó.
   - **Xử lý ngoại lệ (Fault Tolerance):** Bọc logic khởi tạo skill tree trong khối `try/catch` để nếu có bất kỳ lỗi nào xảy ra trong quá trình khởi tạo cây kỹ năng, luồng nộp đơn ứng tuyển cốt lõi (apply job) vẫn diễn ra bình thường mà không bị ngắt quãng.

## Tasks / Subtasks (Nhiệm vụ chi tiết)

- [x] Xây dựng service `skillTreeService.js`
  - [x] Tạo file mới `backend/src/services/skillTreeService.js`.
  - [x] Khai báo cấu trúc default skill trees cho `Frontend Developer` và `Backend Developer` (10 nodes và 10 links cho mỗi cây, đồng bộ cấu trúc dữ liệu với file seed dữ liệu).
  - [x] Viết hàm `initializeSkillTreeFromCV(userId, matchedSkills, jobTitle, atsScore)` thực thi các logic: kiểm tra tồn tại, xác định Career Track, so khớp và cập nhật trạng thái node sang `'unlocked'`, và ghi dữ liệu vào bảng `user_skill_trees`.
- [x] Tích hợp logic khởi tạo vào `applicationController.js`
  - [x] Mở file [applicationController.js](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/backend/src/controllers/applicationController.js).
  - [x] Import hàm `initializeSkillTreeFromCV` từ `../services/skillTreeService.js`.
  - [x] Xác định khối code lưu CV thành công vào bảng `cvs` (ở cả 2 trường hợp `existingApp` và `else`).
  - [x] Gọi hàm `initializeSkillTreeFromCV` trong khối `try/catch`, truyền vào `candidateId`, `evaluation.matched_skills`, `job.title`, và `evaluation.semantic_score`.
- [x] Xác minh và chạy thử nghiệm
  - [x] Viết script test hoặc chạy thử nghiệm tải lên CV thực tế và kiểm tra dữ liệu được tạo ra trong bảng `user_skill_trees` thông qua cơ sở dữ liệu.
  - [x] Kiểm tra tính năng hoạt động trơn tru không phát sinh lỗi biên dịch hay lỗi runtime.

## Dev Notes (Ghi chú phát triển)

- **Fault Tolerance:** Việc lỗi ở module phụ (Skill Tree) không được phép làm hỏng nghiệp vụ chính (nộp đơn ứng tuyển). Do đó việc bao bọc block code bằng `try/catch` là yêu cầu bắt buộc.
- **Kỹ năng so khớp linh hoạt:** AI có thể bóc tách kỹ năng dưới dạng `"React"`, `"ReactJS"`, hoặc `"React.js"`. Hãy thực hiện hàm chuẩn hóa chuỗi (chuyển chữ thường, bỏ ký tự đặc biệt) trước khi so khớp để đảm bảo tỷ lệ khớp cao nhất.

### Project Structure Notes (Cấu trúc dự án)

- Service mới: `backend/src/services/skillTreeService.js`.
- Controller được chỉnh sửa: `backend/src/controllers/applicationController.js`.

### References (Tài liệu tham khảo)

- Cấu trúc bảng `user_skill_trees` đã thiết lập: [2-1-database-schema-and-mock-seed-data.md](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/_bmad-output/implementation-artifacts/2-1-database-schema-and-mock-seed-data.md)
- File migration DB: `backend/migrations/20260628155512_create_user_skill_trees.js`
- File seed dữ liệu mẫu: `backend/seeds/07_sample_user_skill_trees.js`

## Dev Agent Record

### Agent Model Used

Gemini 3.5 Flash

### Debug Log References

- Created `backend/src/services/skillTreeService.js` and verified standard formatting.
- Modified `backend/src/controllers/applicationController.js` to import and call `initializeSkillTreeFromCV`.
- Created test script `backend/test_skill_tree.js` and ran it (`node test_skill_tree.js`). Corrected type bug where `record.graph_data` is already parsed as Object by PostgreSQL pg driver.
- Re-run test completed successfully, verifying that "HTML5, Tailwind CSS, TypeScript, ReactJS" were unlocked with the correct CV ATS score.
- Deleted test script `backend/test_skill_tree.js` to keep workspace clean.

### Completion Notes List

- Built a robust `skillTreeService.js` to manage career track classification and node-matching with normalizations.
- Safely integrated the initialization callback into the application flow right after CV inserts, protected inside try/catch to maintain fault tolerance.

### File List

- `backend/src/services/skillTreeService.js`
- `backend/src/controllers/applicationController.js`
