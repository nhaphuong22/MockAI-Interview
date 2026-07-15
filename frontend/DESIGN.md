---
name: MockAI-Interview
description: Hệ thống thiết kế visual chuyên nghiệp, đột phá công nghệ sử dụng tông màu Ocean Blue làm chủ đạo.
colors:
  primary: "#0ea5e9"
  secondary: "#38bdf8"
  background: "#ffffff"
  foreground: "#020817"
  card: "#ffffff"
  card-foreground: "#020817"
  muted: "#f1f5f9"
  muted-foreground: "#64748b"
  border: "#e2e8f0"
typography:
  display:
    fontFamily: "Outfit, Inter, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.1
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.975rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.secondary}"
---

# Design System: MockAI-Interview

## 1. Overview

**Creative North Star: "The Professional Launchpad"**

Hệ thống thiết kế visual của MockAI-Interview tập trung truyền tải sự chuyên nghiệp, tin cậy tuyệt đối và đổi mới công nghệ. Lấy tông màu Ocean Blue làm chủ đạo, giao diện mang lại cảm giác thông minh, sang trọng và thúc đẩy sự nghiệp cho ứng viên cũng như nhà tuyển dụng.

Triết lý cốt lõi của hệ thống là sự rõ ràng về mặt thị giác, cấu trúc thông tin chặt chẽ và tương tác vi mô mượt mà. Chúng tôi loại bỏ các chi tiết thừa thãi để tập trung vào hiệu suất sử dụng, giúp các tác vụ phức tạp như phỏng vấn AI và đánh giá CV trở nên trực quan và đáng tin cậy.

**Key Characteristics:**
- **Sắc nét & Khoáng đạt**: Layout thoáng rộng với hệ thống phân cấp rõ ràng theo lưới 8-point.
- **Tương tác có chủ đích**: Motion (chuyển động) chỉ được dùng để phản hồi hành động hoặc dẫn dắt sự tập trung, tuyệt đối không lạm dụng hiệu ứng trang trí.
- **Độ tin cậy kỹ thuật**: Độ tương phản chữ đạt tiêu chuẩn WCAG AA và bảo mật auth gate thể hiện qua trạng thái giao diện chắc chắn.

## 2. Colors

Bảng màu Ocean Blue phản ánh sự tin cậy chuyên nghiệp và hơi thở công nghệ hiện đại.

