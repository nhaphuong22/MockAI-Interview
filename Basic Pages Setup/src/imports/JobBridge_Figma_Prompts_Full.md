**JOBBRIDGE**

Hệ thống kết nối việc làm thông minh

**TÀI LIỆU CHUẨN HÓA PROMPT CHO FIGMA AI**

Phiên bản đầy đủ — 3 luồng + 3 AI Agents

[Design]  Màu chủ đạo:  #E8580C (Cam)    |    Phong cách: Modern SaaS

[Layout]  Layout: Desktop (ưu tiên) + Mobile responsive

[Font]  Font: Inter / DM Sans    |    Border-radius: 16px cards

**Ba luồng chính:**

- Luồng A — Người Xin Việc (Job Seeker): 12 màn hình
- Luồng B — Nhà Tuyển Dụng (HR/Recruiter): 9 màn hình
- Luồng C — Admin: 9 màn hình
- 3 AI Agent UIs (chat tổng, luyện phỏng vấn, cổng nộp đơn)


# **⚙️  DESIGN SYSTEM CHUNG**
Áp dụng nhất quán cho toàn bộ các trang trong dự án.
## **1. Màu sắc**

|**Primary**|**Secondary**|**Dark**|**Gray**|
| :- | :- | :- | :- |
|**#E8580C**|#FFF3ED|#1A1A2E|#6B7280|

## **2. Typography**
Font chính: Inter / DM Sans

H1 — 48px Bold  |  H2 — 32px Semibold  |  H3 — 24px Medium

Body — 16px Regular  |  Caption — 14px Regular
## **3. Components tái sử dụng**
- Button: Primary (cam), Secondary (viền cam), Ghost (transparent)
- Input field: border-radius 12px, focus border cam #E8580C
- Card: shadow nhẹ, border-radius 16px, padding 24px
- Badge/Tag: rounded pill, màu cam nhạt nền #FFF3ED
- Avatar: hình tròn, có bo viền màu cam
- Navigation: sidebar hoặc top bar, active state màu cam
- Modal: overlay tối 50%, card trắng border-radius 16px
- Toast/Alert: góc phải, màu xanh (success) / cam (warning) / đỏ (error)

## **4. Figma AI Context Header (dùng cho MỌI prompt)**
Paste đoạn này vào đầu MỖI prompt để Figma AI nhớ design system:

|JobBridge Design System Context: Primary color: #E8580C (orange) | Secondary: #FFF3ED | Dark: #1A1A2E Font: Inter, DM Sans | Border-radius: cards 16px, inputs 12px, buttons 8px Cards: white bg, subtle shadow (0 2px 8px rgba(0,0,0,0.08)), padding 24px Buttons: primary = orange gradient, secondary = outlined orange, ghost = transparent Style: Modern SaaS, clean, professional | Desktop-first, mobile responsive|
| :- |


# **[Person]‍[Briefcase]  LUỒNG A — NGƯỜI XIN VIỆC (Job Seeker)**
Đối tượng: Người tìm việc, sinh viên, người đổi nghề.

**Tổng số màn hình: 12**

|**#**|**Màn hình**|**Mô tả**|**Ưu tiên**|
| :- | :- | :- | :- |
|**01**|**Home / Landing**|Hero search, stats, featured jobs, how it works|Cao|
|**02**|**Tìm Việc**|Filter, search, lưu job, AI Match %, skeleton loading|Cao|
|**03**|**Chi Tiết Việc Làm**|JD đầy đủ, thông tin công ty, nút nộp / PV AI|Cao|
|**04**|**Việc Đã Lưu**|Danh sách bookmark, xóa, ghi chú|Trung bình|
|**05**|**Theo Dõi Ứng Tuyển**|Timeline trạng thái từng đơn, thông báo pass/fail|Cao|
|**06**|**Profile Cá Nhân**|Avatar, kinh nghiệm, kỹ năng, thành tích, AI score|Cao|
|**07**|**AI Chấm Điểm CV**|Upload CV → AI chấm + nhận xét chi tiết theo mục|Cao|
|**08**|**AI Luyện Phỏng Vấn**|Mock interview chat/voice từ CV, phản hồi AI|Cao|
|**09**|**Cộng Đồng / Blog**|Feed bài viết, like, comment, viết bài mới|Trung bình|
|**10**|**Các Công Ty Đã Lưu**|Danh sách follow companies, xem employer page|Thấp|
|**11**|**Thông Báo**|Bell panel: trạng thái đơn, kết quả PV AI|Trung bình|
|**12**|**Cài Đặt Tài Khoản**|Đổi mật khẩu, privacy, thông báo, gói dịch vụ|Thấp|


