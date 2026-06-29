---
baseline_commit: 0f03175ff859c36c1e1a47a75eca6412cb58f5ca
---

# Story 3.4: Audio Slicing API and Embedded Playback

Status: done

## Story

As a recruiter,
I want to listen to the specific audio segment of the candidate's answer directly from the highlights timeline,
So that I can verify the AI's findings (strengths, weaknesses, hesitations, violations) without listening to the whole 2-minute answer.

## Acceptance Criteria (Tiêu chí Chấp nhận)

1. **API Endpoint ở Backend (`GET /api/interviews/hr/audio/slice`):**
   - Khai báo endpoint mới trong `backend/src/routes/interviewRoutes.js`.
   - Chỉ cho phép người dùng có vai trò `HR` hoặc `ADMIN` đã xác thực truy cập.
   - Triển khai handler `getAudioSliceHandler` trong `backend/src/controllers/hrInterviewController.js`.
   - Handler nhận các tham số query:
     - `audioUrl`: Đường dẫn tệp âm thanh gốc (ví dụ từ Cloudinary).
     - `start`: Thời điểm bắt đầu cắt (giây), mặc định là `0`.
     - `duration`: Thời lượng cần cắt (giây), mặc định là `30`.
   - Vì hệ thống server không cài đặt binary `ffmpeg` (đã được xác minh CommandNotFound), handler sẽ hoạt động dưới dạng **Virtual Slicer Proxy**:
     - Kiểm tra tính hợp lệ của các tham số.
     - Tải stream từ `audioUrl` gốc và pipe trực tiếp về client (hoặc redirect `302` nếu gặp sự cố tải file) với các header bổ sung:
       - `X-Audio-Slice-Start`: Giá trị `start`.
       - `X-Audio-Slice-Duration`: Giá trị `duration`.
       - `X-Audio-Slice-Virtual`: `true` (báo hiệu cho client biết đây là stream ảo để client tự điều khiển phát).

2. **Frontend API Client:**
   - Khai báo hàm `getAudioSliceUrl(audioUrl, start, duration)` trong `frontend/src/api/hrInterviewApi.js` để trả về URL gọi lên endpoint slice ở backend kèm các tham số query phù hợp.

3. **Giao diện Trình phát nhạc nhúng Mini (Embedded Audio Playback):**
   - Tại mỗi phần tử mốc thời gian trong timeline của `ApplicationDetailModal.jsx`:
     - Nhúng một trình phát âm thanh mini (Mini Audio Player) thiết kế cao cấp, nhỏ gọn bằng tông màu xanh đại dương (Ocean Blue) và Glassmorphism.
     - Trình phát gồm: Nút Play/Pause nhỏ, thanh tiến trình mini (progress bar) thể hiện thời gian đang phát của đoạn slice, và nhãn thời gian dạng `0:02 / 0:30`.
     - Khi HR click vào một mốc thời gian, trình phát âm thanh của mốc đó sẽ xuất hiện ngay dưới nội dung khoảnh khắc nổi bật (hoặc hiển thị nút Play/Pause cạnh mốc thời gian và click vào sẽ mở rộng thanh phát nhạc).
     - Khi phát:
       - Sử dụng thẻ `<audio>` HTML5 ẩn hoặc React refs để load nguồn nhạc từ API slice.
       - Tự động tua (seek) đến giây thứ `start` ngay sau khi audio đã sẵn sàng phát (`canplay` / `loadedmetadata`).
       - Lắng nghe sự kiện `timeupdate`. Khi `currentTime >= start + duration`, tự động tạm dừng (pause) và tua ngược lại vị trí `start` để giới hạn thời lượng phát đúng bằng `duration`.
       - Hiển thị hiệu ứng vi sóng âm thanh động (micro-animations audio wave) nhỏ nhấp nháy màu xanh khi đang phát nhạc để tạo cảm giác sống động, chuyên nghiệp.

4. **Định vị chính xác File Audio gốc của Câu hỏi:**
   - Để biết mốc thời gian `timestamp` thuộc về câu hỏi nào:
     - Áp dụng công thức ánh xạ tương đối: `questionIndex = Math.floor(timestamp / 30) + 1` (giới hạn tối đa bằng độ dài transcript).
     - Lấy file audio gốc của câu hỏi đó từ transcript: `const targetQA = transcriptData.transcript[questionIndex - 1]`.
     - Lấy `audioUrl = targetQA.audioUrl` (cần cập nhật service backend và frontend API để trả về `audioUrl` trong transcript Q&A).
     - Nếu `audioUrl` không tồn tại (ứng viên không ghi âm hoặc lỗi file), ẩn trình phát hoặc hiển thị trạng thái vô hiệu hóa kèm tooltip "Không có ghi âm cho câu trả lời này".

5. **Đảm bảo chất lượng & Linting:**
   - Chạy kiểm thử linter: `pnpm -C frontend run lint` không phát sinh bất kỳ lỗi nào.
   - Kiểm tra phát nhạc seek và pause hoạt động hoàn hảo trên trình duyệt.

