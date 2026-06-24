# SWP391 - PROJECT AI USAGE REPORT
**DỰ ÁN: MOCKAI-INTERVIEW (NỀN TẢNG LUYỆN PHỎNG VẤN ẢO TÍCH HỢP AI)**

---

## PHẦN 1: THÔNG TIN CHUNG (METADATA & STUDENT LIST)

### 1. Thông Tin Học Phần
*   **Subject Code (Mã môn học):** SWP391
*   **Subject Name (Tên môn học):** Software Development Project
*   **Class Code (Mã lớp):** SE1808-NET
*   **Semester (Học kỳ):** Summer 2026
*   **Lecturer Name (Giảng viên phụ trách):** Nguyễn Văn A
*   **Group Code (Mã nhóm):** Group 5
*   **Project Title (Tên đề tài):** MockAI-Interview

### 2. Danh Sách Sinh Viên Đăng Ký (List of Students)
| No. | StudentCode | StudentName | Role In Group | AI Tool Used |
| :--- | :--- | :--- | :--- | :--- |
| 1 | HE170001 | Nguyễn Minh Quân | Backend & AI Developer (Phân hệ phỏng vấn kiến thức, chấm câu trả lời) | ChatGPT, Copilot |
| 2 | HE170002 | Trần Thế Phương | Full-Stack & UI/UX Developer (Phân hệ phỏng vấn giọng nói & tương tác 3D) | ChatGPT, Copilot |
| 3 | HE170003 | Phạm Minh Triều | DevOps & Backend Engineer (Phân hệ quản trị Jobs, Redis Cache, Docker) | ChatGPT, Copilot |
| 4 | HE170004 | Nguyễn Gia Huy | CV & Community Specialist (Chấm điểm CV, Xuất PDF, Blog Cộng đồng) | ChatGPT, Copilot |
| 5 | HE170005 | Lê Hữu Sang | Admin & Security Manager (Phân quyền RBAC, Kiểm duyệt, Admin Dashboard) | ChatGPT, Copilot |

---

## PHẦN 2: BÁO CÁO NHẬT KÝ SỬ DỤNG AI THEO TUẦN (WEEKLY AI USAGE LOGS)

### WEEK 1: PROJECT INITIATION & REQUIREMENTS (TUẦN 1: KHỞI TẠO DỰ ÁN & PHÂN TÍCH YÊU CẦU)
*   **Mục tiêu tuần:** Thiết lập cấu trúc monorepo và phân rã các tính năng cốt lõi thành User Stories cho từng phân hệ.

| No. | SDLC Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Requirement | Project Structure Allocation | ChatGPT | Suggested monorepo folder structure using `pnpm-workspace.yaml` and role splitting for 5 members. | Validated folder structure; added sequential prefix naming convention to migration files to avoid database conflicts. | `Group5_Week1_Monorepo.png` | 1 workspace, 2 subprojects, 5 modules. | 4 | AI did not consider database migration conflicts in concurrent team environments. |
| 2 | Requirement | User Story Breakdown | ChatGPT | Suggested 20 user stories covering Candidate, HR, and Admin flows. | Filtered and selected 12 core user stories; discarded payment and premium package features since they are deferred. | `Group5_Week1_UserStories.png` | 12 core user stories kept, 8 user stories removed. | 4 | Generated irrelevant or out-of-scope user stories for initial development. |

---

### WEEK 2: ARCHITECTURE & DATABASE DESIGN (TUẦN 2: THIẾT KẾ KIẾN TRÚC & CƠ SỞ DỮ LIỆU)
*   **Mục tiêu tuần:** Thiết kế mô hình dữ liệu (Database Schema), ma trận phân quyền (RBAC) và giải pháp quản lý State ở Frontend.

| No. | SDLC Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Design | State Management Architecture | ChatGPT | Recommended storing all client and server data (jobs, history) in Zustand. | Rejected saving server data in Zustand; separated Zustand for client/auth state and TanStack Query for server state cache. | `Group5_Week2_StateManagement.png` | 1 Zustand store, 1 QueryClient wrapper, 12 cached API endpoints. | 3 | AI suggested anti-pattern of bloated client state, ignoring react-query cache benefits. |
| 2 | Design | RBAC Database Schema | ChatGPT | Proposed adding a single `role` column (admin, hr, user) directly to the `users` table. | Designed normalized schema (users, roles, permissions, user_roles, role_permissions) for dynamic permission checkboxes. | `Group5_Week2_RBACSchema.png` | 5 database tables, 6 relation constraints, 1 admin permission matrix. | 4 | Simple role column cannot support multiple roles or runtime permission toggles by Admin. |

---

