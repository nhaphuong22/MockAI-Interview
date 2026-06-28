---
baseline_commit: 4b8b9a8c758a32556c0a72e175683bb3ce3fc6f2
---

# Story 2.3: Interactive 3D/SVG Skill Graph Visualization

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want to see my skill tree as an interactive visual graph with locked/unlocked nodes,
so that I can easily browse my skill development.

## Acceptance Criteria (Tiêu chí Chấp nhận)

1. **Xây dựng API Endpoint ở Backend:**
   - Tạo endpoint `GET /api/skill-tree` để lấy sơ đồ cây kỹ năng của người dùng đang đăng nhập.
   - Route được bảo vệ bởi middleware `authenticateToken`.
   - Nếu chưa có cây kỹ năng, trả về `data: null` với status `200` (để tránh báo lỗi crash ở frontend và cho phép frontend hiển thị thông báo "Hãy upload CV để kích hoạt cây kỹ năng").
   - Trả về dữ liệu graph đã được parse JSON đầy đủ (đối tượng `graph_data` có các thuộc tính `track`, `nodes`, `links`).
2. **Thêm tab Cây Kỹ Năng ở Frontend:**
   - Trong trang [Profile.jsx](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/frontend/src/pages/candidate/Profile.jsx), thêm tab thứ 3 tên là "Cây Kỹ Năng" (`value="skill-tree"`).
3. **Vẽ đồ thị tương tác bằng SVG:**
   - Tạo component `SkillTreeGraph.jsx` để vẽ đồ thị dựa trên cấu trúc `nodes` và `links` lấy được từ API.
   - Vẽ bằng SVG để đảm bảo hiệu năng tối ưu (không bị giật lag, không gây layout shift theo NFR3).
   - Thiết kế visual premium (chuẩn **Ocean Blue**):
     - **Node đã mở khóa (Unlocked):** Sử dụng gradient màu xanh dương (`#0ea5e9` đến `#38bdf8`) và hiệu ứng đổ bóng/glow sáng.
     - **Node bị khóa (Locked):** Hiển thị bằng màu xám xỉn (grayscale) để người dùng dễ phân biệt.
     - **Đường liên kết (Links):**
       - Nếu node đích đã được mở khóa, vẽ đường nối liền màu xanh dương nhạt.
       - Nếu node đích bị khóa, vẽ đường nét đứt (dashed line) màu xám.
4. **Tương tác và Phản hồi (Responsive & Interactive):**
   - Đồ thị phải tự động co giãn (responsive) vừa vặn với kích thước khung chứa trên cả Mobile và Desktop.
   - Thêm hiệu ứng hover (phóng to nhẹ, đổi màu viền) và trỏ chuột dạng pointer khi người dùng di chuột qua các node.
   - Cho phép người dùng click chọn node (đánh dấu node bằng viền nổi bật).

## Tasks / Subtasks (Nhiệm vụ chi tiết)

- [x] Phát triển API Backend cho Skill Tree
  - [x] Tạo controller `backend/src/controllers/skillTreeController.js` chứa hàm `getSkillTree`.
  - [x] Tạo route `backend/src/routes/skillTreeRoutes.js` đăng ký route `GET /` sử dụng `authenticateToken`.
  - [x] Đăng ký route mới vào file index `backend/src/routes/index.js`.
- [x] Thiết kế Component Đồ thị `SkillTreeGraph.jsx`
  - [x] Tạo file component `frontend/src/pages/candidate/components/SkillTreeGraph.jsx`.
  - [x] Sử dụng TanStack Query (`useQuery`) để fetch dữ liệu từ endpoint `/api/skill-tree`.
  - [x] Triển khai khung vẽ SVG (`<svg viewBox="0 0 800 450" ...>`) có tính năng responsive.
  - [x] Định nghĩa các thẻ `<defs>` chứa linearGradient của Ocean Blue (`#0ea5e9` to `#38bdf8`) và filter glow phát sáng.
  - [x] Render các đường nối `<line>` từ dữ liệu `links` (tính toán tọa độ x, y của node nguồn và đích tương ứng). Cấu hình style dashed/solid dựa trên trạng thái unlock.
  - [x] Render các node `<g>` từ `nodes`. Mỗi node gồm `<circle>` (bán kính khoảng 22-25px, click handler) và `<text>` hiển thị label kỹ năng bên dưới.
  - [x] Tích hợp CSS animations/transitions cho hover effect trên các node.
