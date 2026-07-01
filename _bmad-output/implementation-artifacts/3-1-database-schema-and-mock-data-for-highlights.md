---
baseline_commit: 0f03175ff859c36c1e1a47a75eca6412cb58f5ca
---

# Story 3.1: Database Schema and Mock Data for Highlights

Status: done

## Story

As a developer,
I want to create database schemas for storing interview highlight summaries and seed mock data,
So that I can develop the HR Highlights dashboard independently.

## Acceptance Criteria (Tiêu chí Chấp nhận)

1. **Tạo tệp migration mới:** Tạo tệp migration Knex mới trong `backend/migrations/` sử dụng định dạng ES Modules (`export async function up` / `export async function down`).
2. **Định nghĩa bảng `interview_highlights`:**
   - `id`: Khoá chính integer serial tự tăng (increments).
   - `interview_id`: Integer, tham chiếu tới bảng `interviews.id` với `onDelete('CASCADE')`. Ràng buộc `unique` để đảm bảo mỗi buổi phỏng vấn chỉ có tối đa một bản tóm tắt highlight. Không được null.
   - `highlight_summary`: Kiểu dữ liệu `TEXT` để lưu trữ tóm tắt dài khoảng 1 phút do AI tạo ra. Không được null.
   - `is_flagged`: Kiểu dữ liệu `BOOLEAN`, mặc định là `false`. Dùng để đánh dấu các buổi phỏng vấn có vi phạm/gian lận hoặc cần HR lưu ý đặc biệt.
   - `timestamps_data`: Kiểu dữ liệu `JSONB` để lưu trữ thông tin chi tiết về các khoảnh khắc nổi bật (timestamps). Không được null.
   - `timestamps(true, true)`: Tạo 2 cột `created_at` và `updated_at`.
3. **Định nghĩa chỉ mục (Indexes):**
   - Tạo chỉ mục trên cột `interview_id` của bảng `interview_highlights` để tăng tốc độ tìm kiếm và tối ưu hoá hiệu năng cho HR dashboard.
4. **Tạo tệp seed data mới:** Tạo tệp seed mới trong `backend/seeds/08_sample_interview_highlights.js` để seed dữ liệu thử nghiệm.
5. **Seed dữ liệu mẫu (Mock/Seed Data):**
   - Xoá bảng `interview_highlights` trước khi seed để tránh lỗi trùng lặp dữ liệu (`await knex('interview_highlights').del()`).
   - Seed dữ liệu mẫu cho `interview_id: 1` (được định nghĩa trong `05_sample_interviews.js`):
     - `highlight_summary`: "Ứng viên có phong thái trả lời tự tin, kỹ năng chuyên môn React tốt. Có một số giây ngập ngừng nhẹ ở câu hỏi thứ 2 nhưng nhanh chóng lấy lại bình tĩnh. Tổng thể thể hiện xuất sắc, giao tiếp trôi chảy và mạch lạc."
     - `is_flagged`: `false`
     - `timestamps_data`: Phải là một mảng JSON chứa các mốc thời gian nổi bật:
       - Mốc 1: `timestamp: 15` (giây), `label: "Trả lời xuất sắc về tối ưu hóa React.useMemo và useCallback"`, `duration: 30` (giây), `type: "STRENGTH"`
       - Mốc 2: `timestamp: 45` (giây), `label: "Khoảnh khắc ngập ngừng khi giải thích về useEffect clean-up function"`, `duration: 15` (giây), `type: "HESITATION"`
       - Mốc 3: `timestamp: 120` (giây), `label: "Thể hiện tư duy thiết kế component tốt và hiểu sâu về State Management"`, `duration: 30` (giây), `type: "STRENGTH"`
   - Seed dữ liệu mẫu cho trường hợp bị gắn cờ gian lận (`is_flagged: true`):
     - Tạo thêm một interview mẫu `id: 2` (có `status: 'SUSPENDED'`) liên kết với một user và cv hợp lệ.
     - Seed highlight cho `interview_id: 2` với `is_flagged: true`, `highlight_summary` ghi rõ lý do cảnh báo gian lận (ví dụ: chuyển tab 6 lần, phát hiện nghi vấn gian lận thi cử).
     - `timestamps_data` cho `interview_id: 2` chứa các mốc vi phạm:
       - Mốc 1: `timestamp: 30` (giây), `label: "Phát hiện chuyển tab trình duyệt lần 1 (Cảnh báo)"`, `duration: 10` (giây), `type: "VIOLATION"`
       - Mốc 2: `timestamp: 75` (giây), `label: "Ứng viên rời mắt khỏi màn hình quá lâu (Gaze Violation)"`, `duration: 15` (giây), `type: "VIOLATION"`
       - Mốc 3: `timestamp: 110` (giây), `label: "Ứng viên liên tục chuyển tab trình duyệt nhiều lần (Hủy tư cách)"`, `duration: 30` (giây), `type: "VIOLATION"`
6. **Kiểm tra rollback:**
   - Hàm `down` trong migration phải drop bảng `interview_highlights` nếu tồn tại.

## Tasks / Subtasks (Nhiệm vụ chi tiết)

- [x] Tạo file migration Knex trong `backend`
  - [x] Chạy lệnh tạo migration: `pnpm --filter backend knex migrate:make create_interview_highlights` (npx knex CLI trong `backend`)
