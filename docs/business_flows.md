# TÀI LIỆU PHÂN TÍCH USE CASE & LUỒNG NGHIỆP VỤ HỆ THỐNG (BUSINESS FLOWS)
**Tác giả**: Business Analyst & Software Architect Senior  
**Dự án**: MockAI-Interview (Nền tảng hỗ trợ việc làm tích hợp AI cao cấp)  

---

## 🛠️ PHẦN 1: BẢN ĐỒ USE CASE HỆ THỐNG (SYSTEM USE CASES)

Dưới đây là danh sách tất cả các Use Case nghiệp vụ được trích xuất trực tiếp từ mã nguồn hệ thống, phân chia theo các nhóm thực thể chính:

### 1. Phân hệ Ứng viên (Candidate / Jobseeker Use Cases)
- **Đăng ký tài khoản ứng viên**: Tạo tài khoản tìm việc mới.
- **Kích hoạt tài khoản**: Xác thực email để kích hoạt quyền đăng nhập.
- **Đăng nhập hệ thống**: Truy cập bằng email/mật khẩu hoặc đăng nhập nhanh qua Google.
- **Đồng ý bảo mật dữ liệu**: Ký cam kết bảo vệ và xử lý thông tin cá nhân.
- **Quản lý hồ sơ cá nhân**: Cập nhật thông tin liên hệ, avatar, ảnh bìa.
- **Tìm kiếm việc làm**: Tra cứu cơ hội nghề nghiệp theo từ khóa.
- **Lọc việc làm đa chiều**: Lọc tin tuyển dụng theo địa điểm, mức lương, kinh nghiệm, cấp bậc.
- **Lưu tin tuyển dụng**: Đánh dấu các công việc yêu thích.
- **Ghi chú cá nhân tin tuyển dụng**: Viết ghi chú chuẩn bị cho từng công việc đã lưu.
- **Tải lên & Bóc tách CV**: Tải CV định dạng PDF để AI trích xuất nội dung chữ.
- **AI Đánh giá & Chấm điểm CV**: So khớp CV với JD cụ thể để chấm điểm tương thích ATS.
- **Xuất báo cáo ATS**: Tạo và tải tệp báo cáo đánh giá CV dưới dạng PDF.
- **Luyện phỏng vấn thử với AI**: Phỏng vấn trực tiếp bằng giọng nói thời gian thực với Avatar 3D.
- **Nhận đánh giá năng lực**: Nhận kết quả đánh giá phỏng vấn qua biểu đồ Radar Chart 5 chiều.
- **Tham gia Thử thách hàng ngày**: Trả lời câu hỏi nhanh bằng giọng nói để duy trì chuỗi ngày luyện tập (Streak).
- **Xem Bảng xếp hạng**: Xem thứ hạng thành tích luyện tập của mình so với cộng đồng.
- **Viết bài viết cộng đồng**: Soạn thảo bài viết chia sẻ kinh nghiệm định dạng Markdown và lưu nháp.
- **Đăng bài cộng đồng**: Gửi bài viết lên hàng chờ duyệt để xuất bản công khai.
- **Tương tác cộng đồng**: Thích bài viết, bình luận, sửa/xóa bình luận cá nhân.
- **Tính toán lương Gross-Net**: Tính toán chi tiết thu nhập thực nhận sau thuế.
- **Mua gói dịch vụ**: Nâng cấp tài khoản lên gói Pro để mở rộng giới hạn AI.

