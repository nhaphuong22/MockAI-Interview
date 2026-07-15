import { HelpCircle, Code, Server, ShieldCheck, Calculator, Users } from "lucide-react";

export const CURATED_CATEGORIES = [
  { id: "common", label: "Câu hỏi phỏng vấn chung", icon: HelpCircle },
  { id: "frontend-dev", label: "Frontend Developer", icon: Code },
  { id: "backend-dev", label: "Backend Developer", icon: Server },
  { id: "tester", label: "Kiểm thử phần mềm (Tester)", icon: ShieldCheck },
  { id: "accountant", label: "Nhân viên Kế toán", icon: Calculator },
  { id: "hr", label: "Hành chính & Nhân sự (HR)", icon: Users },
];

export const CURATED_QUESTIONS = {
  common: Array.from({ length: 30 }, (_, index) => {
    const list = [
      {
        question: "Bạn hãy giới thiệu ngắn gọn về bản thân?",
        purpose: "Đánh giá sự tự tin, khả năng giao tiếp và cách chọn lọc thông tin nổi bật của ứng viên.",
        tips: "Nói về kinh nghiệm hiện tại -> các thành tựu nổi bật gần đây -> lý do mong muốn cống hiến cho công ty.",
        sampleAnswer: "Tôi là Nguyễn Văn A, có 3 năm làm việc ở vị trí tương đương. Tôi có thế mạnh về việc tối ưu hóa quy trình làm việc và nâng cao hiệu quả nhóm. Ở công ty cũ, tôi từng giúp cải tiến quy trình xử lý dữ liệu giúp tiết kiệm 20% thời gian cho dự án chính. Tôi tin kinh nghiệm của mình phù hợp với vị trí công ty đang tuyển dụng."
      },
      {
        question: "Điểm mạnh và điểm yếu lớn nhất của bạn là gì?",
        purpose: "Kiểm tra mức độ tự nhận thức và mong muốn cải thiện bản thân.",
        tips: "Nêu điểm mạnh bổ trợ trực tiếp cho công việc; điểm yếu thật thà kèm theo cách bạn đang khắc phục nó.",
        sampleAnswer: "Điểm mạnh của tôi là khả năng tự học nhanh và thích nghi tốt. Điểm yếu là tôi hơi cầu toàn trong công việc. Để khắc phục, tôi đã sử dụng các công cụ quản lý thời gian như Trello để phân bổ thời gian hợp lý hơn."
      },
      {
        question: "Tại sao bạn lại ứng tuyển vào công ty chúng tôi?",
        purpose: "Đo lường mức độ quan tâm của ứng viên đối với công ty và sự phù hợp văn hóa.",
        tips: "Nêu rõ tầm nhìn, sản phẩm hoặc văn hóa công ty phù hợp với định hướng phát triển của bạn.",
        sampleAnswer: "Tôi rất ấn tượng với định hướng phát triển sản phẩm công nghệ ứng dụng AI của công ty. Với năng lực chuyên môn của mình, tôi tin mình có thể đóng góp vào việc cải tiến sản phẩm và phát triển sự nghiệp lâu dài tại đây."
      },
      {
        question: "Tại sao bạn lại quyết định rời bỏ công việc cũ?",
        purpose: "Kiểm tra thái độ ứng viên đối với sếp cũ/công ty cũ và mục tiêu phát triển.",
        tips: "Tập trung vào mong muốn tìm kiếm thử thách mới và phát triển kỹ năng, tránh nói tiêu cực về nơi làm việc cũ.",
        sampleAnswer: "Tôi mong muốn tìm kiếm một môi trường có quy mô dự án lớn hơn để thử thách bản thân và nâng cao kỹ năng xử lý hệ thống tải cao."
      },
      {
        question: "Mức lương mong muốn của bạn là bao nhiêu và vì sao?",
        purpose: "Xem xét sự phù hợp giữa năng lực ứng viên và ngân sách tuyển dụng.",
        tips: "Đưa ra khoảng lương dựa trên khảo sát thị trường và khẳng định giá trị bản thân mang lại tương xứng.",
        sampleAnswer: "Dựa trên năng lực chuyên môn và mức giá thị trường cho vị trí này, tôi mong muốn mức lương dao động từ 20.000.000đ đến 25.000.000đ net. Tôi sẵn sàng thảo luận thêm."
      },
      {
        question: "Bạn giải quyết mâu thuẫn với đồng nghiệp như thế nào?",
        purpose: "Đánh giá kỹ năng mềm và khả năng làm việc nhóm.",
        tips: "Bình tĩnh lắng nghe, tập trung vào giải quyết công việc thay vì cá nhân, trao đổi trực tiếp tìm điểm chung.",
        sampleAnswer: "Tôi sẽ hẹn gặp riêng đồng nghiệp để lắng nghe quan điểm của họ. Chúng tôi sẽ cùng đối chiếu dữ liệu thực tế và chọn giải pháp mang lại hiệu quả tốt nhất cho dự án."
      },
      {
        question: "Bạn thấy bản thân mình ở đâu trong 3 đến 5 năm tới?",
        purpose: "Đo lường hoài bão và mức độ gắn bó lâu dài của ứng viên.",
        tips: "Nêu lộ trình nghề nghiệp rõ ràng, gắn liền với đóng góp cho sự phát triển của công ty.",
        sampleAnswer: "Trong 3 năm tới tôi đặt mục tiêu trở thành chuyên gia làm chủ công nghệ ở mảng này, và trong 5 năm tới có thể đảm nhận vai trò quản lý/dẫn dắt đội ngũ."
      },
      {
        question: "Bạn đối phó với áp lực công việc như thế nào?",
        purpose: "Đánh giá sức bền tâm lý và khả năng quản lý công việc dưới áp lực.",
        tips: "Chia sẻ cách lập kế hoạch, thứ tự ưu tiên và phương pháp giải tỏa căng thẳng khoa học.",
        sampleAnswer: "Khi gặp áp lực, tôi thường phân loại công việc theo mức độ khẩn cấp và quan trọng, sau đó tập trung giải quyết từng phần. Tôi cũng thường xuyên chạy bộ để cân bằng tâm lý."
      },
      {
        question: "Hãy kể về một thất bại lớn của bạn và bài học rút ra?",
        purpose: "Đo lường tính trung thực và khả năng học hỏi từ sai lầm.",
        tips: "Chọn một tình huống thực tế, giải thích nguyên nhân khách quan/chủ quan và bài học cải tiến sau đó.",
        sampleAnswer: "Tôi từng ước lượng sai tiến độ hoàn thành một module do chủ quan. Dự án bị trễ 2 ngày. Từ đó, tôi học được bài học phải luôn có quỹ thời gian dự phòng rủi ro 15-20%."
      },
      {
        question: "Bạn định nghĩa thế nào là một môi trường làm việc lý tưởng?",
        purpose: "Đánh giá độ phù hợp văn hóa doanh nghiệp.",
        tips: "Nhấn mạnh sự tôn trọng, minh bạch, tinh thần học hỏi và hợp tác cùng phát triển.",
        sampleAnswer: "Một môi trường lý tưởng với tôi là nơi mọi người cởi mở chia sẻ kiến thức, giao tiếp rõ ràng và cùng hướng tới mục tiêu chung của sản phẩm."
      },
      {
        question: "Tại sao chúng tôi nên tuyển dụng bạn thay vì các ứng viên khác?",
        purpose: "Kiểm tra độ tự tin và giá trị cạnh tranh độc bản của ứng viên.",
        tips: "Đối chiếu kỹ năng của bản thân khớp với các yêu cầu quan trọng nhất trong JD.",
        sampleAnswer: "Bên cạnh kỹ năng chuyên môn vững vàng, tôi có tinh thần trách nhiệm cao và kinh nghiệm thực chiến giải quyết các bài toán tương tự như công ty đang gặp phải."
      },
      {
        question: "Bạn có thể làm việc ngoài giờ hoặc đi công tác khi được yêu cầu không?",
        purpose: "Khảo sát tính linh hoạt và mức độ cam kết với công việc.",
        tips: "Trả lời tích cực nhưng thực tế, thể hiện sự sẵn sàng hỗ trợ khi dự án ở giai đoạn nước rút.",
        sampleAnswer: "Tôi hoàn toàn sẵn sàng làm việc ngoài giờ khi dự án cần đẩy nhanh tiến độ bàn giao hoặc có sự cố khẩn cấp cần khắc phục ngay."
      },
      {
        question: "Sếp cũ hoặc đồng nghiệp cũ nhận xét như thế nào về bạn?",
        purpose: "Đánh giá uy tín cá nhân và mối quan hệ xã hội của ứng viên.",
        tips: "Nêu các nhận xét tích cực liên quan đến tinh thần trách nhiệm, khả năng cộng tác và độ tin cậy.",
        sampleAnswer: "Đồng nghiệp cũ thường nhận xét tôi là người chủ động, có trách nhiệm cao và luôn sẵn sàng hỗ trợ mọi người gỡ rối các vấn đề kỹ thuật."
      },
      {
        question: "Nếu được giao một công việc hoàn toàn mới mà bạn chưa từng làm, bạn sẽ bắt đầu thế nào?",
        purpose: "Kiểm tra khả năng tự nghiên cứu và tư duy tiếp cận vấn đề mới.",
        tips: "Nghiên cứu tài liệu -> Tìm hiểu các dự án mẫu -> Hỏi ý kiến chuyên gia -> Làm thử bản demo nhỏ (POC).",
        sampleAnswer: "Tôi sẽ dành 1-2 ngày đầu nghiên cứu tài liệu chính thống, tìm kiếm các best practices và xây dựng một phiên bản demo nhỏ để làm quen trước khi bắt tay làm thật."
      },
      {
        question: "Làm thế nào bạn quản lý thời gian khi có quá nhiều việc cùng lúc?",
        purpose: "Đánh giá kỹ năng quản lý thời gian và sắp xếp thứ tự ưu tiên.",
        tips: "Sử dụng ma trận Eisenhower (Khẩn cấp vs Quan trọng) hoặc các công cụ task management.",
        sampleAnswer: "Tôi sử dụng ma trận Eisenhower để chia việc thành 4 nhóm ưu tiên, tập trung xử lý các việc quan trọng trước và hạn chế tối đa các yếu tố gây xao nhãng."
      },
      {
        question: "Bạn thích làm việc độc lập hay làm việc nhóm hơn?",
        purpose: "Kiểm tra tính linh hoạt trong các mô hình vận hành dự án.",
        tips: "Thể hiện sự linh hoạt, có thể hoàn thành tốt nhiệm vụ cá nhân đồng thời phối hợp ăn ý với tập thể.",
        sampleAnswer: "Tôi có thể làm việc độc lập tốt nhờ khả năng tự chủ cao, nhưng tôi cũng rất thích làm việc nhóm vì sức mạnh tập thể sẽ giúp giải quyết các bài toán lớn nhanh hơn."
      },
      {
        question: "Bạn làm gì để cập nhật các kiến thức, công nghệ mới trong ngành?",
        purpose: "Đo lường tinh thần học hỏi suốt đời (lifelong learning).",
        tips: "Đọc blog công nghệ, tham gia các cộng đồng, khóa học online hoặc tự làm các dự án cá nhân.",
        sampleAnswer: "Tôi thường đọc các bài viết trên Medium, GitHub và tham gia các group cộng đồng chuyên môn để thảo luận và cập nhật các xu hướng công nghệ mới hàng tuần."
      },
      {
        question: "Mục tiêu ngắn hạn trong 1 năm tới của bạn là gì?",
        purpose: "Kiểm tra mức độ tập trung và kế hoạch hành động thực tế.",
        tips: "Làm chủ tốt vai trò mới, tối ưu hiệu quả công việc và học thêm 1-2 kỹ năng bổ trợ.",
        sampleAnswer: "Mục tiêu ngắn hạn của tôi là nhanh chóng làm quen hệ thống, hòa nhập với đội ngũ và hoàn thành xuất sắc các dự án đầu tiên được giao đúng hạn."
      },
      {
        question: "Bạn xử lý như thế nào khi nhận được phản hồi tiêu cực từ sếp hoặc khách hàng?",
        purpose: "Đánh giá thái độ đón nhận góp ý để cải thiện năng lực.",
        tips: "Không tự ái, lắng nghe tích cực để hiểu rõ vấn đề và lập kế hoạch hành động sửa đổi cụ thể.",
        sampleAnswer: "Tôi xem phản hồi tiêu cực là cơ hội để hoàn thiện. Tôi sẽ lắng nghe kỹ lý do, ghi nhận các điểm cần cải thiện và lập tức điều chỉnh quy trình làm việc của mình."
      },
      {
        question: "Bạn có câu hỏi nào dành cho chúng tôi không?",
        purpose: "Đánh giá mức độ chủ động và khát khao gia nhập công ty của ứng viên.",
        tips: "Hỏi về quy trình làm việc, thách thức lớn nhất của vị trí hoặc lộ trình thăng tiến tại công ty.",
        sampleAnswer: "Anh/chị có thể chia sẻ thêm về thách thức lớn nhất mà đội ngũ đang gặp phải ở dự án hiện tại là gì không ạ?"
      },
      {
        question: "Theo bạn, yếu tố quan trọng nhất tạo nên một buổi làm việc nhóm hiệu quả là gì?",
        purpose: "Đánh giá tư duy cộng tác và kỹ năng giao tiếp tập thể.",
        tips: "Sự giao tiếp rõ ràng, phân chia vai trò minh bạch và sự tôn trọng lẫn nhau.",
        sampleAnswer: "Đó là sự giao tiếp cởi mở và minh bạch. Khi mọi người hiểu rõ vai trò của mình và sẵn sàng hỗ trợ nhau, hiệu quả công việc sẽ đạt mức cao nhất."
      },
      {
        question: "Bạn sẽ làm thế nào nếu phát hiện đồng nghiệp vi phạm quy định của công ty?",
        purpose: "Kiểm tra tính trung thực, đạo đức nghề nghiệp và cách ứng xử khéo léo.",
        tips: "Góp ý khéo léo trước, nếu nghiêm trọng ảnh hưởng hệ thống thì báo cáo cấp quản lý theo quy trình.",
        sampleAnswer: "Tôi sẽ chủ động nhắc nhở riêng đồng nghiệp đó trước. Nếu hành vi đó tiếp tục và gây ảnh hưởng nghiêm trọng đến tập thể, tôi sẽ báo cáo với quản lý trực tiếp."
      },
      {
        question: "Hãy kể về một lần bạn thuyết phục thành công người khác theo ý kiến của mình?",
        purpose: "Kiểm tra kỹ năng thuyết phục và thương lượng dựa trên số liệu thực tế.",
        tips: "Đưa ra bằng chứng, số liệu cụ thể thay vì nói lý thuyết suông để thuyết phục đối phương.",
        sampleAnswer: "Tôi từng đề xuất thay đổi thư viện UI cũ sang Tailwind. Tôi đã dựng bản so sánh chi tiết dung lượng bundle và tốc độ phát triển để thuyết phục team cùng chuyển đổi."
      },
      {
        question: "Bạn có sẵn sàng học một công nghệ mới hoàn toàn nếu công ty yêu cầu không?",
        purpose: "Đo lường độ linh hoạt và khả năng học hỏi thích ứng.",
        tips: "Khẳng định sự sẵn sàng và chia sẻ phương pháp tiếp cận công nghệ mới nhanh chóng.",
        sampleAnswer: "Tôi luôn sẵn sàng đón nhận cái mới. Công nghệ thay đổi liên tục và việc học thêm kỹ năng mới là cách tốt nhất để đồng hành cùng sự phát triển của công ty."
      },
      {
        question: "Bạn nghĩ điều gì sẽ khiến bạn cảm thấy thất vọng nhất trong công việc?",
        purpose: "Hiểu rõ các yếu tố ảnh hưởng tiêu cực đến động lực làm việc của ứng viên.",
        tips: "Tránh các yếu tố nhỏ nhặt; tập trung vào sự thiếu minh bạch hoặc quy trình làm việc chồng chéo không rõ ràng.",
        sampleAnswer: "Điều làm tôi thất vọng nhất là sự thiếu giao tiếp rõ ràng dẫn đến việc chồng chéo nhiệm vụ và gây lãng phí tài nguyên của cả đội ngũ."
      },
      {
        question: "Hãy mô tả cách bạn tiếp cận một vấn đề phức tạp không có hướng dẫn cụ thể?",
        purpose: "Đo lường tư duy phân tích và khả năng giải quyết vấn đề độc lập.",
        tips: "Chia nhỏ vấn đề -> Nghiên cứu lý thuyết -> Tham chiếu giải pháp tương tự -> Chạy thử nghiệm nhỏ.",
        sampleAnswer: "Tôi sẽ chia nhỏ vấn đề thành các phần dễ quản lý hơn, tìm kiếm các bài viết giải quyết vấn đề tương tự trên mạng, xây dựng mô hình giả lập và chạy thử nghiệm."
      },
      {
        question: "Bạn làm thế nào để duy trì động lực làm việc lâu dài?",
        purpose: "Đánh giá tính bền bỉ và nguồn cảm hứng làm việc của ứng viên.",
        tips: "Nhìn thấy giá trị sản phẩm mang lại, liên tục đặt mục tiêu mới và duy trì sự cân bằng cuộc sống.",
        sampleAnswer: "Tôi duy trì động lực bằng cách nhìn thấy sản phẩm mình làm ra mang lại giá trị thực tế cho người dùng và việc vượt qua mỗi thử thách kỹ thuật giúp tôi nâng cao trình độ."
      },
      {
        question: "Nếu có cơ hội làm lại một dự án cũ, bạn sẽ cải thiện điều gì?",
        purpose: "Đo lường tư duy phản biện và khả năng tự đánh giá rút kinh nghiệm.",
        tips: "Nêu một khía cạnh cụ thể như tối ưu hiệu năng, cấu trúc thư mục sạch hơn hoặc viết test đầy đủ hơn.",
        sampleAnswer: "Tôi sẽ chú trọng viết Unit Test đầy đủ ngay từ đầu. Ở dự án cũ, việc thiếu test khiến việc refactor code sau này tốn nhiều thời gian kiểm thử thủ công."
      },
      {
        question: "Bạn xử lý như thế nào nếu được phân công làm việc với một đồng nghiệp có phong cách làm việc trái ngược?",
        purpose: "Kiểm tra khả năng thích ứng và tôn trọng sự đa dạng trong đội ngũ.",
        tips: "Tìm hiểu phong cách của họ, tôn trọng sự khác biệt và thống nhất cách thức giao tiếp chung cho công việc.",
        sampleAnswer: "Tôi sẽ chủ động ngồi lại trao đổi để thống nhất cách thức giao tiếp và quy trình làm việc chung nhằm đảm bảo phối hợp trơn tru mà không ảnh hưởng tiến độ."
      },
      {
        question: "Tại sao chúng tôi nên tin tưởng vào sự cam kết lâu dài của bạn?",
        purpose: "Xác nhận sự gắn kết và tính ổn định của nhân sự.",
        tips: "Bày tỏ mong muốn phát triển nghề nghiệp đồng bộ với lộ trình lâu dài của dự án công ty.",
        sampleAnswer: "Tôi tìm kiếm một nơi để phát triển sự nghiệp lâu dài chứ không chỉ là một công việc tạm thời. Tầm nhìn của công ty rất phù hợp với lộ trình phát triển 3-5 năm tới của tôi."
      }
    ];
    return {
      id: index + 1,
      ...list[index % list.length]
    };
  }),
  "frontend-dev": Array.from({ length: 30 }, (_, index) => {
    const list = [
      {
        question: "Sự khác biệt giữa Virtual DOM và Real DOM trong React?",
        purpose: "Kiểm tra kiến thức cốt lõi về cơ chế tối ưu render của React.",
        tips: "Nêu cơ chế Render của trình duyệt -> Virtual DOM là JS Object -> thuật toán Diffing và Reconciliation giúp update tối thiểu.",
        sampleAnswer: "Real DOM cập nhật rất chậm vì trình duyệt phải chạy lại Reflow và Repaint. React giải quyết bằng Virtual DOM - bản sao nhẹ lưu dưới dạng Object JS trong bộ nhớ. Khi state thay đổi, React so sánh Virtual DOM cũ và mới (Diffing) và chỉ render các phần thay đổi lên Real DOM, giúp tăng tốc độ xử lý."
      },
      {
        question: "Phân biệt display: none, visibility: hidden và opacity: 0?",
        purpose: "Đánh giá hiểu biết về CSS Layout và tương tác người dùng.",
        tips: "display: none xóa khỏi layout flow; visibility: hidden ẩn nhưng giữ chỗ; opacity: 0 trong suốt vẫn nhận click/hover.",
        sampleAnswer: "display: none ẩn phần tử hoàn toàn và không chiếm khoảng trống. visibility: hidden ẩn đi nhưng vẫn giữ chỗ trên layout. opacity: 0 làm trong suốt phần tử, vẫn chiếm chỗ và vẫn có thể tương tác click/hover bình thường."
      },
      {
        question: "Closure trong JS là gì và ứng dụng thực tế?",
        purpose: "Kiểm tra kiến thức JavaScript nâng cao.",
        tips: "Hàm con ghi nhớ lexical scope của hàm cha; ứng dụng làm biến private hoặc stateful functions.",
        sampleAnswer: "Closure là việc một hàm con ghi nhớ và truy cập được các biến ở phạm vi bên ngoài nó ngay cả khi hàm cha đã chạy xong. Ứng dụng thực tế là tạo biến private để đóng gói dữ liệu trong thiết kế module."
      },
      {
        question: "Browser Rendering Flow hoạt động như thế nào?",
        purpose: "Đánh giá hiểu biết sâu về hiệu năng và hoạt động của trình duyệt.",
        tips: "Parse HTML -> DOM; Parse CSS -> CSSOM; Gộp lại -> Render Tree; Layout -> Paint -> Composite.",
        sampleAnswer: "Trình duyệt parse HTML thành cây DOM, parse CSS thành CSSOM. Gộp cả hai thành Render Tree. Sau đó tính toán vị trí kích thước (Layout/Reflow), tô màu các pixel (Paint) và gộp các lớp lại để hiển thị (Composite)."
      },
      {
        question: "Làm thế nào để tối ưu hiệu năng (Web Performance) cho ứng dụng React?",
        purpose: "Đo lường kinh nghiệm xử lý tối ưu thực tế.",
        tips: "Code splitting (lazy/Suspense), memoization (useMemo, useCallback, memo), nén ảnh WebP, CDN.",
        sampleAnswer: "Tôi dùng React.lazy và Suspense để code splitting giảm tải lần đầu. Áp dụng useMemo/useCallback tránh tính toán và re-render thừa. Tối ưu hóa tài nguyên bằng cách nén ảnh sang WebP, dùng CDN và cấu hình cache hợp lý."
      },
      {
        question: "CORS là gì và cách xử lý lỗi CORS ở frontend?",
        purpose: "Kiểm tra kiến thức bảo mật mạng cơ bản.",
        tips: "Cross-Origin Resource Sharing; trình duyệt chặn request từ domain khác; xử lý bằng Proxy ở dev hoặc nhờ backend cấu hình headers.",
        sampleAnswer: "CORS là cơ chế an toàn của trình duyệt ngăn chặn gọi API sang một domain khác. Để xử lý ở môi trường phát triển, tôi cấu hình proxy trong file cấu hình Vite/Webpack. Ở production, backend bắt buộc phải trả về header Access-Control-Allow-Origin hợp lệ."
      },
      {
        question: "Phân biệt LocalStorage, SessionStorage và Cookies?",
        purpose: "Đánh giá khả năng lựa chọn công cụ lưu trữ ở client thích hợp.",
        tips: "So sánh dung lượng, thời gian sống, và việc tự động gửi lên server.",
        sampleAnswer: "LocalStorage lưu trữ vĩnh viễn cho đến khi bị xóa chủ động (dung lượng ~5MB). SessionStorage tự xóa khi đóng tab/trình duyệt. Cookies chỉ lưu ~4KB, tự động đính kèm vào mỗi request gửi lên server và thường dùng để lưu token phiên bản cũ hoặc thông tin tracking."
      },
      {
        question: "Sự khác biệt giữa Redux và React Context API?",
        purpose: "Kiểm tra tư duy thiết kế quản lý state trong React.",
        tips: "Redux cho state phức tạp, cập nhật tần suất cao, hỗ trợ devtools mạnh mẽ; Context cho state đơn giản, ít thay đổi.",
        sampleAnswer: "Context API tích hợp sẵn trong React, thích hợp cho state đơn giản ít cập nhật (như theme, locale). Redux là thư viện ngoài, quản lý luồng dữ liệu một chiều chặt chẽ bằng reducer/action, thích hợp cho các ứng dụng lớn có state phức tạp cập nhật liên tục."
      },
      {
        question: "CSS Specificity là gì và cách tính độ ưu tiên?",
        purpose: "Đánh giá nền tảng CSS cơ bản.",
        tips: "Độ ưu tiên: Inline styles > ID selectors > Class/Attribute/Pseudo-class > Element selectors.",
        sampleAnswer: "CSS Specificity là trọng số dùng để trình duyệt quyết định quy tắc CSS nào sẽ được áp dụng cho phần tử. Độ ưu tiên cao nhất thuộc về inline style, tiếp theo là ID, Class/Attribute và thấp nhất là tên thẻ Tag. Nếu bằng nhau, thuộc tính khai báo sau cùng sẽ ghi đè."
      },
      {
        question: "Promises và Async/Await khác nhau thế nào?",
        purpose: "Đánh giá kiến thức lập trình bất đồng bộ trong JS.",
        tips: "Async/await thực chất là cú pháp bọc ngoài Promise (syntactic sugar), giúp viết code bất đồng bộ trông giống như đồng bộ.",
        sampleAnswer: "Promise sử dụng các chuỗi .then() và .catch() để xử lý kết quả bất đồng bộ. Async/Await viết trên nền Promise giúp code trông tuần tự, dễ đọc và dễ quản lý lỗi hơn bằng cấu trúc try/catch truyền thống."
      },
      {
        question: "XSS là gì và cách ngăn ngừa XSS ở frontend?",
        purpose: "Đánh giá kiến thức bảo mật giao diện.",
        tips: "Cross-Site Scripting; hacker chèn mã độc JS; ngăn chặn bằng cách sanitize dữ liệu đầu vào (DOMPurify).",
        sampleAnswer: "XSS là lỗi bảo mật xảy ra khi mã script độc hại được thực thi trên trình duyệt của người dùng. Để phòng chống, tôi luôn lọc sạch (sanitize) dữ liệu người dùng nhập bằng thư viện DOMPurify trước khi render và hạn chế tối đa sử dụng dangerouslySetInnerHTML trong React."
      },
      {
        question: "Event Delegation trong JavaScript là gì?",
        purpose: "Kiểm tra kiến thức tối ưu hóa xử lý sự kiện trong DOM.",
        tips: "Lắng nghe sự kiện ở phần tử cha thay vì gắn listener cho từng phần tử con dựa trên cơ chế Event Bubbling.",
        sampleAnswer: "Event Delegation là kỹ thuật lắng nghe sự kiện ở một phần tử cha duy nhất thay vì gắn listener cho hàng loạt phần tử con. Kỹ thuật này hoạt động dựa trên cơ chế nổi bọt sự kiện (Event Bubbling), giúp giảm mức tiêu thụ bộ nhớ đáng kể."
      },
      {
        question: "Flexbox và CSS Grid khác nhau thế nào? Khi nào dùng loại nào?",
        purpose: "Đánh giá khả năng dựng layout giao diện chuyên nghiệp.",
        tips: "Flexbox cho layout 1 chiều (hàng hoặc cột); Grid cho layout 2 chiều (cả hàng và cột cùng lúc).",
        sampleAnswer: "Flexbox được thiết kế để sắp xếp các phần tử theo một chiều duy nhất (trục ngang hoặc dọc). CSS Grid được thiết kế cho layout hai chiều phức tạp có cả hàng và cột. Tôi dùng Flexbox cho navbar, list item và dùng Grid cho bố cục trang tổng thể."
      },
      {
        question: "React Lifecycle trong functional component được quản lý như thế nào?",
        purpose: "Kiểm tra kiến thức React Hooks cơ bản.",
        tips: "Sử dụng useEffect Hook với các dependency array tương ứng để mô phỏng mount, update, unmount.",
        sampleAnswer: "Trong Functional Component, vòng đời được quản lý bằng useEffect Hook. Dependency array rỗng [] tương đương componentDidMount, có dependency tương đương componentDidUpdate, và hàm return bên trong callback tương đương componentWillUnmount."
      },
      {
        question: "SSR (Server-Side Rendering) và CSR (Client-Side Rendering) khác nhau thế nào?",
        purpose: "Đánh giá kiến thức kiến trúc ứng dụng web.",
        tips: "SSR render HTML trên server giúp SEO tốt, tải trang đầu nhanh; CSR tải file JS rỗng rồi render ở client.",
        sampleAnswer: "SSR tạo sẵn file HTML hoàn chỉnh trên server trước khi gửi về client, giúp SEO tốt và tối ưu hóa FCP. CSR tải HTML rỗng kèm file JS lớn về trình duyệt tự dựng giao diện, giúp trải nghiệm chuyển trang sau đó cực kỳ mượt mà."
      },
      {
        question: "Next.js cung cấp những phương thức fetch data nào?",
        purpose: "Kiểm tra kiến thức về các framework React hiện đại.",
        tips: "SSR (getServerSideProps), SSG (getStaticProps), ISR (Incremental Static Regeneration).",
        sampleAnswer: "Next.js cung cấp Static Site Generation (SSG) để build trang tĩnh từ trước, Server-Side Rendering (SSR) để lấy dữ liệu mới mỗi request, và Incremental Static Regeneration (ISR) giúp tự động cập nhật lại các trang tĩnh sau một khoảng thời gian."
      },
      {
        question: "Debounce và Throttle khác nhau thế nào? Cho ví dụ?",
        purpose: "Kiểm tra kỹ thuật tối ưu hóa sự kiện tần suất cao.",
        tips: "Debounce trì hoãn chạy đến khi hết kích hoạt; Throttle giới hạn tần suất chạy tối đa trong khoảng thời gian.",
        sampleAnswer: "Debounce chỉ chạy hàm sau khi sự kiện dừng kích hoạt một khoảng thời gian (phù hợp cho ô tìm kiếm). Throttle đảm bảo hàm chỉ chạy tối đa 1 lần trong khoảng thời gian cố định (phù hợp cho sự kiện scroll/resize)."
      },
      {
        question: "Hoisting trong JavaScript là gì?",
        purpose: "Kiểm tra kiến thức cơ bản về JS Engine.",
        tips: "Cơ chế đưa phần khai báo biến và hàm lên đầu scope trước khi thực thi code.",
        sampleAnswer: "Hoisting là cơ chế của JS Engine đưa khai báo biến (với var) và khai báo hàm lên đầu phạm vi chứa nó trước khi thực thi. Biến khai báo bằng let/const cũng bị hoisted nhưng nằm trong 'Temporal Dead Zone' nên gọi trước sẽ bị lỗi."
      },
      {
        question: "Semantic HTML là gì và tại sao nó lại quan trọng?",
        purpose: "Đo lường hiểu biết về SEO và Accessibility (A11y).",
        tips: "Sử dụng các thẻ HTML phản ánh đúng ý nghĩa nội dung như <header>, <article>, <section>, <footer>.",
        sampleAnswer: "Semantic HTML là sử dụng các thẻ HTML có ý nghĩa mô tả rõ ràng nội dung bên trong thay vì dùng div vô tội vạ. Nó giúp các công cụ tìm kiếm index cấu trúc web tốt hơn (SEO) và hỗ trợ các thiết bị đọc màn hình cho người khiếm thị."
      },
      {
        question: "Sự khác biệt giữa NPM, PNPM và Yarn?",
        purpose: "Kiểm tra hiểu biết về package manager và tối ưu hóa dung lượng dự án.",
        tips: "PNPM sử dụng hard links lưu trữ tập trung giúp tiết kiệm ổ cứng và cài đặt cực nhanh.",
        sampleAnswer: "NPM và Yarn cài đặt package bằng cách nhân bản thư mục vào node_modules của từng dự án. PNPM sử dụng cơ chế lưu trữ tập trung (global store) và tạo liên kết cứng (hard links) trong dự án, giúp tiết kiệm dung lượng ổ cứng tối đa."
      },
      {
        question: "Làm thế nào để xử lý ảnh Responsive trong HTML/CSS?",
        purpose: "Đánh giá kỹ năng xây dựng giao diện đa thiết bị.",
        tips: "Dùng thuộc tính max-width: 100%, height: auto hoặc sử dụng thẻ <picture> với các nguồn srcset khác nhau.",
        sampleAnswer: "Tôi thường thiết lập max-width: 100% và height: auto để ảnh tự co giãn theo container. Đối với ảnh cần thay đổi kích thước vật lý theo thiết bị để tối ưu băng thông, tôi sử dụng thẻ picture kết hợp các thẻ source và thuộc tính srcset."
      },
      {
        question: "Babel và Webpack đóng vai trò gì trong quá trình build dự án?",
        purpose: "Kiểm tra kiến thức về môi trường phát triển front-end.",
        tips: "Babel dịch chuyển mã JS mới về tương thích trình duyệt cũ; Webpack đóng gói tài nguyên.",
        sampleAnswer: "Babel là trình biên dịch chuyển đổi mã JS hiện đại (ES6+) về mã tương thích với các trình duyệt cũ. Webpack là công cụ đóng gói (bundler) thu thập toàn bộ các file JS, CSS, ảnh và gom chúng lại thành các file tối ưu để phân phối."
      },
      {
        question: "React.memo và useMemo khác nhau thế nào?",
        purpose: "Kiểm tra kiến thức tối ưu hóa render trong React.",
        tips: "React.memo là Higher-Order Component dùng để cache component; useMemo là Hook dùng để cache giá trị tính toán.",
        sampleAnswer: "React.memo được dùng để bọc component, giúp tránh re-render component đó nếu props truyền vào không đổi. useMemo là một Hook dùng bên trong component để ghi nhớ kết quả của một phép tính toán nặng giữa các lần render."
      },
      {
        question: "Sự khác biệt giữa Virtual DOM của React và Real DOM của Svelte?",
        purpose: "Đánh giá hiểu biết sâu về các framework frontend hiện đại.",
        tips: "Svelte không dùng Virtual DOM; nó là compiler dịch mã thẳng thành các thao tác Real DOM trực tiếp khi build.",
        sampleAnswer: "React chạy runtime để đối chiếu Virtual DOM trong bộ nhớ rồi cập nhật. Svelte là trình biên dịch (compiler), nó phân tích mã nguồn khi build và tạo ra mã JS thuần tác động trực tiếp vào Real DOM khi có biến thay đổi mà không cần đối chiếu cây DOM."
      },
      {
        question: "HTTP/2 mang lại những cải tiến gì so với HTTP/1.1?",
        purpose: "Đánh giá kiến thức về giao thức mạng tối ưu hiệu năng web.",
        tips: "Multiplexing (gửi nhiều request song song trên 1 kết nối), Header Compression (HPACK), Server Push.",
        sampleAnswer: "HTTP/2 hỗ trợ Multiplexing cho phép gửi nhiều yêu cầu và phản hồi song song trên cùng một kết nối TCP, nén header bằng HPACK giúp giảm dung lượng truyền tải, và tính năng Server Push gửi trước tài nguyên tĩnh cho client."
      },
      {
        question: "Làm thế nào để phát hiện và sửa rò rỉ bộ nhớ (Memory Leak) trong JS?",
        purpose: "Kiểm tra kinh nghiệm gỡ lỗi nâng cao.",
        tips: "Kiểm tra các event listener chưa gỡ, các setInterval chưa clear, các biến global vô tình tạo ra.",
        sampleAnswer: "Tôi sử dụng tab Memory trong Chrome DevTools để chụp Profile bộ nhớ. Nguyên nhân phổ biến thường là do quên hủy đăng ký event listener trong componentWillUnmount/useEffect hoặc các timer (setInterval) vẫn chạy ngầm."
      },
      {
        question: "Sự khác biệt giữa target và currentTarget trong Event Object?",
        purpose: "Đánh giá kiến thức DOM API cơ bản.",
        tips: "target là phần tử thực tế kích hoạt sự kiện; currentTarget là phần tử đang lắng nghe sự kiện.",
        sampleAnswer: "event.target trả về phần tử gốc thực tế chịu tác động trực tiếp của click chuột. event.currentTarget trả về phần tử đang trực tiếp lắng nghe sự kiện (nơi đăng ký event listener)."
      },
      {
        question: "CSS Variables (Custom Properties) là gì và ưu điểm của nó?",
        purpose: "Đánh giá khả năng viết CSS hiện đại linh hoạt.",
        tips: "Khai báo biến bằng dấu gạch ngang --; có tính kế thừa; thay đổi động được bằng JavaScript.",
        sampleAnswer: "CSS Variables cho phép định nghĩa các biến (như --primary-color) trực tiếp trong CSS. Ưu điểm lớn nhất là có thể kế thừa theo cấu trúc DOM và dễ dàng thay đổi giá trị động thông qua JavaScript để tạo tính năng đổi theme."
      },
      {
        question: "Hydration trong React SSR là gì?",
        purpose: "Đo lường hiểu biết về cơ chế kết nối SSR frontend.",
        tips: "Quá trình React gắn các event listener vào HTML tĩnh được server gửi về để trang web hoạt động bình thường.",
        sampleAnswer: "Hydration là quá trình xảy ra ở phía client sau khi trình duyệt nhận HTML tĩnh từ server. React sẽ chạy code để map cấu trúc DOM tĩnh đó với cấu trúc React component, gắn thêm các sự kiện tương tác để trang web hoạt động bình thường."
      },
      {
        question: "Critical Rendering Path là gì và cách tối ưu hóa?",
        purpose: "Kiểm tra tư duy tối ưu hóa tốc độ tải trang nâng cao.",
        tips: "Chuỗi các bước trình duyệt xử lý để hiển thị trang; tối ưu bằng cách inline CSS quan trọng, async/defer JS.",
        sampleAnswer: "Critical Rendering Path là chuỗi các bước trình duyệt phải thực hiện để vẽ trang lên màn hình. Tôi tối ưu hóa bằng cách trì hoãn tải các file JS không khẩn cấp (sử dụng defer/async), inline CSS quan trọng và tối giản cây DOM."
      }
    ];
    return {
      id: index + 1,
      ...list[index % list.length]
    };
  }),
  "backend-dev": Array.from({ length: 30 }, (_, index) => {
    const list = [
      {
        question: "Sự khác biệt cốt lõi giữa REST API và GraphQL?",
        purpose: "Đo lường hiểu biết về thiết kế giao tiếp client-server.",
        tips: "REST dựa trên resource với endpoint cố định; GraphQL linh hoạt cho phép client query trường dữ liệu mong muốn.",
        sampleAnswer: "REST sử dụng các endpoint tĩnh trả về dữ liệu cố định, dễ bị over-fetching. GraphQL chỉ dùng một endpoint duy nhất và cho phép client tự chỉ định cấu trúc dữ liệu cần thiết, giúp tiết kiệm băng thông và tăng tốc độ ứng dụng."
      },
      {
        question: "Database Index giúp tăng tốc độ truy vấn thế nào và có nhược điểm gì?",
        purpose: "Kiểm tra kiến thức tối ưu hóa cơ sở dữ liệu.",
        tips: "Sử dụng cấu trúc dữ liệu (thường là B-Tree) để tìm kiếm nhanh; nhược điểm là làm chậm các tác vụ ghi và tốn ổ cứng.",
        sampleAnswer: "Index tạo cấu trúc cây tìm kiếm (thường là B-Tree) giúp DB định vị dữ liệu mà không cần Table Scan. Tuy nhiên, nó làm tốn dung lượng ổ cứng và làm chậm các lệnh INSERT, UPDATE, DELETE do phải tính toán lại cây Index."
      },
      {
        question: "Cơ chế hoạt động của Middleware trong Express.js?",
        purpose: "Đánh giá hiểu biết về luồng xử lý request-response.",
        tips: "Hàm trung gian; có quyền truy cập req, res và next(); bắt buộc gọi next() để chuyển tiếp xử lý.",
        sampleAnswer: "Middleware là hàm trung gian xử lý request trước khi đến route handler. Nó có thể thực hiện logic và thay đổi req/res. Hàm next() bắt buộc phải được gọi để chuyển tiếp sang middleware tiếp theo, tránh làm request bị treo."
      },
      {
        question: "Cách thiết kế hệ thống Authentication an toàn bằng JWT?",
        purpose: "Kiểm tra tư duy thiết kế hệ thống bảo mật.",
        tips: "Access token ngắn hạn trong bộ nhớ; Refresh token dài hạn lưu trong cookie HttpOnly/Secure/SameSite.",
        sampleAnswer: "Tôi dùng Access Token thời hạn ngắn (15 phút) lưu trong bộ nhớ tạm và Refresh Token thời hạn dài lưu trong Cookie HttpOnly, Secure, SameSite ở client. Khi Access Token hết hạn, client gọi API dùng Refresh Token lấy token mới."
      },
      {
        question: "Sự khác biệt giữa SQL và NoSQL database? Khi nào dùng loại nào?",
        purpose: "Kiểm tra kiến thức thiết kế dữ liệu hệ thống.",
        tips: "SQL có schema cố định, hỗ trợ ACID tốt (PostgreSQL); NoSQL schema linh hoạt, scale ngang tốt (MongoDB).",
        sampleAnswer: "SQL lưu dữ liệu dạng bảng có quan hệ chặt chẽ và đảm bảo tính ACID cao, thích hợp cho giao dịch tài chính. NoSQL lưu dạng tài liệu linh hoạt (JSON), dễ dàng mở rộng theo chiều ngang, thích hợp cho log, chat, dữ liệu phi cấu trúc."
      },
      {
        question: "Connection Pooling là gì và tại sao nó lại quan trọng?",
        purpose: "Đánh giá kiến thức tối ưu hóa tài nguyên kết nối cơ sở dữ liệu.",
        tips: "Duy trì một nhóm các kết nối mở sẵn để tái sử dụng thay vì tạo mới kết nối sau mỗi request.",
        sampleAnswer: "Connection Pooling là kỹ thuật duy trì sẵn một danh sách các kết nối mở tới DB. Khi có request, hệ thống lấy kết nối sẵn có để thực thi rồi trả lại pool. Việc này giúp tiết kiệm thời gian tạo và hủy kết nối TCP tốn kém."
      },
      {
        question: "Làm thế nào để xử lý N+1 Query Problem trong ORM?",
        purpose: "Đánh giá khả năng tối ưu hóa truy vấn dữ liệu quan hệ.",
        tips: "Xảy ra khi lấy danh sách cha rồi chạy vòng lặp gọi API lấy con; khắc phục bằng Eager Loading (JOIN/IN).",
        sampleAnswer: "N+1 Query xảy ra khi ta lấy N bản ghi cha, sau đó chạy vòng lặp thực hiện thêm N câu truy vấn để lấy dữ liệu con liên quan. Để khắc phục, tôi sử dụng cơ chế Eager Loading (ví dụ: dùng include trong Sequelize hay join trong Knex) để gộp truy vấn."
      },
      {
        question: "Phân biệt Monolithic và Microservices architecture?",
        purpose: "Kiểm tra kiến thức thiết kế kiến trúc hệ thống.",
        tips: "Monolith gộp chung toàn bộ code vào 1 dự án duy nhất; Microservices chia nhỏ thành các service độc lập giao tiếp qua API/Message queue.",
        sampleAnswer: "Monolithic dễ phát triển và triển khai lúc đầu nhưng khó mở rộng khi hệ thống lớn. Microservices chia nhỏ hệ thống thành các dịch vụ độc lập giúp các team phát triển song song, dễ scale độc lập nhưng tăng độ phức tạp trong vận hành."
      },
      {
        question: "Message Queue là gì và khi nào nên ứng dụng?",
        purpose: "Đo lường khả năng xử lý bất đồng bộ ở backend.",
        tips: "RabbitMQ/Kafka; dùng để lưu trữ tạm thời các tác vụ nặng cần xử lý bất đồng bộ (gửi mail, resize ảnh, data sync).",
        sampleAnswer: "Message Queue là hệ thống trung gian chứa hàng đợi thông điệp (như RabbitMQ, Kafka). Tôi dùng nó để xử lý bất đồng bộ các tác vụ nặng như gửi email hàng loạt hoặc xử lý video, giúp giải phóng server phản hồi client nhanh hơn."
      },
      {
        question: "ACID trong Database đại diện cho những tính chất gì?",
        purpose: "Kiểm tra kiến thức lý thuyết cơ sở dữ liệu cơ bản.",
        tips: "Atomicity (Tính nguyên tử), Consistency (Tính nhất quán), Isolation (Tính cô lập), Durability (Tính bền vững).",
        sampleAnswer: "ACID là tiêu chuẩn giao dịch tin cậy trong DB. Atomicity đảm bảo giao dịch chạy hết hoặc không chạy gì. Consistency đảm bảo dữ liệu hợp lệ theo ràng buộc. Isolation giữ các giao dịch chạy song song không can thiệp nhau. Durability đảm bảo kết quả lưu vĩnh viễn dù hệ thống mất điện."
      },
      {
        question: "Redis được sử dụng làm gì ở backend bên cạnh Caching?",
        purpose: "Kiểm tra hiểu biết về các công cụ lưu trữ RAM nhanh.",
        tips: "Lưu session, giới hạn rate limiting, message broker (pub/sub), leaderboard.",
        sampleAnswer: "Bên cạnh làm cache dữ liệu, tôi dùng Redis để lưu trữ session đăng nhập của người dùng, làm cơ chế Rate Limiting chống spam API bằng thuật toán token bucket, hoặc dùng cơ chế Pub/Sub để giao tiếp real-time đơn giản giữa các worker."
      },
      {
        question: "Rate Limiting là gì và cách triển khai như thế nào?",
        purpose: "Kiểm tra kỹ năng bảo vệ hệ thống khỏi tấn công DoS/Spam.",
        tips: "Giới hạn số request client gửi lên trong thời gian cố định; dùng Redis lưu trữ số request kèm IP.",
        sampleAnswer: "Rate Limiting là giới hạn số lượng yêu cầu mà một IP được phép gửi lên server trong một khoảng thời gian. Tôi hay sử dụng Redis kết hợp thư viện express-rate-limit ở backend để kiểm tra số request của IP và trả về status 429 nếu vượt ngưỡng."
      },
      {
        question: "Sự khác biệt giữa Authentication và Authorization?",
        purpose: "Kiểm tra kiến thức bảo mật hệ thống cơ bản.",
        tips: "Authentication là xác thực danh tính (Bạn là ai); Authorization là phân quyền truy cập (Bạn được làm gì).",
        sampleAnswer: "Authentication xác thực người dùng là ai (ví dụ qua đăng nhập bằng email/password). Authorization kiểm tra quyền hạn của người dùng sau khi xác thực để quyết định họ có được phép truy cập tài nguyên hay không (ví dụ: Admin vs User)."
      },
      {
        question: "WebSockets khác với HTTP Polling như thế nào?",
        purpose: "Đánh giá kiến thức lập trình thời gian thực (real-time).",
        tips: "Polling gọi request liên tục; WebSocket thiết lập kết nối song hướng (full-duplex) duy nhất giữ kết nối liên tục.",
        sampleAnswer: "HTTP Polling bắt client gửi request liên tục theo chu kỳ để hỏi dữ liệu mới, gây lãng phí tài nguyên. WebSockets thiết lập một kết nối TCP song hướng duy nhất giúp server và client chủ động gửi dữ liệu cho nhau lập tức mà không cần tạo request mới."
      },
      {
        question: "Database Replication là gì? Phân biệt Master-Slave?",
        purpose: "Kiểm tra kiến thức thiết kế hệ thống tính sẵn sàng cao.",
        tips: "Sao chép dữ liệu sang nhiều server; Master nhận ghi dữ liệu; Slaves sao chép từ Master và chỉ phục vụ đọc.",
        sampleAnswer: "Replication là sao chép dữ liệu từ một database sang nhiều database khác. Trong mô hình Master-Slave, mọi thao tác ghi dữ liệu (INSERT/UPDATE) đều thực hiện trên Master Node, còn các Slave Nodes đồng bộ dữ liệu từ Master để phục vụ các truy vấn đọc."
      },
      {
        question: "Làm thế nào để bảo vệ hệ thống chống tấn công SQL Injection?",
        purpose: "Đánh giá kiến thức lập trình an toàn hệ thống dữ liệu.",
        tips: "Không cộng chuỗi SQL trực tiếp; sử dụng Parameterized Queries hoặc ORM (Knex, Sequelize).",
        sampleAnswer: "Tôi tuyệt đối không cộng chuỗi tham số người dùng nhập vào câu truy vấn SQL. Thay vào đó, tôi sử dụng Parameterized Queries (truy vấn tham số hóa) hoặc tận dụng các thư viện ORM như Sequelize/Knex để tự động escapes ký tự đặc biệt."
      },
      {
        question: "Cơ chế gỡ lỗi (Debugging) rò rỉ bộ nhớ ở Node.js?",
        purpose: "Kiểm tra kinh nghiệm xử lý sự cố vận hành backend.",
        tips: "Dùng Chrome DevTools kết nối Node inspect, heapdump, phân tích đồ thị sử dụng RAM.",
        sampleAnswer: "Tôi khởi chạy Node với cờ --inspect, sau đó kết nối qua Chrome DevTools để theo dõi Memory Allocation. Tôi chụp heap snapshot ở các thời điểm khác nhau để so sánh các object không được giải phóng bởi Garbage Collector."
      },
      {
        question: "gRPC là gì và so sánh với REST?",
        purpose: "Kiểm tra hiểu biết về các giao thức giao tiếp microservices hiện đại.",
        tips: "Sử dụng HTTP/2 và Protocol Buffers (Protobuf) cho tốc độ truyền tải cực nhanh, thích hợp giao tiếp nội bộ.",
        sampleAnswer: "gRPC là framework gọi hàm từ xa hiệu năng cao do Google phát triển. Nó sử dụng giao thức HTTP/2 và định dạng nhị phân Protocol Buffers, giúp truyền tải dữ liệu nhanh và nhỏ gọn hơn nhiều so với REST API dùng JSON trên HTTP/1.1."
      },
      {
        question: "CAP Theorem trong hệ thống phân tán là gì?",
        purpose: "Kiểm tra kiến thức lý thuyết thiết kế hệ thống lớn.",
        tips: "Consistency (Nhất quán), Availability (Sẵn sàng), Partition Tolerance (Chịu lỗi phân mảnh); chỉ chọn được 2 trong 3.",
        sampleAnswer: "CAP chỉ ra rằng một hệ thống phân tán chỉ có thể đáp ứng tối đa 2 trong 3 yếu tố: Consistency (mọi node thấy cùng dữ liệu), Availability (mọi request đều nhận phản hồi), và Partition Tolerance (hệ thống vẫn chạy khi đường truyền giữa các node bị ngắt)."
      },
      {
        question: "Sự khác biệt giữa Process và Thread trong hệ điều hành?",
        purpose: "Đánh giá nền tảng khoa học máy tính cơ bản.",
        tips: "Process là chương trình đang thực thi có vùng nhớ riêng; Thread là đơn vị nhỏ chạy bên trong Process và dùng chung vùng nhớ.",
        sampleAnswer: "Process là một tiến trình chạy độc lập có không gian bộ nhớ riêng do hệ điều hành cấp phát. Thread là luồng chạy bên trong Process, các Thread trong cùng một Process chia sẻ chung không gian bộ nhớ và tài nguyên, giúp chuyển đổi ngữ cảnh nhanh hơn."
      },
      {
        question: "Làm thế nào để lưu trữ mật khẩu người dùng một cách an toàn nhất?",
        purpose: "Đo lường kiến thức bảo mật thông tin tài khoản.",
        tips: "Sử dụng thuật toán băm (hashing) một chiều mạnh như bcrypt, pbkdf2 kết hợp với chuỗi muối ngẫu nhiên (salt).",
        sampleAnswer: "Tôi tuyệt đối không lưu mật khẩu dạng clear text. Tôi sử dụng thư viện bcrypt để tự động tạo chuỗi muối ngẫu nhiên (salt) kết hợp mật khẩu trước khi băm (hash) nhiều vòng, giúp chống lại các cuộc tấn công dò mật khẩu (Rainbow Table)."
      },
      {
        question: "Cơ chế Event Loop trong Node.js hoạt động như thế nào?",
        purpose: "Đánh giá hiểu biết sâu sắc về runtime Node.js.",
        tips: "Single-threaded, non-blocking I/O; chuyển các tác vụ nặng cho Thread Pool của libuv xử lý bất đồng bộ.",
        sampleAnswer: "NodeJS chạy đơn luồng nhưng xử lý non-blocking bằng cách đẩy các tác vụ I/O (file, network) xuống cho Thread Pool của thư viện libuv bên dưới. Khi tác vụ hoàn thành, kết quả được đưa vào hàng đợi callback để Event Loop lấy ra thực thi khi luồng chính rảnh."
      },
      {
        question: "API Gateway đóng vai trò gì trong kiến trúc Microservices?",
        purpose: "Kiểm tra kiến thức thiết kế hệ thống phân tán.",
        tips: "Điểm tiếp nhận duy nhất cho client; định tuyến request, load balancing, auth, rate limiting.",
        sampleAnswer: "API Gateway là cổng vào duy nhất cho toàn bộ các request từ client. Nó có nhiệm vụ định tuyến yêu cầu đến đúng microservice bên trong, thực hiện xác thực tập trung, giới hạn tần suất (rate limiting) và cân bằng tải (load balancing)."
      },
      {
        question: "Sự khác biệt giữa Inner Join và Left Join trong SQL?",
        purpose: "Kiểm tra kiến thức truy vấn dữ liệu SQL cơ bản.",
        tips: "Inner Join lấy các bản ghi có khớp ở cả 2 bảng; Left Join lấy toàn bộ bảng bên trái và các dòng khớp ở bảng phải.",
        sampleAnswer: "Inner Join chỉ trả về những dòng dữ liệu có sự trùng khớp khóa ở cả hai bảng được liên kết. Left Join trả về toàn bộ dữ liệu ở bảng bên trái (bảng chính) và chỉ lấy dữ liệu khớp ở bảng bên phải, các dòng không khớp sẽ có giá trị NULL."
      },
      {
        question: "Idempotency trong thiết kế API là gì? Tại sao nó quan trọng?",
        purpose: "Đánh giá tư duy thiết kế API an toàn khi mạng chập chờn.",
        tips: "Gọi API nhiều lần với cùng dữ liệu luôn trả về cùng 1 kết quả như gọi 1 lần duy nhất; quan trọng cho API thanh toán.",
        sampleAnswer: "Idempotency đảm bảo một API khi gọi nhiều lần liên tiếp với cùng tham số đầu vào sẽ tạo ra tác động hệ thống giống hệt như chỉ gọi một lần duy nhất. Điều này cực kỳ quan trọng cho các API thanh toán để tránh việc trừ tiền tài khoản hai lần."
      },
      {
        question: "Làm thế nào để xử lý việc tải lên file lớn (Large File Upload) hiệu quả?",
        purpose: "Kiểm tra kỹ năng giải quyết bài toán thực tế nặng ở backend.",
        tips: "Sử dụng multipart upload (chia nhỏ file thành nhiều phần), truyền trực tiếp dạng stream, hoặc upload trực tiếp lên S3 qua presigned URL.",
        sampleAnswer: "Để tránh quá tải RAM, tôi sử dụng kỹ thuật stream dữ liệu trực tiếp ghi xuống đĩa thay vì đọc toàn bộ file vào bộ nhớ. Với file cực lớn, tôi áp dụng Multipart Upload (chia nhỏ file ở client) hoặc dùng Presigned URL để client đẩy trực tiếp lên Cloud Storage."
      },
      {
        question: "Cơ chế Garbage Collection (GC) trong V8 Engine hoạt động thế nào?",
        purpose: "Kiểm tra hiểu biết sâu sắc về quản lý bộ nhớ của Node.js.",
        tips: "Sử dụng thuật toán Mark-and-Sweep; chia bộ nhớ thành thế hệ trẻ (New Space) và thế hệ già (Old Space).",
        sampleAnswer: "V8 Engine quản lý bộ nhớ bằng cách chia thành New Space (chứa các đối tượng sống ngắn) và Old Space (đối tượng sống dài). GC sử dụng thuật toán Mark-and-Sweep để đánh dấu các đối tượng có thể truy cập được và thu hồi vùng nhớ của các đối tượng rác."
      },
      {
        question: "Sự khác biệt giữa HTTP PUT và PATCH?",
        purpose: "Đánh giá tính chuẩn mực trong thiết kế REST API.",
        tips: "PUT dùng để ghi đè/thay thế hoàn toàn tài nguyên; PATCH dùng để cập nhật một vài trường dữ liệu cụ thể (cục bộ).",
        sampleAnswer: "PUT yêu cầu client gửi toàn bộ thông tin của tài nguyên để thay thế hoàn toàn tài nguyên cũ trên server. PATCH chỉ yêu cầu gửi các trường cần thay đổi để cập nhật cục bộ tài nguyên đó, giúp tiết kiệm băng thông mạng."
      },
      {
        question: "Làm thế nào để đồng bộ hóa dữ liệu giữa các Microservices?",
        purpose: "Kiểm tra kiến thức thiết kế hệ thống phân tán nâng cao.",
        tips: "Sử dụng kiến trúc hướng sự kiện (Event-Driven Architecture) với các message broker như Kafka/RabbitMQ.",
        sampleAnswer: "Tôi sử dụng cơ chế Event-Driven. Khi một service thay đổi dữ liệu, nó phát ra một sự kiện (Event) vào Message Broker. Các service khác đăng ký lắng nghe sự kiện đó sẽ tự động nhận thông tin và cập nhật database cục bộ của mình để đảm bảo tính nhất quán."
      },
      {
        question: "Log Rotation là gì và tại sao nó lại cần thiết cho server production?",
        purpose: "Kiểm tra kiến thức vận hành hệ thống thực tế.",
        tips: "Quy trình tự động lưu trữ, nén và xóa các file log cũ để tránh ổ cứng server bị đầy.",
        sampleAnswer: "Log Rotation là quy trình tự động nén, đổi tên hoặc xóa các file log cũ theo chu kỳ ngày/tháng hoặc dung lượng. Nếu không cấu hình log rotation, file log sẽ phình to liên tục theo thời gian, dẫn đến hết dung lượng ổ cứng và làm sập server."
      }
    ];
    return {
      id: index + 1,
      ...list[index % list.length]
    };
  }),
  tester: Array.from({ length: 30 }, (_, index) => {
    const list = [
      {
        question: "Sự khác biệt giữa Test Case và Test Scenario?",
        purpose: "Đánh giá khả năng tổ chức tài liệu kiểm thử cơ bản.",
        tips: "Test Scenario là kịch bản khái quát (test cái gì); Test Case là ca chi tiết (các bước cụ thể, input, expected result).",
        sampleAnswer: "Test Scenario mô tả tổng quan tính năng cần kiểm thử (ví dụ: kiểm tra chức năng chuyển khoản). Test Case chi tiết hóa kịch bản đó với các bước thực hiện cụ thể, dữ liệu test và kết quả mong đợi rõ ràng (ví dụ: chuyển khoản thành công khi đủ số dư)."
      },
      {
        question: "Phân biệt kiểm thử Hộp đen (Black-box) và Hộp trắng (White-box)?",
        purpose: "Kiểm tra hiểu biết về phương pháp tiếp cận kiểm thử.",
        tips: "Black-box không quan tâm cấu trúc code bên trong, chỉ test chức năng; White-box kiểm tra luồng logic code bên trong (Unit Test).",
        sampleAnswer: "Kiểm thử hộp đen tập trung vào đầu vào và kết quả đầu ra dựa trên tài liệu đặc tả mà không cần biết code bên trong chạy thế nào. Kiểm thử hộp trắng yêu cầu hiểu rõ cấu trúc mã nguồn để kiểm tra các luồng rẽ nhánh logic và viết unit test."
      },
      {
        question: "Quy trình kiểm thử phần mềm (STLC) gồm những bước nào?",
        purpose: "Đánh giá quy trình làm việc chuẩn của QA.",
        tips: "Phân tích yêu cầu -> Lập kế hoạch -> Thiết kế test case -> Set up môi trường -> Chạy test -> Báo cáo & Đóng chu kỳ.",
        sampleAnswer: "STLC gồm: 1. Phân tích yêu cầu, 2. Lập kế hoạch test, 3. Thiết kế kịch bản test case, 4. Thiết lập môi trường test, 5. Thực thi chạy test và báo cáo lỗi lên Jira, 6. Tổng kết đánh giá và đóng chu kỳ kiểm thử."
      },
      {
        question: "Regression Testing (Kiểm thử hồi quy) là gì và tại sao nó quan trọng?",
        purpose: "Đo lường hiểu biết về bảo trì chất lượng phần mềm khi cập nhật.",
        tips: "Test lại các tính năng cũ sau khi code có thay đổi để đảm bảo không phát sinh lỗi mới ở các phần hoạt động ổn định trước đó.",
        sampleAnswer: "Kiểm thử hồi quy là việc chạy lại các test case cũ sau khi hệ thống có sự thay đổi code hoặc sửa lỗi mới, nhằm đảm bảo các bản cập nhật này không vô tình phá hỏng hoặc tạo ra lỗi mới trong các tính năng đang chạy ổn định."
      },
      {
        question: "Sự khác biệt giữa Verification và Validation?",
        purpose: "Kiểm tra kiến thức lý thuyết QA cơ bản.",
        tips: "Verification là kiểm tra quy trình (Chúng ta có build sản phẩm đúng cách?); Validation là kiểm tra kết quả (Chúng ta có build đúng sản phẩm khách hàng cần?).",
        sampleAnswer: "Verification tập trung vào việc đánh giá tài liệu, thiết kế và quy trình xem có tuân thủ chuẩn không. Validation tập trung vào việc chạy phần mềm thực tế để xác minh xem nó có đáp ứng đúng mong đợi và nhu cầu thực tế của người dùng cuối hay không."
      },
      {
        question: "Làm thế nào để viết một báo cáo lỗi (Bug Report) chất lượng?",
        purpose: "Đánh giá kỹ năng giao tiếp và làm việc chuyên nghiệp của QA.",
        tips: "Tiêu đề rõ ràng, các bước tái hiện (Steps to reproduce), kết quả thực tế, kết quả mong đợi, ảnh chụp/video minh họa, môi trường test.",
        sampleAnswer: "Một Bug Report tốt cần có: Tiêu đề súc tích, mô tả môi trường test (OS, Browser), các bước tái hiện lỗi chi tiết (Steps to reproduce), kết quả thực tế bị lỗi, kết quả mong muốn đúng và đính kèm hình ảnh/video bằng chứng để dev dễ sửa."
      }
    ];
    return {
      id: index + 1,
      ...list[index % list.length]
    };
  }),
  accountant: Array.from({ length: 30 }, (_, index) => {
    const list = [
      {
        question: "Phân biệt kế toán dồn tích (Accrual) và kế toán tiền mặt (Cash)?",
        purpose: "Kiểm tra kiến thức nguyên lý kế toán cơ bản.",
        tips: "Cash ghi nhận khi tiền thực tế vào/ra; Accrual ghi nhận ngay khi nghiệp vụ kinh tế phát sinh không kể thu chi tiền chưa.",
        sampleAnswer: "Kế toán tiền mặt chỉ ghi nhận doanh thu/chi phí khi tiền thực tế được thu hoặc chi ra. Kế toán dồn tích ghi nhận doanh thu khi hóa đơn xuất và dịch vụ hoàn thành, chi phí khi nghĩa vụ trả tiền phát sinh, giúp phản ánh đúng bức tranh tài chính."
      },
      {
        question: "Hồ sơ quyết toán thuế TNCN cho nhân viên gồm những gì?",
        purpose: "Kiểm tra kiến thức nghiệp vụ thuế thực tế.",
        tips: "Tờ khai 05/QTT-TNCN, bảng kê chi tiết, giấy ủy quyền quyết toán thay, chứng từ khấu trừ thuế.",
        sampleAnswer: "Hồ sơ gồm tờ khai quyết toán thuế TNCN mẫu 05/QTT-TNCN kèm các bảng kê chi tiết thu nhập, giấy ủy quyền quyết toán của người lao động. Nếu cá nhân tự quyết toán thì công ty cấp chứng từ khấu trừ thuế TNCN cho họ."
      },
      {
        question: "Nguyên tắc khấu hao tài sản cố định đường thẳng hoạt động thế nào?",
        purpose: "Đo lường hiểu biết về nghiệp vụ quản lý tài sản cố định.",
        tips: "Chia đều nguyên giá tài sản cho số năm sử dụng hữu ích dự kiến.",
        sampleAnswer: "Phương pháp khấu hao đường thẳng phân bổ giá trị tài sản cố định đều qua từng năm sử dụng hữu ích. Chi phí khấu hao hàng năm bằng Nguyên giá tài sản chia cho số năm sử dụng, giúp chi phí hoạt động của doanh nghiệp ổn định."
      }
    ];
    return {
      id: index + 1,
      ...list[index % list.length]
    };
  }),
  hr: Array.from({ length: 30 }, (_, index) => {
    const list = [
      {
        question: "Quy trình giải quyết mâu thuẫn giữa 2 nhân sự trong phòng?",
        purpose: "Đánh giá kỹ năng nhân sự mềm và hòa giải.",
        tips: "Gặp riêng lắng nghe -> Tìm nguyên nhân cốt lõi -> Đối thoại chung hướng tới công việc -> Đưa ra giải pháp phân vai rõ ràng.",
        sampleAnswer: "Tôi gặp riêng từng người để lắng nghe góc nhìn khách quan. Sau đó tổ chức đối thoại chung, tập trung vào mục tiêu công việc thay vì cá nhân. Chúng tôi thống nhất phân vai nhiệm vụ rõ ràng để tránh mâu thuẫn lặp lại."
      },
      {
        question: "KPI và OKR khác nhau cơ bản thế nào?",
        purpose: "Kiểm tra kiến thức quản trị hiệu suất hiện đại.",
        tips: "KPI đo lường hiệu suất công việc tĩnh để duy trì; OKR thúc đẩy đạt mục tiêu đột phá thay đổi.",
        sampleAnswer: "KPI là chỉ số đo lường hiệu suất công việc tĩnh, dùng để đánh giá hoạt động vận hành hàng ngày (ví dụ: số cuộc gọi bán hàng). OKR hướng tới các mục tiêu chiến lược đột phá có tính thách thức trong ngắn hạn (ví dụ: mở rộng thị trường mới)."
      },
      {
        question: "Làm thế nào để thu hút các ứng viên thụ động (Passive Candidates) tài năng?",
        purpose: "Đánh giá kỹ năng tuyển dụng nâng cao.",
        tips: "Xây dựng thương hiệu nhà tuyển dụng, networking trên LinkedIn/GitHub, liên hệ cá nhân hóa cơ hội nghề nghiệp.",
        sampleAnswer: "Tôi chủ động tìm hồ sơ của họ trên LinkedIn/GitHub, theo dõi các bài chia sẻ chuyên môn của họ. Khi tiếp cận, tôi gửi email cá nhân bày tỏ sự ấn tượng về năng lực của họ và mời cafe trao đổi định hướng mở thay vì gửi JD thô."
      }
    ];
    return {
      id: index + 1,
      ...list[index % list.length]
    };
  })
};

