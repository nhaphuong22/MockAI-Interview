# Research: Architecture Patterns for AI 3D Lipsync & ATS

**Analysis Date:** 2026-06-07

## System Component Integration

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   FRONTEND (React 19)                                  │
│                                                                                        │
│  ┌───────────────────────┐   audio play   ┌─────────────────┐   volume data    ┌────┐  │
│  │ HTML Audio Element    │───────────────>│ AudioAnalyser   │─────────────────>│ R3F│  │
│  │ (Plays TTS Audio File)│                │ (Web Audio API) │                  │    │  │
│  └───────────────────────┘                └─────────────────┘                  │    │  │
│              ▲                                                                 │    │  │
│              │ URL/Blob                                                        │    │  │
│              │                                                                 │    │  │
│  ┌───────────────────────┐                ┌─────────────────┐   mesh morph     │ 3D │  │
│  │ Axios Client          │                │ useFrame Loop   │<─────────────────│    │  │
│  │ (Sends voice/requests)│                │ (Updates avatar)│                  │    │  │
│  └───────────────────────┘                └─────────────────┘                  └────┘  │
└──────────────┬────────────────────────────────────────────────────────────────────▲────┘
               │                                                                    │
               │ HTTPS (Audio Upload / JSON Response)                               │ Realtime Events
               │                                                                    │ (Socket.io)
               ▼                                                                    │
┌───────────────────────────────────────────────────────────────────────────────────▼────┐
               │                                                                    │
│  ┌───────────▼───────────┐                ┌─────────────────┐                  ┌──┴─┐  │
│  │ Express API Routes    │                │ Socket.io Server│                  │    │  │
│  │ (Routes requests)     │                │ (Notifications) │                  │ DB │  │
│  └───────────┬───────────┘                └─────────────────┘                  │    │  │
│              │                                                                 │    │  │
│              ▼                                                                 │    │  │
│  ┌───────────────────────┐                ┌─────────────────┐                  │    │  │
│  │ Controllers & Services│───────────────>│ Database (Pg)   │<─────────────────┘    │  │
│  │ (STT, TTS, Groq LLM)  │                │ (Knex Client)   │                          │
│  └───────────────────────┘                └─────────────────┘                          │
│                                                                                        │
│                                   BACKEND (Express 5)                                  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

## Component Boundaries

### 1. Audio Interaction Flow (Lipsync)
- **Audio Node Hook**: Một React hook tùy chỉnh (ví dụ: `useAudioAnalyser.js`) kết nối thẻ `<audio>` phát giọng nói của AI với `AudioContext`. Nó tạo ra `AnalyserNode` để liên tục trích xuất dữ liệu biên độ âm thanh (`getByteFrequencyData` hoặc `getByteTimeDomainData`).
- **Blendshape Mapper**: Một function chuyển đổi chỉ số âm lượng nhận được từ AnalyserNode thành các giá trị từ `0` đến `1` và áp vào thuộc tính `morphTargetInfluences` của lưới miệng nhân vật 3D (ví dụ: `nodes.Mesh002.morphTargetInfluences[index_jaw_open]`).
- **useFrame Loop**: Chạy đều đặn 60 khung hình/giây của React Three Fiber để cập nhật chuyển động của miệng, kết hợp với các hiệu ứng chuyển động mắt (chớp mắt tự động dùng `Math.sin`) và chuyển động đầu nhẹ nhàng (idle animations).

### 2. Candidate Application Flow
- **Axios File Uploader**: Sử dụng `FormData` để gửi tệp tin CV PDF qua POST API.
- **Background AI Parser & Evaluator**: Khi nhận tệp PDF, backend thực hiện trích xuất text, gọi service phân tích với LLM và lưu kết quả ATS score + feedback vào DB trước khi trả phản hồi về cho client. Điều này đảm bảo tính nhất quán của dữ liệu.

## Database & Model Schemas

- **cvs**: Lưu `parsed_text`, `ats_score`, `ai_feedback` (dữ liệu chi tiết dạng JSON chứa danh sách kỹ năng, điểm mạnh, điểm yếu).
- **applications**: Lưu `cv_id`, `cv_score`, `cover_letter`, `status` (SUBMITTED, REVIEWED, ACCEPTED, REJECTED), `ai_summary`.
- **voice_sessions**: Lưu `interview_id`, `status` (CONNECTED, DISCONNECTED, ASSESSED), `duration_seconds`, `created_at`.
- **interview_assessments**: Lưu kết quả đánh giá phỏng vấn gồm điểm số chi tiết các kỹ năng mềm/cứng dưới dạng JSON để phục vụ việc vẽ Radar Chart trên frontend.

---

*Architecture research analysis: 2026-06-07*
