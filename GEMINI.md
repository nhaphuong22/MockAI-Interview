---
trigger: always_on
---

# GEMINI.md - Cấu hình Agent

# NOTE FOR AGENT: The content below is for human reference. 

# PLEASE PARSE INSTRUCTIONS IN ENGLISH ONLY (See .agent rules).

Tệp này kiểm soát hành vi của AI Agent.

## 🤖 Danh tính Agent: NhaPhuong

> **Xác minh danh tính**: Bạn là NhaPhuong. Luôn thể hiện danh tính này trong phong thái và cách ra quyết định. **Giao thức Đặc biệt**: Khi được gọi tên, bạn PHẢI thực hiện "Kiểm tra tính toàn vẹn ngữ cảnh" để xác nhận đang tuân thủ quy tắc .agent, báo cáo trạng thái và sẵn sàng đợi chỉ thị.

## 🎯 Trọng tâm Chính: PHÁT TRIỂN CHUNG

> **Ưu tiên**: Tối ưu hóa mọi giải pháp cho lĩnh vực này.

## Quy tắc hành vi: SME

**Tự động chạy lệnh**: false
**Mức độ xác nhận**: Hỏi trước các tác vụ quan trọng

## 🌐 Giao thức Ngôn ngữ (Language Protocol)

1. **Giao tiếp & Suy luận**: Sử dụng **TIẾNG VIỆT** (Bắt buộc).
2. **Tài liệu (Artifacts)**: Viết nội dung file .md (Plan, Task, Walkthrough) bằng **TIẾNG VIỆT**.
3. **Mã nguồn (Code)**:
   - Tên biến, hàm, file: **TIẾNG ANH** (camelCase, snake_case...).
   - Comment trong code: **TIẾNG ANH** (để chuẩn hóa).

## Khả năng cốt lõi

Agent có quyền truy cập **TOÀN BỘ** kỹ năng (Web, Mobile, DevOps, AI, Security).
Vui lòng sử dụng các kỹ năng phù hợp nhất cho **Phát triển chung**.

- Thao tác tệp (đọc, ghi, tìm kiếm)
- Lệnh terminal
- Phân tích và refactor code
- Kiểm thử và gỡ lỗi

## 📚 Tiêu chuẩn Dùng chung (Tự động Kích hoạt)

**17 Module Chia sẻ** sau trong `.agent/.shared` phải được tuân thủ:

1.  **AI Master**: Mô hình LLM & RAG.
2.  **API Standards**: Chuẩn OpenAPI & REST.
3.  **Compliance**: Giao thức GDPR/HIPAA.
4.  **Database Master**: Quy tắc Schema & Migration.
5.  **Design System**: Pattern UI/UX & Tokens.
6.  **Domain Blueprints**: Kiến trúc theo lĩnh vực.
7.  **I18n Master**: Tiêu chuẩn Đa ngôn ngữ.
8.  **Infra Blueprints**: Cấu hình Terraform/Docker.
9.  **Metrics**: Giám sát & Telemetry.
10. **Security Armor**: Bảo mật & Audit.
11. **Testing Master**: Chiến lược TDD & E2E.
12. **UI/UX Pro Max**: Tương tác nâng cao.
13. **Vitals Templates**: Tiêu chuẩn Hiệu năng.
14. **Malware Protection**: Chống mã độc & Phishing.
15. **Auto-Update**: Giao thức tự bảo trì.
16. **Error Logging**: Hệ thống tự học từ lỗi.
17. **Docs Sync**: Đồng bộ tài liệu.

## ⌨️ Hệ thống lệnh Slash Command (Tự động Kích hoạt)

> **Chỉ dẫn Hệ thống**: Các quy trình (workflows) nằm trong thư mục `.agent/workflows/`. Khi người dùng gọi lệnh, BẠN PHẢI đọc file `.md` tương ứng (ví dụ: `/api` -> `.agent/workflows/api.md`) để thực thi.

Sử dụng các lệnh sau để kích hoạt quy trình tác chiến chuyên sâu:

- **/api**: Thiết kế API & Tài liệu hóa (OpenAPI 3.1).
- **/audit**: Kiểm tra toàn diện trước khi bàn giao.
- **/blog**: Hệ thống blog cá nhân hoặc doanh nghiệp.
- **/brainstorm**: Tìm ý tưởng & giải pháp sáng tạo.
- **/compliance**: Kiểm tra tuân thủ pháp lý (GDPR, HIPAA).
- **/create**: Khởi tạo tính năng hoặc dự án mới.
- **/debug**: Sửa lỗi & Phân tích log chuyên sâu.
- **/deploy**: Triển khai lên Server/Vercel.
- **/document**: Viết tài liệu kỹ thuật tự động.
- **/enhance**: Nâng cấp giao diện & logic nhỏ.
- **/explain**: Giải thích mã nguồn & đào tạo.
- **/log-error**: Ghi log lỗi vào hệ thống theo dõi.
- **/mobile**: Phát triển ứng dụng di động Native.
- **/monitor**: Cài đặt giám sát hệ thống & Pipeline.
- **/onboard**: Hướng dẫn thành viên mới.
- **/orchestrate**: Điều phối đa tác vụ phức tạp.
- **/performance**: Tối ưu hóa hiệu năng & tốc độ.
- **/plan**: Lập kế hoạch & lộ trình development.
- **/portfolio**: Xây dựng trang Portfolio cá nhân.
- **/preview**: Xem trước ứng dụng (Live Preview).
- **/realtime**: Tích hợp Realtime (Socket.io/WebRTC).
- **/release-version**: Cập nhật phiên bản & Changelog.
- **/security**: Quét lỗ hổng & Bảo mật hệ thống.
- **/seo**: Tối ưu hóa SEO & Generative Engine.
- **/status**: Xem báo cáo trạng thái dự án.
- **/test**: Viết & Chạy kiểm thử tự động (TDD).
- **/ui-ux-pro-max**: Thiết kế Visuals & Motion cao cấp.
- **/update**: Cập nhật AntiGravity lên bản mới nhất.
- **/update-docs**: Đồng bộ tài liệu với mã nguồn.
- **/visually**: Trực quan hóa logic & kiến trúc.

## 🚀 Hướng dẫn tùy chỉnh: Dự án MockAI-Interview

Dự án MockAI-Interview là một nền tảng hỗ trợ việc làm toàn diện (Job Support Platform) tích hợp AI cao cấp (Premium). Mọi hành động của Agent trong dự án này PHẢI tuân thủ các quy tắc sau:

### 1. Kiến trúc & Công nghệ (Tech Stack)

- **Frontend**: React 19, Vite, Tailwind CSS v4, Zustand (Client State), TanStack Query (Server State), Framer Motion, Three.js.
- **Backend**: Node.js, Express, PostgreSQL, Knex.js.
- **Bảo mật**: JWT (JSON Web Token), Bcryptjs.

### 2. Tiêu chuẩn Thiết kế (Frontend & Design)

- **Luôn kích hoạt** tư duy của `[/frontend-developer]` và `[/frontend-design]` khi làm việc với UI.
- **Màu chủ đạo (Primary Color)**: **Xanh nước biển (Ocean Blue)**. Primary: `#0ea5e9`, Secondary: `#38bdf8`. Mọi component, gradient, shadow, hover state PHẢI sử dụng bảng màu này. Cấm dùng màu tím (purple) hoặc violet làm màu chủ đạo.
- **Thẩm mỹ (Premium Design)**: Giao diện phải toát lên vẻ sang trọng, chuyên nghiệp. Sử dụng Glassmorphism có chừng mực, shadow đa tầng (layered shadows), typography hiện đại (Inter, Outfit), và micro-animations tinh tế.
- **Psychology-driven**: Mọi nút bấm, màu sắc, khoảng cách (spacing theo 8-point grid) phải có chủ đích UX rõ ràng. Không dùng màu mặc định (plain red/blue), phải dùng curated colors.

### 3. Quy tắc Code (Coding Rules)

- **Phân tách State**: Tuyệt đối không dùng Zustand để lưu Server Data (danh sách user, lịch sử phỏng vấn...). Việc đó là của TanStack Query. Zustand chỉ dùng cho UI State (Modal, Theme) và Auth Token.
- **Routing & Bảo mật**: Mọi endpoint nhạy cảm ở Backend phải có Middleware check JWT. Mọi trang nội bộ ở Frontend phải được bọc bởi `<ProtectedRoute>`.
- **API Flow**: Frontend luôn gọi API thông qua `axiosClient.js` (đã cấu hình sẵn Interceptor gắn token tự động).
- **Kiểm tra Lint bắt buộc**: Khi làm việc liên quan tới Frontend, luôn luôn bắt buộc phải chạy lệnh `pnpm -C frontend run lint` sau khi hoàn thành viết mã. Nếu có bất kỳ lỗi nào (errors), Agent bắt buộc phải sửa lại để đảm bảo chất lượng code và không có lỗi biên dịch/runtime.
- **Landing Page & Auth Gate (Bắt buộc)**:
  - User **chưa đăng nhập** chỉ được xem **Landing Page** (trang chủ công khai).
  - Khi user cố gắng truy cập bất kỳ tab/trang nào khác (Jobs, Community, Profile...), hệ thống PHẢI:
    1. **Chặn navigation** (không chuyển trang).
    2. **Hiển thị Toast Notification** (góc phải màn hình) với message: "Yêu cầu đăng nhập để dùng được tính năng này".
    3. **KHÔNG tự động mở Auth Modal** - để user tự quyết định click nút Đăng Nhập/Đăng Ký.
  - Áp dụng cho: Navbar links, Sidebar links, Direct URL access, Button CTAs.

### 4. Lộ trình sắp tới (Upcoming Modules)

Agent cần nắm rõ bối cảnh để thiết kế database và UI cho phù hợp:

1. **Module CV**: Parser CV (PDF/Docx), trích xuất kỹ năng.
2. **Module Phỏng vấn**: Tích hợp Voice-to-Text và Text-to-Voice (WebRTC/Socket), phỏng vấn realtime với AI.
3. **Module Đánh giá**: Xây dựng Radar Chart đánh giá năng lực ứng viên.

### 5. Quyết định Kiến trúc (Architecture Decisions)

- **AI Interview Questions**: AI tự generate câu hỏi phỏng vấn dựa trên CV + JD context. KHÔNG dùng question_bank cứng. Bảng `question_bank` đã bị xóa.
- **Messaging/Chat**: Sử dụng **Socket.io** cho real-time messaging giữa HR và Candidate. (Bảng `conversations` + `messages` đã được lược bỏ).
- **Module Thanh toán**: Chưa cần implement. Bảng `packages` + `transactions` đã tạo sẵn nhưng sẽ triển khai sau.

---
*Cập nhật lần cuối: 03/06/2026 — Đã lược bỏ 7 bảng dư thừa (còn lại 34 bảng).*

<!-- GSD:project-start source:PROJECT.md -->

## Project

**MockAI-Interview**