### WEEK 3: AUTHENTICATION & SECURITY GATEWAYS (TUẦN 3: XÁC THỰC & CỔNG BẢO MẬT)
*   **Mục tiêu tuần:** Xây dựng cơ chế Route Guard (Auth Gate) ở Frontend và validate bảo mật tải tệp tin ở Backend.

| No. | SDLC Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Design | Auth Gate UX Flow | ChatGPT | Provided `ProtectedRoute` component that auto-redirects to `/login` page or pops up login modal. | Modified flow to block navigation and show Custom Toast warning, letting the user trigger the Auth Modal manually. | `Group5_Week3_AuthGate.png` | 1 CustomToastContainer, 8 protected routes. | 4 | AI ignored specific UX requirements (Auth Gate Protocol) and suggested intrusive modal popups. |
| 2 | Implementation | CV Upload Security Config | ChatGPT | Used `file.originalname.endsWith('.pdf')` to validate uploaded files in Multer. | Added verification for `file.mimetype` and read the first few bytes (Magic Bytes) of the file to verify PDF signature. | `Group5_Week3_UploadSecurity.png` | 1 middleware validator, blocked 100% of renaming attacks. | 4 | Checking extension only was insecure and prone to arbitrary file upload vulnerabilities. |

---

### WEEK 4: SPEECH INTERACTION & WEBSOCKETS SETUP (TUẦN 4: THIẾT LẬP KẾT NỐI REAL-TIME VOICE)
*   **Mục tiêu tuần:** Thiết kế luồng truyền dẫn thời gian thực bằng WebSockets và cấu hình Socket Context ở Frontend React.

| No. | SDLC Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Design | Real-time WebSocket Flow | ChatGPT | Proposed sending complete WebM audio files via REST API after user finishes speaking. | Implemented Socket.io binary stream connection, sending audio in 40ms chunks to backend Whisper engine. | `Group5_Week4_VoiceSocket.png` | 1 SocketContext, 1 WebSocket endpoint, latency reduced to <1.5s. | 4 | Proposed REST method had high latency (5-7 seconds) making natural conversation impossible. |
| 2 | Implementation | Socket Connection Setup | GitHub Copilot | Provided basic `io(VITE_API_URL)` client connection setup inside a simple React hook. | Wrapped inside a global React context `SocketProvider` and added automatic cleanup listener on component unmount. | `Group5_Week4_SocketContext.png` | 1 Context Provider, 4 custom socket listeners configured. | 4 | Inline connection triggered multiple sockets open on page re-render. |

---

### WEEK 5: AUDIO PROCESSING & STT INTEGRATION (TUẦN 5: XỬ LÝ ÂM THANH & TÍCH HỢP AI STT)
*   **Mục tiêu tuần:** Nhận diện giọng nói thông qua AI, loại bỏ tiếng ồn nền (silence filter) để giảm tải và tiết kiệm chi phí gọi API.

| No. | SDLC Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Implementation | Audio Silence Filter | ChatGPT | Suggested uploading all audio data to Whisper API and classifying empty strings as silence. | Implemented Web Audio API RMS energy calculator on frontend; blocked uploads under -30dB. | `Group5_Week5_SilenceFilter.png` | 1 filter utility, 40% reduction in API server load and billing costs. | 5 | Uploading silence was extremely wasteful and added unnecessary network roundtrip time. |
| 2 | Implementation | Whisper STT Integration | ChatGPT | Suggested saving WebSocket binary chunks to disk and running CLI Whisper commands. | Piping socket binary buffer streams directly in-memory to Whisper C++ node bindings to prevent disk IO lag. | `Group5_Week5_WhisperSTT.png` | 1 STT service handler, disk write reduced to 0. | 4 | Disk writes created read/write latency issues on high concurrent user loads. |

---

### WEEK 6: 3D AVATAR RENDERING & INTERACTIVE WEBGL (TUẦN 6: HIỂN THỊ AVATAR 3D & TƯƠNG TÁC)
*   **Mục tiêu tuần:** Tải mô hình 3D Ready Player Me, cấu hình hoạt ảnh nhép môi (Lipsync) khớp với âm phổ phát ra của AI.

| No. | SDLC Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Implementation | 3D Avatar Lipsync Render | ChatGPT | Proposed scaling the entire head mesh of a robot GLTF model based on audio amplitude. | Mapped audio frequency FFT data to morph target blendshapes (visemes) of a Ready Player Me avatar. | `Group5_Week6_3DAvatar.png` | 1 Three.js scene, 1 Avatar component, 5 phoneme blendshapes mapped. | 4 | Head scaling looked unnatural and failed to match realistic speech requirements. |
| 2 | Implementation | WebGL Performance Tuning | GitHub Copilot | Provided high-quality shadow mapping and high-resolution textures in Three.js renderer. | Disabled complex shadows on mobile viewports; configured custom WebGLRenderer parameters and enabled frustum culling. | `Group5_Week6_WebGLOptimize.png` | Frame rate increased by 25 FPS, GPU temperature stabilized on low-end devices. | 4 | High-res default settings caused GPU throttling and severe UI lag on laptops. |