### Primary
- **Ocean Blue** (#0ea5e9 / oklch(0.68 0.17 236)): Màu thương hiệu chủ đạo. Được sử dụng cho các CTA chính, liên kết quan trọng và trạng thái kích hoạt nhằm tạo điểm nhấn thị giác tập trung.

### Secondary
- **Ocean Sky** (#38bdf8 / oklch(0.77 0.14 233)): Màu bổ trợ. Dùng cho các hover states, điểm nhấn phụ và biểu đồ minh họa thông tin công nghệ.

### Neutral
- **Deep Slate Ink** (#020817): Màu văn bản và tiêu đề chính, đảm bảo độ tương phản cao và độ sắc nét trên nền sáng.
- **Slate Muted** (#64748b): Dùng cho nhãn phụ, thông tin mô tả và văn bản bổ sung.
- **Pure White Canvas** (#ffffff): Màu nền chính cho trang sáng và các thẻ chứa thông tin.
- **Border Slate** (#e2e8f0): Dùng cho các đường kẻ phân tách và đường viền card mảnh.

**The Ten Percent Rule.** Màu nhấn primary chỉ chiếm tối đa 10% bề mặt của bất kỳ màn hình nào. Sự hiếm hoi của màu sắc chính là yếu tố tạo ra điểm nhấn điều hướng.

## 3. Typography

**Display Font:** Outfit (fallback: Inter, sans-serif)
**Body Font:** Inter (fallback: sans-serif)

Sự kết hợp giữa Outfit (hình học tinh tế, cao cấp) cho các đề mục lớn và Inter (rõ ràng, dễ đọc) cho phần thân mang lại trải nghiệm đọc tối ưu trên mọi màn hình.

### Hierarchy
- **Display** (Bold (700), clamp(2.25rem, 6vw, 3.75rem), 1.1): Sử dụng cho tiêu đề chính (h1) trên trang chủ hoặc trang đón khách.
- **Headline** (SemiBold (600), 1.75rem, 1.25): Sử dụng cho tiêu đề cấp 2 (h2) của các section lớn.
- **Title** (Medium (500), 1.25rem, 1.3): Tiêu đề cấp 3 (h3) cho các thẻ hoặc các mục chi tiết.
- **Body** (Regular (400), 0.975rem, 1.5): Sử dụng cho tất cả nội dung văn bản. Giới hạn độ dài dòng tối đa ở mức 65–75ch để tránh mỏi mắt.
- **Label** (Medium (500), 0.875rem, normal): Dùng cho text nút, thẻ tag, và nhãn biểu mẫu.

**The Hierarchy Guard Rule.** Không sử dụng quá 3 kích thước font chữ trên cùng một khối nội dung hẹp để tránh làm loãng phân cấp thông tin.

## 4. Elevation

MockAI-Interview tuân thủ triết lý "Tonal Layering & Border Rules" - sử dụng độ tương phản màu nền cực nhẹ kết hợp với viền mảnh 1px thay vì lạm dụng đổ bóng đậm hoặc hiệu ứng glassmorphism để phân cấp cấu trúc thông tin.

### Shadow Vocabulary
- **Interactive Shadow** (0 4px 12px rgba(2, 8, 23, 0.05)): Đổ bóng siêu nhẹ, chỉ xuất hiện trên các trạng thái hover của card hoặc button để tạo phản hồi xúc giác nhẹ nhàng.

**The Border-First Rule.** Độ sâu của giao diện được biểu diễn trước tiên bằng đường viền mảnh (1px) màu #e2e8f0 kết hợp màu nền khác biệt nhẹ giữa canvas và container, không dùng shadow làm mặc định.

## 5. Components

### Buttons
- **Shape:** Bo góc vừa phải (rounded-md, 8px) thể hiện sự chuyên nghiệp và cân bằng.
- **Primary:** Sử dụng nền primary (#0ea5e9) và chữ trắng. Padding mặc định (8px 16px).
- **Hover / Focus:** Hover chuyển đổi mượt mà sang màu secondary (#38bdf8) trong 200ms. Khi focus, hiển thị vòng focus xanh ring/50 rộng 3px.

### Cards / Containers
- **Corner Style:** Bo góc lớn hơn button (rounded-xl, 12px) để tạo cảm giác bao bọc.
- **Background:** Nền trắng (#ffffff) hoặc nền tối sâu trong dark mode.
- **Border:** Viền mảnh 1px màu #e2e8f0.
- **Internal Padding:** Sử dụng khoảng cách tối thiểu 24px (lg) để đảm bảo thông tin thông thoáng.

### Inputs / Fields
- **Style:** Viền 1px màu #e2e8f0, bo góc rounded-md (8px), nền sạch sẽ.
- **Focus:** Khi click chọn, viền đổi sang màu primary (#0ea5e9) và hiển thị ring ring/50 rộng 3px.

### Navigation
- **Style:** Thanh bar cố định phía trên (sticky top) hoặc sidebar cấu trúc gọn gàng, sử dụng màu nền mờ với hiệu ứng backdrop-filter nhẹ để tạo sự liên kết không gian. Các liên kết hover đổi màu sáng hoặc hiển thị chỉ báo gạch chân mỏng dưới chữ.

## 6. Do's and Don'ts

### Do:
- **Do** Tuân thủ tuyệt đối lưới khoảng cách 8-point cho padding, margin và layout.
- **Do** Đảm bảo mọi văn bản đọc được có tỷ lệ tương phản tối thiểu là 4.5:1 đối với màu nền tương ứng.
- **Do** Sử dụng cơ chế transition trơn tru (duration-200, ease-out) cho mọi tương tác hover và focus.
- **Do** Luôn bọc các trang nội bộ của ứng dụng bằng Auth Gate và hiển thị Toast thông báo nếu người dùng chưa đăng nhập cố truy cập.

### Don't:
- **Don't** Không sử dụng bất kỳ tông màu tím (purple/violet) nào làm màu chủ đạo của ứng dụng (Luôn sử dụng Ocean Blue).
- **Don't** Không lạm dụng hiệu ứng Glassmorphism quá mức cho các thành phần hiển thị văn bản dài gây cản trở trải nghiệm đọc.
- **Don't** Không sử dụng viền kẻ sọc dày (border-left > 1px) làm điểm nhấn trang trí cho các thẻ hoặc hộp thông báo.
- **Don't** Không tạo các thẻ card có kích thước giống hệt nhau lặp đi lặp lại một cách nhàm chán mà không có biến thể phân cấp trực quan.
- **Don't** Không bao giờ thu phóng (scale) hoặc dịch chuyển xoay các phần tử hình ảnh (`<img>`) trực tiếp khi hover chuột (anti-pattern AI slop).
