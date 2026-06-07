# Phase 1: Luồng Ứng Tuyển & AI Chấm Điểm ATS (Apply Job & ATS Evaluation) - Research

**Analysis Date:** 2026-06-07

## Technical Approach & Libraries

### 1. CV PDF Parsing (Backend)
- **Library**: `pdf-parse` v1.1.1.
- **Usage**: Trích xuất text thô từ tệp PDF tải lên qua multipart form-data.
- **Code Pattern**:
  ```javascript
  import pdf from 'pdf-parse';
  import fs from 'fs';

  const dataBuffer = fs.readFileSync(localFilePath);
  const parsedData = await pdf(dataBuffer);
  const cvText = parsedData.text; // Text thô của CV
  ```
- **Error Handling**: Nếu tệp tải lên không phải PDF hoặc file scan không trích xuất được văn bản (chữ rỗng hoặc < 50 ký tự), API trả về lỗi 400 Bad Request kèm thông báo chi tiết.

### 2. PDF Report Generation (Backend)
- **Library**: `pdfkit` v0.18.0.
- **Usage**: Tạo tệp PDF báo cáo đánh giá tự động dựa trên kết quả chấm điểm của AI.
- **Styling Guide**:
  - Tông màu chủ đạo: Ocean Blue (`#0ea5e9` và `#38bdf8`), chữ đen/xám tối.
  - Sử dụng Font chữ hỗ trợ tốt tiếng Việt Unicode (như DejaVuSans.ttf hoặc Roboto-Regular.ttf tích hợp sẵn).
  - Thể hiện điểm ATS nổi bật dưới dạng hộp đồ họa bo góc tô nền xanh nhạt, chữ xanh đậm.
  - Phân chia các đề mục: Điểm mạnh, Điểm yếu, Khuyến nghị cải thiện của AI rõ ràng bằng các biểu tượng hoặc đường kẻ ngang trang nhã.

### 3. Cloudinary Raw Upload (Backend)
- **Library**: `cloudinary` v2.10.0.
- **Usage**: Upload file PDF báo cáo sinh ra từ pdfkit lên mây dưới dạng `raw` resource để nhận được liên kết tải về trực tiếp.
- **Code Pattern**:
  ```javascript
  import { v2 as cloudinary } from 'cloudinary';

  const uploadPdfToCloudinary = (pdfBuffer, fileName) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'cv-evaluations',
          public_id: fileName,
          format: 'pdf'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );
      uploadStream.end(pdfBuffer);
    });
  };
  ```

### 4. Custom Toast Component using Framer Motion (Frontend)
- **Library**: `framer-motion` v12.38.0.
- **Design System**:
  - Nút đóng, viền và thanh đếm ngược tự động chạy trong 4s có màu Ocean Blue (`#0ea5e9`).
  - Giao diện Glassmorphism: `backdrop-blur-md bg-white/70 border border-white/20 shadow-xl`.
  - z-index cố định `z-[9999]`.
- **Zustand Toast Store**:
  - Quản lý danh sách toast active: `addToast(message, type)`, `removeToast(id)`.
  - Component `ToastContainer` ở root ứng dụng lắng nghe store để render danh sách toast có hiệu ứng `AnimatePresence`.

## Reusable Code & Existing Patterns

### 1. Backend Route & Controllers
- Sử dụng mô hình controller hiện có như `backend/src/controllers/authController.js` và route `backend/src/routes/authRoutes.js`.
- Bọc mọi API nhạy cảm bằng `authenticateToken` từ `backend/src/middlewares/authMiddleware.js`.
- Trả response đồng bộ bằng helper `sendResponse` và `sendError` trong `backend/src/ultils/responseHelper.js`.

### 2. Frontend API & Stores
- Gọi API qua `axiosClient.js` nằm trong `frontend/src/api/`. Tệp này tự động gắn JWT Token từ `localStorage` và xử lý hết hạn phiên đăng nhập.
- Dùng `useAuthStore` để xác định trạng thái đăng nhập (`isAuthenticated`).

## Integration & Data Flow

### 1. Luồng ứng tuyển & chấm điểm CV (ATS Entry Point)
```
[Client] -> Tải lên CV (PDF) & Cover Letter
   │ (POST /api/applications/apply/:jobId)
   ▼
[Express Server] -> Nhận file bằng Multer
   │
   ├─> Parse PDF bằng pdf-parse -> Text thô
   ├─> Gọi evaluateCV(cvText, jobJD) -> Điểm & Nhận xét
   ├─> Sinh PDF báo cáo bằng pdfkit -> Buffer
   ├─> Upload Buffer lên Cloudinary -> Nhận URL PDF
   ├─> Ghi record vào bảng `cvs` và `applications` (lưu URL PDF)
   ├─> Gửi email thông báo (Nodemailer) đính kèm file PDF
   ├─> Gửi Socket.io realtime event (new_application) thông báo cho HR
   ▼
[Client] <- Phản hồi JSON (Lưu vào React Query Cache, chuyển về trang cá nhân xem kết quả)
```

### 2. Luồng bảo vệ Auth Gate & Toast
```
[User click protected link/action]
   │
   ├─> Kiểm tra authState trong Zustand useAuthStore.js
   │     ├─> Nếu isAuthenticated = true: Cho phép tiếp tục navigation/action.
   │     └─> Nếu isAuthenticated = false:
   │           ├─> Chặn hành động (preventDefault)
   │           ├─> Gọi addToast("Yêu cầu đăng nhập để dùng được tính năng này", "warning")
   │           └─> (KHÔNG mở Auth Modal)
   ▼
[Custom Toast Component] -> Render ở góc màn hình, chạy animation 4s biến mất
```

---

*Phase 1 technical research: 2026-06-07*