- [x] Thực hiện phương thức `up` trong file migration
  - [x] Định nghĩa cấu trúc bảng `interview_highlights` (các cột `id`, `interview_id`, `highlight_summary`, `is_flagged`, `timestamps_data` và timestamps).
  - [x] Cấu hình ràng buộc khoá ngoại liên kết tới `interviews.id` với hành động `CASCADE` khi xoá.
  - [x] Thêm ràng buộc duy nhất (`unique`) trên trường `interview_id`.
  - [x] Thiết lập index trên trường `interview_id`.
- [x] Thực hiện phương thức `down` trong file migration
  - [x] Drop bảng `interview_highlights` nếu tồn tại.
- [x] Tạo file seed Knex mới `backend/seeds/08_sample_interview_highlights.js`
  - [x] Thiết lập logic import và export hàm `seed(knex)`.
  - [x] Xoá sạch bảng `interview_highlights` trước khi seed để tránh trùng lặp dữ liệu (`await knex('interview_highlights').del()`).
  - [x] Đảm bảo có sẵn các bản ghi `interviews` tham chiếu phù hợp (bao gồm `id: 1` và tạo thêm `id: 2` có `status: 'SUSPENDED'` liên kết với `job_id: 3` để tránh lỗi unique constraint của bảng `applications`).
  - [x] Chèn dữ liệu mẫu vào bảng `interview_highlights` cho `interview_id: 1` (bình thường) và `interview_id: 2` (bị gắn cờ vi phạm).
- [x] Xác minh chạy migration và seed thành công
  - [x] Chạy lệnh `pnpm run migrate` tại root workspace để áp dụng migration mới.
  - [x] Chạy lệnh `pnpm run seed` để nạp seed data.
  - [x] Chạy lệnh `pnpm run migrate:rollback` để đảm bảo khôi phục lại DB an toàn.
  - [x] Chạy lại `pnpm run migrate` và `pnpm run seed` để khôi phục trạng thái DB sạch.

### Review Findings

- [x] [Review][Patch] Dư thừa index trên trường unique `interview_id` [backend/migrations/20260629043114_create_interview_highlights.js:19]
- [x] [Review][Patch] Nguy cơ vi phạm khóa ngoại khi chạy lại seed [backend/seeds/08_sample_interview_highlights.js:11]
- [x] [Review][Defer] Nguy cơ lỗi reset sequence khi bảng rỗng [backend/seeds/08_sample_interview_highlights.js:109] — deferred, pre-existing

## Dev Notes (Ghi chú phát triển)

- **Language & Standards:** Sử dụng Javascript ES Modules (`import`/`export`) cho cả migration và seed (đồng bộ với codebase backend hiện tại).
- **JSONB format:** Trường `timestamps_data` dùng kiểu JSONB giúp lưu trữ linh hoạt danh sách các mốc thời gian nổi bật và tối ưu hiệu suất truy vấn trong PostgreSQL.
- **Tránh vi phạm khoá ngoại (Foreign Key Constraints) & Unique Constraints:** Đảm bảo thứ tự xoá dữ liệu và chèn dữ liệu hợp lý. Tránh chèn dữ liệu trùng lặp cặp `(candidate_id, job_id)` trong bảng `applications`.

### Project Structure Notes (Cấu trúc dự án)

- Các file migration phải được đặt trong thư mục `backend/migrations/`.
- Các file seed phải được đặt trong thư mục `backend/seeds/`.

### References (Tài liệu tham khảo)

- Cấu trúc các bảng hiện có: [DATABASE_SCHEMA.md](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/DATABASE_SCHEMA.md)
- Cấu hình Knex: [knexfile.js](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/backend/knexfile.js)

## Dev Agent Record

### Agent Model Used

Gemini 3.5 Flash (High)

### Debug Log References

- Migration file created at: `backend/migrations/20260629043114_create_interview_highlights.js`
- Seed file created at: `backend/seeds/08_sample_interview_highlights.js`
- Command `pnpm run migrate` executed successfully: applied new migration and loaded all 7 seed files.
- Command `pnpm run migrate:rollback` executed successfully: batch 2 rolled back 40 migrations.
- Command `pnpm run migrate` re-run executed successfully: DB returned to fully seeded state.

### Completion Notes List

- Khai báo schema bảng `interview_highlights` và tạo tệp migration chuẩn ES Modules.
- Tạo tệp seed `08_sample_interview_highlights.js` để nạp dữ liệu highlights mẫu cho buổi phỏng vấn bình thường (id: 1) và buổi phỏng vấn gian lận bị đình chỉ (id: 2).
- Khắc phục lỗi vi phạm ràng buộc unique `applications_candidate_id_job_id_unique` trong seed bằng cách liên kết hồ sơ gian lận mẫu thứ 2 sang `job_id: 3` (Kỹ sư năng lượng).
- Xác minh thành công các chu trình migrate, seed, rollback và restore trên môi trường database thực tế.

### File List

- `backend/migrations/20260629043114_create_interview_highlights.js`
- `backend/seeds/08_sample_interview_highlights.js`

## Change Log

### [2026-06-29]
- Khởi tạo migration `create_interview_highlights` và nạp dữ liệu seed cho phân hệ Highlights của HR.
