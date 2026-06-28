---
baseline_commit: 4b8b9a8c758a32556c0a72e175683bb3ce3fc6f2
---

# Story 2.5: Real-time Skill Tree Updates

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want my skill tree scores and node lock/unlock status to update immediately after I complete an AI interview,
so that I see my progress.

## Acceptance Criteria (Tiêu chí Chấp nhận)

1. **Xây dựng Hàm cập nhật Cây Kỹ năng ở Backend:**
   - Trong `backend/src/services/skillTreeService.js`, viết hàm `updateSkillTreeOnInterviewComplete(userId, customSkillsStr, overallScore)`.
   - Hàm này sẽ:
     - Phân tích chuỗi kỹ năng được test `customSkillsStr` (ví dụ `"ReactJS, HTML5"` -> `["ReactJS", "HTML5"]`).
     - Lấy cây kỹ năng hiện có của candidate từ bảng `user_skill_trees`. Nếu chưa có, tiến hành khởi tạo mới.
     - Cập nhật lũy tiến: Với các kỹ năng được test, cập nhật điểm số `score = Math.max(existingScore, overallScore)` và chuyển trạng thái node sang `'unlocked'`.
     - **Mở khóa nhánh kỹ năng liên kề (Adjacent Node Unlocking):**
       - Duyệt qua các node vừa được cập nhật điểm số. Nếu điểm số của node cha đạt từ **70/100 trở lên**, hệ thống tự động tìm kiếm tất cả các node con liền kề (thông qua liên kết `links` có `source` là node cha đó) và chuyển trạng thái các node con này từ `'locked'` thành `'unlocked'`.
     - Lưu lại cây kỹ năng mới vào database.
2. **Tạo Socket Event phát tín hiệu cập nhật:**
   - Trong `backend/src/socket.js`, định nghĩa helper `emitSkillTreeUpdate(userId, updatedTree)` để gửi thông điệp event `'skill_tree_update'` trực tiếp tới room socket của candidate (`user_${userId}`).
   - Gọi helper này ngay sau khi lưu cập nhật cây kỹ năng thành công ở Backend.
3. **Tích hợp vào Luồng hoàn thành Phỏng vấn (Interview Complete Pipeline):**
   - Gọi hàm cập nhật cây kỹ năng `updateSkillTreeOnInterviewComplete` tại:
     - [voiceSessionService.js](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/backend/src/services/voiceSessionService.js) (ngay sau khi ghi nhận kết quả vào bảng `assessments` đối với phỏng vấn thử Practice).
     - [hrInterviewService.js](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/backend/src/services/hrInterviewService.js) (ngay sau khi ghi nhận kết quả vào bảng `assessments` đối với phỏng vấn HR).
   - Bảo vệ luồng bằng `try/catch` để tránh làm crash kết quả phỏng vấn chính.
4. **Lắng nghe và cập nhật giao diện Frontend Real-time:**
   - Trong file [SocketContext.jsx](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/frontend/src/context/SocketContext.jsx) ở Frontend, lắng nghe sự kiện `'skill_tree_update'`.
   - Khi nhận được sự kiện:
     - Hiển thị Toast thông báo chúc mừng: "Sơ đồ cây kỹ năng của bạn đã được cập nhật!".
     - Sử dụng `queryClient.setQueryData` để cập nhật trực tiếp cache query của `["skillTree"]`, giúp đồ thị SVG tự động cập nhật các node sáng xanh và thay đổi điểm số ngay lập tức mà không cần reload trang hoặc gọi API tải lại.

## Tasks / Subtasks (Nhiệm vụ chi tiết)

- [x] Phát triển Socket Event và Logic Cập nhật cây kỹ năng
  - [x] Thêm hàm `emitSkillTreeUpdate` vào file `backend/src/socket.js`.
  - [x] Viết hàm `updateSkillTreeOnInterviewComplete` trong `backend/src/services/skillTreeService.js` xử lý cập nhật lũy tiến, mở khóa node liền kề (với điều kiện score > 70) và phát socket event.
- [x] Tích hợp hàm cập nhật vào các Service phỏng vấn Backend
  - [x] Mở file [voiceSessionService.js](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/backend/src/services/voiceSessionService.js), import và gọi `updateSkillTreeOnInterviewComplete`.
  - [x] Mở file [hrInterviewService.js](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/backend/src/services/hrInterviewService.js), import và gọi `updateSkillTreeOnInterviewComplete`.
- [x] Lắng nghe socket event ở Frontend và cập nhật cache
  - [x] Mở file [SocketContext.jsx](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/frontend/src/context/SocketContext.jsx).
  - [x] Thêm trình lắng nghe sự kiện `'skill_tree_update'` bên trong socket effect.
  - [x] Gọi `queryClient.setQueryData` để trực tiếp đồng bộ graph_data vào cache `["skillTree"]`.
- [x] Kiểm thử và xác minh real-time
  - [x] Viết kịch bản test hoặc chạy thử buổi phỏng vấn thử, xác nhận sau khi hoàn thành buổi thi và lưu kết quả, socket đẩy cây kỹ năng mới về client và giao diện tự động vẽ lại các node đã mở khóa.

## Dev Notes (Ghi chú phát triển)

- **Adjacent Unlocking:** Nhớ duyệt chính xác `links` để map đúng `source` -> `target`.
- **Set Query Data:** Hãy copy cẩn thận cấu trúc payload trả về để `queryClient.setQueryData` hoạt động trơn tru mà không làm vỡ schema của graph.

### Project Structure Notes (Cấu trúc dự án)

- Backend:
  - `backend/src/socket.js`
  - `backend/src/services/skillTreeService.js`
  - `backend/src/services/voiceSessionService.js`
  - `backend/src/services/hrInterviewService.js`
- Frontend:
  - `frontend/src/context/SocketContext.jsx`

### References (Tài liệu tham khảo)

- Quản lý Socket server: [socket.js](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/backend/src/socket.js)
- Lưu trữ assessments: [voiceSessionService.js](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/backend/src/services/voiceSessionService.js#L261-L284)

## Dev Agent Record

### Agent Model Used

Gemini 3.5 Flash

### Debug Log References

- Implemented `emitSkillTreeUpdate` inside `backend/src/socket.js`.
- Implemented `updateSkillTreeOnInterviewComplete` in `backend/src/services/skillTreeService.js` with target-link verification, parent node checking logic (score >= 70) and child unlocking structure.
- Integrated the callback inside `backend/src/services/voiceSessionService.js` (Practice interview) and `backend/src/services/hrInterviewService.js` (HR interview) safely under `try/catch`.
- Registered listener `skill_tree_update` inside `frontend/src/context/SocketContext.jsx` and triggered `queryClient.setQueryData(["skillTree"])` mapping.
- Executed frontend linting successfully with 0 compilation errors.

### Completion Notes List

- Established progress-based scoring mechanism where skill tree updates are computed dynamically after any interview submission.
- Formed adjacent node unlocking path algorithm based on DB-defined relations (links).
- Successfully deployed instant client-cache updates via WebSocket event listeners, achieving zero page reloads.

### File List

- `backend/src/socket.js`
- `backend/src/services/skillTreeService.js`
- `backend/src/services/voiceSessionService.js`
- `backend/src/services/hrInterviewService.js`
- `frontend/src/context/SocketContext.jsx`
