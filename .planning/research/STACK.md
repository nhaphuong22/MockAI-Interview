# Research: Proposed Tech Stack for AI 3D Interviewer & ATS

**Analysis Date:** 2026-06-07

## AI Lipsync & 3D Avatar Rendering

**3D Model Format:**
- **Ready Player Me (RPM) / GLTF format**: Mô hình nhân vật 3D tiêu chuẩn có hỗ trợ sẵn các blendshapes khuôn mặt theo chuẩn Apple ARKit (52 blendshapes bao gồm `jawOpen`, `mouthSmile`, `lipStretch`...).

**Rendering Engine:**
- **React Three Fiber (R3F)** & **@react-three/drei**: Thư viện React bọc ngoài Three.js giúp tích hợp mô hình 3D vào cây Component React một cách khai báo, dễ dàng quản lý state của model.

**Lipsync Logic:**
- **Web Audio API (AudioAnalyser)**: Phân tích tần số và biên độ âm thanh thời gian thực từ tệp âm thanh TTS phát ra, trích xuất chỉ số âm lượng (RMS - Root Mean Square) và map trực tiếp tới blendshape mở miệng (`jawOpen`, `mouthLowerDown`) trong vòng lặp cập nhật khung hình `useFrame`.
- **Rhubarb Lip Sync (Optional/Pre-processed)**: Phân tích âm thanh để sinh ra dữ liệu khớp khẩu hình (mouth shapes) dạng JSON nếu cần độ chính xác cực cao (cho các câu hỏi cố định). Đối với câu trả lời động từ AI, phân tích biên độ âm thanh (Volume-based blendshape animation) là lựa chọn tối ưu về độ trễ.

## Speech-to-Text (STT) & Text-to-Speech (TTS)

**Speech-to-Text (STT):**
- **Whisper API (OpenAI/Groq)**: Trích xuất giọng nói ứng viên thành văn bản với độ chính xác cao và hỗ trợ tốt tiếng Việt. Groq Whisper cung cấp tốc độ phản hồi cực nhanh (< 1 giây).

**Text-to-Speech (TTS):**
- **ElevenLabs API / OpenAI TTS**: Sinh âm thanh giọng nói tự nhiên của người phỏng vấn. ElevenLabs hỗ trợ tiếng Việt rất biểu cảm, trong khi OpenAI TTS cung cấp chi phí tối ưu và độ trễ thấp.
- **Google Cloud TTS (Fallback)**: Đơn giản, ổn định, chi phí thấp.

## Large Language Model (LLM) for Interviewer

**Groq Cloud (Llama 3 70B/8B):**
- Khuyến nghị nhờ tốc độ sinh token siêu tốc (tới 300+ tokens/s), giúp giảm thiểu thời gian chờ (Time to First Token) của AI xuống dưới 500ms.

**Gemini Flash API:**
- Khả năng xử lý ngữ cảnh cực lớn (CV + JD) với chi phí thấp và hỗ trợ đa phương tiện.

---

*Research stack analysis: 2026-06-07*