### 2. Phân hệ Nhà tuyển dụng (Recruiter / HR Use Cases)
- **Đăng ký tài khoản nhà tuyển dụng**: Tạo tài khoản tuyển dụng mới.
- **Đăng ký thông tin công ty**: Thiết lập thương hiệu tuyển dụng, đăng tải logo, ảnh bìa.
- **Xác thực doanh nghiệp (KYC HR)**: Gửi mã OTP xác nhận sở hữu email doanh nghiệp để lấy nhãn kiểm duyệt.
- **Xem báo cáo tuyển dụng**: Theo dõi hiệu suất chiến dịch đăng tuyển (lượt xem, đơn ứng tuyển).
- **Đăng tin tuyển dụng mới**: Nhập chi tiết tiêu đề, mô tả và các yêu cầu chi tiết (detailed requirements).
- **Quản lý tin tuyển dụng**: Cập nhật thông tin hoặc đóng/mở tin tuyển dụng.
- **Quản lý phễu ứng viên**: Kéo thả thẻ ứng viên qua các giai đoạn lọc trên bảng Kanban.
- **Sàng lọc ứng viên nâng cao (AI Screening)**: Xem điểm tương thích ATS và Radar Chart phỏng vấn thử AI của ứng viên.
- **Ghi chú hồ sơ ứng viên**: Lưu nhận xét nội bộ trên từng thẻ ứng viên.
- **Gửi lời mời phỏng vấn AI**: Mời ứng viên thực hiện phỏng vấn thử với AI hệ thống để lấy dữ liệu tham khảo.
- **Xuất danh sách ứng viên**: Tải danh sách ứng viên được chọn lọc (Shortlist) ra file Excel/CSV.
- **Nạp Credit tuyển dụng**: Mua credit qua cổng thanh toán VNPay/Momo để chi trả phí dịch vụ tuyển dụng.

### 3. Phân hệ Quản trị viên (Admin Use Cases)
- **Xem báo cáo phân tích hệ thống**: Theo dõi chỉ số tăng trưởng người dùng, doanh thu toàn trang.
- **Cấu hình ma trận phân quyền**: Cập nhật động quyền hạn truy cập của các vai trò (RBAC).
- **Kiểm duyệt tin tuyển dụng**: Phê duyệt hoặc từ chối tin tuyển dụng mới của HR trước khi hiển thị công khai.
- **Kiểm duyệt bài viết cộng đồng**: Phê duyệt hoặc xóa các bài blog vi phạm tiêu chuẩn.
- **Xác thực KYC nhà tuyển dụng**: Đối sánh thông tin đăng ký doanh nghiệp của HR.
- **AI OCR Quét CMND/CCCD**: Sử dụng AI quét ảnh giấy tờ tùy thân của HR để tự động xác minh danh tính.

---

## 🧭 PHẦN 2: BẢN ĐỒ CÁC LUỒNG NGHIỆP VỤ LỚN (BUSINESS FLOWS)

Các Use Case trên được tổ chức thành **9 Luồng nghiệp vụ xuyên suốt** đại diện cho toàn bộ hành trình trải nghiệm của khách hàng và quy trình vận hành hệ thống:

```
[Khách hàng vãng lai] 
         │
         ▼ (Giao thức Auth Gate bảo vệ)
 1. Luồng Xác thực & Kích hoạt tài khoản an toàn 
         │
         ├─────────────────────────────────────────┐
         ▼                                         ▼
 [Luồng Ứng viên / Jobseeker]               [Luồng Tuyển dụng / Recruiter]
 2. Luồng Tìm kiếm việc làm & Nộp hồ sơ    5. Luồng Đăng tuyển & Sàng lọc ứng viên (Kanban)
 3. Luồng Đánh giá hồ sơ & Tối ưu ATS      6. Luồng Xác thực Doanh nghiệp (KYC HR)
 4. Luồng Phỏng vấn AI 3D & Streak         7. Luồng Nạp Credit & Thanh toán Doanh nghiệp
         │                                         │
         └────────────────────┬────────────────────┘
                              ▼
                8. Luồng Cộng đồng & Tương tác
                              ▼
            9. Luồng Kiểm duyệt & Quản trị Hệ thống (Admin)
```

---

## 📝 PHẦN 3: MÔ TẢ CHI TIẾT TỪNG LUỒNG NGHIỆP VỤ CHO KHÁCH HÀNG

---

### LUỒNG 1: XÁC THỰC & KÍCH HOẠT TÀI KHOẢN AN TOÀN (SECURE AUTHENTICATION FLOW)
* **Các Use Case bao gồm:** Đăng ký tài khoản (Candidate/Recruiter), Xác thực kích hoạt email, Đăng nhập (Email hoặc Google OAuth), Đồng ý cam kết bảo mật dữ liệu, Cập nhật thông tin profile (Avatar/Cover).
* **Mô tả tổng quan hành trình:** Hệ thống cung cấp cổng đăng nhập/đăng ký nhất quán. Khi người dùng mới đăng ký, hệ thống gửi email kích hoạt tài khoản. Sau khi kích hoạt và đăng nhập, người dùng được yêu cầu ký số đồng ý thỏa thuận dữ liệu cá nhân trước khi tải lên ảnh đại diện và ảnh bìa để cá nhân hóa tài khoản.
* **Điểm sáng công nghệ & Tối ưu:**
  - Tải ảnh không qua đĩa trung gian: Sử dụng [uploadMiddleware.js](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/backend/src/middlewares/uploadMiddleware.js) kết hợp Multer Memory Storage đẩy trực tiếp file lên Cloudinary dạng buffer, tối ưu hóa tốc độ I/O và dung lượng ổ cứng của server.
  - Đăng nhập một chạm: Tích hợp Google OAuth giúp bỏ qua các bước nhập liệu thủ công.