## Tasks / Subtasks (Nhiệm vụ chi tiết)

- [x] Cập nhật Backend API & Services
  - [x] Khai báo route `/hr/audio/slice` trong `backend/src/routes/interviewRoutes.js` cho HR/Admin.
  - [x] Cập nhật `getHRInterviewTranscript` trong `backend/src/services/hrInterviewService.js` để bổ sung trường `audio_url` vào đối tượng Q&A trả về cho client.
  - [x] Viết handler `getAudioSliceHandler` trong `backend/src/controllers/hrInterviewController.js` thực hiện proxy stream file audio gốc và đính kèm các custom headers (`X-Audio-Slice-Start`, etc.).
- [x] Cập nhật Frontend API Client
  - [x] Thêm hàm `getAudioSliceUrl` vào `frontend/src/api/hrInterviewApi.js`.
- [x] Thiết kế và Tích hợp Mini Audio Player vào Timeline
  - [x] Tạo component `MiniAudioPlayer` (hoặc viết trực tiếp trong `ApplicationDetailModal.jsx`) quản lý thẻ audio ẩn, logic seek từ giây `start`, tự động pause khi hết `duration`, và điều khiển play/pause.
  - [x] Cập nhật timeline render trong `ApplicationDetailModal.jsx`: ánh xạ `timestamp` của mốc thời gian sang câu hỏi trong transcript để lấy `audioUrl` tương ứng.
  - [x] Hiển thị trình phát nhạc mini Ocean Blue khi HR chọn nghe mốc thời gian đó.
  - [x] Thêm micro-animations sóng âm nhấp nháy khi đang phát nhạc.
- [x] Xác minh & Kiểm thử (Verification)
  - [x] Mở HR Dashboard, kiểm tra phát âm thanh cho mốc thời gian có chạy đúng từ giây bắt đầu và tự động dừng sau 30 giây hay không.
  - [x] Chạy linter: `pnpm -C frontend run lint` thành công.

### Review Findings

- [x] [Review][Patch] SSRF Risk & Lack of Redirect Support in Node.js built-in `https.get` [backend/src/controllers/hrInterviewController.js:220]
- [x] [Review][Patch] UI Loading State Mismatch vs "No Audio" Message [frontend/src/pages/recruiter/components/ApplicationDetailModal.jsx:900]
- [x] [Review][Defer] JWT Token transmission via URL Query Parameters [frontend/src/api/hrInterviewApi.js:47] — deferred, pre-existing design limitation

## Dev Notes (Ghi chú phát triển)

- **Tải file từ Cloudinary ở Backend**: Sử dụng module built-in `https` (hoặc `http`) của Node.js giúp proxy stream tệp gốc ổn định và độc lập với ffmpeg binary.
- **HTML5 Audio Control**:
  ```javascript
  const audio = audioRef.current;
  // Thiết lập seek khi load
  const handleLoadedMetadata = () => {
    audio.currentTime = start;
  };
  // Giới hạn phát nhạc
  const handleTimeUpdate = () => {
    if (audio.currentTime >= start + duration) {
      audio.pause();
      audio.currentTime = start;
    }
  };
  ```

### Project Structure Notes (Cấu trúc dự án)

- `backend/src/routes/interviewRoutes.js`
- `backend/src/controllers/hrInterviewController.js`
- `backend/src/services/hrInterviewService.js`
- `frontend/src/api/hrInterviewApi.js`
- `frontend/src/pages/recruiter/components/ApplicationDetailModal.jsx`

## Dev Agent Record

### Agent Model Used

Antigravity (Google DeepMind)

### Debug Log References

- API endpoint `/hr/audio/slice` successfully registered and proxying audio stream using Node.js built-in `https` module.
- Fallback route logic implemented to redirect to raw audioUrl in case of errors.
- Custom headers (`X-Audio-Slice-Start`, `X-Audio-Slice-Duration`, `X-Audio-Slice-Virtual`) sent correctly.
- Embedded `MiniAudioPlayer` implementation using HTML5 Audio controls (`currentTime`, `pause`, event listeners).

### Completion Notes List

- Triển khai thành công Backend Audio Slice proxy router & controller.
- Thêm trường `audioUrl` vào đối tượng Q&A transcript để frontend xác định audio file tương ứng.
- Tích hợp `getAudioSliceUrl` sinh URL kèm JWT token để phục vụ request direct.
- Xây dựng component Mini Audio Player Premium Ocean Blue với hiệu ứng sóng âm nhấp nháy khi đang phát nhạc.
- Chạy linter `pnpm -C frontend run lint` thành công với 0 errors.

### File List

- `backend/src/routes/interviewRoutes.js`
- `backend/src/controllers/hrInterviewController.js`
- `backend/src/services/hrInterviewService.js`
- `frontend/src/api/hrInterviewApi.js`
- `frontend/src/pages/recruiter/components/ApplicationDetailModal.jsx`
