# Roadmap: MockAI-Interview

**Defined:** 2026-06-07
**Mode:** mvp
**Current Phase:** Phase 1

## Summary

Lộ trình phát triển được thiết kế theo phương pháp **Vertical MVP (Lát cắt dọc)** bao gồm 3 Phase lớn. Mỗi Phase giải quyết trọn vẹn một luồng trải nghiệm người dùng từ frontend đến backend để có thể kiểm thử và bàn giao độc lập.

| Phase | Goal | Requirements | Mode | Success Criteria |
|-------|------|--------------|------|------------------|
| 1 | Hoàn thiện luồng ứng tuyển CV & AI chấm điểm ATS | APPLY-01, APPLY-02, APPLY-03, APPLY-04, NOTI-01 | mvp | 4 tiêu chí |
| 2 | Xây dựng HR Dashboard quản lý ứng viên | HR-01, HR-02, HR-03, HR-04, NOTI-02 | mvp | 5 tiêu chí |
| 3 | Tích hợp Phòng phỏng vấn ảo 3D AI & Đánh giá năng lực | INT-01, INT-02, INT-03, INT-04, INT-05, INT-06, INT-07 | mvp | 5 tiêu chí |

---

## Phase Details

### Phase 1: Luồng Ứng Tuyển & AI Chấm Điểm ATS (Apply Job & ATS Evaluation)
**Goal:** Hoàn thiện luồng ứng tuyển CV, AI chấm điểm ATS, trả về kết quả và gửi email/thông báo.
**Mode:** mvp
**Success Criteria:**
1. Ứng viên có thể duyệt danh sách công việc ở Client, xem chi tiết công việc và mở Modal nộp CV.
2. Nộp thành công file CV PDF và Cover Letter. Backend parse file PDF, gọi AI chấm điểm độ tương thích với JD của Job tuyển dụng và lưu vào Database.
3. Ứng viên xem được điểm số ATS Score và phản hồi chi tiết từ AI (điểm mạnh, điểm yếu) trực tiếp trong trang cá nhân.
4. Hệ thống tự động gửi email xác nhận đã nhận đơn cho Candidate và email thông báo kèm PDF đánh giá cho HR.

---

### Phase 2: HR Dashboard & Quản Lý Ứng Viên (HR Dashboard & Applicant Management)
**Goal:** Xây dựng Dashboard cho HR quản lý hồ sơ ứng viên theo điểm số ATS.
**Mode:** mvp
**Success Criteria:**
1. HR đăng nhập vào Dashboard xem được toàn bộ ứng viên đã ứng tuyển vào các công việc của mình.
2. Sắp xếp danh sách ứng viên theo điểm ATS CV tăng/giảm dần và lọc theo công việc dễ dàng.
3. Xem chi tiết thông tin ứng viên, thư xin việc, nội dung CV và nhận xét chi tiết của AI.
4. Tải xuống tệp báo cáo PDF (export PDF) chứa điểm số ATS và feedback chi tiết để chia sẻ.
5. HR nhận thông báo realtime (Socket.io) trên màn hình Dashboard ngay khi có ứng tuyển mới.

---

### Phase 3: Phòng Phỏng Vấn 3D AI & Đánh Giá Năng Lực (3D AI Interview Room & Skill Assessment)
**Goal:** Xây dựng phòng phỏng vấn ảo 3D tích hợp AI hội thoại giọng nói và Lipsync.
**Mode:** mvp
**Success Criteria:**
1. Ứng viên tham gia phòng phỏng vấn 3D với nhân vật người ảo phỏng vấn (dựng bằng Three.js/React Three Fiber).
2. Avatar tự động có hành động idle (chớp mắt, gật đầu nhẹ) và khẩu hình miệng (lipsync) mập mờ khớp chính xác với âm thanh phát ra của AI (phân tích bằng Web Audio API).
3. Ứng viên nhấn giữ nút Microphone thu âm câu trả lời, backend STT dịch thành văn bản và lưu lại lịch sử.
4. AI sinh câu hỏi phỏng vấn tiếp theo cá nhân hóa dựa trên CV + JD + Lịch sử, và tự động gọi TTS chuyển thành file âm thanh trả về client.
5. Khi kết thúc, hiển thị biểu đồ mạng nhện Radar Chart đánh giá năng lực theo 5 khía cạnh cốt lõi và lộ trình học tập đề xuất.

---
*Roadmap defined: 2026-06-07*
*Last updated: 2026-06-07 after initial definition*