* **Giá trị hấp dẫn người dùng:**
  - Trải nghiệm đăng ký nhanh gọn, an toàn và bảo mật cao.
  - Giao diện thiết lập hồ sơ trực quan, hiệu ứng tải ảnh mượt mà cùng hệ màu xanh Ocean Blue tạo sự tin cậy.
* **Độ chặt chẽ của nghiệp vụ:**
  - Mật khẩu mã hóa `bcryptjs` với độ muối (salt rounds) tối ưu chống giải mã ngược.
  - Giao thức **Auth Gate** ([index.jsx](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/frontend/src/routes/index.jsx)) chặn đứng mọi truy cập trái phép vào trang sâu, đẩy Toast cảnh báo nhưng không bật modal thô bạo.
  - Thỏa thuận bảo mật thông tin (`privacy-agreement`) được lưu vết cụ thể thời gian ký trong cơ sở dữ liệu để phục vụ kiểm toán bảo mật dữ liệu (Compliance).

---

### LUỒNG 2: TÌM KIẾM VIỆC LÀM ĐA CHIỀU & NỘP HỒ SƠ (SMART JOB SEEKING & APPLICATION FLOW)
* **Các Use Case bao gồm:** Tìm kiếm việc làm theo từ khóa, Lọc tin theo 7 tiêu chí (Ngành, Lương, Kinh nghiệm...), Xem chi tiết JD, Lưu công việc, Viết ghi chú chuẩn bị, Nộp hồ sơ ứng tuyển, Theo dõi trạng thái hồ sơ.
* **Mô tả tổng quan hành trình:** Ứng viên sử dụng bộ lọc tìm công việc mong muốn, lưu tin tuyển dụng để nghiên cứu sâu và có thể viết ghi chú chuẩn bị. Khi sẵn sàng, ứng viên nhấn ứng tuyển, chọn CV đã tải lên và viết thư giới thiệu (Cover Letter). Ứng viên theo dõi tiến trình tuyển dụng ngay trên trang quản lý ứng tuyển cá nhân.
* **Điểm sáng công nghệ & Tối ưu:**
  - Kỹ thuật **Debounced Search**: Độ trễ 400ms ở ô tìm kiếm giúp triệt tiêu hiện tượng spam API request lên cơ sở dữ liệu khi ứng viên gõ phím liên tục.
  - **TanStack Query Caching**: Tự động lưu cache danh sách công việc ở Client, giảm số lần truy vấn database trùng lặp và tăng tốc độ chuyển trang lên tức thì.
  - Đồng bộ thời gian thực: Cập nhật trạng thái ứng tuyển qua kết nối **Socket.io** khi HR thay đổi trạng thái hồ sơ của ứng viên.
* **Giá trị hấp dẫn người dùng:**
  - Thiết kế bảng lọc cực kỳ hiện đại như TopCV giúp tiết kiệm tối đa thời gian tìm kiếm.
  - Minh bạch hóa quá trình ứng tuyển: Ứng viên biết chính xác CV của mình đã được HR xem hay chưa, giảm bớt sự lo lắng khi gửi hồ sơ.
* **Độ chặt chẽ của nghiệp vụ:**
  - Chỉ cho phép ứng viên đã đăng nhập và có vai trò `jobseeker` nộp đơn.
  - Ràng buộc duy nhất: Một ứng viên chỉ được nộp tối đa **1 đơn ứng tuyển** cho mỗi vị trí công việc đang mở, không cho phép spam hồ sơ lỗi.
  - Hệ thống tự động kiểm tra thời hạn tin tuyển dụng (`deadline`) và trạng thái `OPEN` trước khi nhận hồ sơ.

---

