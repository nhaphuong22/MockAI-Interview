# ERRORS.md - Nhật Ký Lỗi & Khắc Phục

Dưới đây là danh sách các lỗi được phát hiện và xử lý trong quá trình phát triển dự án MockAI-Interview.

## [2026-06-08 00:05] - Lỗi 401 Unauthorized khi xem báo cáo PDF trên Cloudinary

- **Type**: Integration
- **Severity**: High
- **File**: `backend/src/controllers/cvController.js:15`, `backend/src/controllers/applicationController.js:18`
- **Agent**: NhaPhuong
- **Root Cause**: Sử dụng cấu hình `resource_type: 'raw'` khi upload tệp PDF lên Cloudinary khiến các liên kết tải về bị Cloudinary cấu hình bảo mật chặn truy cập công khai, dẫn đến lỗi HTTP 401.
- **Error Message**: 
  ```
  HTTP ERROR 401 (Trang này hiện không hoạt động) khi truy cập URL dạng:
  https://res.cloudinary.com/drbfpvper/raw/upload/v1780851538/reports/1/78085153931-Report-Ph__ng_I__Nh__de190574_.pdf
  ```
- **Fix Applied**: Thay đổi cấu hình `resource_type` từ `'raw'` sang `'image'`. Đối với định dạng PDF, Cloudinary hỗ trợ lưu và hiển thị trực tiếp dưới dạng ảnh nhiều trang cho phép truy cập công khai an toàn.
- **Prevention**: Luôn sử dụng `resource_type: 'image'` cho các tệp PDF cần chia sẻ công khai qua Cloudinary để tránh các cơ chế bảo mật nghiêm ngặt của định dạng raw.
- **Status**: Fixed

---

## [2026-06-08 00:05] - Lỗi "Không có bản xem trước nào" khi xem CV gốc của ứng viên trên HR Dashboard

- **Type**: Integration
- **Severity**: Major
- **File**: `frontend/src/pages/recruiter/HRDashboard.jsx:456`
- **Agent**: NhaPhuong
- **Root Cause**: Sử dụng dịch vụ bên thứ ba Google Docs Viewer (`docs.google.com/gview`) để xem trước CV. Dịch vụ này không thể tải tệp tin chạy từ môi trường phát triển cục bộ (`localhost:5000`) hoặc khi file Cloudinary bị lỗi 401.
- **Error Message**: 
  ```
  "Không có bản xem trước nào" hiển thị trong khung iframe xem CV gốc trên HR Dashboard.
  ```
- **Fix Applied**: Thay đổi cách nhúng từ Google Docs Viewer sang nạp trực tiếp đường dẫn file PDF vào thuộc tính `src` của `iframe` và thuộc tính `href` của nút xem toàn màn hình. Trình duyệt hiện đại của người dùng sẽ tự động gọi trình xem PDF nội tại để render file PDF nhanh chóng và hỗ trợ tốt cả localhost lẫn production.
- **Prevention**: Tránh sử dụng các dịch vụ bên thứ ba trực tuyến để render các tài nguyên cục bộ từ localhost. Hãy tận dụng trình xem PDF tích hợp sẵn của trình duyệt.
- **Status**: Fixed

---

## [2026-06-08 00:07] - Lỗi 401 (deny or ACL failure) khi Nodemailer tải tệp đính kèm và Broadcast log hiển thị undefined

- **Type**: Integration / Logic
- **Severity**: Medium
- **File**: `backend/src/services/emailService.js:269`, `backend/src/socket.js:90`
- **Agent**: NhaPhuong
- **Root Cause**:
  1. Cloudinary mặc định chặn tải trực tiếp định dạng `.pdf` (kể cả khi upload bằng `resource_type: 'image'` hoặc `'raw'`) đối với một số tài khoản mới/miễn phí vì lý do bảo mật. Khi Nodemailer tải tệp đính kèm qua tham số `path: pdfReportUrl`, Cloudinary trả về mã lỗi HTTP 401 (`deny or ACL failure`), gây gián đoạn việc gửi email xác nhận.
  2. Trong `socket.js`, hàm log in ra `application.candidate_name` nhưng dữ liệu nhận được từ controller chỉ truyền khoá `name`, khiến log hiển thị `undefined`.
- **Error Message**:
  ```
  [0] [Socket] Broadcast ứng tuyển mới tới toàn bộ HR: undefined
  ...
  [0] ========== [EmailService] ERROR — Gửi email thất bại ==========
  [0] Chi tiết lỗi: Invalid status code 401
  ```
- **Fix Applied**:
  1. Cải tiến hàm `sendApplicationReportEmail` hỗ trợ tham số `pdfBuffer` (Buffer lưu cục bộ báo cáo PDF vừa sinh ra). Khi có Buffer, Nodemailer sẽ đính kèm trực tiếp thông qua thuộc tính `content` thay vì gửi HTTP request tải từ Cloudinary qua `path`, loại bỏ hoàn toàn lỗi 401 do ACL.
  2. Sửa lại dòng log ở `socket.js` để kiểm tra cả `application.name` hoặc `application.candidate_name`.
- **Prevention**: Khi gửi email có đính kèm tệp được sinh ra trong bộ nhớ (In-memory buffers như PDF, hình ảnh), hãy ưu tiên đính kèm trực tiếp Buffer qua thuộc tính `content` của Nodemailer thay vì tải lại từ URL bên ngoài để tiết kiệm băng thông và tránh lỗi phân quyền ACL.
- **Status**: Fixed

---