---

### WEEK 7: CV ANALYSIS & PDF REPORT GENERATION (TUẦN 7: PHÂN TÍCH CV ATS & XUẤT BÁO CÁO PDF)
*   **Mục tiêu tuần:** Xây dựng thuật toán tính toán độ trùng khớp CV với JD, sinh tài liệu PDF báo cáo và vẽ biểu đồ Radar trên trang PDF ở Backend.

| No. | SDLC Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Implementation | ATS CV Scoring Algorithm | ChatGPT | Provided regex keyword count divided by total word count to score CV match. | Wrote advanced Vector Space Model scoring using TF-IDF weighting and Cosine Similarity, ignoring stop words. | `Group5_Week7_ATSScoring.png` | 1 matching algorithm, 1 parser (pdf-parse), accuracy increased by 50%. | 4 | AI algorithm was easily tricked by keyword stuffing and ignored semantic context. |
| 2 | Implementation | PDF Export with Radar Chart | ChatGPT | Suggested using Chart.js to render radar chart on canvas element and insert dataURL into `pdfkit`. | **Hallucination Detected!** Wrote math formulas (Sine/Cosine) to draw the spider web radar chart vector directly using `pdfkit` drawing APIs. | `Group5_Week7_PDFRadar.png` | 1 PDF exporter service, 1 math drawing utility, 0 dependency issues. | 5 | AI hallucinated that Chart.js HTML5 canvas could run on Node.js backend without browser DOM. |

---

### WEEK 8: PERFORMANCE OPTIMIZATION & CACHING (TUẦN 8: TỐI ƯU HIỆU NĂNG & CACHE REDIS)
*   **Mục tiêu tuần:** Tích hợp bộ nhớ đệm Redis cho các API danh sách tĩnh, tối ưu hóa visualizer sóng âm 60 FPS để không gây đơ giao diện.

| No. | SDLC Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Implementation | Redis Caching Integration | ChatGPT | Provided middleware caching HTTP GET responses with a static 1-hour expiration time (TTL). | Wrote active cache invalidation logic deleting cache keys on POST/PUT/DELETE events. | `Group5_Week8_RedisCache.png` | 1 cache middleware, 3 cache invalidation events, API response time under 10ms. | 4 | Static TTL caused stale data issues when jobs or blogs were updated or hidden by admin. |
| 2 | Implementation | Sóng âm Ocean Blue Visualizer | ChatGPT | Created React component updating state frequency data in an animation loop to trigger re-renders. | Used `useRef` to capture the canvas element and drew wave lines directly using `requestAnimationFrame`, skipping React state. | `Group5_Week8_AudioVisualizer.png` | 1 AudioVisualizer component, FPS increased from 20 to 60, CPU usage down by 70%. | 4 | State updates in loop caused component re-renders at 60Hz, freezing other components. |

---

### WEEK 9: ANTI-FRAUD & ROBUST ERROR HANDLING (TUẦN 9: CHỐNG GIAN LẬN & QUẢN LÝ LỖI TOÀN CỤC)
*   **Mục tiêu tuần:** Cài đặt phát hiện vắng mặt/nhìn lệch bằng camera cảnh báo gian lận, xây dựng middleware quản lý lỗi tập trung để bảo mật hệ thống.

| No. | SDLC Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Implementation | Gaze Tracking & Face Detection | GitHub Copilot | Suggested `face-api.js` loop running on `requestAnimationFrame` updating React state directly. | Implemented ref for coordinates, throttled state updates to 200ms, added 1.5s delay for face missing warning. | `Group5_Week9_GazeTracking.png` | 1 hook (useGazeTracker), 60 FPS performance maintained (down from 100% CPU usage). | 4 | AI code caused infinite render loop and 100% CPU usage, freezing the UI. |
| 2 | Implementation | Global Error Handling | ChatGPT | Advised using try/catch blocks in every controller sending `res.status(500).json({ error: err.message })`. | Implemented global Express error middleware; created `AppError` class to filter out DB query schemas. | `Group5_Week9_GlobalError.png` | 1 central middleware, 4 custom error classes, 0 exposed database details. | 4 | Exposing raw `err.message` would leak database schemas, creating SQL injection reconnaissance risk. |

---

### WEEK 10: TESTING, VERIFICATION & SECURITY AUDIT (TUẦN 10: KIỂM THỬ & AN TOÀN THÔNG TIN)
*   **Mục tiêu tuần:** Thực hiện rà soát lỗ hổng SQL Injection và kiểm thử khả năng tự phục hồi phiên kết nối phỏng vấn (Socket Reconnection Recovery) của ứng viên.

