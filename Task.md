# MockAI - Nền tảng Hỗ trợ Việc làm Toàn diện tích hợp AI

Dự án xây dựng hệ sinh thái hỗ trợ việc làm hiện đại, sử dụng trí tuệ nhân tạo để tối ưu hóa hồ sơ năng lực, luyện tập phỏng vấn thực tế và xây dựng lộ trình sự nghiệp cá nhân hóa dựa trên dữ liệu thị trường.

## 🛠 Ngăn Xếp Công Nghệ (Tech Stack)

- **Frontend:** ReactJS + Vite app, Tailwind CSS, Lucide Icons, Chart.js/Recharts (Radar Chart), Three.js, Framer Motion.
- **Backend:** Node.js, Express.js.
- **Database:** PostgreSQL (Knex.js).
- **AI & ML:**
  - `whisper-node` (Speech-to-Text)
  - `node-llama-cpp` (Llama-3 model)
  - `pdf-parse` (CV Extraction & Analysis)
- **Real-time & Storage:** WebRTC/WebSockets, JWT, AWS S3/Cloudinary.

---

## 👥 Phân Công Nhiệm Vụ (5 Modules - 5 Nhân sự)

### 1. Quân - Module phỏng vấn kiến thức giữa ứng viên với AI (Chỉ test kiến thức)
- Sau khi ứng viên nộp CV lên hệ thống thì AI sẽ dựa vào CV và requirements của vị trí ứng tuyển để đặt câu hỏi cho ứng viên
- Sau khi hoàn tất buổi phỏng vấn với AI thì AI sẽ dựa vào câu trả lời của ứng viên để đánh giá sau đó gửi về cho HR và xếp hạng danh sách ứng viên và update trên giao diện của HR 

### 2. Phương - Module luyện tập Phỏng vấn Giọng nói & Tương tác AI (AI Voice Engine & Interaction)
- Module sẽ bao gồm các kỹ năng phỏng vấn như là xin chào, small talk, giao tiếp cơ bản trước khi đi vào phỏng vấn chuyên sâu về kỹ năng, điểm mạnh điểm yếu, câu hỏi chuyên môn, và kết thúc buổi phỏng vấn. Tương tác giữa user và AI sẽ là voice/video (có thể tắt camera) 
- User sẽ đưa CV vào và lựa chọn vị trí muốn ứng tuyển sau đó hệ thống AI sẽ đưa ra danh sách để cho phép user luyện tập phỏng vấn thông qua giọng nói (user và AI sẽ trò chuyện với nhau)
- Sau khi hoàn tất buổi phỏng vấn với AI thì AI sẽ dựa vào câu trả lời của ứng viên để đánh giá sau đó đưa ra lộ trình luyện tập phỏng vấn và hướng dẫn cách trả lời các câu hỏi phỏng vấn cho ứng viên để có thể trả lời phỏng vấn tốt hơn. 


### 3. Khánh - Module giao diện và chức năng cho HR đăng bài ứng tuyển
- HR sẽ đăng bài ứng tuyển lên hệ thống 
- Hệ thống sẽ dựa vào bài đăng tuyển để đưa ra danh sách các câu hỏi phỏng vấn 
- HR sẽ xem danh sách các ứng viên và đánh giá 
- HR sẽ xem danh sách các bài đánh giá CV và chấm điểm CV 


### 4. Huy - Module Đánh giá CV, chấm điểm CV và gợi ý chỉnh sửa CV 
- User sẽ upload CV lên hệ thống 
- Hệ thống sẽ dựa vào CV và yêu cầu của vị trí ứng tuyển để đánh giá CV và chấm điểm CV
- Sau khi đánh giá CV thì hệ thống sẽ đưa ra lộ trình luyện tập phỏng vấn và hướng dẫn cách trả lời các câu hỏi phỏng vấn cho ứng viên để có thể trả lời phỏng vấn tốt hơn. 
- Ứng viên có thể upload CV của mình và yêu cầu AI chấm điểm theo vị trí mà mình muốn ứng tuyển để AI chấm điểm
- Có thể đánh giá CV một cách tổng quan và đưa ra nhận xét tổng quan về CV 


### 5. Sang - Module giao diện và chức năng cho Admin hệ thống để quản lý các users
- Admin hệ thống sẽ quản lý các users 
- Admin hệ thống sẽ quản lý các bài đăng tuyển
- Admin hệ thống sẽ quản lý các bài đánh giá CV và chấm điểm CV
- Admin hệ thống sẽ quản lý các bài luyện tập phỏng vấn


---
