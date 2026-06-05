# 🤖 MockAI-Interview

MockAI-Interview là nền tảng hỗ trợ việc làm toàn diện (Job Support Platform) tích hợp AI, hỗ trợ tối ưu CV, luyện tập phỏng vấn giọng nói thực tế và nhận đánh giá năng lực chi tiết. Dự án được xây dựng với kiến trúc hiện đại, hiệu năng cao và giao diện Premium nhằm mang lại lộ trình sự nghiệp vững chắc cho người dùng.

## 🚀 Công nghệ sử dụng

- **Frontend:** React 19, Vite, Tailwind CSS, Three.js (3D Hero), Framer Motion, Zustand (State Management), TanStack Query (Server State).
- **Backend:** Node.js, Express, Knex.js (Query Builder), PostgreSQL.
- **Infrastructure:** Docker (PostgreSQL).

## 📋 Yêu cầu hệ thống

- **Node.js**: v18+
- **Docker & Docker Compose**: Để chạy Database nhanh chóng.

## 🛠 Hướng dẫn Setup & Chạy dự án

```bash
npm install -g pnpm
```

### 1. Clone dự án và cài đặt Library

```bash
# Clone dự án (nếu chưa có)
git clone https://github.com/nhaphuong22/MockAI-Interview.git
cd MockAI-Interview

# Cài đặt tất cả dependencies (Root, FE, BE)
npm run install-all
```

### 2. Cấu hình Biến môi trường (Environment Variables)

Hãy copy các file `.env.example` thành `.env` ở 3 vị trí sau:

- Thư mục gốc (`./.env`)
- Thư mục Backend (`./backend/.env`)
- Thư mục Frontend (`./frontend/.env`)

_Lưu ý: Mặc định các file ví dụ đã được cấu hình để chạy được ngay với Docker._

### 3. Khởi chạy Database (Docker)

Mở terminal tại thư mục gốc và chạy:

```bash
docker-compose up -d
```

Lệnh này sẽ khởi tạo một container PostgreSQL trên port `5432`.

### 4. Khởi tạo Database Schema & Dữ liệu mẫu

Dự án đã được gộp lệnh để thực hiện cả Migration (tạo bảng) và Seeding (tạo data mẫu) chỉ với 1 câu lệnh duy nhất tại thư mục gốc:

```bash
npm run migrate
```

Khi có data mới được pull từ main về thì phải cd vào backend trước:

```bash
cd backend
npm run migrate
```

### 5. Chạy dự án (Development Mode)

Chạy đồng thời cả Frontend và Backend:

```bash
npm run dev
```

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **Swagger UI:** http://localhost:5000/api-docs

## 🔑 Tài khoản mẫu (Demo Accounts)

Sau khi chạy lệnh `npm run migrate`, bạn có thể đăng nhập bằng các tài khoản sau:

| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| **Quản trị viên** | `admin@mockai.com` | `123456` |
| **Ứng viên** | `user@mockai.com` | `123456` |
| **Nhà Tuyển Dụng** | `recruiter@mockai.com` | `123456` |

### 💳 Thẻ thanh toán thử nghiệm (Test Card)

| Ngân hàng | Số thẻ | Tên chủ thẻ | Ngày phát hành | Mật khẩu OTP |
| :--- | :--- | :--- | :--- | :--- |
| **NCB** | `9704198526191432198` | `NGUYEN VAN A` | `07/15` | `123456` |

## 📁 Cấu trúc thư mục

- `/frontend`: Chứa mã nguồn React.
  - `/src/api`: Cấu hình Axios Interceptors.
  - `/src/store`: Zustand stores.
  - `/src/components`: UI Components (chia theo module).
- `/backend`: Chứa mã nguồn Express.
  - `/migrations`: File cấu trúc Database.
  - `/seeds`: Dữ liệu mẫu khởi tạo.
  - `/src`: Logic MVC (Models, Controllers, Routes).

## 🛡 Quy tắc đóng góp (For Teammates)

1. **Frontend:** Luôn sử dụng TanStack Query cho Server State và Zustand cho Client State.
2. **Backend:** Tuân thủ mô hình MVC, viết Migration khi thay đổi cấu trúc DB.
3. **Môi trường:** Không commit file `.env`. Luôn cập nhật `.env.example` nếu thêm biến mới.

### Quy tắc đặt tên nhánh (branch)

- Làm chức năng mới
  - feature/Tên_của_mình/FE_moduleName (Ví dụ: feature/nha-phuong/HEADER_Component)
  - feature/Tên_của_mình/BE_moduleName
- Fix bug
  - fix/Tên_của_mình/FE_functionality
  - fix/Tên_của_mình/BE_functionality
- Sửa lỗi đột xuất
  - hotfix/Tên_của_mình/unctionality

---

_Làm việc bám theo rules đã đưa và yêu cầu đọc kỹ file này trước khi hỏi_
 