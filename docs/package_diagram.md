# Tài liệu Thiết kế: Package Diagram - Dự án MockAI-Interview

Tài liệu này mô tả chi tiết cấu trúc các package (thư mục) trong dự án **MockAI-Interview** (cấu trúc Monorepo) và mối quan hệ phụ thuộc giữa chúng, kèm theo hướng dẫn vẽ sơ đồ này bằng công cụ trực quan.

---

## 1. Danh sách các Package trong Dự án

Dự án được cấu trúc theo dạng **Monorepo** sử dụng `pnpm workspaces`, chia thành 2 subsystem chính: **Frontend** (Client-side) và **Backend** (Server-side).

### A. Subsystem Frontend (`frontend/src`)
Đóng vai trò giao diện người dùng, được tổ chức thành các package logic sau:
1.  **Entrypoint (`main.jsx` / `App.jsx`)**: Khởi tạo ứng dụng React 19, thiết lập Providers (QueryClientProvider, RouterProvider, SocketContext).
2.  **`routes`**: Định nghĩa cây định tuyến (Routing) và các bộ bảo vệ định tuyến (`ProtectedRoute` - Auth Gate).
3.  **`pages`**: Chứa các trang UI hoàn chỉnh theo phân quyền (Candidate, Recruiter, Admin, Public).
4.  **`components`**: Các thành phần giao diện dùng chung (Button, Card, Sidebar, Navbar, Modal...).
5.  **`store`**: Quản lý Client State (Auth token, UI state như đóng mở modal, theme) bằng **Zustand**. *(Không lưu Server data tại đây)*.
6.  **`api`**: Đóng gói các hàm gọi API thông qua `axiosClient.js` (đã được tích hợp gắn JWT token tự động) và các hooks từ **TanStack Query**.
7.  **`context`**: Quản lý kết nối WebSocket Client thông qua `SocketContext.jsx` phục vụ tính năng real-time.
8.  **`hooks` / `utils`**: Các hàm tiện ích bổ trợ và React hooks tự định nghĩa.

### B. Subsystem Backend (`backend/src`)
Đóng vai trò xử lý nghiệp vụ, API REST và thời gian thực, được tổ chức thành các package logic sau:
1.  **Entrypoint (`server.js` / `app.js`)**: Khởi tạo Express app, cài đặt middleware chung, khởi chạy HTTP server và Socket.io.
2.  **`routes`**: Định nghĩa các API endpoints (auth, CV, jobs, interviews, blogs...).
3.  **`middlewares`**: Các bộ lọc trung gian (Xác thực JWT `authMiddleware.js`, chống SSRF `ssrfGuard`, phân quyền...).
4.  **`controllers`**: Tiếp nhận request, kiểm tra tham số đầu vào, điều phối nghiệp vụ và trả về response JSON.
5.  **`services`**: Lớp xử lý nghiệp vụ cốt lõi (Business Logic Layer) bao gồm parser CV, chấm điểm AI, sinh câu hỏi phỏng vấn...
6.  **`db`**: Cấu hình kết nối cơ sở dữ liệu PostgreSQL sử dụng Knex.js.
7.  **`socket.js`**: Xử lý các sự kiện giao tiếp thời gian thực (real-time chat, phỏng vấn voice) qua Socket.io Server.

### C. Cơ sở dữ liệu & Dịch vụ bên ngoài (External Services)
1.  **Database**: Hệ quản trị cơ sở dữ liệu **PostgreSQL**.
2.  **Cloudinary**: Dịch vụ lưu trữ file đa phương tiện (CV PDF, file ghi âm phỏng vấn).
3.  **AI API (Anthropic Sonnet)**: Xử lý chấm điểm ATS, phân tích CV và sinh câu hỏi phỏng vấn.
4.  **Mailer (Nodemailer)**: Dịch vụ gửi email thông báo tự động (thông báo lịch phỏng vấn, kết quả...).

---

## 2. Sơ đồ Package Diagram (Mermaid)

Dưới đây là mã sơ đồ Package Diagram được mô tả dưới dạng Flowchart Mermaid:

