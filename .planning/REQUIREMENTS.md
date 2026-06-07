# Requirements: MockAI-Interview

**Defined:** 2026-06-07
**Core Value:** Cung cấp trải nghiệm luyện tập phỏng vấn ảo bằng AI 3D trực quan sinh động và hệ thống tự động chấm điểm, đánh giá năng lực ứng viên chính xác giúp rút ngắn thời gian tuyển dụng.

## v1 Requirements

Các yêu cầu cam kết thực hiện trong Milestone đầu tiên này.

### Jobs & Applications (Luồng Ứng Tuyển)

- [ ] **APPLY-01**: Ứng viên có thể xem danh sách tin tuyển dụng (Jobs List) và chi tiết từng tin tuyển dụng (Job Details) bao gồm tiêu đề, mô tả, yêu cầu kỹ năng.
- [ ] **APPLY-02**: Ứng viên có thể mở Modal ứng tuyển để tải lên tệp CV dưới dạng PDF và viết thư xin việc (Cover Letter).
- [ ] **APPLY-03**: Hệ thống tự động phân tích (parse) nội dung text từ CV PDF và gọi dịch vụ AI chấm điểm ATS Score (độ tương thích với công việc) khi ứng viên nộp đơn.
- [ ] **APPLY-04**: Ứng viên có thể xem trực tiếp điểm số ATS Score và phản hồi chi tiết của AI (AI Feedback) trên trang cá nhân của mình sau khi ứng tuyển thành công.

### HR Management Dashboard (Giao Diện Nhà Tuyển Dụng)

- [ ] **HR-01**: HR có thể đăng nhập vào Dashboard để xem danh sách toàn bộ ứng viên đã ứng tuyển vào các công việc do mình quản lý.
- [ ] **HR-02**: Giao diện HR Dashboard cho phép sắp xếp danh sách ứng viên theo điểm số ATS CV (tăng/giảm dần) và lọc theo từng công việc.
- [ ] **HR-03**: HR có thể click vào từng ứng viên để xem chi tiết thông tin, thư xin việc, nội dung CV và nhận xét chi tiết của AI (điểm mạnh, điểm yếu, mức độ phù hợp).
- [ ] **HR-04**: HR và Candidate có thể tải về tệp báo cáo PDF (export PDF) chứa kết quả AI chấm điểm và nhận xét chi tiết để lưu trữ offline.

### AI 3D Interview Room (Phòng Phỏng Vấn 3D AI)

- [ ] **INT-01**: Ứng viên có thể tham gia vào phòng phỏng vấn trực tuyến hiển thị nhân vật người ảo 3D (Avatar) được vẽ bằng Three.js/React Three Fiber.
- [ ] **INT-02**: Nhân vật 3D phỏng vấn tự động chớp mắt, có chuyển động idle tự nhiên và chuyển đổi trạng thái sinh động khi AI đang nói (speaking) hoặc đang lắng nghe (listening).
- [ ] **INT-03**: Khẩu hình miệng (blendshapes morphTargets) của nhân vật 3D tự động di chuyển khớp với âm lượng giọng nói phát ra từ AI (Lipsync thời gian thực qua Web Audio API ở client).
- [ ] **INT-04**: Ứng viên có thể nhấn giữ hoặc click nút Microphone để thu âm câu trả lời trực tiếp từ trình duyệt, hệ thống tự động gửi file ghi âm lên backend để chuyển thành văn bản (Speech-To-Text).
- [ ] **INT-05**: AI tự động sinh câu hỏi phỏng vấn tiếp theo dựa trên CV của ứng viên, thông tin JD của Job tuyển dụng và lịch sử hội thoại trước đó.
- [ ] **INT-06**: Hệ thống chuyển đổi câu hỏi dạng văn bản của AI thành file âm thanh giọng nói tự nhiên (Text-To-Speech) và gửi về client phát lên kèm theo dữ liệu lipsync của Avatar.
- [ ] **INT-07**: Khi kết thúc buổi phỏng vấn, ứng viên có thể xem lại lịch sử cuộc phỏng vấn dạng văn bản và biểu đồ mạng nhện Radar Chart đánh giá năng lực theo 5 khía cạnh cốt lõi.

### System Notifications & Email (Thông Báo & Email)

- [ ] **NOTI-01**: Gửi email thông báo tự động xác nhận đã nhận đơn cho Candidate và thông báo cho HR khi có ứng viên mới nộp đơn thành công.
- [ ] **NOTI-02**: Gửi realtime notification bằng Socket.io thông báo cho HR trên giao diện Dashboard khi có ứng tuyển mới xuất hiện.

## v2 Requirements

Các tính năng tạm thời hoãn lại, sẽ xem xét ở các phiên bản sau.

### Payments & Packages (Thanh Toán)
- **PAY-01**: Ứng viên có thể mua các gói phỏng vấn nâng cấp để mở khóa nhiều tính năng/Interviewer VIP hơn.
- **PAY-02**: HR có thể đăng ký gói doanh nghiệp để đăng tải nhiều tin tuyển dụng hơn và quản lý nhiều ứng viên hơn.

### Realtime Communication (Giao Tiếp Thời Gian Thực)
- **COMM-01**: Nhà tuyển dụng và ứng viên có thể nhắn tin trực tiếp với nhau (live chat) qua Socket.io.
- **COMM-02**: Tính năng gọi điện thoại trực tiếp hoặc gọi video trực tuyến giữa HR và Candidate.

## Out of Scope

Các tính năng không thuộc phạm vi phát triển để tránh phình to dự án (scope creep).

| Feature | Reason |
|---------|--------|
| Camera Emotion Detection | Phân tích cảm xúc qua camera bằng AI: Độ phức tạp cao, tốn tài nguyên, dễ gây lo ngại về quyền riêng tư của ứng viên và không phải giá trị cốt lõi. |
| WebRTC Audio Streaming | Stream audio liên tục qua WebRTC: Phức tạp cao về mặt truyền dẫn âm thanh, tỷ lệ mất mát gói tin lớn. Sử dụng cơ chế ghi âm đoạn ngắn và upload file qua API giúp đảm bảo độ chính xác STT/TTS và giảm độ trễ xử lý. |

## Traceability

Sẽ được ánh xạ chi tiết sang các Phase trong Roadmap.

| Requirement | Phase | Status |
|-------------|-------|--------|
| APPLY-01 | Phase 1 | Pending |
| APPLY-02 | Phase 1 | Pending |
| APPLY-03 | Phase 1 | Pending |
| APPLY-04 | Phase 1 | Pending |
| HR-01 | Phase 2 | Pending |
| HR-02 | Phase 2 | Pending |
| HR-03 | Phase 2 | Pending |
| HR-04 | Phase 2 | Pending |
| INT-01 | Phase 3 | Pending |
| INT-02 | Phase 3 | Pending |
| INT-03 | Phase 3 | Pending |
| INT-04 | Phase 3 | Pending |
| INT-05 | Phase 3 | Pending |
| INT-06 | Phase 3 | Pending |
| INT-07 | Phase 3 | Pending |
| NOTI-01 | Phase 1 | Pending |
| NOTI-02 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-07*
*Last updated: 2026-06-07 after initial definition*