### LUỒNG 3: ĐÁNH GIÁ HỒ SƠ & TỐI ƯU HÓA ATS TỰ ĐỘNG (AI RESUME PARSING & ATS SCORING FLOW)
* **Các Use Case bao gồm:** Tải lên tệp CV PDF, Bóc tách chữ tự động (Text extraction), AI chấm điểm tương thích ATS (ATS Score Matcher), Xuất báo cáo đánh giá ra PDF.
* **Mô tả tổng quan hành trình:** Ứng viên tải lên tệp CV PDF của mình. Hệ thống sử dụng AI bóc tách thông tin và phân tích điểm số tương thích với bản mô tả công việc (JD). AI chỉ ra các kỹ năng bị thiếu hụt, các từ khóa cần bổ sung và cho phép xuất báo cáo đánh giá hoàn chỉnh ra file PDF.
* **Điểm sáng công nghệ & Tối ưu:**
  - Sử dụng thư viện `pdf-parse` bóc tách văn bản trực tiếp từ memory buffer mà không tạo file rác trên ổ cứng máy chủ.
  - AI Phân tích ngữ nghĩa chuyên sâu (Semantic Matcher) thay vì so khớp từ khóa thô sơ, giúp nhận diện các kỹ năng tương đương (ví dụ: Postgres và PostgreSQL).
  - Tích hợp `pdfkit` xuất báo cáo PDF động với giao diện bố cục chuyên nghiệp của doanh nghiệp lớn.
* **Giá trị hấp dẫn người dùng:**
  - Giúp ứng viên "vượt ải" lọc CV tự động của các doanh nghiệp lớn bằng cách nâng cấp điểm số ATS lên trên 80%.
  - Biết chính xác mình cần học thêm công nghệ gì hoặc viết lại câu chữ thế nào để lọt vào mắt xanh của HR.
* **Độ chặt chẽ của nghiệp vụ:**
  - Giới hạn kích thước tệp tải lên dưới 5MB và bắt buộc định dạng `.pdf` để tránh tấn công tải lên mã độc qua file thực thi.
  - Quyền truy cập kết quả chấm điểm được bảo mật nghiêm ngặt bằng JWT token, chỉ ứng viên tải lên hoặc HR nhận hồ sơ mới có quyền xem.

---

### LUỒNG 4: LUYỆN TẬP PHỎNG VẤN ẢO AI 3D & GAME HÓA (IMMERSIVE AI INTERVIEW & GAMIFICATION FLOW)
* **Các Use Case bao gồm:** Khởi tạo buổi phỏng vấn ảo, AI sinh câu hỏi phỏng vấn động theo CV & JD, Mô phỏng người phỏng vấn 3D, Trả lời qua Microphone (Voice-to-Text), Phân tích kết quả phỏng vấn thử (Radar Chart), Làm Thử thách hàng ngày, Tích lũy chuỗi Streak và đua Bảng xếp hạng.
* **Mô tả tổng quan hành trình:** Ứng viên tham gia phòng phỏng vấn ảo, trò chuyện trực tiếp qua microphone với nhân vật 3D mô phỏng HR. AI sinh câu hỏi động dựa trên CV và JD của vị trí đó. Kết thúc buổi, ứng viên nhận đánh giá năng lực 5 chiều bằng Radar Chart và các câu trả lời mẫu. Ứng viên cũng có thể làm các thử thách câu hỏi hàng ngày để tích điểm và duy trì chuỗi Streak học tập đều đặn.
* **Điểm sáng công nghệ & Tối ưu:**
  - Mô phỏng người ảo bằng **Three.js** kết hợp với `@react-three/fiber` cho phép hiển thị trực quan chuyển động ngay trên trình duyệt mà không cần cài đặt phần mềm nặng.
  - Chuyển đổi giọng nói ngay tại Client bằng **Web Speech API** giúp tiết kiệm chi phí dịch vụ đám mây và giảm độ trễ phản hồi giọng nói xuống gần như bằng 0.
  - Thuật toán Gamification: Tự động ghi nhận chuỗi hoạt động liên tục (Streak) dựa trên múi giờ địa phương và cập nhật bảng xếp hạng tức thì qua cơ chế cập nhật gia tăng.
* **Giá trị hấp dẫn người dùng:**
  - Phòng phỏng vấn giả lập chuyên nghiệp giúp loại bỏ 100% cảm giác lo lắng, bối rối trước khi bước vào phòng phỏng vấn thật.
  - Radar Chart trực quan chỉ rõ điểm yếu và điểm mạnh của ứng viên, giúp họ tập trung ôn luyện có trọng tâm.
  - Động lực học tập hàng ngày nhờ hệ thống tranh tài điểm số thú vị với cộng đồng.