```mermaid
flowchart TB
    %% Cấu hình style màu sắc Ocean Blue theo đúng chuẩn GEMINI.md
    classDef subsystem fill:#e0f2fe,stroke:#0ea5e9,stroke-width:2px,color:#0369a1,font-weight:bold;
    classDef package fill:#f0f9ff,stroke:#38bdf8,stroke-width:2px,color:#0c4a6e;
    classDef external fill:#f3f4f6,stroke:#9ca3af,stroke-width:2px,color:#374151;

    subgraph Project ["MockAI-Interview Monorepo Architecture"]
        
        %% SUB-SYSTEM FRONTEND
        subgraph FE ["frontend (Client Subsystem)"]
            FE_Entry["Entrypoint\n(main.jsx / App.jsx)"]
            FE_Routes["routes\n(Router & Guards)"]
            FE_Pages["pages\n(Views & Layouts)"]
            FE_Comp["components\n(Shared UI Components)"]
            FE_Store["store\n(Zustand UI State)"]
            FE_API["api\n(Axios & TanStack Query)"]
            FE_Ctx["context\n(SocketContext)"]
        end

        %% SUB-SYSTEM BACKEND
        subgraph BE ["backend (Server Subsystem)"]
            BE_Entry["Entrypoint\n(server.js / app.js)"]
            BE_Routes["routes\n(API Router)"]
            BE_Mid["middlewares\n(Auth & SSRF Guard)"]
            BE_Ctrl["controllers\n(Request Handlers)"]
            BE_Svc["services\n(Business Logic & AI)"]
            BE_DB["db\n(Knex Connection)"]
            BE_Socket["socket.js\n(Socket.io Server)"]
        end

        %% DATABASE LAYER
        subgraph DB ["Database Layer"]
            PostgreSQL[(PostgreSQL Database)]
        end

        %% EXTERNAL SERVICES
        subgraph EXT ["External Services"]
            Cloudinary[Cloudinary Storage]
            AI_API[AI LLM API\n(Claude Sonnet)]
            Mailer[Nodemailer SMTP]
        end
    end

    %% Mối quan hệ phụ thuộc trong Frontend
    FE_Entry -.-> FE_Routes
    FE_Routes -.-> FE_Pages
    FE_Pages -.-> FE_Comp
    FE_Pages -.-> FE_Store
    FE_Pages -.-> FE_API
    FE_Pages -.-> FE_Ctx
    FE_Comp -.-> FE_Store
    FE_API -.-> FE_Store

    %% Mối quan hệ phụ thuộc trong Backend
    BE_Entry -.-> BE_Routes
    BE_Routes -.-> BE_Mid
    BE_Routes -.-> BE_Ctrl
    BE_Ctrl -.-> BE_Svc
    BE_Svc -.-> BE_DB
    BE_Socket -.-> BE_Svc

    %% Giao tiếp Client - Server (Frontend -> Backend)
    FE_API -.-> |HTTP REST API / JSON| BE_Routes
    FE_Ctx -.-> |WebSockets / Real-time| BE_Socket

    %% Giao tiếp Backend -> Cơ sở dữ liệu & Dịch vụ ngoài
    BE_DB -.-> |SQL Queries / Knex| PostgreSQL
    BE_Svc -.-> |Upload CV/Audio| Cloudinary
    BE_Svc -.-> |AI Prompting & Evaluation| AI_API
    BE_Svc -.-> |Send Email Notification| Mailer

    %% Áp dụng Class Styles
    class FE,BE subsystem;
    class DB,EXT external;
    class FE_Entry,FE_Routes,FE_Pages,FE_Comp,FE_Store,FE_API,FE_Ctx,BE_Entry,BE_Routes,BE_Mid,BE_Ctrl,BE_Svc,BE_DB,BE_Socket package;
```

---

## 3. Hướng dẫn cách vẽ Package Diagram

Bạn có thể tự vẽ hoặc tạo tự động sơ đồ này bằng 2 cách phổ biến và chuyên nghiệp nhất dưới đây:

### Cách 1: Sử dụng Draw.io (Nhanh & Tự động từ mã Mermaid)
Draw.io hỗ trợ tạo sơ đồ cực nhanh từ mã Mermaid có sẵn ở Mục 2.

1.  Truy cập trang web [draw.io](https://app.diagrams.net/).
2.  Tạo một bản vẽ trống mới (Blank Diagram).
3.  Trên thanh thực đơn (Menu bar), chọn **Arrange** (Sắp xếp) -> **Insert** (Chèn) -> **Advanced** (Nâng cao) -> **Mermaid...**
4.  Copy toàn bộ đoạn mã Mermaid ở **Mục 2** của tài liệu này và dán vào hộp thoại nhập liệu.
5.  Nhấn nút **Insert** (Chèn). Draw.io sẽ tự động dựng và bố trí toàn bộ Package Diagram chuẩn với màu sắc **Ocean Blue** cực kỳ chuyên nghiệp.
6.  Bạn có thể kéo thả, căn chỉnh lại các hộp thư mục hoặc đổi font chữ (Inter, Outfit) theo ý thích để hoàn thiện sơ đồ.

### Cách 2: Vẽ thủ công trên Draw.io (Theo chuẩn UML Package Diagram)
Nếu bạn muốn tự thiết kế theo đúng ký hiệu UML tiêu chuẩn (biểu tượng thư mục có tab):

1.  **Tạo Folder biểu thị Package**:
    *   Mở thư viện hình khối ở cột bên trái: Tìm kiếm khối **Folder** hoặc vào mục **UML** chọn khối có dạng hình thư mục (một hình chữ nhật lớn kèm một hình chữ nhật nhỏ nhô lên ở góc trên bên trái).
    *   Đặt tên cho Package lớn (ví dụ: `frontend`, `backend`) ở tab nhô lên, và các package con ở bên trong phần thân thư mục.
2.  **Đặt các Package con vào trong**:
    *   Kéo các khối Folder nhỏ hơn tương ứng với các package con (`routes`, `controllers`, `services`...) vào bên trong lòng khối Folder lớn.
3.  **Vẽ đường liên kết phụ thuộc (Dependency)**:
    *   Sử dụng mũi tên nét đứt có đầu hở (`- - - >`) để biểu thị mối quan hệ phụ thuộc từ Package gọi đến Package được gọi (ví dụ: `controllers` phụ thuộc vào `services`).
    *   Thêm nhãn (label) trên đường nối như `«use»`, `«import»` hoặc `«access»` nếu cần làm rõ mối quan hệ.
4.  **Phối màu (Ocean Blue)**:
    *   Áp dụng màu nền Ocean Blue nhạt (`#f0f9ff` hoặc `#e0f2fe`) và viền xanh đậm (`#0ea5e9` or `#38bdf8`) để đảm bảo thẩm mỹ premium đồng bộ với nhận diện thương hiệu của dự án.
