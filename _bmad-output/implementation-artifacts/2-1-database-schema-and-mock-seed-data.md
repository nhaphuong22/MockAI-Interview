---
baseline_commit: 4b8b9a8c758a32556c0a72e175683bb3ce3fc6f2
---

# Story 2.1: Database Schema and Mock/Seed Data

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want to create database schemas for caching candidates' skill tree states and seed mock JSON data,
so that I can develop and test the graph UI independently.

## Acceptance Criteria (Tiêu chí Chấp nhận)

1. **Tạo tệp migration mới:** Tạo tệp migration Knex mới trong `backend/migrations/` sử dụng định dạng ES Modules (`export async function up` / `export async function down`).
2. **Định nghĩa bảng `user_skill_trees`:**
   - `id`: Khoá chính integer serial tự tăng (increments).
   - `user_id`: Integer, tham chiếu tới bảng `users.id` với `onDelete('CASCADE')`. Ràng buộc `unique` để đảm bảo mỗi người dùng chỉ có tối đa một sơ đồ cây kỹ năng được lưu trữ. Không được null.
   - `graph_data`: Kiểu dữ liệu `JSONB` để lưu trữ cấu trúc JSON của cây kỹ năng. Không được null.
   - `last_updated`: Timestamp có múi giờ, mặc định là `knex.fn.now()`.
   - `timestamps(true, true)`: Tạo 2 cột `created_at` và `updated_at`.
3. **Định nghĩa chỉ mục (Indexes):**
   - Tạo chỉ mục trên cột `user_id` của bảng `user_skill_trees` để tăng tốc độ truy vấn trạng thái skill tree của candidate.
4. **Tạo tệp seed data mới:** Tạo tệp seed mới trong `backend/seeds/07_sample_user_skill_trees.js` để seed dữ liệu thử nghiệm.
5. **Seed dữ liệu mẫu (Mock/Seed Data):**
   - Seed dữ liệu cho ít nhất 1 candidate (ví dụ: `user_id: 2` đại diện cho "Ứng viên Thử nghiệm" đã được định nghĩa trong `01_init_sample_users.js`).
   - Dữ liệu `graph_data` phải là một đối tượng JSON hợp lệ mô tả cây kỹ năng (Skill Tree / Knowledge Graph) với ít nhất 10 skills được liên kết với nhau.
   - Cấu trúc JSON của skill tree phải rõ ràng, bao gồm:
     - `nodes`: Danh sách các node kỹ năng, mỗi node gồm: `id`, `label`, `score` (0-100), `status` ('unlocked' hoặc 'locked'), `category` (ví dụ: 'Frontend', 'Backend'), `x` và `y` (tọa độ hiển thị 2D để hỗ trợ UI Canvas/SVG).
     - `links`: Mối quan hệ phụ thuộc giữa các node (ví dụ: HTML5 -> CSS3, JavaScript -> ReactJS) dạng source-target.
   - Seed data cần mô tả tối thiểu 10 linked skills cho Frontend Track và 10 linked skills cho Backend Track, có sự kết hợp đa dạng giữa các skill đã mở khoá (unlocked - kèm điểm số thật) và các skill còn khoá (locked - score: 0).
6. **Kiểm tra rollback:**
   - Hàm `down` trong migration phải drop bảng `user_skill_trees` nếu tồn tại.

## Tasks / Subtasks (Nhiệm vụ chi tiết)

- [x] Tạo file migration Knex trong `backend`
  - [x] Chạy lệnh tạo migration: `pnpm --filter backend knex migrate:make create_user_skill_trees`
- [x] Thực hiện phương thức `up` trong file migration
  - [x] Định nghĩa cấu trúc bảng `user_skill_trees` (các cột `id`, `user_id`, `graph_data`, `last_updated` và timestamps).
  - [x] Cấu hình ràng buộc khoá ngoại liên kết tới `users.id` với hành động `CASCADE` khi xoá.
  - [x] Thêm ràng buộc duy nhất (`unique`) trên trường `user_id`.
  - [x] Thiết lập index trên trường `user_id`.
