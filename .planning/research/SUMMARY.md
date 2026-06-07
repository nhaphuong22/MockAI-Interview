# Research Summary: AI 3D Interviewer & ATS

**Analysis Date:** 2026-06-07

## Stack Đề Xuất (Stack)
- **3D Rendering**: React Three Fiber (R3F) và @react-three/drei để tải và dựng mô hình Avatar 3D (định dạng GLTF/GLB có sẵn blendshapes ARKit).
- **Lipsync**: Web Audio API (Audio Context & Analyser Node) phân tích biên độ âm thanh (volume RMS) trực tiếp ở trình duyệt để cập nhật blendshape hàm (`jawOpen`) của Avatar, đảm bảo đồng bộ âm thanh - khẩu hình 100%.
- **Speech-to-Text (STT)**: Groq Whisper API để chuyển giọng nói ứng viên thành chữ nhanh dưới 500ms.
- **Large Language Model (LLM)**: Llama 3 70B/8B trên Groq hoặc Gemini Flash API để sinh câu hỏi phỏng vấn động phản hồi cực nhanh.
- **Text-to-Speech (TTS)**: OpenAI TTS hoặc ElevenLabs API để sinh giọng nói tự nhiên của người phỏng vấn ảo.

## Các Tính Năng Cốt Lõi (Table Stakes)
- **Apply Job với ATS CV Evaluation**: Ứng viên tải lên CV PDF, AI tự động parse text, chấm điểm ATS Score và nhận xét điểm mạnh/yếu dựa trên JD của công việc.
- **HR Applicant Management Dashboard**: HR quản lý danh sách ứng viên nộp đơn cho từng công việc, sắp xếp và lọc theo điểm ATS.
- **AI 3D Interview Room**: Ứng viên luyện tập phỏng vấn giọng nói với Avatar 3D có khẩu hình miệng khớp với tiếng nói của AI. Xem lại lịch sử cuộc phỏng vấn dạng văn bản và nhận đánh giá Radar Chart sau khi hoàn thành.
- **Hệ thống thông báo & Email**: Tự động gửi email xác nhận và gửi thông báo realtime (Socket.io) cho HR khi có ứng tuyển mới.

## Các Điểm Cần Lưu Ý (Watch Out For)
- **Độ trễ (Latency)**: Phải giữ thời gian chờ phản hồi giọng nói của AI dưới 2 giây bằng cách sử dụng các API tốc độ cao (Groq Whisper, Llama 3).
- **Lỗi PDF Scan**: CV định dạng ảnh quét không đọc được nội dung. Cần thiết lập kiểm tra nội dung CV rỗng ở backend và hướng dẫn ứng viên ở frontend tải lên file PDF chuẩn vector text.
- **Bảo mật thông tin**: Áp dụng chặt chẽ JWT Middleware kiểm tra quyền sở hữu đối với các tệp CV và điểm số đánh giá, không lộ thông tin cá nhân của ứng viên.

---

*Research summary: 2026-06-07*