// Cẩm nang phỏng vấn dành cho Sidebar
export const INTERVIEW_GUIDES = [
  {
    title: "Mẫu email đồng ý phỏng vấn chuyên nghiệp",
    description: "Cách phản hồi thư mời phỏng vấn từ nhà tuyển dụng lịch sự và xác nhận thời gian chuẩn xác nhất.",
    content: `**Tiêu đề:** [Họ tên] - Xác nhận tham gia phỏng vấn vị trí [Tên vị trí]

Kính gửi Bộ phận Tuyển dụng Công ty [Tên công ty],

Tôi là [Họ tên], rất cảm ơn công ty đã quan tâm đến hồ sơ của tôi và gửi thư mời phỏng vấn cho vị trí [Tên vị trí].

Tôi xin phép xác nhận sẽ tham gia buổi phỏng vấn vào thời gian: **[Giờ] ngày [Ngày/Tháng]** tại văn phòng công ty (hoặc qua Google Meet/Zoom theo liên kết công ty cung cấp).

Tôi đã chuẩn bị đầy đủ các tài liệu cần thiết và rất mong chờ cơ hội được trao đổi trực tiếp cùng Quý công ty về sự phù hợp của bản thân đối với vị trí này.

Nếu có bất kỳ thay đổi nào hoặc cần chuẩn bị thêm thông tin gì, xin vui lòng phản hồi lại email này hoặc liên hệ với tôi qua số điện thoại: [Số điện thoại].

Trân trọng,
[Họ tên]
[Số điện thoại]`
  },
  {
    title: "Mẫu email cảm ơn sau phỏng vấn",
    description: "Bí quyết tạo dấu ấn tốt đẹp với người phỏng vấn chỉ bằng một bức thư cảm ơn chân thành gửi trong vòng 24h.",
    content: `**Tiêu đề:** [Họ tên] - Thư cảm ơn sau buổi phỏng vấn vị trí [Tên vị trí]

Kính gửi Ban Tuyển dụng và Anh/Chị Phỏng vấn Công ty [Tên công ty],

Tôi là [Họ tên], ứng viên đã tham gia phỏng vấn vị trí [Tên vị trí] vào lúc [Giờ] ngày [Ngày/Tháng] vừa qua.

Tôi viết thư này để gửi lời cảm ơn chân thành nhất đến Quý công ty và các Anh/Chị đã dành thời gian quý báu để trao đổi và chia sẻ cụ thể với tôi về công việc cũng như định hướng phát triển của phòng ban.

Buổi trao đổi giúp tôi hiểu rõ hơn về những thách thức thú vị của vị trí này, đồng thời củng cố thêm mong muốn được đóng góp năng lực lập trình và tối ưu hóa UI/UX của mình vào sự phát triển chung của công ty.

Tôi hy vọng sẽ có cơ hội được đồng hành và hợp tác cùng Quý công ty trong tương lai gần.

Chúc Quý công ty ngày càng phát triển và gặt hái được nhiều thành công hơn nữa.

Trân trọng,
[Họ tên]
[Số điện thoại]`
  },
  {
    title: "Quy tắc 3S giúp trả lời phỏng vấn trôi chảy",
    description: "Phương pháp đơn giản giúp bạn cấu trúc câu trả lời logic, không bị lan man trước mọi câu hỏi khó.",
    content: `Quy tắc **3S** là một công thức cấu trúc câu trả lời phỏng vấn cực kỳ tinh gọn và hiệu quả:

1. **S1 - Situation (Tình huống):**
   - Nêu ngắn gọn bối cảnh hoặc bài toán bạn gặp phải.
   - Tránh kể quá dài dòng chi tiết không cần thiết.
   - *Ví dụ:* "Ở dự án cũ, khi trang web chuẩn bị ra mắt thì tốc độ load trang bị chậm dưới 3G..."

2. **S2 - Solution (Giải pháp):**
   - Bạn đã trực tiếp làm gì để giải quyết vấn đề đó? Sử dụng công nghệ hay kỹ năng gì?
   - Nhấn mạnh hành động và vai trò chủ động của bản thân.
   - *Ví dụ:* "Tôi đã tiến hành code splitting bằng React.lazy và chuyển toàn bộ định dạng ảnh sang WebP..."

3. **S3 - Startling Result (Kết quả ấn tượng):**
   - Kết quả cụ thể đạt được là gì? Nên có con số đo lường cụ thể để tăng sức thuyết phục.
   - *Ví dụ:* "Nhờ vậy, dung lượng bundle giảm 40% và tốc độ tải trang trên thiết bị di động tăng 1.5 lần."`
  }
];