- [x] Thực hiện phương thức `down` trong file migration
  - [x] Drop bảng `user_skill_trees` nếu tồn tại.
- [x] Tạo file seed Knex mới `backend/seeds/07_sample_user_skill_trees.js`
  - [x] Thiết lập logic import và export hàm `seed(knex)`.
  - [x] Xoá sạch bảng `user_skill_trees` trước khi seed để tránh trùng lặp dữ liệu (`await knex('user_skill_trees').del()`).
  - [x] Chuẩn bị dữ liệu JSONB cây kỹ năng mẫu gồm ít nhất 10 nodes và các links/edges phụ thuộc tương ứng.
  - [x] Chèn dữ liệu mẫu vào bảng `user_skill_trees` cho các người dùng phù hợp (ví dụ: `user_id: 2` cho Frontend, `user_id: 3` cho Backend, v.v.).
- [x] Xác minh chạy migration và seed thành công
  - [x] Chạy lệnh `pnpm run migrate` tại root workspace để áp dụng migration mới.
  - [x] Chạy lệnh `pnpm run seed` để nạp seed data.
  - [x] Chạy lệnh `pnpm run migrate:rollback` để đảm bảo khôi phục lại DB an toàn.
  - [x] Chạy lại `pnpm run migrate` và `pnpm run seed` để phục hồi dữ liệu DB thử nghiệm sạch.

## Dev Notes (Ghi chú phát triển)

- **Language & Standards:** Sử dụng Javascript ES Modules (`import`/`export`) cho cả migration và seed (đồng bộ với codebase backend hiện tại).
- **JSON Data structure:** Đảm bảo cấu trúc JSON trong trường `graph_data` phải khớp với chuẩn API mà Frontend sẽ sử dụng trong các story sau (Story 2.2, 2.3, 2.4). Nên sử dụng cấu trúc `nodes` và `links` chuẩn định dạng của các thư viện trực quan hoá (như D3, React Flow, Three.js).
- **Tránh trùng lặp / Lỗi DB:** Đảm bảo xoá dữ liệu trong bảng `user_skill_trees` trước khi thực hiện chèn dữ liệu mẫu trong file seed.

### Project Structure Notes (Cấu trúc dự án)

- Các file migration phải được đặt trong thư mục `backend/migrations/`.
- Các file seed phải được đặt trong thư mục `backend/seeds/`.

### References (Tài liệu tham khảo)

- Cấu trúc các bảng hiện có: [DATABASE_SCHEMA.md](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/DATABASE_SCHEMA.md) và [DATABASE_EXPLANATION.md](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/DATABASE_EXPLANATION.md)
- Knex config: [knexfile.js](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/backend/knexfile.js)

## Dev Agent Record

### Agent Model Used

Gemini 3.5 Flash

### Debug Log References

- Migration file created at: `backend/migrations/20260628155512_create_user_skill_trees.js`
- Seed file created at: `backend/seeds/07_sample_user_skill_trees.js`
- Command `pnpm run migrate` executed successfully: `Batch 2 run: 1 migrations`, and `Ran 6 seed files`.
- Command `pnpm run migrate:rollback` executed successfully: `Batch 2 rolled back: 39 migrations` (all tables successfully dropped).
- Re-run `pnpm run migrate` succeeded, returning DB to fully seeded state.

### Completion Notes List

- Implemented database migrations with proper primary/foreign keys, uniqueness on `user_id`, JSONB data structure, and indexes.
- Created a seed file containing mock Frontend and Backend skill trees (with 10 nodes each) with varying scores and locked/unlocked statuses.
- Verified Knex up and down commands run completely error-free.

### File List

- `backend/migrations/20260628155512_create_user_skill_trees.js`
- `backend/seeds/07_sample_user_skill_trees.js`