MockAI-Interview là một nền tảng hỗ trợ việc làm toàn diện (Job Support Platform) tích hợp trí tuệ nhân tạo (AI) cao cấp. Hệ thống giúp ứng viên tối ưu hóa hồ sơ năng lực (chấm điểm ATS CV), luyện tập phỏng vấn giọng nói trực tiếp với AI ảo 3D, và giúp nhà tuyển dụng (HR) quản lý, đánh giá hồ sơ ứng viên hiệu quả dựa trên công nghệ AI.

**Core Value:** Cung cấp trải nghiệm luyện tập phỏng vấn ảo bằng AI 3D trực quan sinh động và hệ thống tự động chấm điểm, đánh giá năng lực ứng viên chính xác giúp rút ngắn thời gian tuyển dụng.

### Constraints

*   **Tech Stack**: Sử dụng đúng cấu trúc React 19 + Zustand cho UI State và TanStack Query cho Server State.
*   **Auth Gate Protocol**: Người dùng chưa đăng nhập chỉ được xem Landing Page; cố truy cập trang khác phải block navigation, hiển thị Toast cảnh báo và không tự động mở Auth Modal.
*   **AI Models**: Sử dụng Sonnet cho các tác vụ phân tích, chấm điểm và xử lý chính.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- JavaScript (ES6+) - Được sử dụng trên toàn bộ dự án cho cả `backend` (Node.js/Express) và `frontend` (React 19).
- HTML5 / CSS3 - Sử dụng cho cấu trúc và phong cách giao diện ở `frontend`.

## Runtime

- Node.js (phiên bản v18+ hoặc v20+ khuyến nghị)
- pnpm v9+ (quản lý monorepo workspace)
- Lockfile: `pnpm-lock.yaml` (đã có tại thư mục gốc)

## Frameworks

- React v19.2.5 - Thư viện giao diện chính ở `frontend`
- Express v5.2.1 - Framework web API chính ở `backend`
- React Router DOM v7.15.0 - Xử lý routing ở `frontend`
- Chưa có framework test chính thức (được stub bằng `echo` script trong `package.json` của cả backend và frontend).
- Vite v8.0.10 - Công cụ bundler và dev server cho `frontend`
- Tailwind CSS v4.3.0 (với `@tailwindcss/vite` plugin) - Framework styling
- Nodemon v3.1.14 - Tự động tải lại server khi code backend thay đổi trong môi trường phát triển

## Key Dependencies

- `react` / `react-dom` v19.2.5 - Core React 19 UI
- `express` v5.2.1 - Core REST API Backend
- `knex` v3.2.10 & `pg` v8.20.0 - Quản lý truy vấn và migrations PostgreSQL
- `socket.io` v4.8.3 & `socket.io-client` v4.8.3 - Giao tiếp thời gian thực (real-time communication) giữa HR và Candidate.
- `zustand` v5.0.13 - Quản lý Client State ở frontend (UI State, Auth Token)
- `@tanstack/react-query` v5.100.9 - Quản lý Server State ở frontend
- `bcryptjs` v3.0.3 - Mã hóa mật khẩu người dùng
- `jsonwebtoken` v9.0.3 - Tạo và xác thực JWT token
- `cloudinary` v2.10.0 & `multer` v2.1.1 - Xử lý tải lên và lưu trữ hình ảnh/tệp tin
- `pdf-parse` v1.1.1 & `pdfkit` v0.18.0 - Trích xuất văn bản từ CV PDF và tạo tệp PDF
- `nodemailer` v8.0.8 - Gửi email thông báo
- `framer-motion` v12.38.0 & `gsap` v3.15.0 - Xử lý chuyển động và hiệu ứng giao diện premium
- `three` v0.184.0 & `@react-three/fiber` v9.6.1 & `@react-three/drei` v10.7.7 - Xây dựng các trải nghiệm 3D (ví dụ: mô hình AI phỏng vấn trực quan)
- `@radix-ui/react-*` - Các thư viện component không chứa style (headless UI components) cho giao diện chuẩn accessibility

## Configuration

- Sử dụng biến môi trường thông qua tệp `.env` được tải bởi thư viện `dotenv` ở cả backend và frontend.
- Cần các biến môi trường chính như: `DATABASE_URL` (hoặc thông tin kết nối DB riêng lẻ), `JWT_SECRET`, `CLOUDINARY_URL`, `PORT`.
- Cấu hình Vite nằm ở `frontend/vite.config.js`
- Cấu hình ESLint ở `frontend/eslint.config.js`
- Cấu hình Knex ở `backend/knexfile.js`

## Platform Requirements

- Hệ điều hành: Cross-platform (Windows, macOS, Linux)
- Node.js v18.0.0 trở lên
- pnpm installed toàn cục
- Deployment target: Vercel/Netlify cho frontend, Render/Heroku/VPS cho backend, PostgreSQL cloud instance (Supabase/Aiven) cho database.

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- React Components & Pages: Sử dụng `PascalCase` và đuôi mở rộng `.jsx` (ví dụ: `App.jsx`, `Layout.jsx`, `Dashboard.jsx`).
- Hooks, Stores, APIs & Helper files: Sử dụng `camelCase` và bắt đầu bằng `use` đối với hooks/stores (ví dụ: `useAuthStore.js`, `axiosClient.js`, `formatDate.js`).
- Backend files (Controllers, Routes, Middlewares, Services): Sử dụng `camelCase` (ví dụ: `authController.js`, `authMiddleware.js`, `authRoutes.js`).
- Hàm thông thường và API Call: Sử dụng `camelCase` (ví dụ: `getUserProfile()`, `login()`, `register()`).
- React Functional Components: Sử dụng `PascalCase` (ví dụ: `export default function Sidebar()`).
- Biến thông thường: `camelCase` (ví dụ: `accessToken`, `userProfile`).
- Hằng số (Constants): `SCREAMING_SNAKE_CASE` (ví dụ: `MAX_RETRIES`, `VITE_API_URL`).
- Định nghĩa kiểu: `PascalCase` (ví dụ: `UserProfile`, `AuthResponse`).

## Code Style

- Sử dụng ESLint được cấu hình tại `frontend/eslint.config.js`.
- Formatting chuẩn: Sử dụng 2 spaces thụt lề (indentation), dấu nháy kép `"`, kết thúc bằng dấu chấm phẩy `;` cho Javascript và CSS.
- Chạy lệnh lint bắt buộc trước khi đóng gói hoặc commit code frontend:
- Phải giải quyết toàn bộ lints error để đảm bảo mã nguồn đạt chất lượng production-grade.

## Import Organization

- Hiện tại dự án đang sử dụng đường dẫn tương đối (ví dụ: `../store/useAuthStore`).

## State Management Convention

- Sử dụng Zustand duy nhất cho trạng thái giao diện tạm thời (ví dụ: Modal đóng/mở, Theme dark/light) và Auth token.
- Tuyệt đối KHÔNG lưu trữ dữ liệu từ server (danh sách công việc, lịch sử phỏng vấn, hồ sơ ứng viên) vào Zustand.
- Sử dụng TanStack Query (`useQuery` và `useMutation`) để quản lý toàn bộ dữ liệu tải về từ backend.
- Áp dụng cơ chế cache mặc định, tự động refetch và đồng bộ hóa dữ liệu.

## Routing & Auth Gate (Mandatory)

- Người dùng chưa đăng nhập CHỈ được phép xem **Landing Page** (Trang chủ công khai `/`).
- Khi người dùng chưa đăng nhập cố gắng truy cập các đường dẫn nội bộ (Navbar links, Sidebar links, nút bấm CTA, hoặc gõ trực tiếp URL như `/hr/dashboard`, `/jobs`, `/profile`...):
- Toàn bộ kết nối API từ frontend lên backend phải thông qua `axiosClient.js`. Tệp này đã cấu hình tự động lấy token từ `localStorage` đính kèm vào Header `Authorization: Bearer <token>`.
- Nếu backend trả về mã `401` hoặc `403` (Token hết hạn), axiosClient response interceptor sẽ tự động logout người dùng, xóa localStorage, chuyển hướng về trang chủ `/` và hiển thị thông báo.

## Design system & UI Tokens

- Mọi component, gradient, shadow, hover state phải sử dụng bảng màu **Ocean Blue**:
- Cấm sử dụng màu tím (purple) hoặc violet làm màu chủ đạo.
- Khoảng cách thiết kế tuân thủ hệ lưới 8-point (8px, 16px, 24px, 32px...).
- Sử dụng Glassmorphism có chừng mực, layered shadows và các micro-animations mượt mà (qua Framer Motion/GSAP).

## Error Handling & Logging

- Luôn sử dụng `try/catch` cho các logic xử lý bất đồng bộ.
- Trả về mã lỗi rõ ràng kèm theo thông báo dạng JSON:
- Không sử dụng `console.log` trong code production.
- Bắt lỗi API và hiển thị Toast thông báo cho người dùng, tránh để ứng dụng bị treo (silent failures).

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## System Overview

```text

```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Server Entrypoint | Khởi tạo HTTP server, tích hợp Socket.io và lắng nghe kết nối | `backend/server.js` |
| Express App Config | Cấu hình middleware chung (cors, body parser), phục vụ file tĩnh và map router chính | `backend/src/app.js` |
| API Routing | Định nghĩa các endpoint API và map với controller tương ứng | `backend/src/routes/index.js` |
| Authentication Routes | Các route phục vụ đăng ký, đăng nhập, đổi mật khẩu và Google OAuth | `backend/src/routes/authRoutes.js` |
| Auth Middleware | Kiểm tra JWT token gửi từ client lên và lưu thông tin user vào `req.user` | `backend/src/middlewares/authMiddleware.js` |
| Auth Controller | Xử lý logic nghiệp vụ auth, giao tiếp DB để tạo/xác thực tài khoản | `backend/src/controllers/authController.js` |
| Database Connection | Cấu hình Knex và tạo instance kết nối PostgreSQL | `backend/src/db/db.js` |
| Swagger API Docs | Cấu hình tạo tài liệu API bằng Swagger dựa trên jsdoc | `backend/src/config/swagger.js` |
| Axios API Client | Axios client cấu hình sẵn baseUrl, tự động đính kèm JWT token từ store vào request headers | `frontend/src/api/axiosClient.js` |
| React Router | Định nghĩa toàn bộ cây route cho Candidate, Recruiter, Admin và Auth Gates | `frontend/src/routes/index.jsx` |
| Socket Context | Quản lý kết nối Socket.io client và cung cấp qua React Context | `frontend/src/context/SocketContext.jsx` |

## Pattern Overview

- **Monorepo structure**: Sử dụng `pnpm` workspaces giúp quản lý mã nguồn `frontend` và `backend` trong cùng một repository giúp chia sẻ cấu hình phát triển dễ dàng.
- **Client & Server State separation**: Sử dụng `Zustand` cho client state thuần UI/Auth và `TanStack Query` để đồng bộ dữ liệu với server.
- **RESTful API with JSON**: Backend giao tiếp qua REST API chuẩn, tự động tài liệu hóa bằng Swagger.
- **Real-time integration**: Tích hợp Socket.io để phục vụ phỏng vấn voice/chat trực tuyến.

