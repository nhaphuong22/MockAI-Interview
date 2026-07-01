---
baseline_commit: 4b8b9a8c758a32556c0a72e175683bb3ce3fc6f2
---

# Story 2.4: Node Interaction and Learning Recommendations Panel

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want to click on a skill node to view detailed AI feedback, practice questions, and recommended courses,
so that I know how to improve that specific skill.

## Acceptance Criteria (Tiêu chí Chấp nhận)

1. **Xây dựng API Endpoint lấy chi tiết Kỹ năng ở Backend:**
   - Tạo endpoint `GET /api/skill-tree/node/:nodeId` để lấy thông tin học tập chi tiết của một node kỹ năng cụ thể.
   - Endpoint sử dụng middleware `authenticateToken`.
   - Kết quả trả về gồm:
     - `ai_feedback`: Nhận xét từ AI dựa trên CV của ứng viên liên quan đến kỹ năng này (nếu có CV và kỹ năng khớp). Nếu không, trả về nhận xét chung chuẩn hóa của kỹ năng.
     - `practice_questions`: Danh sách 3 câu hỏi phỏng vấn thử thực tế kèm gợi ý câu trả lời mong đợi.
     - `courses`: Danh sách 2-3 khóa học/tài liệu tự học chất lượng kèm URL liên kết.
   - **Tích hợp AI & Static Fallback:**
     - Tích hợp gọi Google Generative AI (Gemini/Groq) để sinh dữ liệu động cá nhân hóa dựa trên CV của candidate (nếu có cấu hình API Key đầy đủ).
     - Định nghĩa sẵn bộ Mock Data tĩnh đầy đủ và chuyên nghiệp cho tất cả 20 kỹ năng của cả 2 track Frontend và Backend làm phương án dự phòng (fallback) để đảm bảo tốc độ phản hồi và độ ổn định cao nhất khi kiểm thử.
2. **Thiết kế Side Panel tương tác ở Frontend:**
   - Khi ứng viên click chọn một node kỹ năng trên đồ thị, một Side Panel (Bảng điều khiển bên cạnh) trượt ra từ bên phải màn hình.
   - Sử dụng thư viện **Framer Motion** để tạo chuyển động trượt mượt mà (slide-in / slide-out).
   - Hiển thị đầy đủ thông tin: Tên kỹ năng, Trạng thái (Mở khóa/Khóa), Nhận xét từ AI, Danh sách 3 câu hỏi phỏng vấn thử, và 2-3 đường link khóa học tự học.
3. **Chuyển hướng Luyện tập trực tiếp (Instant Practice Route):**
   - Khi ứng viên click vào nút "Luyện tập kỹ năng này" hoặc bấm trực tiếp vào một câu hỏi phỏng vấn thử trong Side Panel:
     - Hệ thống thực hiện chuyển hướng ứng viên sang trang Luyện tập phỏng vấn (`/interview-practice`) kèm theo trạng thái kỹ năng tự động khởi chạy (`location.state.autoStartSkill = nodeLabel`).
   - Cập nhật trang `/interview-practice` ở Frontend để tự động nhận dạng trạng thái này, bỏ qua các bước cấu hình thủ công và dẫn ứng viên trực tiếp đến màn hình Microphone Setup để phỏng vấn ngay lập tức.

## Tasks / Subtasks (Nhiệm vụ chi tiết)

- [x] Phát triển API Backend chi tiết kỹ năng
  - [x] Thêm phương thức xử lý `getSkillTreeNodeDetails` trong controller `backend/src/controllers/skillTreeController.js`.
  - [x] Khai báo và cấu hình prompt cho Groq để tự động phân tích CV + sinh câu hỏi/khóa học dựa trên kỹ năng.
  - [x] Thiết lập bộ Mock Data dự phòng chất lượng cao cho toàn bộ kỹ năng của cả 2 track (Frontend/Backend).
  - [x] Đăng ký route `GET /node/:nodeId` trong `backend/src/routes/skillTreeRoutes.js`.
- [x] Thiết kế UI Side Panel ở Frontend
  - [x] Tạo component `SkillTreeSidePanel.jsx` hiển thị thông tin chi tiết của node kỹ năng được chọn.
  - [x] Sử dụng **Framer Motion** bọc ngoài để tạo hiệu ứng `x: [300, 0]` trượt từ bên phải và mờ dần background.
  - [x] Tạo API client trong `frontend/src/api/skillTreeApi.js` để gọi endpoint `/api/skill-tree/node/:nodeId`.
  - [x] Fetch dữ liệu chi tiết của node kỹ năng mỗi khi ứng viên click chọn node trên đồ thị.
  - [x] Thêm sự kiện click chuyển hướng người dùng bằng `useNavigate` truyền kèm `state: { autoStartSkill: nodeLabel }`.