* **Độ chặt chẽ của nghiệp vụ:**
  - Giới hạn lượt phỏng vấn theo tài khoản: Người dùng miễn phí bị giới hạn số lượt phỏng vấn hàng tháng, gói Pro mở khóa không giới hạn để đảm bảo công bằng và tính thương mại.
  - Trạng thái phiên phỏng vấn được xác thực thông qua mã phiên duy nhất lưu ở DB để tránh giả mạo kết quả trả lời hoặc gửi đáp án khống.

---

### LUỒNG 5: TUYỂN DỤNG, SƠ LOẠI & QUẢN LÝ PHỄU KANBAN (AI SCREENING & KANBAN RECRUITING FLOW)
* **Các Use Case bao gồm:** Xem danh sách hồ sơ ứng tuyển, Quản lý ứng viên dạng kéo thả Kanban, Xem nhanh điểm ATS & Radar Chart phỏng vấn thử AI của ứng viên, Ghi chú hồ sơ, Gửi lời mời phỏng vấn AI, Xuất danh sách ứng viên đạt yêu cầu.
* **Mô tả tổng quan hành trình:** Nhà tuyển dụng đăng nhập vào Dashboard quản lý tin tuyển dụng. Toàn bộ hồ sơ ứng viên nộp về được tổ chức thành các cột trạng thái trên bảng Kanban. HR có thể kéo thả ứng viên để thay đổi trạng thái, click xem nhanh phân tích ATS và kết quả phỏng vấn ảo của họ để đưa ra ghi chú đánh giá nhanh, gửi lời mời phỏng vấn tự động và xuất dữ liệu báo cáo.
* **Điểm sáng công nghệ & Tối ưu:**
  - Bảng Kanban tương tác cực cao được xử lý bằng Framer Motion cho hiệu ứng kéo thả mượt mà và trực quan.
  - Đồng bộ đa thiết bị: Sử dụng **Socket.io** truyền tải trạng thái kéo thả Kanban tức thì sang trang cá nhân của ứng viên.
  - Tích hợp xem trực tiếp kết quả phỏng vấn AI của ứng viên mà không cần mở tab mới giúp giảm số lượng click và thao tác của HR.
* **Giá trị hấp dẫn người dùng:**
  - Tiết kiệm 70% thời gian sơ loại hồ sơ và gọi điện phỏng vấn lọc vòng đầu. Dữ liệu phỏng vấn AI và điểm ATS cung cấp cái nhìn khách quan và chính xác về năng lực ứng viên ngay lập tức.
  - Thao tác kéo thả cực kỳ đơn giản giúp HR quản lý hàng trăm hồ sơ một cách khoa học và không bị bỏ sót.
* **Độ chặt chẽ của nghiệp vụ:**
  - Kiểm tra phân quyền: Chỉ tài khoản có vai trò `recruiter` mới được phép truy cập và thực hiện thao tác trên bảng Kanban.
  - HR chỉ được xem và kéo thả các hồ sơ ứng cử vào đúng tin tuyển dụng do tài khoản của mình tạo hoặc thuộc doanh nghiệp của mình để đảm bảo tính riêng tư thông tin doanh nghiệp.

---

### LUỒNG 6: XÁC THỰC DOANH NGHIỆP & QUẢN LÝ TIN ĐĂNG (RECRUITER KYC & CAMPAIGN FLOW)
* **Các Use Case bao gồm:** Tạo/Cập nhật thông tin doanh nghiệp, Gửi mã OTP xác thực email doanh nghiệp, Xác minh OTP kích hoạt nhãn doanh nghiệp chính danh, Đăng tin tuyển dụng (kèm yêu cầu chi tiết), Đóng/Mở tin, Xem báo cáo chiến dịch tuyển dụng.
* **Mô tả tổng quan hành trình:** Để đăng tuyển tin uy tín, HR cần thiết lập hồ sơ công ty và gửi yêu cầu xác thực email doanh nghiệp (ví dụ: tên miền `@viettel.com`). Sau khi nhập mã OTP xác thực gửi về email, HR đăng tin tuyển dụng mới kèm các yêu cầu đầu vào chi tiết. Tin tuyển dụng sẽ được chuyển vào hàng đợi kiểm duyệt trước khi hiển thị công khai. HR cũng theo dõi báo cáo hiệu quả tin tuyển dụng để tối ưu hóa chiến dịch.
* **Điểm sáng công nghệ & Tối ưu:**
  - Thuật toán tạo mã OTP ngẫu nhiên 6 chữ số kèm cơ chế tự hủy (TTL - Time to Live) lưu trữ trong cơ sở dữ liệu để đảm bảo an toàn.
  - Tách biệt tin tuyển dụng ở trạng thái chờ duyệt (Pending) và công khai (Open) giúp hệ thống lọc nội dung rác trước khi tiếp cận ứng viên.
