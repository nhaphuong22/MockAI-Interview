---
trigger: glob
glob: "**/*.{py,js,ts,go,rs,sql,php,java,dockerfile,tf,yaml,yml}"
---

# BACKEND.MD - Systems & Logic Standards

> **Mục tiêu**: Một bộ luật duy nhất quản lý toàn bộ Logic, Dữ liệu và Hạ tầng. Hiệu suất cao - Không chồng chéo.

---

## 🏗️ 1. ARCHITECTURE & TECH STACK (Node.js + Express)

1. **Tech Stack**: Bắt buộc sử dụng Node.js và Express.js.
2. **Architecture**: Đảm bảo tuân thủ nghiêm ngặt mô hình **MVC (Model - View - Controller)**. Đối với API, cấu trúc sẽ là **Router -> Controller -> Service -> Model (Repository)**. Không viết logic lộn xộn trong file route.
3. **Directory Structure**: Bắt buộc tuân thủ cấu trúc thư mục sau:
   - `backend/server.js`: Entry point của ứng dụng.
   - `backend/src/app.js`: Cấu hình Express, Middlewares và Routes.
   - `backend/src/auth/`: Xử lý xác thực (JWT, Login, Register).
   - `backend/src/config/`: Lưu trữ file cấu hình (DB, Env, API keys).
   - `backend/src/controllers/`: Tiếp nhận request và điều hướng logic.
   - `backend/src/core/`: Xử lý logic cốt lõi, AI engine, Global Middleware.
   - `backend/src/data/`: Chứa dữ liệu tĩnh, constants.
   - `backend/src/db/`: Khởi tạo và quản lý kết nối database.
   - `backend/src/helper/`: Các hàm tiện ích hỗ trợ nhỏ.
   - `backend/src/models/`: Định nghĩa Database Models/Schemas (Knex).
   - `backend/src/routes/`: Định nghĩa các API endpoints.
   - `backend/src/services/`: Chứa logic nghiệp vụ xử lý chính (Business logic).
   - `backend/src/ultils/`: Các công cụ tiện ích dùng chung hệ thống.
4. **API Standards**:
   - RESTful: `GET /resources`, `POST /resources`.
   - Response: `{ success: true, data: any, error: null }`.
5. **AI Integration**: Quản lý tốt các integration với mô hình AI (`whisper-node`, `node-llama-cpp`) và tối ưu performance.

---

## 🗄️ 2. DATABASE MASTERY (PostgreSQL + Knex)

1. **Database**: Sử dụng PostgreSQL.
2. **Migration**: Bắt buộc dùng Knex.js để quản lý Migration. Không sửa cấu trúc bảng trực tiếp ở Production.
3. **Schema Design**:
   - Tuân thủ 3NF (Chuẩn hóa cấp 3).
   - `snake_case` cho tên bảng/cột.
   - Luôn có `created_at`, `updated_at`.
4. **Performance**: Bắt buộc Index cho khóa ngoại (FK) và cột search.

---

## ☁️ 3. DEVOPS & INFRASTRUCTURE

1. **Port & Config**: 12-Factor App. Cổng server (`PORT`), kết nối Database (`DATABASE_URL`) và các cổng dịch vụ phải lấy 100% từ Environment Variables (`.env`).
2. **Docker**: Đa tầng (Multi-stage build). Tầng cuối chỉ chứa binary/artifact. Sử dụng `${VAR}` trong docker-compose.
3. **CI/CD**: Pipeline không được pass nếu Unit Test fail.

---

## 🛡️ 4. ERROR HANDLING

1. **Structured Logging**: Log phải parse được (JSON). KHÔNG dùng `print`/`console.log`.
2. **Graceful Failure**: DB chết thì API trả về 503, không được treo request.
