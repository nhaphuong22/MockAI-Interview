# Phase 1: Luồng Ứng Tuyển & AI Chấm Điểm ATS (Apply Job & ATS Evaluation) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-07
**Phase:** 01-Luồng Ứng Tuyển & AI Chấm Điểm ATS (Apply Job & ATS Evaluation)
**Areas discussed:** Giao diện hiển thị kết quả ATS, Email thông báo ứng tuyển, Cách xử lý file PDF báo cáo, Toast cảnh báo Auth Gate.

---

## Giao diện hiển thị kết quả ATS

| Option | Description | Selected |
|--------|-------------|----------|
| Option A | Thiết kế Dashboard chi tiết (Phân chia Tab: Tổng quan ATS với progress bar tròn, Tab Điểm mạnh/Điểm yếu, Tab Khuyến nghị AI cải thiện CV). Trải nghiệm premium, giúp ứng viên thấy rõ giá trị của AI. | ✓ |
| Option B | Hiển thị tóm tắt ngắn gọn (Chỉ hiển thị điểm ATS tổng quan và 2-3 điểm mạnh chính dạng thẻ Card đơn giản). Thích hợp nếu muốn giữ giao diện cá nhân cực kỳ tối giản. | |

**User's choice:** Option A
**Notes:** Quyết định này giúp Candidate có trải nghiệm trực quan và hữu ích hơn, làm nổi bật giá trị cốt lõi của tính năng chấm điểm CV bằng AI của nền tảng.

---

## Cấu trúc và nội dung Email thông báo ứng tuyển

| Option | Description | Selected |
|--------|-------------|----------|
| Option A | Đính kèm file PDF đánh giá CV chi tiết vào cả email gửi cho Candidate và email thông báo cho HR. Tạo độ tin cậy và chuyên nghiệp tối đa cho cả hai phía. | ✓ |
| Option B | Chỉ đính kèm file PDF đánh giá vào email của HR (nhà tuyển dụng). Email của Candidate chỉ nhận thư cảm ơn và điểm ATS tổng quan trong nội dung email (không có file đính kèm). | |
| Option C | Không đính kèm file PDF cho cả hai bên. Chỉ gửi email dạng text/HTML thông thường chứa liên kết dẫn về website để xem kết quả trực tiếp nhằm tối ưu tài nguyên server. | |

**User's choice:** Option A
**Notes:** Giúp tạo niềm tin tối đa cho cả Candidate (về kết quả chấm điểm khách quan của AI) và HR (về báo cáo năng lực ứng viên ngay lập tức).

---

## Cách thức xử lý file PDF đánh giá

| Option | Description | Selected |
|--------|-------------|----------|
| Option A | Tạo sẵn một lần ngay khi chấm điểm xong, lưu trữ tệp PDF trên Cloudinary và lưu URL vào database (Tải về tức thì, gửi email dễ dàng, nhưng tốn dung lượng Cloudinary). | ✓ |
| Option B | Tạo động khi yêu cầu (On-demand) bằng thư viện pdfkit ở backend mỗi khi gửi email hoặc khi người dùng click nút tải về (Tiết kiệm bộ nhớ Cloudinary, nhưng tốn CPU render lại nhiều lần và có độ trễ nhỏ khi click tải). | |

**User's choice:** Option A
**Notes:** Giải pháp này mang lại trải nghiệm tải file tức thì (instant download) cực kỳ mượt mà và gửi email dễ dàng vì tệp PDF đã sẵn có trên mây.

---

## Thư viện / Component Toast hiển thị cảnh báo Auth Gate

| Option | Description | Selected |
|--------|-------------|----------|
| Option A | Tự xây dựng Custom Toast bằng Framer Motion & Tailwind CSS. Đảm bảo hiệu ứng chuyển động mượt mà độc quyền (premium micro-animation), đồng bộ hoàn hảo với thiết kế Glassmorphism và màu Ocean Blue. | ✓ |
| Option B | Sử dụng thư viện react-toastify và ghi đè (override) CSS để định hình màu sắc Ocean Blue và z-index 9999. Nhanh chóng, ổn định và dễ bảo trì. | |

**User's choice:** Option A
**Notes:** Phù hợp với định hướng thiết kế premium và rich aesthetics của dự án, tối ưu hóa các chuyển động vi mô (micro-animations) của toast.

---

## the agent's Discretion

- Không có chủ đề nào bị bỏ ngỏ hoặc tự quyết định. Các phương án đều đã được thông qua ý kiến người dùng.

## Deferred Ideas

- Không phát sinh thêm ý tưởng ngoài phạm vi. Các ý tưởng về WebRTC voice streaming và phân tích camera cảm xúc được thống nhất giữ nguyên trong mục Out of Scope của dự án.