- [x] Cập nhật luồng Luyện tập Phỏng vấn tự động
  - [x] Mở file [InterviewPractice.jsx](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/frontend/src/pages/candidate/InterviewPractice.jsx).
  - [x] Thêm một `useEffect` kiểm tra sự tồn tại của `location.state.autoStartSkill`.
  - [x] Nếu tồn tại và chưa được xử lý, tự động kích hoạt `initInterviewApi` với kỹ năng tương ứng, gán câu hỏi từ server và chuyển thẳng sang `setup` mode (Microphone Setup).
- [x] Tích hợp và kiểm thử trải nghiệm người dùng
  - [x] Liên kết `SkillTreeSidePanel` vào trong `SkillTreeGraph.jsx` hoặc trang `Profile.jsx`.
  - [x] Kiểm tra bấm chọn node và xem Side Panel trượt mượt mà.
  - [x] Thử click vào một câu hỏi luyện tập và xác nhận hệ thống chuyển hướng thông minh, vào thẳng chế độ phỏng vấn kỹ năng đó.

## Dev Notes (Ghi chú phát triển)

- **Framer Motion Panel:** Sử dụng `AnimatePresence` bọc ngoài Side Panel để khi tắt, panel trượt ra ngoài mượt mà trước khi unmount khỏi DOM.
- **Auto-Start Safety:** Đảm bảo thêm cờ `hasProcessedState` trong `InterviewPractice` để tránh trigger vòng lặp bất tận hoặc re-fetch không mong muốn khi state thay đổi.

### Project Structure Notes (Cấu trúc dự án)

- Backend:
  - `backend/src/controllers/skillTreeController.js`
  - `backend/src/routes/skillTreeRoutes.js`
- Frontend:
  - `frontend/src/pages/candidate/components/SkillTreeSidePanel.jsx` (NEW)
  - `frontend/src/pages/candidate/components/SkillTreeGraph.jsx` (Modified)
  - `frontend/src/pages/candidate/InterviewPractice.jsx` (Modified)

### References (Tài liệu tham khảo)

- Cấu trúc API Router Backend: [skillTreeRoutes.js](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/backend/src/routes/skillTreeRoutes.js)
- Trang luyện tập gốc: [InterviewPractice.jsx](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/frontend/src/pages/candidate/InterviewPractice.jsx)

## Dev Agent Record

### Agent Model Used

Gemini 3.5 Flash

### Debug Log References

- Created `generateSkillNodeDetailsFromGroq` in `backend/src/services/groqService.js` to prompt Groq Llama for dynamic AI feedback based on candidate's CV and skill.
- Updated `getSkillTreeNodeDetails` in `backend/src/controllers/skillTreeController.js` and defined `staticNodeDetails` fallback structure for all 20 skills.
- Registered `/api/skill-tree/node/:nodeId` in `backend/src/routes/skillTreeRoutes.js`.
- Created `frontend/src/pages/candidate/components/SkillTreeSidePanel.jsx` using Framer Motion trượt mở và close overlay.
- Modified `SkillTreeGraph.jsx` to render the side panel using `AnimatePresence`.
- Modified `frontend/src/pages/candidate/InterviewPractice.jsx` to capture `autoStartSkill` in state and initiate a direct practice session.
- Ran lint and resolved React unused import warning.

### Completion Notes List

- Implemented dynamic AI node generation using Groq API, with high-quality predefined fallback data.
- Achieved an interactive side-drawer UX leveraging Framer Motion.
- Streamlined practice initiation by automatically bypassing configuration forms when redirecting from a skill node.

### File List

- `backend/src/services/groqService.js`
- `backend/src/controllers/skillTreeController.js`
- `backend/src/routes/skillTreeRoutes.js`
- `frontend/src/api/skillTreeApi.js`
- `frontend/src/pages/candidate/components/SkillTreeSidePanel.jsx`
- `frontend/src/pages/candidate/components/SkillTreeGraph.jsx`
- `frontend/src/pages/candidate/InterviewPractice.jsx`
