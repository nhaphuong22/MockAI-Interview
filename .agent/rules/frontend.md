---
trigger: glob
glob: "**/*.{js,jsx,ts,tsx,css,scss,html,vue,svelte,dart,swift,kt,xml}"
---

# FRONTEND.MD - Client-Side Mastery

> **Mục tiêu**: Quản lý thống nhất Giao diện Web & Mobile. Một nguồn chân lý cho trải nghiệm người dùng.

---

## 🎨 1. PREMIUM UX/UI & TECH STACK (React + Tailwind)

1. **Tech Stack**: Bắt buộc sử dụng ReactJS + Vite. Styling bằng Tailwind CSS.
2. **Aesthetics**: Sử dụng Lucide Icons. Tuân thủ Glassmorphism 2.0 và thiết kế hiện đại.
3. **Feedback**: Mọi tương tác đều phải có phản hồi thị giác ngay lập tức.
4. **Real-time**: Quản lý luồng WebRTC/WebSockets chuẩn xác cho tính năng thu âm/AI Voice.

---

## 📱 2. MOBILE & RESPONSIVE

1. **Touch Targets**: Button tối thiểu 44x44px (Chuẩn ngón tay cái).
2. **Safe Areas**: Tôn trọng tai thỏ (Notch) và Home Indicator trên iOS/Android.
3. **Mobile-First**: Code CSS cho mobile trước, override cho PC sau.

---

## ⚡ 3. PERFORMANCE & CONNECTIVITY

1. **Port Configuration**: Tuyệt đối không hardcode port. Mọi kết nối API (BASE_URL) và port chạy server phải được lấy từ file `.env`.
2. **Core Web Vitals**: LCP < 2.5s, CLS < 0.1, FID < 100ms.
3. **Optimistic UI**: Cập nhật giao diện TRƯỚC khi API trả về.
4. **Asset Optimization**: Ảnh WebP, Video lazy-load.

---

## 🛡️ 4. STATE & COMPONENT STRUCTURE

1. **Folder Structure**: Bắt buộc tổ chức component theo cấu trúc thư mục chuyên nghiệp (VD: `components/common/`, `components/layout/`, `components/features/`). Mỗi component phức tạp nên nằm trong 1 folder riêng chứa cả file `.jsx`, logic `.hook.js` và `.css` (nếu có).
2. **Atomic Design**: Component nhỏ, tái sử dụng cao (`<Button />`, `<INPUT />`).
3. **State**: Server State (TanStack Query) !== Client State (Zustand/Context). Tách biệt rõ ràng.

---

## 🔍 5. CODE QUALITY & LINTING GATES

1. **Linting Check**: Khi thực hiện bất kỳ thay đổi nào liên quan đến mã nguồn Frontend, Agent bắt buộc phải chạy lệnh linter sau khi hoàn thành code: `pnpm -C frontend run lint`.
2. **Error Resolution**: Nếu có bất kỳ lỗi nào xuất hiện (errors), Agent phải chủ động sửa đổi cho đến khi vượt qua vòng kiểm tra sạch lỗi (0 errors).