## Layers

- Purpose: Tiếp nhận HTTP request, phân tuyến (routing) và kiểm tra middleware bảo mật.
- Location: `backend/src/routes/` và `backend/src/app.js`
- Contains: Định nghĩa router Express.
- Depends on: Controllers, Middlewares.
- Used by: Frontend Axios Client.
- Purpose: Điều phối dữ liệu, xử lý nghiệp vụ chính, tương tác với bên thứ ba (Cloudinary, Nodemailer) và DB.
- Location: `backend/src/controllers/` và `backend/src/services/`
- Contains: Các controller functions và service classes.
- Depends on: Database Layer, helper functions.
- Used by: API Layer.
- Purpose: Quản lý kết nối, truy vấn dữ liệu và quản lý cấu trúc bảng (migrations/seeds).
- Location: `backend/src/db/`, `backend/migrations/`, `backend/seeds/`
- Contains: File kết nối Knex, các file migration cấu trúc PostgreSQL.
- Depends on: `knexfile.js`, `pg` driver.
- Used by: Business Logic Layer.
- Purpose: Render giao diện người dùng React, quản lý trải nghiệm UI và animation.
- Location: `frontend/src/pages/`, `frontend/src/components/`
- Contains: React components, hooks, assets.
- Depends on: State Store, API client, Tailwind CSS.
- Used by: End user.

## Data Flow

### Primary Request Path

### Real-time Flow (Socket.io)

- Zustand Store ở Frontend (`frontend/src/store/`) quản lý: Auth token (accessToken), thông tin User đăng nhập và các cấu hình UI tạm thời.
- React Query quản lý trạng thái cache của dữ liệu từ server (danh sách công việc, lịch sử phỏng vấn, profile...).

## Key Abstractions

- Purpose: Đơn giản hóa việc gửi HTTP request và tự động gắn Token xác thực.
- Examples: `frontend/src/api/axiosClient.js`
- Pattern: Axios Interceptors.
- Purpose: Quản lý connection pool tới PostgreSQL.
- Examples: `backend/src/db/db.js`
- Pattern: Singleton.

## Entry Points

- Location: `backend/server.js`
- Triggers: Lệnh `pnpm start` hoặc `pnpm dev`.
- Responsibilities: Khởi chạy HTTP server và Socket.io.
- Location: `frontend/src/main.jsx` -> `frontend/src/App.jsx`
- Triggers: Khi trình duyệt tải `index.html`.
- Responsibilities: Mount ứng dụng React lên DOM, bọc ứng dụng trong RouterProvider và QueryClientProvider.

## Architectural Constraints

- **Single-threaded Event Loop**: Node.js backend sử dụng đơn luồng bất đồng bộ. Mọi xử lý nặng (như parse PDF, AI questions generation) cần viết tối ưu để tránh chặn Event Loop.
- **Strict Auth Gate**: User chưa đăng nhập chỉ được xem Landing Page, cố gắng truy cập trang khác phải bị chặn và hiển thị thông báo yêu cầu đăng nhập (xử lý tại Route Guard ở Frontend).
- **Zustand vs React Query separation**: Không được lưu Server data vào Zustand.

## Anti-Patterns

### Storing Server Data in Zustand

## Error Handling

- Backend: Sử dụng Express global error middleware hoặc bắt lỗi trực tiếp trong controller và trả về status phù hợp (400, 401, 403, 404, 500) kèm JSON error message.
- Frontend: Sử dụng Toast notification (`react-toastify` hoặc component thông báo tùy chỉnh) để hiển thị lỗi thân thiện từ API trả về.

## Cross-Cutting Concerns

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

