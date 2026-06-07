# Research: Domain Features for AI 3D Interviewer & ATS

**Analysis Date:** 2026-06-07

## Table Stakes (Phải Có)

### 1. Luồng Ứng Tuyển & ATS Chấm Điểm CV
- **Tải lên CV (PDF)**: Ứng viên tải lên tệp CV.
- **Trích xuất nội dung**: Backend parse text từ file PDF.
- **Chấm điểm độ tương thích (ATS Score)**: AI chấm điểm CV dựa trên JD của Job tuyển dụng từ 0-100%.
- **Đánh giá điểm mạnh/điểm yếu**: AI đưa ra nhận xét tóm tắt các điểm mạnh, điểm yếu và mức độ phù hợp.
- **HR Dashboard**: Giao diện cho HR xem danh sách ứng tuyển của từng công việc, sắp xếp và lọc theo điểm ATS tăng/giảm dần.

### 2. Phỏng Vấn Giọng Nói Với AI
- **Ghi âm câu trả lời**: Ứng viên thu âm câu trả lời trực tiếp từ trình duyệt.
- **AI Phản hồi bằng giọng nói**: AI đưa ra câu hỏi, tiếp nhận câu trả lời, nhận xét ngắn gọn và đặt câu hỏi tiếp theo dưới dạng âm thanh phát lại.
- **Lịch sử phỏng vấn**: Xem lại lịch sử các câu hỏi và câu trả lời dạng văn bản sau khi kết thúc buổi phỏng vấn.

## Differentiators (Điểm Khác Biệt)

### 1. Trực Quan Hóa Với 3D Avatar (Lipsync)
- **Người ảo phỏng vấn 3D**: Giao diện hiển thị một nhân vật 3D chuyên nghiệp làm người phỏng vấn ảo thay vì chỉ có màn hình chat text thông thường.
- **Lipsync thời gian thực**: Khẩu hình miệng của Avatar 3D chuyển động khớp với âm thanh câu hỏi phát ra từ AI.
- **Cử chỉ tự nhiên**: Avatar có các hành động tự nhiên như chớp mắt, gật đầu nhẹ khi lắng nghe, chuyển đổi trạng thái giữa nói/nghe để tạo cảm giác thực tế.

### 2. Đánh Giá Năng Lực Bằng Radar Chart & Feedback Chi Tiết
- **Radar Chart**: Vẽ biểu đồ mạng nhện đánh giá năng lực ứng viên trên 5 khía cạnh cốt lõi (Kỹ năng chuyên môn, Kỹ năng mềm, Kinh nghiệm thực tế, Khả năng giải quyết vấn đề, Mức độ phù hợp văn hóa).
- **Lộ trình học tập đề xuất (Learning Path)**: AI gợi ý các kỹ năng/kiến thức cần cải thiện dựa trên các điểm yếu phát hiện trong buổi phỏng vấn.

## Anti-Features (Deliberately NOT Build)

- **Nhận diện cảm xúc khuôn mặt ứng viên qua Camera (Emotion Detection)**: Phức tạp, dễ gây tranh cãi về độ chính xác và quyền riêng tư của ứng viên, không thực sự mang lại giá trị cốt lõi cho việc luyện tập.
- **Phỏng vấn video trực tiếp realtime WebRTC Video Call**: Chi phí hạ tầng cao, độ phức tạp lớn. Chỉ tập trung vào mô phỏng âm thanh + Avatar 3D ở phía client.

---

*Research features analysis: 2026-06-07*