# **[Building]  LUỒNG B — NHÀ TUYỂN DỤNG (HR / Recruiter)**
Đối tượng: HR manager, recruiter, hiring manager tại công ty.

**Tổng số màn hình: 9**

|**#**|**Màn hình**|**Mô tả**|**Ưu tiên**|
| :- | :- | :- | :- |
|**01**|**HR Dashboard**|Tổng quan: stats, đơn mới, pipeline nhanh|Cao|
|**02**|**Đăng Tin Tuyển Dụng**|Form tạo JD, yêu cầu, cài đặt PV AI bắt buộc|Cao|
|**03**|**Quản Lý Tin Đăng**|Danh sách jobs, trạng thái, lượt xem, ẩn/xóa|Cao|
|**04**|**Quản Lý Đơn Ứng Tuyển**|Table ứng viên, AI score, filter, đổi trạng thái|Cao|
|**05**|**Trang Thí Sinh**|Chi tiết 1 ứng viên: CV + điểm AI + nhận xét đầy đủ|Cao|
|**06**|**Profile Công Ty**|Logo, mô tả, văn hóa, hình ảnh, employer branding|Trung bình|
|**07**|**Phân Tích Tuyển Dụng**|Funnel, tỷ lệ đậu, thời gian tuyển, biểu đồ|Trung bình|
|**08**|**Cài Đặt Công Ty**|HR team, phân quyền, gói dịch vụ, API AI|Thấp|
|**09**|**Thông Báo HR**|Đơn mới nộp, ứng viên pass/fail AI, hệ thống|Trung bình|


# **⚙️  LUỒNG C — ADMIN**
Đối tượng: Quản trị viên hệ thống JobBridge.

**Tổng số màn hình: 9**

|**#**|**Màn hình**|**Mô tả**|**Ưu tiên**|
| :- | :- | :- | :- |
|**01**|**Admin Dashboard**|KPIs tổng hệ thống, revenue, user growth, AI usage|Cao|
|**02**|**Quản Lý Người Dùng**|Table users, ban/unban, filter, xem profile|Cao|
|**03**|**Quản Lý Doanh Nghiệp**|Duyệt công ty mới, verify badge, gói dịch vụ|Cao|
|**04**|**Quản Lý Tin Tuyển Dụng**|Duyệt/ẩn/xóa bài đăng vi phạm|Trung bình|
|**05**|**Quản Lý Blog / Cộng Đồng**|Kiểm duyệt bài viết, xử lý report vi phạm|Trung bình|
|**06**|**Quản Lý Thanh Toán**|Giao dịch, subscription, refund, doanh thu|Cao|
|**07**|**Báo Cáo & Analytics**|Biểu đồ tăng trưởng, retention, AI usage cost|Trung bình|
|**08**|**Cài Đặt AI Agents**|Config 3 agents, prompt, ngưỡng điểm, monitoring|Cao|
|**09**|**Cài Đặt Hệ Thống**|Email template, bảo trì, feature flags, audit log|Thấp|


# **[AI]  3 AI AGENT UIs**
Giao diện riêng cho từng AI Agent. Các agent này nhúng vào luồng người dùng.
## **Agent 1 — Chat Tư Vấn Tổng (Trang Home)**
**Vị trí: Floating bubble góc phải tất cả các trang (Job Seeker)**

**[Clipboard] Figma AI Prompt:**

|[JobBridge Design System Context]  Design an AI Chat Widget (floating) for JobBridge home page. Friendly, approachable.  COLLAPSED STATE: - Orange circle button (56px), bottom-right corner - Chat bubble icon + pulse animation ring - Notification dot (red) when there is a proactive message  EXPANDED STATE (320px wide, 480px tall, above bubble): - Header: "JobBridge AI" + orange robot avatar + "Online" green dot - Close X button - Chat area (scrollable):   \* AI greeting bubble (gray bg): "Xin chao! Minh la AI tu van cua JobBridge..."   \* Quick reply chips: "Tim viec IT" | "Huong dan tao CV" | "Cach nop don"   \* User bubble (right, orange tint)   \* AI typing indicator (3 dots animation) - Input bar: text input + send button (orange)  QUICK SUGGESTION CHIPS (below first AI message): - Scrollable horizontal chips: common user questions|
| :- |

- Pulse animation khi có tin nhắn mới
- Typing indicator (3 dots bounce)
- Quick reply chips với câu hỏi phổ biến
- Mobile: full-screen modal thay vì floating panel

## **Agent 2 — Luyện Phỏng Vấn + Chấm CV**
**Vị trí: Màn hình A07 + A08 (Job Seeker dedicated pages)**