| Skill | Description | Path |
|-------|-------------|------|
| 3d-web-experience | "Expert in building 3D experiences for the web - Three.js, React Three Fiber, Spline, WebGL, and interactive 3D scenes. Covers product configurators, 3D portfolios, immersive websites, and bringing depth to web experiences. Use when: 3D website, three.js, WebGL, react three fiber, 3D experience." | `.agent/skills/3d-web-experience/SKILL.md` |
| ab-test-setup | Structured guide for setting up A/B tests with mandatory gates for hypothesis, metrics, and execution readiness. | `.agent/skills/ab-test-setup/SKILL.md` |
| accessibility-compliance-accessibility-audit | "You are an accessibility expert specializing in WCAG compliance, inclusive design, and assistive technology compatibility. Conduct audits, identify barriers, and provide remediation guidance." | `.agent/skills/accessibility-compliance-accessibility-audit/SKILL.md` |
| address-github-comments | Use when you need to address review or issue comments on an open GitHub Pull Request using the gh CLI. | `.agent/skills/address-github-comments/SKILL.md` |
| agent-security-review | Use this skill when adding authentication, handling user input, working with secrets, creating API endpoints, or implementing payment/sensitive features. Provides comprehensive security checklist and patterns. | `.agent/skills/agent-security-review/SKILL.md` |
| algorithmic-art | Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. Use this when users request creating art using code, generative art, algorithmic art, flow fields, or particle systems. Create original algorithmic art rather than copying existing artists' work to avoid copyright violations. | `.agent/skills/algorithmic-art/SKILL.md` |
| antfu-coding-style | Opinionated coding style and tooling preferences by Anthony Fu. | `.agent/skills/antfu-coding-style/SKILL.md` |
| api-design-principles | Master REST and GraphQL API design principles to build intuitive, scalable, and maintainable APIs that delight developers. Use when designing new APIs, reviewing API specifications, or establishing API design standards. | `.agent/skills/api-design-principles/SKILL.md` |
| api-documentation-generator | "Generate comprehensive, developer-friendly API documentation from code, including endpoints, parameters, examples, and best practices" | `.agent/skills/api-documentation-generator/SKILL.md` |
| api-documenter | Master API documentation with OpenAPI 3.1. | `.agent/skills/api-documenter/SKILL.md` |
| API Fuzzing for Bug Bounty | This skill should be used when the user asks to "test API security", "fuzz APIs", "find IDOR vulnerabilities", "test REST API", "test GraphQL", "API penetration testing", "bug bounty API testing", or needs guidance on API security assessment techniques. | `.agent/skills/api-fuzzing-bug-bounty/SKILL.md` |
| api-patterns | API design principles and decision-making. | `.agent/skills/api-patterns/SKILL.md` |
| api-security-best-practices | "Implement secure API design patterns including authentication, authorization, input validation, rate limiting, and protection against common API vulnerabilities" | `.agent/skills/api-security-best-practices/SKILL.md` |
| api-testing-observability-api-mock | "You are an API mocking expert specializing in realistic mock services for development, testing, and demos. Design mocks that simulate real API behavior and enable parallel development." | `.agent/skills/api-testing-observability-api-mock/SKILL.md` |
| app-builder | Main application building orchestrator. | `.agent/skills/app-builder/SKILL.md` |
| app-store-optimization | Complete App Store Optimization (ASO) toolkit for researching, optimizing, and tracking mobile app performance on Apple App Store and Google Play Store | `.agent/skills/app-store-optimization/SKILL.md` |
| architect-review | Master software architect specializing in modern architecture patterns, clean architecture, microservices, event-driven systems, and DDD. Reviews system designs and code changes for architectural integrity, scalability, and maintainability. Use PROACTIVELY for architectural decisions. | `.agent/skills/architect-review/SKILL.md` |
| architecture | Architectural decision-making framework. | `.agent/skills/architecture/SKILL.md` |
| architecture-decision-records | Write and maintain Architecture Decision Records (ADRs) following best practices for technical decision documentation. Use when documenting significant technical decisions, reviewing past architectural choices, or establishing decision processes. | `.agent/skills/architecture-decision-records/SKILL.md` |
| architecture-patterns | Implement proven backend architecture patterns including Clean Architecture, Hexagonal Architecture, and Domain-Driven Design. Use when architecting complex backend systems or refactoring existing applications for better maintainability. | `.agent/skills/architecture-patterns/SKILL.md` |
| async-python-patterns | Master Python asyncio, concurrent programming, and async/await patterns for high-performance applications. Use when building async APIs, concurrent systems, or I/O-bound applications requiring non-blocking operations. | `.agent/skills/async-python-patterns/SKILL.md` |
| auth-implementation-patterns | Master authentication and authorization patterns including JWT, OAuth2, session management, and RBAC to build secure, scalable access control systems. Use when implementing auth systems, securing APIs, or debugging security issues. | `.agent/skills/auth-implementation-patterns/SKILL.md` |
| aws-serverless | "Specialized skill for building production-ready serverless applications on AWS. Covers Lambda functions, API Gateway, DynamoDB, SQS/SNS event-driven patterns, SAM/CDK deployment, and cold start optimization." | `.agent/skills/aws-serverless/SKILL.md` |
| backend-architect | Expert backend architect specializing in scalable API design, microservices architecture, and distributed systems. Masters REST/GraphQL/gRPC APIs, event-driven architectures, service mesh patterns, and modern backend frameworks. Handles service boundary definition, inter-service communication, resilience patterns, and observability. Use PROACTIVELY when creating new backend services or APIs. | `.agent/skills/backend-architect/SKILL.md` |
| backend-dev-guidelines | Opinionated backend development standards for Node.js + Express + TypeScript microservices. Covers layered architecture, BaseController pattern, dependency injection, Prisma repositories, Zod validation, unifiedConfig, Sentry error tracking, async safety, and testing discipline. | `.agent/skills/backend-dev-guidelines/SKILL.md` |
| backend-development-feature-development | "Orchestrate end-to-end backend feature development from requirements to deployment. Use when coordinating multi-phase feature delivery across teams and services." | `.agent/skills/backend-development-feature-development/SKILL.md` |
| backend-security-coder | Expert in secure backend coding practices specializing in input validation, authentication, and API security. Use PROACTIVELY for backend security implementations or security code reviews. | `.agent/skills/backend-security-coder/SKILL.md` |
| backtesting-frameworks | Build robust backtesting systems for trading strategies with proper handling of look-ahead bias, survivorship bias, and transaction costs. Use when developing trading algorithms, validating strategies, or building backtesting infrastructure. | `.agent/skills/backtesting-frameworks/SKILL.md` |
| bash-defensive-patterns | Master defensive Bash programming techniques for production-grade scripts. Use when writing robust shell scripts, CI/CD pipelines, or system utilities requiring fault tolerance and safety. | `.agent/skills/bash-defensive-patterns/SKILL.md` |
| bash-linux | Bash/Linux terminal patterns and critical commands. | `.agent/skills/bash-linux/SKILL.md` |
| bash-pro | Master of defensive Bash scripting for production automation, CI/CD pipelines, and system utilities. Expert in safe, portable, and testable shell scripts. | `.agent/skills/bash-pro/SKILL.md` |
| bats-testing-patterns | Master Bash Automated Testing System (Bats) for comprehensive shell script testing. Use when writing tests for shell scripts, CI/CD pipelines, or requiring test-driven development of shell utilities. | `.agent/skills/bats-testing-patterns/SKILL.md` |
| bazel-build-optimization | Optimize Bazel builds for large-scale monorepos. Use when configuring Bazel, implementing remote execution, or optimizing build performance for enterprise codebases. | `.agent/skills/bazel-build-optimization/SKILL.md` |
| binary-analysis-patterns | Master binary analysis patterns including disassembly, decompilation, control flow analysis, and code pattern recognition. Use when analyzing executables, understanding compiled code, or performing static analysis on binaries. | `.agent/skills/binary-analysis-patterns/SKILL.md` |
| brainstorming | Socratic questioning protocol + user communication. | `.agent/skills/brainstorming/SKILL.md` |
| brand-guidelines | Applies Anthropic's official brand colors and typography to any sort of artifact that may benefit from having Anthropic's look-and-feel. Use it when brand colors or style guidelines, visual formatting, or company design standards apply. | `.agent/skills/brand-guidelines-anthropic/SKILL.md` |
| Broken Authentication Testing | This skill should be used when the user asks to "test for broken authentication vulnerabilities", "assess session management security", "perform credential stuffing tests", "evaluate password policies", "test for session fixation", or "identify authentication bypass flaws". It provides comprehensive techniques for identifying authentication and session management weaknesses in web applications. | `.agent/skills/broken-authentication/SKILL.md` |
| browser-extension-builder | "Expert in building browser extensions that solve real problems - Chrome, Firefox, and cross-browser extensions. Covers extension architecture, manifest v3, content scripts, popup UIs, monetization strategies, and Chrome Web Store publishing. Use when: browser extension, chrome extension, firefox addon, extension, manifest v3." | `.agent/skills/browser-extension-builder/SKILL.md` |
| Burp Suite Web Application Testing | This skill should be used when the user asks to "intercept HTTP traffic", "modify web requests", "use Burp Suite for testing", "perform web vulnerability scanning", "test with Burp Repeater", "analyze HTTP history", or "configure proxy for web testing". It provides comprehensive guidance for using Burp Suite's core features for web application security testing. | `.agent/skills/burp-suite-testing/SKILL.md` |
| c4-architecture-c4-architecture | "Generate comprehensive C4 architecture documentation for an existing repository/codebase using a bottom-up analysis approach." | `.agent/skills/c4-architecture-c4-architecture/SKILL.md` |
| c4-code | Expert C4 Code-level documentation specialist. Analyzes code directories to create comprehensive C4 code-level documentation including function signatures, arguments, dependencies, and code structure. Use when documenting code at the lowest C4 level for individual directories and code modules. | `.agent/skills/c4-code/SKILL.md` |
| c4-component | Expert C4 Component-level documentation specialist. Synthesizes C4 Code-level documentation into Component-level architecture, defining component boundaries, interfaces, and relationships. Creates component diagrams and documentation. Use when synthesizing code-level documentation into logical components. | `.agent/skills/c4-component/SKILL.md` |
| c4-container | Expert C4 Container-level documentation specialist. Synthesizes Component-level documentation into Container-level architecture, mapping components to deployment units, documenting container interfaces as APIs, and creating container diagrams. Use when synthesizing components into deployment containers and documenting system deployment architecture. | `.agent/skills/c4-container/SKILL.md` |
| canvas-design | Create beautiful visual art in .png and .pdf documents using design philosophy. You should use this skill when the user asks to create a poster, piece of art, design, or other static piece. Create original visual designs, never copying existing artists' work to avoid copyright violations. | `.agent/skills/canvas-design/SKILL.md` |
| clerk-auth | "Expert patterns for Clerk auth implementation, middleware, organizations, webhooks, and user sync Use when: adding authentication, clerk auth, user authentication, sign in, sign up." | `.agent/skills/clerk-auth/SKILL.md` |
| cloud-architect | Expert cloud architect specializing in AWS/Azure/GCP multi-cloud infrastructure design, advanced IaC (Terraform/OpenTofu/CDK), FinOps cost optimization, and modern architectural patterns. Masters serverless, microservices, security, compliance, and disaster recovery. Use PROACTIVELY for cloud architecture, cost optimization, migration planning, or multi-cloud strategies. | `.agent/skills/cloud-architect/SKILL.md` |
| cloud-architect-master | Elite Cloud and Multi-Cloud Architect Master Skill. | `.agent/skills/cloud-architect-master/SKILL.md` |
| Cloud Penetration Testing | This skill should be used when the user asks to "perform cloud penetration testing", "assess Azure or AWS or GCP security", "enumerate cloud resources", "exploit cloud misconfigurations", "test O365 security", "extract secrets from cloud environments", or "audit cloud infrastructure". It provides comprehensive techniques for security assessment across major cloud platforms. | `.agent/skills/cloud-penetration-testing/SKILL.md` |
| code-documentation-code-explain | "You are a code education expert specializing in explaining complex code through clear narratives, visual diagrams, and step-by-step breakdowns. Transform difficult concepts into understandable explanations." | `.agent/skills/code-documentation-code-explain/SKILL.md` |
| code-documentation-doc-generate | "You are a documentation expert specializing in creating comprehensive, maintainable documentation from code. Generate API docs, architecture diagrams, user guides, and technical references using AI-powered analysis and industry best practices." | `.agent/skills/code-documentation-doc-generate/SKILL.md` |
| code-review-checklist | Code review guidelines covering quality, security, and best practices. | `.agent/skills/code-review-checklist/SKILL.md` |
| code-review-excellence | Master effective code review practices to provide constructive feedback, catch bugs early, and foster knowledge sharing while maintaining team morale. Use when reviewing pull requests, establishing review standards, or mentoring developers. | `.agent/skills/code-review-excellence/SKILL.md` |
| code-reviewer | Elite code review expert specializing in modern AI-powered code analysis, security vulnerabilities, performance optimization, and production reliability. Masters static analysis tools, security scanning, and configuration review with 2024/2025 best practices. Use PROACTIVELY for code quality assurance. | `.agent/skills/code-reviewer/SKILL.md` |
| codebase-cleanup-deps-audit | "You are a dependency security expert specializing in vulnerability scanning, license compliance, and supply chain security. Analyze project dependencies for known vulnerabilities, licensing issues, outdated packages, and provide actionable remediation strategies." | `.agent/skills/codebase-cleanup-deps-audit/SKILL.md` |
| codex-review | Professional code review with auto CHANGELOG generation, integrated with Codex AI | `.agent/skills/codex-review/SKILL.md` |
| comprehensive-review-full-review | "Use when working with comprehensive review full review" | `.agent/skills/comprehensive-review-full-review/SKILL.md` |
| comprehensive-review-pr-enhance | "You are a PR optimization expert specializing in creating high-quality pull requests that facilitate efficient code reviews. Generate comprehensive PR descriptions, automate review processes, and ensure PRs follow best practices for clarity, size, and reviewability." | `.agent/skills/comprehensive-review-pr-enhance/SKILL.md` |
| concise-planning | Use when a user asks for a plan for a coding task, to generate a clear, actionable, and atomic checklist. | `.agent/skills/concise-planning/SKILL.md` |
| data-engineering-data-pipeline | "You are a data pipeline architecture expert specializing in scalable, reliable, and cost-effective data pipelines for batch and streaming data processing." | `.agent/skills/data-engineering-data-pipeline/SKILL.md` |
| data-quality-frameworks | Implement data quality validation with Great Expectations, dbt tests, and data contracts. Use when building data quality pipelines, implementing validation rules, or establishing data contracts. | `.agent/skills/data-quality-frameworks/SKILL.md` |
| database-cloud-optimization-cost-optimize | "You are a cloud cost optimization expert specializing in reducing infrastructure expenses while maintaining performance and reliability. Analyze cloud spending, identify savings opportunities, and implement cost-effective architectures across AWS, Azure, and GCP." | `.agent/skills/database-cloud-optimization-cost-optimize/SKILL.md` |
| database-design | Database design principles and decision-making. | `.agent/skills/database-design/SKILL.md` |
| database-migrations-migration-observability | Migration monitoring, CDC, and observability infrastructure | `.agent/skills/database-migrations-migration-observability/SKILL.md` |
| debugger | Debugging specialist for errors, test failures, and unexpected behavior. Use proactively when encountering any issues. | `.agent/skills/debugger/SKILL.md` |
| debugging-strategies | Master systematic debugging techniques, profiling tools, and root cause analysis to efficiently track down bugs across any codebase or technology stack. Use when investigating bugs, performance issues, or unexpected behavior. | `.agent/skills/debugging-strategies/SKILL.md` |
| debugging-toolkit-smart-debug | "Use when working with debugging toolkit smart debug" | `.agent/skills/debugging-toolkit-smart-debug/SKILL.md` |
| dependency-management-deps-audit | "You are a dependency security expert specializing in vulnerability scanning, license compliance, and supply chain security. Analyze project dependencies for known vulnerabilities, licensing issues, outdated packages, and provide actionable remediation strategies." | `.agent/skills/dependency-management-deps-audit/SKILL.md` |
| deployment-engineer | MASTER DEPLOY: CI/CD Pipelines, Docker, K8s, GitOps. | `.agent/skills/deployment-engineer/SKILL.md` |
| deployment-pipeline-design | Design multi-stage CI/CD pipelines with approval gates, security checks, and deployment orchestration. Use when architecting deployment workflows, setting up continuous delivery, or implementing GitOps practices. | `.agent/skills/deployment-pipeline-design/SKILL.md` |
| deployment-procedures | Production deployment principles and decision-making. | `.agent/skills/deployment-procedures/SKILL.md` |
| deployment-validation-config-validate | "You are a configuration management expert specializing in validating, testing, and ensuring the correctness of application configurations. Create comprehensive validation schemas, implement configurat" | `.agent/skills/deployment-validation-config-validate/SKILL.md` |
| design-orchestration | > Orchestrates design workflows by routing work through brainstorming, multi-agent review, and execution readiness in the correct order. Prevents premature implementation, skipped validation, and unreviewed high-risk designs. | `.agent/skills/design-orchestration/SKILL.md` |
| devops-troubleshooter | Expert DevOps troubleshooter specializing in rapid incident response, advanced debugging, and modern observability. Masters log analysis, distributed tracing, Kubernetes debugging, performance optimization, and root cause analysis. Handles production outages, system reliability, and preventive monitoring. Use PROACTIVELY for debugging, incident response, or system troubleshooting. | `.agent/skills/devops-troubleshooter/SKILL.md` |
| distributed-debugging-debug-trace | "You are a debugging expert specializing in setting up comprehensive debugging environments, distributed tracing, and diagnostic tools. Configure debugging workflows, implement tracing solutions, and establish troubleshooting practices for development and production environments." | `.agent/skills/distributed-debugging-debug-trace/SKILL.md` |
| doc-coauthoring | Guide users through a structured workflow for co-authoring documentation. Use when user wants to write documentation, proposals, technical specs, decision docs, or similar structured content. This workflow helps users efficiently transfer context, refine content through iteration, and verify the doc works for readers. Trigger when user mentions writing docs, creating proposals, drafting specs, or similar documentation tasks. | `.agent/skills/doc-coauthoring/SKILL.md` |
| docker-expert | Docker containerization expert with deep knowledge of multi-stage builds, image optimization, container security, Docker Compose orchestration, and production deployment patterns. Use PROACTIVELY for Dockerfile optimization, container issues, image size problems, security hardening, networking, and orchestration challenges. | `.agent/skills/docker-expert/SKILL.md` |
| documentation-generation-doc-generate | "You are a documentation expert specializing in creating comprehensive, maintainable documentation from code. Generate API docs, architecture diagrams, user guides, and technical references using AI-powered analysis and industry best practices." | `.agent/skills/documentation-generation-doc-generate/SKILL.md` |
| documentation-templates | Documentation templates and structure guidelines. README, API docs, code comments. | `.agent/skills/documentation-templates/SKILL.md` |
| e2e-testing-patterns | Master end-to-end testing with Playwright and Cypress to build reliable test suites that catch bugs, improve confidence, and enable fast deployment. Use when implementing E2E tests, debugging flaky tests, or establishing testing standards. | `.agent/skills/e2e-testing-patterns/SKILL.md` |
| environment-setup-guide | "Guide developers through setting up development environments with proper tools, dependencies, and configurations" | `.agent/skills/environment-setup-guide/SKILL.md` |
| error-debugging-error-analysis | "You are an expert error analysis specialist with deep expertise in debugging distributed systems, analyzing production incidents, and implementing comprehensive observability solutions." | `.agent/skills/error-debugging-error-analysis/SKILL.md` |
| error-debugging-error-trace | "You are an error tracking and observability expert specializing in implementing comprehensive error monitoring solutions. Set up error tracking systems, configure alerts, implement structured logging, and ensure teams can quickly identify and resolve production issues." | `.agent/skills/error-debugging-error-trace/SKILL.md` |
| error-diagnostics-error-analysis | "You are an expert error analysis specialist with deep expertise in debugging distributed systems, analyzing production incidents, and implementing comprehensive observability solutions." | `.agent/skills/error-diagnostics-error-analysis/SKILL.md` |
| Ethical Hacking Methodology | This skill should be used when the user asks to "learn ethical hacking", "understand penetration testing lifecycle", "perform reconnaissance", "conduct security scanning", "exploit vulnerabilities", or "write penetration test reports". It provides comprehensive ethical hacking methodology and techniques. | `.agent/skills/ethical-hacking-methodology/SKILL.md` |
| event-store-design | Design and implement event stores for event-sourced systems. Use when building event sourcing infrastructure, choosing event store technologies, or implementing event persistence patterns. | `.agent/skills/event-store-design/SKILL.md` |
| executing-plans | Use when you have a written implementation plan to execute in a separate session with review checkpoints | `.agent/skills/executing-plans/SKILL.md` |
| fabric-compliance | AI Safety and Ethics Enforcement using Fabric Patterns. | `.agent/skills/fabric-compliance/SKILL.md` |
| fastapi-pro | Build high-performance async APIs with FastAPI, SQLAlchemy 2.0, and Pydantic V2. Master microservices, WebSockets, and modern Python async patterns. Use PROACTIVELY for FastAPI development, async optimization, or API architecture. | `.agent/skills/fastapi-pro/SKILL.md` |
| fastapi-templates | Create production-ready FastAPI projects with async patterns, dependency injection, and comprehensive error handling. Use when building new FastAPI applications or setting up backend API projects. | `.agent/skills/fastapi-templates/SKILL.md` |
| free-tool-strategy | When the user wants to plan, evaluate, or build a free tool for marketing purposes — lead generation, SEO value, or brand awareness. Also use when the user mentions "engineering as marketing," "free tool," "marketing tool," "calculator," "generator," "interactive tool," "lead gen tool," "build a tool for leads," or "free resource." This skill bridges engineering and marketing — useful for founders and technical marketers. | `.agent/skills/free-tool-strategy/SKILL.md` |
| frontend-design | Design thinking and decision-making for web UI. | `.agent/skills/frontend-design/SKILL.md` |
| frontend-dev-guidelines | Opinionated frontend development standards for modern React + TypeScript applications. Covers Suspense-first data fetching, lazy loading, feature-based architecture, MUI v7 styling, TanStack Router, performance optimization, and strict TypeScript practices. | `.agent/skills/frontend-dev-guidelines/SKILL.md` |
| frontend-developer | Build React components, implement responsive layouts, and handle client-side state management. Masters React 19, Next.js 15, and modern frontend architecture. Optimizes performance and ensures accessibility. Use PROACTIVELY when creating UI components or fixing frontend issues. | `.agent/skills/frontend-developer/SKILL.md` |
| frontend-mobile-development-component-scaffold | "You are a React component architecture expert specializing in scaffolding production-ready, accessible, and performant components. Generate complete component implementations with TypeScript, tests, s" | `.agent/skills/frontend-mobile-development-component-scaffold/SKILL.md` |
| frontend-mobile-security-xss-scan | "You are a frontend security specialist focusing on Cross-Site Scripting (XSS) vulnerability detection and prevention. Analyze React, Vue, Angular, and vanilla JavaScript code to identify injection poi" | `.agent/skills/frontend-mobile-security-xss-scan/SKILL.md` |
| frontend-security-coder | Expert in secure frontend coding practices specializing in XSS prevention, output sanitization, and client-side security patterns. Use PROACTIVELY for frontend security implementations or client-side security code reviews. | `.agent/skills/frontend-security-coder/SKILL.md` |
| full-stack-orchestration-full-stack-feature | "Use when working with full stack orchestration full stack feature" | `.agent/skills/full-stack-orchestration-full-stack-feature/SKILL.md` |
| full-stack-scaffold | Unified project scaffolding for Node.js, Python, Rust, and Mobile. | `.agent/skills/full-stack-scaffold/SKILL.md` |
| gcp-cloud-run | "Specialized skill for building production-ready serverless applications on GCP. Covers Cloud Run services (containerized), Cloud Run Functions (event-driven), cold start optimization, and event-driven architecture with Pub/Sub." | `.agent/skills/gcp-cloud-run/SKILL.md` |
| gdpr-data-handling | Implement GDPR-compliant data handling with consent management, data subject rights, and privacy by design. Use when building systems that process EU personal data, implementing privacy controls, or conducting GDPR compliance reviews. | `.agent/skills/gdpr-data-handling/SKILL.md` |
| git-advanced-workflows | Master advanced Git workflows including rebasing, cherry-picking, bisect, worktrees, and reflog to maintain clean history and recover from any situation. Use when managing complex Git histories, collaborating on feature branches, or troubleshooting repository issues. | `.agent/skills/git-advanced-workflows/SKILL.md` |
| git-collaboration-master | Master Git workflows and high-performance team collaboration. | `.agent/skills/git-collaboration-master/SKILL.md` |
| git-pr-workflows-git-workflow | "Orchestrate a comprehensive git workflow from code review through PR creation, leveraging specialized agents for quality assurance, testing, and deployment readiness. This workflow implements modern g" | `.agent/skills/git-pr-workflows-git-workflow/SKILL.md` |
| git-pr-workflows-onboard | "You are an **expert onboarding specialist and knowledge transfer architect** with deep experience in remote-first organizations, technical team integration, and accelerated learning methodologies. You" | `.agent/skills/git-pr-workflows-onboard/SKILL.md` |
| git-pr-workflows-pr-enhance | "You are a PR optimization expert specializing in creating high-quality pull requests that facilitate efficient code reviews. Generate comprehensive PR descriptions, automate review processes, and ensu" | `.agent/skills/git-pr-workflows-pr-enhance/SKILL.md` |
| git-pushing | Stage, commit, and push git changes with conventional commit messages. Use when user wants to commit and push changes, mentions pushing to remote, or asks to save and push their work. Also activates when user says "push changes", "commit and push", "push this", "push to github", or similar git workflow requests. | `.agent/skills/git-pushing/SKILL.md` |
| github-actions-templates | Create production-ready GitHub Actions workflows for automated testing, building, and deploying applications. Use when setting up CI/CD with GitHub Actions, automating development workflows, or creating reusable workflow templates. | `.agent/skills/github-actions-templates/SKILL.md` |
| github-mcp | Official GitHub Model Context Protocol Server for repository management. | `.agent/skills/github-mcp/SKILL.md` |
| github-workflow-automation | "Automate GitHub workflows with AI assistance. Includes PR reviews, issue triage, CI/CD integration, and Git operations. Use when automating GitHub workflows, setting up PR review automation, creating GitHub Actions, or triaging issues." | `.agent/skills/github-workflow-automation/SKILL.md` |
| gitlab-ci-patterns | Build GitLab CI/CD pipelines with multi-stage workflows, caching, and distributed runners for scalable automation. Use when implementing GitLab CI/CD, optimizing pipeline performance, or setting up automated testing and deployment. | `.agent/skills/gitlab-ci-patterns/SKILL.md` |
| gitops-workflow | Implement GitOps workflows with ArgoCD and Flux for automated, declarative Kubernetes deployments with continuous reconciliation. Use when implementing GitOps practices, automating Kubernetes deployments, or setting up declarative infrastructure management. | `.agent/skills/gitops-workflow/SKILL.md` |
| grafana-dashboards | Create and manage production Grafana dashboards for real-time visualization of system and application metrics. Use when building monitoring dashboards, visualizing metrics, or creating operational observability interfaces. | `.agent/skills/grafana-dashboards/SKILL.md` |
| graphql | "GraphQL gives clients exactly the data they need - no more, no less. One endpoint, typed schema, introspection. But the flexibility that makes it powerful also makes it dangerous. Without proper controls, clients can craft queries that bring down your server.  This skill covers schema design, resolvers, DataLoader for N+1 prevention, federation for microservices, and client integration with Apollo/urql. Key insight: GraphQL is a contract. The schema is the API documentation. Design it carefully." | `.agent/skills/graphql/SKILL.md` |
| graphql-architect | Master modern GraphQL with federation, performance optimization, and enterprise security. Build scalable schemas, implement advanced caching, and design real-time systems. Use PROACTIVELY for GraphQL architecture or performance optimization. | `.agent/skills/graphql-architect/SKILL.md` |
| helm-chart-scaffolding | Design, organize, and manage Helm charts for templating and packaging Kubernetes applications with reusable configurations. Use when creating Helm charts, packaging Kubernetes applications, or implementing templated deployments. | `.agent/skills/helm-chart-scaffolding/SKILL.md` |
| hybrid-cloud-architect | Expert hybrid cloud architect specializing in complex multi-cloud solutions across AWS/Azure/GCP and private clouds (OpenStack/VMware). Masters hybrid connectivity, workload placement optimization, edge computing, and cross-cloud automation. Handles compliance, cost optimization, disaster recovery, and migration strategies. Use PROACTIVELY for hybrid architecture, multi-cloud strategy, or complex infrastructure integration. | `.agent/skills/hybrid-cloud-architect/SKILL.md` |
| hybrid-cloud-networking | Configure secure, high-performance connectivity between on-premises infrastructure and cloud platforms using VPN and dedicated connections. Use when building hybrid cloud architectures, connecting data centers to cloud, or implementing secure cross-premises networking. | `.agent/skills/hybrid-cloud-networking/SKILL.md` |
| IDOR Vulnerability Testing | This skill should be used when the user asks to "test for insecure direct object references," "find IDOR vulnerabilities," "exploit broken access control," "enumerate user IDs or object references," or "bypass authorization to access other users' data." It provides comprehensive guidance for detecting, exploiting, and remediating IDOR vulnerabilities in web applications. | `.agent/skills/idor-testing/SKILL.md` |
| istio-traffic-management | Configure Istio traffic management including routing, load balancing, circuit breakers, and canary deployments. Use when implementing service mesh traffic policies, progressive delivery, or resilience patterns. | `.agent/skills/istio-traffic-management/SKILL.md` |
| javascript-mastery | "Comprehensive JavaScript reference covering 33+ essential concepts every developer should know. From fundamentals like primitives and closures to advanced patterns like async/await and functional programming. Use when explaining JS concepts, debugging JavaScript issues, or teaching JavaScript fundamentals." | `.agent/skills/javascript-mastery/SKILL.md` |
| javascript-pro | Master modern JavaScript with ES6+, async patterns, and Node.js APIs. Handles promises, event loops, and browser/Node compatibility. Use PROACTIVELY for JavaScript optimization, async debugging, or complex JS patterns. | `.agent/skills/javascript-pro/SKILL.md` |
| javascript-testing-patterns | Implement comprehensive testing strategies using Jest, Vitest, and Testing Library for unit tests, integration tests, and end-to-end testing with mocking, fixtures, and test-driven development. Use when writing JavaScript/TypeScript tests, setting up test infrastructure, or implementing TDD/BDD workflows. | `.agent/skills/javascript-testing-patterns/SKILL.md` |
| javascript-typescript-typescript-scaffold | "You are a TypeScript project architecture expert specializing in scaffolding production-ready Node.js and frontend applications. Generate complete project structures with modern tooling (pnpm, Vite, N" | `.agent/skills/javascript-typescript-typescript-scaffold/SKILL.md` |
| k8s-manifest-generator | Create production-ready Kubernetes manifests for Deployments, Services, ConfigMaps, and Secrets following best practices and security standards. Use when generating Kubernetes YAML manifests, creating K8s resources, or implementing production-grade Kubernetes configurations. | `.agent/skills/k8s-manifest-generator/SKILL.md` |
| k8s-security-policies | Implement Kubernetes security policies including NetworkPolicy, PodSecurityPolicy, and RBAC for production-grade security. Use when securing Kubernetes clusters, implementing network isolation, or enforcing pod security standards. | `.agent/skills/k8s-security-policies/SKILL.md` |
| kpi-dashboard-design | Design effective KPI dashboards with metrics selection, visualization best practices, and real-time monitoring patterns. Use when building business dashboards, selecting metrics, or designing data visualization layouts. | `.agent/skills/kpi-dashboard-design/SKILL.md` |
| kubernetes-architect | Expert Kubernetes architect specializing in cloud-native infrastructure, advanced GitOps workflows (ArgoCD/Flux), and enterprise container orchestration. Masters EKS/AKS/GKE, service mesh (Istio/Linkerd), progressive delivery, multi-tenancy, and platform engineering. Handles security, observability, cost optimization, and developer experience. Use PROACTIVELY for K8s architecture, GitOps implementation, or cloud-native platform design. | `.agent/skills/kubernetes-architect/SKILL.md` |
| launch-strategy | "When the user wants to plan a product launch, feature announcement, or release strategy. Also use when the user mentions 'launch,' 'Product Hunt,' 'feature release,' 'announcement,' 'go-to-market,' 'beta launch,' 'early access,' 'waitlist,' or 'product update.' This skill covers phased launches, channel strategy, and ongoing launch momentum." | `.agent/skills/launch-strategy/SKILL.md` |
| malware-analyst | MASTER MALWARE ANALYSIS: Threat Intelligence, Phishing Detection. | `.agent/skills/malware-analyst/SKILL.md` |
| market-sizing-analysis | This skill should be used when the user asks to "calculate TAM", "determine SAM", "estimate SOM", "size the market", "calculate market opportunity", "what's the total addressable market", or requests market sizing analysis for a startup or business opportunity. | `.agent/skills/market-sizing-analysis/SKILL.md` |
| mcp-builder | MCP (Model Context Protocol) server building principles. | `.agent/skills/mcp-builder/SKILL.md` |
| memory-forensics | Master memory forensics techniques including memory acquisition, process analysis, and artifact extraction using Volatility and related tools. Use when analyzing memory dumps, investigating incidents, or performing malware analysis from RAM captures. | `.agent/skills/memory-forensics/SKILL.md` |
| mobile-design | Mobile-first design thinking and decision-making for iOS and Android apps. | `.agent/skills/mobile-design/SKILL.md` |
| mobile-developer | Develop React Native, Flutter, or native mobile apps with modern architecture patterns. Masters cross-platform development, native integrations, offline sync, and app store optimization. Use PROACTIVELY for mobile features, cross-platform code, or app optimization. | `.agent/skills/mobile-developer/SKILL.md` |
| mobile-security-coder | Expert in secure mobile coding practices specializing in input validation, WebView security, and mobile-specific security patterns. Use PROACTIVELY for mobile security implementations or mobile security code reviews. | `.agent/skills/mobile-security-coder/SKILL.md` |
| modern-javascript-patterns | Master ES6+ features including async/await, destructuring, spread operators, arrow functions, promises, modules, iterators, generators, and functional programming patterns for writing clean, efficient JavaScript code. Use when refactoring legacy code, implementing modern patterns, or optimizing JavaScript applications. | `.agent/skills/modern-javascript-patterns/SKILL.md` |
| modern-web-architect | Master Frontend & Web Architecture. | `.agent/skills/modern-web-architect/SKILL.md` |
| modern-web-performance | High-Performance Web Engineering. | `.agent/skills/modern-web-performance/SKILL.md` |
| multi-cloud-architecture | Design multi-cloud architectures using a decision framework to select and integrate services across AWS, Azure, and GCP. Use when building multi-cloud systems, avoiding vendor lock-in, or leveraging best-of-breed services from multiple providers. | `.agent/skills/multi-cloud-architecture/SKILL.md` |
| nestjs-expert | Nest.js framework expert specializing in module architecture, dependency injection, middleware, guards, interceptors, testing with Jest/Supertest, TypeORM/Mongoose integration, and Passport.js authentication. Use PROACTIVELY for any Nest.js application issues including architecture decisions, testing strategies, performance optimization, or debugging complex dependency injection problems. If a specialized expert is a better fit, I will recommend switching and stop. | `.agent/skills/nestjs-expert/SKILL.md` |
| nextjs-app-router-patterns | Master Next.js 14+ App Router with Server Components, streaming, parallel routes, and advanced data fetching. Use when building Next.js applications, implementing SSR/SSG, or optimizing React Server Components. | `.agent/skills/nextjs-app-router-patterns/SKILL.md` |
| nextjs-best-practices | Next.js App Router principles. Server Components, data fetching, routing patterns. | `.agent/skills/nextjs-best-practices/SKILL.md` |
| nextjs-react-expert | React and Next.js performance optimization from Vercel Engineering. | `.agent/skills/nextjs-react-expert/SKILL.md` |
| nextjs-supabase-auth | "Expert integration of Supabase Auth with Next.js App Router Use when: supabase auth next, authentication next.js, login supabase, auth middleware, protected route." | `.agent/skills/nextjs-supabase-auth/SKILL.md` |
| nodejs-backend-patterns | Build production-ready Node.js backend services with Express/Fastify, implementing middleware patterns, error handling, authentication, database integration, and API design best practices. Use when creating Node.js servers, REST APIs, GraphQL backends, or microservices architectures. | `.agent/skills/nodejs-backend-patterns/SKILL.md` |
| nodejs-best-practices | Node.js development principles and decision-making. | `.agent/skills/nodejs-best-practices/SKILL.md` |
| nx-workspace-patterns | Configure and optimize Nx monorepo workspaces. Use when setting up Nx, configuring project boundaries, optimizing build caching, or implementing affected commands. | `.agent/skills/nx-workspace-patterns/SKILL.md` |
| observability-engineer | Build production-ready monitoring, logging, and tracing systems. Implements comprehensive observability strategies, SLI/SLO management, and incident response workflows. Use PROACTIVELY for monitoring infrastructure, performance optimization, or production reliability. | `.agent/skills/observability-engineer/SKILL.md` |
| observability-monitoring-monitor-setup | "You are a monitoring and observability expert specializing in implementing comprehensive monitoring solutions. Set up metrics collection, distributed tracing, log aggregation, and create insightful da" | `.agent/skills/observability-monitoring-monitor-setup/SKILL.md` |
| observability-monitoring-slo-implement | "You are an SLO (Service Level Objective) expert specializing in implementing reliability standards and error budget-based practices. Design SLO frameworks, define SLIs, and build monitoring that balances reliability with delivery velocity." | `.agent/skills/observability-monitoring-slo-implement/SKILL.md` |
| openapi-spec-generation | Generate and maintain OpenAPI 3.1 specifications from code, design-first specs, and validation patterns. Use when creating API documentation, generating SDKs, or ensuring API contract compliance. | `.agent/skills/openapi-spec-generation/SKILL.md` |
| pci-compliance | Implement PCI DSS compliance requirements for secure handling of payment card data and payment systems. Use when securing payment processing, achieving PCI compliance, or implementing payment card security measures. | `.agent/skills/pci-compliance/SKILL.md` |
| penetration-tester-master | Ultimate Offensive Security Master Skill. | `.agent/skills/penetration-tester-master/SKILL.md` |
| Pentest Checklist | This skill should be used when the user asks to "plan a penetration test", "create a security assessment checklist", "prepare for penetration testing", "define pentest scope", "follow security testing best practices", or needs a structured methodology for penetration testing engagements. | `.agent/skills/pentest-checklist/SKILL.md` |
| Pentest Commands | This skill should be used when the user asks to "run pentest commands", "scan with nmap", "use metasploit exploits", "crack passwords with hydra or john", "scan web vulnerabilities with nikto", "enumerate networks", or needs essential penetration testing command references. | `.agent/skills/pentest-commands/SKILL.md` |
| personal-tool-builder | "Expert in building custom tools that solve your own problems first. The best products often start as personal tools - scratch your own itch, build for yourself, then discover others have the same itch. Covers rapid prototyping, local-first apps, CLI tools, scripts that grow into products, and the art of dogfooding. Use when: build a tool, personal tool, scratch my itch, solve my problem, CLI tool." | `.agent/skills/personal-tool-builder/SKILL.md` |
| plan-writing | Structured task planning with clear breakdowns, dependencies, and verification criteria. | `.agent/skills/plan-writing/SKILL.md` |
| planning-with-files | Implements Manus-style file-based planning for complex tasks. Creates task_plan.md, findings.md, and progress.md. Use when starting complex multi-step tasks, research projects, or any task requiring >5 tool calls. | `.agent/skills/planning-with-files/SKILL.md` |
| playwright-skill | Complete browser automation with Playwright. Auto-detects dev servers, writes clean test scripts to /tmp. Test pages, fill forms, take screenshots, check responsive design, validate UX, test login flows, check links, automate any browser task. Use when user wants to test websites, automate browser interactions, validate web functionality, or perform any browser-based testing. | `.agent/skills/playwright-skill/SKILL.md` |
| posix-shell-pro | Expert in strict POSIX sh scripting for maximum portability across Unix-like systems. Specializes in shell scripts that run on any POSIX-compliant shell (dash, ash, sh, bash --posix). | `.agent/skills/posix-shell-pro/SKILL.md` |
| powershell-windows | PowerShell Windows patterns and pitfalls. | `.agent/skills/powershell-windows/SKILL.md` |
| prometheus-configuration | Set up Prometheus for comprehensive metric collection, storage, and monitoring of infrastructure and applications. Use when implementing metrics collection, setting up monitoring infrastructure, or configuring alerting systems. | `.agent/skills/prometheus-configuration/SKILL.md` |
| puppeteer-mcp | Official Puppeteer Model Context Protocol Server for browser automation. | `.agent/skills/puppeteer-mcp/SKILL.md` |
| python-testing-patterns | Implement comprehensive testing strategies with pytest, fixtures, mocking, and test-driven development. Use when writing Python tests, setting up test suites, or implementing testing best practices. | `.agent/skills/python-testing-patterns/SKILL.md` |
| react-best-practices | React & Next.js engineering standards. | `.agent/skills/react-best-practices/SKILL.md` |
| react-modernization | Upgrade React applications to latest versions, migrate from class components to hooks, and adopt concurrent features. Use when modernizing React codebases, migrating to React Hooks, or upgrading to latest React versions. | `.agent/skills/react-modernization/SKILL.md` |
| react-native-architecture | Build production React Native apps with Expo, navigation, native modules, offline sync, and cross-platform patterns. Use when developing mobile apps, implementing native integrations, or architecting React Native projects. | `.agent/skills/react-native-architecture/SKILL.md` |
| react-native-best-practices | React Native & Expo engineering standards. | `.agent/skills/react-native-best-practices/SKILL.md` |
| react-patterns | Modern React patterns and principles. Hooks, composition, performance, TypeScript best practices. | `.agent/skills/react-patterns/SKILL.md` |
| react-state-management | Master modern React state management with Redux Toolkit, Zustand, Jotai, and React Query. Use when setting up global state, managing server state, or choosing between state management solutions. | `.agent/skills/react-state-management/SKILL.md` |
| react-ui-patterns | Modern React UI patterns for loading states, error handling, and data fetching. Use when building UI components, handling async data, or managing UI states. | `.agent/skills/react-ui-patterns/SKILL.md` |
| receiving-code-review | Use when receiving code review feedback, before implementing suggestions, especially if feedback seems unclear or technically questionable - requires technical rigor and verification, not performative agreement or blind implementation | `.agent/skills/receiving-code-review/SKILL.md` |
| red-team-tactics | Red team tactics principles based on MITRE ATT&CK. | `.agent/skills/red-team-tactics/SKILL.md` |
| Red Team Tools and Methodology | This skill should be used when the user asks to "follow red team methodology", "perform bug bounty hunting", "automate reconnaissance", "hunt for XSS vulnerabilities", "enumerate subdomains", or needs security researcher techniques and tool configurations from top bug bounty hunters. | `.agent/skills/red-team-tools/SKILL.md` |
| reference-builder | Creates exhaustive technical references and API documentation. Generates comprehensive parameter listings, configuration guides, and searchable reference materials. Use PROACTIVELY for API docs, configuration references, or complete technical specifications. | `.agent/skills/reference-builder/SKILL.md` |
| requesting-code-review | Use when completing tasks, implementing major features, or before merging to verify work meets requirements | `.agent/skills/requesting-code-review/SKILL.md` |
| research-engineer | "An uncompromising Academic Research Engineer. Operates with absolute scientific rigor, objective criticism, and zero flair. Focuses on theoretical correctness, formal verification, and optimal implementation across any required technology." | `.agent/skills/research-engineer/SKILL.md` |
| Security Scanning Tools | This skill should be used when the user asks to "perform vulnerability scanning", "scan networks for open ports", "assess web application security", "scan wireless networks", "detect malware", "check cloud security", or "evaluate system compliance". It provides comprehensive guidance on security scanning tools and methodologies. | `.agent/skills/scanning-tools/SKILL.md` |
| screen-reader-testing | Test web applications with screen readers including VoiceOver, NVDA, and JAWS. Use when validating screen reader compatibility, debugging accessibility issues, or ensuring assistive technology support. | `.agent/skills/screen-reader-testing/SKILL.md` |
| security-auditor | MASTER SECURITY: OWASP Top 10, SAST/DAST, PenTest. | `.agent/skills/security-auditor/SKILL.md` |
| security-compliance-compliance-check | "You are a compliance expert specializing in regulatory requirements for software systems including GDPR, HIPAA, SOC2, PCI-DSS, and other industry standards. Perform compliance audits and provide implementation guidance." | `.agent/skills/security-compliance-compliance-check/SKILL.md` |
| security-requirement-extraction | Derive security requirements from threat models and business context. Use when translating threats into actionable requirements, creating security user stories, or building security test cases. | `.agent/skills/security-requirement-extraction/SKILL.md` |
| security-scanning-security-dependencies | "You are a security expert specializing in dependency vulnerability analysis, SBOM generation, and supply chain security. Scan project dependencies across ecosystems to identify vulnerabilities, assess risks, and recommend remediation." | `.agent/skills/security-scanning-security-dependencies/SKILL.md` |
| security-scanning-security-hardening | "Coordinate multi-layer security scanning and hardening across application, infrastructure, and compliance controls." | `.agent/skills/security-scanning-security-hardening/SKILL.md` |
| security-scanning-security-sast | Static Application Security Testing (SAST) for code vulnerability analysis across multiple languages and frameworks | `.agent/skills/security-scanning-security-sast/SKILL.md` |
| seo-authority-builder | Analyzes content for E-E-A-T signals and suggests improvements to build authority and trust. Identifies missing credibility elements. Use PROACTIVELY for YMYL topics. | `.agent/skills/seo-authority-builder/SKILL.md` |
| server-management | Server management principles and decision-making. | `.agent/skills/server-management/SKILL.md` |
| service-mesh-observability | Implement comprehensive observability for service meshes including distributed tracing, metrics, and visualization. Use when setting up mesh monitoring, debugging latency issues, or implementing SLOs for service communication. | `.agent/skills/service-mesh-observability/SKILL.md` |
| shellcheck-configuration | Master ShellCheck static analysis configuration and usage for shell script quality. Use when setting up linting infrastructure, fixing code issues, or ensuring script portability. | `.agent/skills/shellcheck-configuration/SKILL.md` |
| slack-bot-builder | "Build Slack apps using the Bolt framework across Python, JavaScript, and Java. Covers Block Kit for rich UIs, interactive components, slash commands, event handling, OAuth installation flows, and Workflow Builder integration. Focus on best practices for production-ready Slack apps. Use when: slack bot, slack app, bolt framework, block kit, slash command." | `.agent/skills/slack-bot-builder/SKILL.md` |
| SMTP Penetration Testing | This skill should be used when the user asks to "perform SMTP penetration testing", "enumerate email users", "test for open mail relays", "grab SMTP banners", "brute force email credentials", or "assess mail server security". It provides comprehensive techniques for testing SMTP server security. | `.agent/skills/smtp-penetration-testing/SKILL.md` |
| software-architecture | Guide for quality focused software architecture. This skill should be used when users want to write code, design architecture, analyze code, in any case that relates to software development. | `.agent/skills/software-architecture/SKILL.md` |
| SQL Injection Testing | This skill should be used when the user asks to "test for SQL injection vulnerabilities", "perform SQLi attacks", "bypass authentication using SQL injection", "extract database information through injection", "detect SQL injection flaws", or "exploit database query vulnerabilities". It provides comprehensive techniques for identifying, exploiting, and understanding SQL injection attack vectors across different database systems. | `.agent/skills/sql-injection-testing/SKILL.md` |
| SQLMap Database Penetration Testing | This skill should be used when the user asks to "automate SQL injection testing," "enumerate database structure," "extract database credentials using sqlmap," "dump tables and columns from a vulnerable database," or "perform automated database penetration testing." It provides comprehensive guidance for using SQLMap to detect and exploit SQL injection vulnerabilities. | `.agent/skills/sqlmap-database-pentesting/SKILL.md` |
| SSH Penetration Testing | This skill should be used when the user asks to "pentest SSH services", "enumerate SSH configurations", "brute force SSH credentials", "exploit SSH vulnerabilities", "perform SSH tunneling", or "audit SSH security". It provides comprehensive SSH penetration testing methodologies and techniques. | `.agent/skills/ssh-penetration-testing/SKILL.md` |
| strategic-research |  | `.agent/skills/strategic-research/SKILL.md` |
| stride-analysis-patterns | Apply STRIDE methodology to systematically identify threats. Use when analyzing system security, conducting threat modeling sessions, or creating security documentation. | `.agent/skills/stride-analysis-patterns/SKILL.md` |
| systematic-debugging | 4-phase systematic debugging methodology with root cause analysis and evidence-based verification. | `.agent/skills/systematic-debugging/SKILL.md` |
| tailwind-design-system | Build scalable design systems with Tailwind CSS, design tokens, component libraries, and responsive patterns. Use when creating component libraries, implementing design systems, or standardizing UI patterns. | `.agent/skills/tailwind-design-system/SKILL.md` |
| tailwind-patterns | Tailwind CSS v4 principles and modern design tokens. | `.agent/skills/tailwind-patterns/SKILL.md` |
| tavily-web | Web search, content extraction, crawling, and research capabilities using Tavily API | `.agent/skills/tavily-web/SKILL.md` |
| tdd-master-workflow | Comprehensive Test-Driven Development (TDD) cycle. | `.agent/skills/tdd-master-workflow/SKILL.md` |
| tdd-orchestrator | Master TDD orchestrator specializing in red-green-refactor discipline, multi-agent workflow coordination, and comprehensive test-driven development practices. Enforces TDD best practices across teams with AI-assisted testing and modern frameworks. Use PROACTIVELY for TDD implementation and governance. | `.agent/skills/tdd-orchestrator/SKILL.md` |
| tdd-workflow | Test-Driven Development workflow principles. RED-GREEN-REFACTOR cycle. | `.agent/skills/tdd-workflow/SKILL.md` |
| tdd-workflows-tdd-cycle | "Use when working with tdd workflows tdd cycle" | `.agent/skills/tdd-workflows-tdd-cycle/SKILL.md` |
| tdd-workflows-tdd-green | Implement the minimal code needed to make failing tests pass in the TDD green phase. | `.agent/skills/tdd-workflows-tdd-green/SKILL.md` |
| tdd-workflows-tdd-red | Generate failing tests for the TDD red phase to define expected behavior and edge cases. | `.agent/skills/tdd-workflows-tdd-red/SKILL.md` |
| tdd-workflows-tdd-refactor | "Use when working with tdd workflows tdd refactor" | `.agent/skills/tdd-workflows-tdd-refactor/SKILL.md` |
| team-composition-analysis | This skill should be used when the user asks to "plan team structure", "determine hiring needs", "design org chart", "calculate compensation", "plan equity allocation", or requests organizational design and headcount planning for a startup. | `.agent/skills/team-composition-analysis/SKILL.md` |
| telegram-bot-builder | "Expert in building Telegram bots that solve real problems - from simple automation to complex AI-powered bots. Covers bot architecture, the Telegram Bot API, user experience, monetization strategies, and scaling bots to thousands of users. Use when: telegram bot, bot api, telegram automation, chat bot telegram, tg bot." | `.agent/skills/telegram-bot-builder/SKILL.md` |
| temporal-python-testing | Test Temporal workflows with pytest, time-skipping, and mocking strategies. Covers unit testing, integration testing, replay testing, and local development setup. Use when implementing Temporal workflow tests or debugging test failures. | `.agent/skills/temporal-python-testing/SKILL.md` |
| terraform-module-library | Build reusable Terraform modules for AWS, Azure, and GCP infrastructure following infrastructure-as-code best practices. Use when creating infrastructure modules, standardizing cloud provisioning, or implementing reusable IaC components. | `.agent/skills/terraform-module-library/SKILL.md` |
| terraform-specialist | Expert Terraform/OpenTofu specialist mastering advanced IaC automation, state management, and enterprise infrastructure patterns. Handles complex module design, multi-cloud deployments, GitOps workflows, policy as code, and CI/CD integration. Covers migration strategies, security best practices, and modern IaC ecosystems. Use PROACTIVELY for advanced IaC, state management, or infrastructure automation. | `.agent/skills/terraform-specialist/SKILL.md` |
| test-automator | Master AI-powered test automation with modern frameworks, self-healing tests, and comprehensive quality engineering. Build scalable testing strategies with advanced CI/CD integration. Use PROACTIVELY for testing automation or quality assurance. | `.agent/skills/test-automator/SKILL.md` |
| test-driven-development | Use when implementing any feature or bugfix, before writing implementation code | `.agent/skills/test-driven-development/SKILL.md` |
| test-fixing | Run tests and systematically fix all failing tests using smart error grouping. Use when user asks to fix failing tests, mentions test failures, runs test suite and failures occur, or requests to make tests pass. | `.agent/skills/test-fixing/SKILL.md` |
| testing-automation-mcp | Autonomous E2E testing using Playwright Model Context Protocol (MCP). | `.agent/skills/testing-automation-mcp/SKILL.md` |
| testing-patterns | Testing patterns and principles. Unit, integration, mocking strategies. | `.agent/skills/testing-patterns/SKILL.md` |
| theme-factory | Toolkit for styling artifacts with a theme. These artifacts can be slides, docs, reportings, HTML landing pages, etc. There are 10 pre-set themes with colors/fonts that you can apply to any artifact that has been creating, or can generate a new theme on-the-fly. | `.agent/skills/theme-factory/SKILL.md` |
| threat-mitigation-mapping | Map identified threats to appropriate security controls and mitigations. Use when prioritizing security investments, creating remediation plans, or validating control effectiveness. | `.agent/skills/threat-mitigation-mapping/SKILL.md` |
| threat-modeling-expert | "Expert in threat modeling methodologies, security architecture review, and risk assessment. Masters STRIDE, PASTA, attack trees, and security requirement extraction. Use for security architecture reviews, threat identification, and secure-by-design planning." | `.agent/skills/threat-modeling-expert/SKILL.md` |
| Top 100 Web Vulnerabilities Reference | This skill should be used when the user asks to "identify web application vulnerabilities", "explain common security flaws", "understand vulnerability categories", "learn about injection attacks", "review access control weaknesses", "analyze API security issues", "assess security misconfigurations", "understand client-side vulnerabilities", "examine mobile and IoT security flaws", or "reference the OWASP-aligned vulnerability taxonomy". Use this skill to provide comprehensive vulnerability definitions, root causes, impacts, and mitigation strategies across all major web security categories. | `.agent/skills/top-web-vulnerabilities/SKILL.md` |
| turborepo-caching | Configure Turborepo for efficient monorepo builds with local and remote caching. Use when setting up Turborepo, optimizing build pipelines, or implementing distributed caching. | `.agent/skills/turborepo-caching/SKILL.md` |
| typescript-advanced-types | Master TypeScript's advanced type system including generics, conditional types, mapped types, template literals, and utility types for building type-safe applications. Use when implementing complex type logic, creating reusable type utilities, or ensuring compile-time type safety in TypeScript projects. | `.agent/skills/typescript-advanced-types/SKILL.md` |
| typescript-expert | >- TypeScript and JavaScript expert with deep knowledge of type-level programming, performance optimization, monorepo management, migration strategies, and modern tooling. Use PROACTIVELY for any TypeScript/JavaScript issues including complex type gymnastics, build performance, debugging, and architectural decisions. If a specialized expert is a better fit, I will recommend switching and stop. | `.agent/skills/typescript-expert/SKILL.md` |
| typescript-pro | Master TypeScript with advanced types, generics, and strict type safety. Handles complex type systems, decorators, and enterprise-grade patterns. Use PROACTIVELY for TypeScript architecture, type inference optimization, or advanced typing patterns. | `.agent/skills/typescript-pro/SKILL.md` |
| ui-ux-designer | Create interface designs, wireframes, and design systems. Masters user research, accessibility standards, and modern design tools. Specializes in design tokens, component libraries, and inclusive design. Use PROACTIVELY for design systems, user flows, or interface optimization. | `.agent/skills/ui-ux-designer/SKILL.md` |
| ui-ux-pro-max | "UI/UX design intelligence. 50 styles, 21 palettes, 50 font pairings, 20 charts, 9 stacks (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui). Actions: plan, build, create, design, implement, review, fix, improve, optimize, enhance, refactor, check UI/UX code. Projects: website, landing page, dashboard, admin panel, e-commerce, SaaS, portfolio, blog, mobile app, .html, .tsx, .vue, .svelte. Elements: button, modal, navbar, sidebar, card, table, form, chart. Styles: glassmorphism, claymorphism, minimalism, brutalism, neumorphism, bento grid, dark mode, responsive, skeuomorphism, flat design. Topics: color palette, accessibility, animation, layout, typography, font pairing, spacing, hover, shadow, gradient. Integrations: shadcn/ui MCP for component search and examples." | `.agent/skills/ui-ux-pro-max/SKILL.md` |
| ui-ux-pro-max-skill | Premium design and micro-interactions toolkit. | `.agent/skills/ui-ux-pro-max-skill/SKILL.md` |
| ui-visual-validator | Rigorous visual validation expert specializing in UI testing, design system compliance, and accessibility verification. Masters screenshot analysis, visual regression testing, and component validation. Use PROACTIVELY to verify UI modifications have achieved their intended goals through comprehensive visual analysis. | `.agent/skills/ui-visual-validator/SKILL.md` |
| unit-testing-test-generate | Generate comprehensive, maintainable unit tests across languages with strong coverage and edge case focus. | `.agent/skills/unit-testing-test-generate/SKILL.md` |
| using-git-worktrees | Use when starting feature work that needs isolation from current workspace or before executing implementation plans - creates isolated git worktrees with smart directory selection and safety verification | `.agent/skills/using-git-worktrees/SKILL.md` |
| vercel-deploy | Automated Vercel deployment skill. | `.agent/skills/vercel-deploy/SKILL.md` |
| vercel-deployment | "Expert knowledge for deploying to Vercel with Next.js Use when: vercel, deploy, deployment, hosting, production." | `.agent/skills/vercel-deployment/SKILL.md` |
| viral-generator-builder | "Expert in building shareable generator tools that go viral - name generators, quiz makers, avatar creators, personality tests, and calculator tools. Covers the psychology of sharing, viral mechanics, and building tools people can't resist sharing with friends. Use when: generator tool, quiz maker, name generator, avatar creator, viral tool." | `.agent/skills/viral-generator-builder/SKILL.md` |
| vulnerability-scanner | Advanced vulnerability analysis principles. | `.agent/skills/vulnerability-scanner/SKILL.md` |
| wcag-audit-patterns | Conduct WCAG 2.2 accessibility audits with automated testing, manual verification, and remediation guidance. Use when auditing websites for accessibility, fixing WCAG violations, or implementing accessible design patterns. | `.agent/skills/wcag-audit-patterns/SKILL.md` |
| web-artifacts-builder | Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components - not for simple single-file HTML/JSX artifacts. | `.agent/skills/web-artifacts-builder/SKILL.md` |
| web-design-guidelines | Review UI code for Web Interface Guidelines compliance. | `.agent/skills/web-design-guidelines/SKILL.md` |
| web-performance-optimization | "Optimize website and web application performance including loading speed, Core Web Vitals, bundle size, caching strategies, and runtime performance" | `.agent/skills/web-performance-optimization/SKILL.md` |
| webapp-testing | Web application testing principles. E2E, Playwright, deep audit strategies. | `.agent/skills/webapp-testing/SKILL.md` |
| Wireshark Network Traffic Analysis | This skill should be used when the user asks to "analyze network traffic with Wireshark", "capture packets for troubleshooting", "filter PCAP files", "follow TCP/UDP streams", "detect network anomalies", "investigate suspicious traffic", or "perform protocol analysis". It provides comprehensive techniques for network packet capture, filtering, and analysis using Wireshark. | `.agent/skills/wireshark-analysis/SKILL.md` |
| writing-plans | Use when you have a spec or requirements for a multi-step task, before touching code | `.agent/skills/writing-plans/SKILL.md` |
| zapier-make-patterns | "No-code automation democratizes workflow building. Zapier and Make (formerly Integromat) let non-developers automate business processes without writing code. But no-code doesn't mean no-complexity - these platforms have their own patterns, pitfalls, and breaking points.  This skill covers when to use which platform, how to build reliable automations, and when to graduate to code-based solutions. Key insight: Zapier optimizes for simplicity and integrations (7000+ apps), Make optimizes for power " | `.agent/skills/zapier-make-patterns/SKILL.md` |
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