* **Giá trị hấp dẫn người dùng:**
  - Doanh nghiệp được xác minh có nhãn tick xanh uy tín, giúp tăng 200% tỷ lệ nộp hồ sơ từ các ứng viên chất lượng cao.
  - Thống kê biểu đồ trực quan về lượt xem và lượt ứng cử giúp HR biết được tin tuyển dụng nào đang thu hút nhất để điều chỉnh.
* **Độ chặt chẽ của nghiệp vụ:**
  - Bắt buộc OTP xác thực email doanh nghiệp trùng với website đã đăng ký để chống giả mạo danh tính HR của các công ty lớn.
  - Tin đăng bắt buộc phải được Admin phê duyệt mới được chuyển trạng thái `OPEN` để hiển thị trên Jobs Board chung.

---

### LUỒNG 7: THANH TOÁN, THUÊ BAO PRO & NẠP CREDITS (PAYMENT & MONETIZATION FLOW)
* **Các Use Case bao gồm:** Xem bảng giá cước, Tạo liên kết thanh toán VNPAY Sandbox, Nhận callback IPN tự động từ VNPAY, Tự động nâng cấp tài khoản Pro / Cộng credit, Xem lịch sử giao dịch.
* **Mô tả tổng quan hành trình:** Người dùng truy cập trang thanh toán. Ứng viên mua gói tháng Pro để mở khóa AI, HR mua gói credit phục vụ tuyển dụng. Hệ thống tạo link thanh toán an toàn chuyển hướng sang VNPAY. Sau khi thanh toán thành công, cổng VNPAY gửi tín hiệu IPN ngầm đến server MockAI để xác minh và tự động kích hoạt dịch vụ cho người dùng.
* **Điểm sáng công nghệ & Tối ưu:**
  - Xử lý giao dịch thông qua cơ chế **VNPAY IPN (Instant Payment Notification)**: Đây là một webhook ngầm chạy độc lập, giúp xử lý cập nhật trạng thái thanh toán thành công ngay cả khi người dùng mất kết nối mạng hoặc đóng tab trình duyệt trước khi trang chuyển hướng thành công.
  - Tối ưu hóa Database Transactions: Đảm bảo tiến trình cộng credit và ghi lịch sử giao dịch được thực hiện nguyên tử (Atomic Transaction), tránh lỗi cộng thiếu hoặc cộng lặp.
* **Giá trị hấp dẫn người dùng:**
  - Thanh toán nhanh chóng bằng quét mã QR của các ứng dụng ngân hàng hay ví điện tử phổ biến.
  - Tài khoản được nâng cấp tự động và ghi nhận giao dịch lập tức mà không cần gọi tổng đài hỗ trợ.
* **Độ chặt chẽ của nghiệp vụ:**
  - Thuật toán xác thực chữ ký số bằng mã hash bí mật (Secure Hash SHA512) từ VNPAY gửi về, ngăn chặn hoàn toàn các cuộc tấn công thay đổi tham số giá tiền hoặc trạng thái giao dịch (Man-in-the-middle).
  - Kiểm tra trùng lặp giao dịch (Idempotency Check) dựa trên mã đối chiếu giao dịch duy nhất trong DB để đảm bảo không cộng lặp tài nguyên cho người dùng dưới mọi tình huống.

---

