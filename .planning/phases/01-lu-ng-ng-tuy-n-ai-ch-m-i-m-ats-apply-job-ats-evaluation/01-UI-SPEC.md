# Phase 1: Luồng Ứng Tuyển & AI Chấm Điểm ATS (Apply Job & ATS Evaluation) - UI Spec

**Analysis Date:** 2026-06-07
**Theme**: Ocean Blue Premium Design (Glassmorphism & Rich Aesthetics)

## Scope of UI Components

### 1. Danh sách công việc (Jobs List)
- **Layout**: Dạng danh sách lưới (Grid) 2 hoặc 3 cột tùy kích thước màn hình.
- **Component**: `JobCard` hiển thị:
  - Tên công việc (Job Title)
  - Công ty, địa điểm, mức lương
  - Nhãn kỹ năng (Skill Tags) - màu nền xanh nhạt, chữ xanh đậm.
  - Nút "Xem chi tiết" (Button CTA) màu Ocean Blue (`#0ea5e9`).
- **States**:
  - Loading: Skeleton animation mượt mà.
  - Empty: Hiển thị hình minh họa trống kèm thông điệp thân thiện.

### 2. Chi tiết công việc (Job Details)
- **Layout**: Split layout (2/3 bên trái hiển thị mô tả & yêu cầu, 1/3 bên phải hiển thị hộp thông tin chung và nút ứng tuyển).
- **Style**:
  - Hộp thông tin bên phải dạng Glassmorphism (`backdrop-blur-md bg-white/60 border border-white/20 shadow-lg`).
  - Nút "Ứng tuyển ngay" (Apply Now Button): Nút lớn, hiệu ứng hover phóng to nhẹ (`scale-102`), màu nền gradient từ `#0ea5e9` sang `#38bdf8`.

### 3. Modal tải lên CV (Apply Job Modal)
- **Component**: `ApplyJobModal` (sử dụng Radix UI Dialog làm primitive để đảm bảo accessibility).
- **Form Fields**:
  - Vùng kéo thả tệp tin (Drag & Drop Zone): Sử dụng `react-dropzone`. Hỗ trợ kéo thả file PDF. Khi drag over, viền nét đứt của box chuyển sang màu Ocean Blue kèm hiệu ứng sóng nhẹ.
  - Cover Letter text area: Nhập văn bản tự do, hỗ trợ tự động mở rộng dòng.
- **States**:
  - Uploading & AI evaluating: Hiển thị màn hình chờ (Overlay loader) kèm thông điệp động (ví dụ: *"Đang parse CV..."*, *"AI đang chấm điểm hồ sơ..."*), tiến trình loading dạng sóng nước hoặc vòng tròn xoay mượt mà.

### 4. Báo cáo đánh giá ATS trên trang cá nhân (Candidate Profile)
- **Component**: `AtsReportDashboard` hiển thị kết quả chấm điểm.
- **Tabs Layout**:
  - **Tab 1: Tổng quan ATS**:
    - Hiển thị điểm số lớn ở tâm vòng tròn tiến trình (Circular Progress Bar) màu Ocean Blue (`#0ea5e9`), có hiệu ứng chạy số khi xuất hiện.
    - Hộp nhận xét chung từ AI.
    - Nút "Tải Báo Cáo PDF" xuất file lưu trữ.
  - **Tab 2: Điểm mạnh & Điểm yếu**:
    - Chia 2 cột: Cột Điểm mạnh (màu xanh lá/Ocean nhạt, icon check), Cột Điểm yếu (màu xám ấm/cam nhạt, icon warning).
  - **Tab 3: Khuyến nghị cải thiện**:
    - Danh sách các kỹ năng/từ khóa cần bổ sung để tăng điểm ATS tương thích.

### 5. Custom Toast Component (Auth Gate)
- **Layout**: Float box ở góc trên bên phải màn hình.
- **Style**: Glassmorphism (`backdrop-blur-md bg-white/70 border border-white/20 shadow-xl`), bo góc `rounded-2xl`, icon warning màu Ocean Blue.
- **Motion**:
  - Xuất hiện: Slide in từ bên phải màn hình (`x: 100% -> 0%`), hiệu ứng spring nhún mượt.
  - Biến mất: Fade out và co lại (`scale: 1 -> 0.9`, `opacity: 0`).
  - Progress bar đếm ngược 4s chạy mờ ở cạnh đáy của Toast.

## Design Tokens

- **Colors**:
  - Primary (Ocean Blue): `#0ea5e9`
  - Secondary: `#38bdf8`
  - Accent (Light Ocean): `#e0f2fe` (xanh nhạt làm nền thẻ/tag)
  - Dark Neutral: `#0f172a` (slate-900 cho chữ tiêu đề)
  - Light Neutral: `#f8fafc` (slate-50 cho nền trang)
- **Spacing**: Hệ lưới 8-point (padding/margin `p-2` = 8px, `p-4` = 16px, `p-6` = 24px, `p-8` = 32px).
- **Typography**: Font family `Inter` hoặc `Outfit`, cỡ chữ tiêu chuẩn, line-height cân đối.
- **Border Radius**: Cực kỳ mềm mại: `rounded-2xl` (16px) cho cards/modals, `rounded-xl` (12px) cho buttons/inputs.

---

*Phase 1 UI spec: 2026-06-07*
