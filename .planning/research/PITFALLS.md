# Research: Common Pitfalls in AI 3D Interviewer & ATS

**Analysis Date:** 2026-06-07

## 1. High Latency in AI Voice Response (Độ trễ phản hồi hội thoại lớn)

- **Warning Signs**: Ứng viên phải chờ quá 4 giây từ khi hoàn thành câu trả lời đến khi Avatar 3D của AI bắt đầu nói câu tiếp theo. Điều này phá vỡ cảm giác giao tiếp tự nhiên.
- **Prevention Strategy**:
  - Không sử dụng các mô hình LLM lớn, chậm (như GPT-4) cho hội thoại realtime. Khuyến nghị sử dụng **Llama 3 trên Groq** hoặc **Gemini 1.5 Flash** nhờ tốc độ phản hồi cực nhanh.
  - Sử dụng các API STT tốc độ cao (như **Groq Whisper** thay vì OpenAI Whisper thông thường).
  - Tối ưu hóa TTS: Sinh tệp âm thanh ở định dạng nén nhẹ (như mp3) để giảm thời gian truyền tải tệp tin qua mạng.
- **Phase Mapping**: Cần được giải quyết triệt để ngay trong giai đoạn thiết lập luồng phỏng vấn AI Backend.

## 2. Lip-sync Desynchronization (Khẩu hình miệng lệch âm thanh)

- **Warning Signs**: Tiếng nói của AI phát ra trước hoặc sau khi khẩu hình miệng của Avatar 3D chuyển động, hoặc miệng chuyển động khi không có âm thanh.
- **Prevention Strategy**:
  - Tránh tính toán lipsync ở server rồi gửi tọa độ về client qua websocket (dễ bị lệch do lag mạng).
  - Khuyến nghị thực hiện **phân tích biên độ âm thanh trực tiếp ở client** bằng Web Audio API. Khi âm thanh thực sự được phát qua thẻ `<audio>` của trình duyệt, client sẽ phân tích âm lượng thời gian thực để di chuyển xương hàm của Avatar. Phương pháp này đảm bảo đồng bộ 100% dù mạng có bị chậm.
- **Phase Mapping**: Triển khai trong giai đoạn tích hợp Canvas 3D và Avatar ở Frontend.

## 3. PDF Parsing Failures (Lỗi trích xuất CV)

- **Warning Signs**: Ứng viên tải lên CV định dạng PDF nhưng hệ thống trả về điểm ATS bằng 0 hoặc báo lỗi không đọc được dữ liệu.
- **Cause**: CV được tạo ra bằng cách quét ảnh (scanned PDF) thay vì tệp PDF chứa văn bản thuần (vector PDF), khiến thư viện `pdf-parse` không thể trích xuất được chữ.
- **Prevention Strategy**:
  - Thiết lập kiểm tra đầu vào ở frontend: Thêm hướng dẫn và cảnh báo ứng viên tải lên file PDF định dạng văn bản (không tải file ảnh quét).
  - Ở backend, nếu `pdf-parse` trả về nội dung rỗng hoặc quá ngắn (< 50 ký tự), trả về mã lỗi 400 yêu cầu ứng viên kiểm tra lại file PDF của mình.
- **Phase Mapping**: Triển khai trong giai đoạn xây dựng Modal tải lên CV ở Frontend và API Upload ở Backend.

## 4. Auth Gate & Information Exposure (Lộ thông tin CV)

- **Warning Signs**: Người dùng chưa đăng nhập hoặc ứng viên khác có thể truy cập trực tiếp vào URL CV hoặc xem điểm ATS của người khác bằng cách thay đổi ID trên URL.
- **Prevention Strategy**:
  - Áp dụng triệt để JWT middleware xác thực quyền sở hữu: Khi tải thông tin CV hoặc đơn ứng tuyển, backend phải kiểm tra `req.user.id` có trùng với `candidate_id` của đơn ứng tuyển đó không (hoặc user có vai trò `recruiter` đăng bài tuyển dụng đó không).
  - File CV tải lên nên đặt tên ngẫu nhiên (UUID) và lưu trữ bảo mật, tránh đặt tên theo dạng tuần tự dễ đoán.
- **Phase Mapping**: Triển khai trong toàn bộ giai đoạn xây dựng API Apply và HR Dashboard.

---

*Research pitfalls analysis: 2026-06-07*