### LUỒNG 8: TƯƠNG TÁC CỘNG ĐỒNG & CHIA SẺ BLOG (COMMUNITY ENGAGEMENT FLOW)
* **Các Use Case bao gồm:** Viết bài viết Markdown, Tải ảnh bìa, Lưu nháp, Gửi duyệt bài viết, Xem bài viết công khai, Gợi ý bài viết liên quan, Thích bài viết, Viết/Sửa/Xóa bình luận đa cấp.
* **Mô tả tổng quan hành trình:** Ứng viên chia sẻ kinh nghiệm phỏng vấn bằng cách viết bài viết định dạng Markdown, tải ảnh bìa và gửi lên hàng chờ duyệt. Bài đăng được hiển thị công khai trên bảng tin cộng đồng sau khi Admin duyệt. Người dùng khác có thể đọc bài, thích, bình luận trao đổi kiến thức để tăng tương tác.
* **Điểm sáng công nghệ & Tối ưu:**
  - Render nội dung Markdown động giúp người viết thoải mái chèn code block, định dạng tiêu đề, hình ảnh sinh động mà vẫn giữ trang load nhanh nhờ cấu trúc JSON nhẹ.
  - Thuật toán gợi ý bài viết liên quan dựa trên các nhãn gắn kết (Tags matching) giúp người đọc dễ dàng tìm thấy các bài viết cùng chủ đề.
* **Giá trị hấp dẫn người dùng:**
  - Tạo không gian kết nối, chia sẻ kinh nghiệm thực tế giữa các ứng viên để cùng phát triển.
  - Nơi ứng viên xây dựng hồ sơ năng lực số và thể hiện bản thân với các nhà tuyển dụng đang theo dõi cộng đồng.
* **Độ chặt chẽ của nghiệp vụ:**
  - Bài viết của người dùng mặc định ở trạng thái nháp (Draft) hoặc chờ duyệt (Pending), chỉ bài viết được Admin duyệt mới có trạng thái `APPROVED` để hiển thị trên giao diện chung.
  - Xác thực quyền sở hữu bình luận và bài viết: Chỉ tác giả bài viết/bình luận mới được quyền chỉnh sửa hoặc xóa thông qua việc so khớp thông tin người dùng được giải mã từ JWT token ở backend.

---

### LUỒNG 9: KIỂM DUYỆT, PHÂN QUYỀN & QUẢN TRỊ HỆ THỐNG (ADMIN AUDITING FLOW)
* **Các Use Case bao gồm:** Theo dõi chỉ số toàn hệ thống, Cấu hình ma trận phân quyền động (Role Matrix), Kiểm duyệt tin đăng của HR, Kiểm duyệt bài blog cộng đồng, Quản lý yêu cầu xác thực HR, Quét AI/OCR xác minh CMND/CCCD.
* **Mô tả tổng quan hành trình:** Admin sử dụng bảng điều khiển quản trị để giám sát hoạt động hệ thống. Admin thực hiện duyệt các tin tuyển dụng và bài đăng blog mới, kiểm tra hồ sơ xác thực của HR bằng công cụ AI OCR để nhận dạng CMND/CCCD, và có quyền cấu hình động các quyền hạn truy cập hệ thống của từng vai trò người dùng.
* **Điểm sáng công nghệ & Tối ưu:**
  - Tích hợp công cụ **AI OCR** tự động trích xuất các trường thông tin (Số CMND, Họ tên, Ngày sinh) từ ảnh chụp giấy tờ tùy thân, tự động đối chiếu thông tin tài khoản đăng ký của HR để đề xuất duyệt nhanh.
  - Thiết kế ma trận phân quyền động (Dynamic RBAC Matrix) lưu trong DB, cho phép Admin bật/tắt quyền của từng vai trò đối với các phân hệ mà không cần sửa code backend.
* **Giá trị hấp dẫn người dùng:**
  - Hệ sinh thái MockAI luôn giữ được môi trường tuyển dụng và cộng đồng lành mạnh, sạch bóng lừa đảo nhờ khâu kiểm duyệt chặt chẽ.
  - Hệ thống bảo mật cao, hạn chế tối đa nguy cơ rò rỉ dữ liệu người dùng.
* **Độ chặt chẽ của nghiệp vụ:**
  - Phân quyền cấp độ cao: Toàn bộ Endpoint quản trị bắt buộc phải qua middleware xác thực Admin (`requireRole(['ADMIN'])`).
  - Lưu trữ dấu vết kiểm toán (Audit Logs) cho các hành động phê duyệt, từ chối, hoặc thay đổi quyền hệ thống để đảm bảo tính giải trình cao của ban quản trị.