- [x] Tích hợp vào trang Profile của Candidate
  - [x] Mở file [Profile.jsx](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/frontend/src/pages/candidate/Profile.jsx).
  - [x] Thêm Tab Trigger "Cây Kỹ Năng" và Tab Content tương ứng.
  - [x] Import và render `<SkillTreeGraph />` vào trong Tab Content mới.
- [x] Kiểm thử và xác minh giao diện
  - [x] Truy cập trang Profile ở Frontend khi đã đăng nhập (sử dụng tài khoản `user@mockai.com`).
  - [x] Kiểm tra đồ thị hiển thị mượt mà, đầy đủ 10 nodes của Frontend Track.
  - [x] Di chuột qua các node để kiểm tra hiệu ứng hover và click để chọn node.

## Dev Notes (Ghi chú phát triển)

- **Responsive SVG:** Sử dụng thuộc tính `viewBox="0 0 800 450"` và `width="100%" height="100%"` giúp SVG tự động co giãn theo container mà không bị vỡ hình.
- **Ocean Blue Palette:** Luôn tuân thủ màu chủ đạo của dự án.
  - Màu nền node unlock: `url(#oceanGradient)` với `#0ea5e9` và `#38bdf8`.
  - Node khóa: `#475569` (Dark mode) hoặc `#94a3b8` (Light mode).

### Project Structure Notes (Cấu trúc dự án)

- Backend:
  - `backend/src/controllers/skillTreeController.js`
  - `backend/src/routes/skillTreeRoutes.js`
- Frontend:
  - `frontend/src/pages/candidate/components/SkillTreeGraph.jsx`

### References (Tài liệu tham khảo)

- Story 2.1 (Migration & Seeds): [2-1-database-schema-and-mock-seed-data.md](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/_bmad-output/implementation-artifacts/2-1-database-schema-and-mock-seed-data.md)
- Quản lý state API ở frontend: sử dụng Axios Client [axiosClient.js](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/frontend/src/api/axiosClient.js)

## Dev Agent Record

### Agent Model Used

Gemini 3.5 Flash

### Debug Log References

- Created `backend/src/controllers/skillTreeController.js` and `backend/src/routes/skillTreeRoutes.js` and registered them in `backend/src/routes/index.js`.
- Created API endpoint `/api/skill-tree` to safely retrieve graph data, parsing the JSON string to Object as needed.
- Created `frontend/src/api/skillTreeApi.js` to call the endpoint.
- Created `frontend/src/pages/candidate/components/SkillTreeGraph.jsx` implementing responsive SVG layout, Ocean Blue gradients (`#0ea5e9` to `#38bdf8`), drop-shadow filters, selection rings, and practice redirect CTAs.
- Modified `frontend/src/pages/candidate/Profile.jsx` to render the SVG graph component within a new Radix tab "Cây Kỹ Năng RPG".
- Executed frontend linting via `pnpm -C frontend run lint` resulting in 0 errors. Fixed a minor warning for unused React import in `SkillTreeGraph.jsx`.

### Completion Notes List

- Created backend API to securely retrieve user-specific skill trees with fallback on null trees.
- Crafted a responsive and beautifully animated SVG graph matching the Ocean Blue theme palette.
- Fully integrated tab navigations in candidate Profile page and tested for linting cleanliness.

### File List

- `backend/src/controllers/skillTreeController.js`
- `backend/src/routes/skillTreeRoutes.js`
- `backend/src/routes/index.js`
- `frontend/src/api/skillTreeApi.js`
- `frontend/src/pages/candidate/components/SkillTreeGraph.jsx`
- `frontend/src/pages/candidate/Profile.jsx`