| No. | SDLC Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Testing | Socket Connection Recovery | ChatGPT | Suggested deleting the session and recording 0 score immediately on socket `disconnect` event. | Designed a Reconnection Grace Period of 30 seconds allowing clients to reconnect and resume. | `Group5_Week10_SocketRecovery.png` | 1 recovery state handler, 30s countdown timer, session state caching. | 4 | Immediate deletion would crash sessions on minor Wi-Fi jitter, causing a terrible UX. |
| 2 | Testing | SQL Injection Vulnerability Check | ChatGPT | Asserted that Knex.js builder is 100% secure from SQL Injection and needs no developer validation. | **Hallucination Detected!** Audited all queries, replacing raw string concatenations in raw SQL queries with parameter bindings. | `Group5_Week10_SQLInjection.png` | 24 queries audited, 3 instances of raw query concatenation refactored to parameter bindings. | 5 | AI gave incorrect security advice, ignoring vulnerabilities from raw SQL concatenations. |

---

## PHẦN 3: BÁO CÁO CÁC CA PHÁT HIỆN HALLUCINATION (RISKS & CORRECTIVE ACTIONS)

### 1. Ca số 1: Vẽ biểu đồ Radar lên PDF ở Backend (Fabrication)
*   **Tuần phát hiện:** Week 7 (Tuần 7: Phân tích CV ATS & Xuất báo cáo PDF)
*   **AI Output:** Gợi ý gọi thư viện `Chart.js` để khởi tạo thẻ `<canvas>` vẽ biểu đồ Radar ở server Node.js, lấy dữ liệu ảnh base64 chèn vào file PDF của `pdfkit`.
*   **Rủi ro/Hạn chế phát hiện:** `Chart.js` là thư viện chạy ở trình duyệt, phụ thuộc vào đối tượng `window` và `HTMLCanvasElement` của DOM. Chạy ở backend Node.js sẽ gây lỗi `ReferenceError: document is not defined` làm crash ứng dụng ngay lập tức.
*   **Hành động khắc phục thực tế (Student Validation/Modification):** Nhóm đã tự xây dựng thuật toán vẽ vector đa giác trực tiếp bằng các tọa độ Sine/Cosine lượng giác trên file PDF thông qua các hàm vẽ cơ bản của `pdfkit` (`moveTo`, `lineTo`, `fill`), tránh hoàn toàn việc phụ thuộc thư viện đồ họa frontend.

### 2. Ca số 2: Tương thích React 19 với Three.js (Outdated Info)
*   **Tuần phát hiện:** Week 6 (Tuần 6: Hiển thị Avatar 3D & Tương tác)
*   **AI Output:** Khuyên dùng câu lệnh cài đặt npm tiêu chuẩn và khẳng định các phiên bản mới nhất của `@react-three/fiber` tương thích tốt với React 19.
*   **Rủi ro/Hạn chế phát hiện:** Lệnh cài đặt bị từ chối do xung đột Peer Dependency nghiêm trọng của npm/pnpm. Phiên bản ổn định hiện tại của thư viện Three.js cho React chỉ mới hỗ trợ chính thức phiên bản React 18.
*   **Hành động khắc phục thực tế (Student Validation/Modification):** Nhóm đã tra cứu tài liệu thảo luận của cộng đồng trên GitHub và thực hiện cài đặt phiên bản alpha/beta tối ưu riêng cho React 19 (`@react-three/fiber@9.0.0-alpha.x`) kết hợp sử dụng tham số `--legacy-peer-deps` để bỏ qua lỗi ràng buộc.

### 3. Ca số 3: An toàn SQL Injection trong Knex.js (Oversimplification)
*   **Tuần phát hiện:** Week 10 (Tuần 10: Kiểm thử & An toàn thông tin)
*   **AI Output:** Khẳng định Knex.js tự động chống SQL Injection 100% cho mọi truy vấn được viết bằng query builder, lập trình viên hoàn toàn yên tâm.
*   **Rủi ro/Hạn chế phát hiện:** Tuyên bố này rất nguy hại. Knex chỉ bảo vệ khi dùng các hàm binding tham số như `.where()`. Nếu lập trình viên dùng `.raw()` hoặc `.whereRaw()` mà viết chuỗi ghép tham số trực tiếp (string concatenation), SQL Injection vẫn có thể diễn ra bình thường.
*   **Hành động khắc phục thực tế (Student Validation/Modification):** Tiến hành rà soát toàn bộ project backend, chuyển đổi tất cả các truy vấn thô ghép chuỗi sang cấu trúc parameter bindings an toàn dạng mảng `[param]` hoặc đối tượng trong các file controller của `backend/src/controllers/`.