→ Prompt đã được viết đầy đủ ở Màn hình A07 (Chấm Điểm CV) và A08 (Luyện Phỏng Vấn). Hai màn hình này chính là giao diện của Agent 2.

## **Agent 3 — Cổng Phỏng Vấn AI Trước Khi Nộp Đơn**
**Vị trí: Modal/fullscreen khi user nhấn "Nộp Đơn" (nếu công ty bật yêu cầu)**

**[Clipboard] Figma AI Prompt:**

|[JobBridge Design System Context]  Design an AI Gatekeeper Interview modal/fullscreen for JobBridge. Triggered when user clicks "Nop Don" on a job that requires AI interview first.  TRIGGER SCREEN (modal, before starting): - Title: "Cong Ty Nay Yeu Cau Phong Van AI" - Company logo + job title - Info box (orange border):   "Ban can hoan thanh phong van AI truoc khi nop don.    So cau: 10 | Thoi gian: ~15 phut | Diem toi thieu: 70%" - Requirements checklist (camera, microphone optional) - Buttons: "Bat Dau Phong Van" (orange large) | "De Sau" (ghost)  INTERVIEW SCREEN (fullscreen, distraction-free): - Top bar: Company logo + Job title + Progress "Cau 3/10" + Timer (countdown) - CENTER: AI Question card (large, clean white card)   Question text (H2, centered)   Question category tag: "Ky thuat" / "Hanh vi" - ANSWER AREA (bottom half):   Large textarea "Nhap cau tra loi cua ban..."   Character count + "Gui Cau Tra Loi" button (orange)   OR: voice input button (mic, recording animation) - Progress bar (top, orange fill)  RESULT SCREEN (after all questions): - PASS state: Large green checkmark + "CHUC MUNG!" + score "85/100"   "Ban da dat nguong diem. Don cua ban da duoc gui!"   Button: "Xem Don Ung Tuyen" (orange) - FAIL state: Soft orange X + "Rat Tiec" + score "45/100"   "Ban chua dat nguong diem toi thieu (70%). Thu lai sau 7 ngay."   Button: "Luyen Them Voi AI" (orange) + "Tim Viec Khac" (ghost)|
| :- |

- Pre-interview checklist (camera/mic check)
- Timer per question (countdown, turns red when < 30s)
- Progress bar (orange fill)
- PASS state: celebratory (confetti subtle), green + orange
- FAIL state: empathetic, không harsh, gợi ý luyện thêm
- Auto-submit nếu hết giờ (warn user trước 10s)
- Fullscreen lock (không thoát giữa chừng mà không confirm)


# **[Lock]  TRANG DÙNG CHUNG (Shared)**
Các trang này dùng cho cả 3 luồng.


# **[Calendar]  WORKFLOW THỰC HIỆN FIGMA**
Thứ tự đề xuất để team thực hiện hiệu quả.
## **Giai đoạn 1 — Nền tảng (Tuần 1)**
- Design System + Component Library (colors, typography, buttons, cards)
- Shared pages: S01 Login, S02 Register
- Luồng A: A01 Home, A02 Tim Viec, A03 Chi Tiet Viec
## **Giai đoạn 2 — Core features (Tuần 2)**
- Luồng A: A04-A06 (Saved, Tracking, Profile)
- Luồng A: A07-A08 (AI CV + AI Interview — Agent 2 UI)
- Agent 3 UI: S\_Agent3 (Cổng PV trước nộp đơn)
## **Giai đoạn 3 — HR & Community (Tuần 3)**
- Luồng B: B01-B05 (HR Dashboard, đăng tin, quản lý đơn, trang thí sinh)
- Luồng A: A09-A11 (Blog, Công ty lưu, Thông báo)
- Agent 1 UI: Floating chat widget
## **Giai đoạn 4 — Admin & Polish (Tuần 4)**
- Luồng B: B06-B09 (Profile công ty, Analytics, Settings, Thông báo HR)
- Luồng C: C01-C05 (Admin dashboard, users, companies, jobs, blog)
- Luồng C: C06-C09 (Payment, Analytics, AI config, System settings)
- Shared: S03-S04 (Pricing, Success page)
- Review tất cả + prototype connections

## **Quy tắc khi dùng Figma AI**
- Mỗi prompt = 1 màn hình (không nhồi nhiều màn vào 1 prompt)
- Luôn paste "JobBridge Design System Context" vào đầu mỗi prompt
- Sau khi generate xong, chỉnh sửa thủ công để đồng nhất với design system
- Dùng component library đã tạo (không để Figma AI tạo component trùng)
- Đặt tên frame theo convention: [Luồng][Số] - [Tên] (VD: A02 - Tim Viec)
