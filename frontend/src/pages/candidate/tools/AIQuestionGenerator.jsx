import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toolApi } from "../../../api/toolApi";
import { 
  Briefcase, Code, Sparkles, Loader2, ArrowRight, 
  ChevronDown, ChevronUp, Mic, Star, Info, HelpCircle,
  TrendingUp, Users, Calculator, MessageSquare, AlertTriangle, CheckCircle, BookOpen
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";

// ─── CURATED QUESTIONS DATABASE (TOPCV CLONE) ────────────────────────────────
const CURATED_CATEGORIES = [
  { id: "common", label: "Câu hỏi phỏng vấn chung", icon: HelpCircle },
  { id: "it", label: "Công nghệ thông tin (IT)", icon: Code },
  { id: "sales", label: "Kinh doanh & Bán hàng", icon: TrendingUp },
  { id: "marketing", label: "Marketing & Truyền thông", icon: Sparkles },
  { id: "hr", label: "Hành chính & Nhân sự", icon: Users },
  { id: "finance", label: "Tài chính & Kế toán", icon: Calculator },
];

const CURATED_QUESTIONS = {
  common: [
    {
      id: 1,
      question: "Bạn hãy giới thiệu ngắn gọn về bản thân?",
      suggestedAnswer: `*   **Mục tiêu:** Đánh giá khả năng giao tiếp, sự tự tin và tư duy logic của bạn.
*   **Mẹo trả lời:**
    1.  **Lời chào:** Lịch sự, ngắn gọn.
    2.  **Kinh nghiệm nổi bật:** Tóm tắt 2-3 điểm mạnh hoặc dự án lớn liên quan trực tiếp tới vị trí đang tuyển.
    3.  **Lý do có mặt:** Thể hiện sự hào hứng và định hướng phát triển tại công ty.
*   **Tránh:** Kể quá dài về đời tư cá nhân hoặc lặp lại y nguyên những thông tin đã ghi trong CV.`,
      sampleAnswer: `*Chào Anh/Chị, tôi tên là Nguyễn Văn A. Tôi có hơn 3 năm kinh nghiệm làm việc ở vị trí Front-End Developer. Tại công ty cũ, tôi đã trực tiếp tối ưu hóa hiệu năng website giúp tốc độ tải trang tăng 40% và phối hợp nhóm Agile hoàn thành dự án đúng hạn. Tôi biết công ty mình đang mở rộng mảng Web Application cao cấp và tôi tin rằng kinh nghiệm tối ưu hóa UI/UX của mình sẽ đóng góp ngay lập tức cho dự án mới này.*`
    },
    {
      id: 2,
      question: "Điểm mạnh và điểm yếu lớn nhất của bạn là gì?",
      suggestedAnswer: `*   **Điểm mạnh:** Chọn 1-2 kỹ năng chuyên môn hoặc mềm liên quan trực tiếp tới vị trí ứng tuyển. Đi kèm ví dụ chứng minh cụ thể.
*   **Điểm yếu:** Chọn một điểm yếu thật thà nhưng không ảnh hưởng nghiêm trọng tới công việc (ví dụ: nói trước đám đông hơi run). Bắt buộc phải đi kèm giải pháp bạn đang thực hiện để khắc phục điểm yếu đó.`,
      sampleAnswer: `* **Điểm mạnh:** Tôi có tư duy giải quyết vấn đề tốt dưới áp lực thời gian. Ví dụ, trong một dự án gấp ở công ty cũ khi server gặp lỗi kết nối, tôi đã bình tĩnh phân tích log và tìm ra lỗi cấu hình DB trong vòng 30 phút.
* **Điểm yếu:** Tôi từng có thói quen ôm đồm mọi việc vì muốn mọi thứ hoàn hảo. Để cải thiện, tôi đã học cách ủy thác công việc và sử dụng công cụ Trello để quản lý tiến độ nhóm hiệu quả hơn.*`
    },
    {
      id: 3,
      question: "Tại sao bạn lại ứng tuyển vào công ty chúng tôi?",
      suggestedAnswer: `*   **Mục tiêu:** Đo lường mức độ quan tâm thực sự của bạn dành cho công ty và sự phù hợp về văn hóa làm việc.
*   **Mẹo trả lời:** Hãy tìm hiểu kỹ về sản phẩm, thành tựu gần đây hoặc văn hóa của doanh nghiệp và liên kết nó với mục tiêu cá nhân của bạn.`,
      sampleAnswer: `*Tôi đã theo dõi hành trình phát triển các giải pháp AI của công ty mình trong 2 năm qua và rất ngưỡng mộ công nghệ Virtual Agent mà công ty vừa công bố. Với thế mạnh nghiên cứu xử lý ngôn ngữ tự nhiên của bản thân, tôi mong muốn được đồng hành cùng đội ngũ kỹ sư tại đây để tạo ra những chatbot thông minh hơn, mang lại giá trị thực tế cho hàng triệu người dùng.*`
    },
    {
      id: 4,
      question: "Tại sao bạn lại quyết định rời bỏ công việc cũ?",
      suggestedAnswer: `*   **Mục tiêu:** Kiểm tra thái độ, sự chuyên nghiệp và định hướng lâu dài của bạn.
*   **Mẹo trả lời:** Tập trung vào mong muốn tìm kiếm thử thách mới, phát triển bản thân hơn là than phiền về sếp cũ hay công ty cũ. Luôn giữ thái độ tích cực.`,
      sampleAnswer: `*Tôi rất trân trọng thời gian làm việc tại công ty cũ vì đã giúp tôi tích lũy được nhiều nền tảng kỹ năng tốt. Tuy nhiên, tôi mong muốn được thử thách bản thân ở một môi trường có quy mô dự án lớn hơn và ứng dụng các công nghệ hiện đại hơn như AI/Big Data. Do đó, tôi tìm kiếm cơ hội mới phù hợp với mục tiêu dài hạn này.*`
    },
    {
      id: 5,
      question: "Mức lương mong muốn của bạn là bao nhiêu và vì sao?",
      suggestedAnswer: `*   **Mục tiêu:** Đánh giá mức độ tự nhận định giá trị năng lực và khảo sát mức độ phù hợp ngân sách của công ty.
*   **Mẹo trả lời:**
    1.  Nêu mức lương dựa trên khảo sát thị trường cho vị trí, số năm kinh nghiệm và khu vực.
    2.  Đưa ra một khoảng lương (range) thay vì con số cứng nhắc để dễ đàm phán.
    3.  Khẳng định giá trị bạn mang lại sẽ tương xứng với đãi ngộ.`,
      sampleAnswer: `*Qua tìm hiểu thị trường và đối chiếu với năng lực 3 năm làm việc ở vị trí tương đương, tôi mong muốn mức lương trong khoảng từ 22.000.000 đ đến 26.000.000 đ. Tuy nhiên, tôi hoàn toàn cởi mở để đàm phán thêm dựa trên các chế độ phúc lợi khác và khối lượng công việc thực tế tại công ty.*`
    }
  ],
  it: [
    {
      id: 1,
      question: "Sự khác biệt chính giữa REST API và GraphQL là gì? Khi nào nên dùng loại nào?",
      suggestedAnswer: `*   **REST API:**
    *   Mỗi endpoint đại diện cho một resource cố định.
    *   Dễ caching, cấu trúc chuẩn hóa, dễ học.
    *   Nhược điểm: Dễ bị over-fetching hoặc under-fetching dữ liệu.
*   **GraphQL:**
    *   Chỉ sử dụng duy nhất một endpoint.
    *   Client tự định nghĩa schema yêu cầu những dữ liệu gì -> Tránh over-fetching.
    *   Nhược điểm: Khó tối ưu cache, cấu trúc phức tạp hơn.
*   **Quyết định sử dụng:** Dùng REST cho hệ thống vừa/nhỏ hoặc cần cache mạnh. Dùng GraphQL khi hệ thống có cấu trúc dữ liệu quan hệ phức tạp và client đa dạng (Mobile, Web) cần lấy dữ liệu linh hoạt.`,
      sampleAnswer: `*Trong dự án Web e-commerce trước, tôi ưu tiên sử dụng REST API cho các API sản phẩm tĩnh cần CDN Caching tốt để tải nhanh. Đối với trang dashboard của người dùng với nhiều thông tin chi tiết đan xen, tôi sử dụng GraphQL để client lấy đúng các trường dữ liệu cần thiết chỉ trong một request duy nhất.*`
    },
    {
      id: 2,
      question: "Bạn làm thế nào để tối ưu hóa hiệu suất (performance) của một ứng dụng React?",
      suggestedAnswer: `*   **Các kỹ thuật tối ưu hóa phổ biến:**
    1.  **Tránh render dư thừa:** Sử dụng \`React.memo\`, \`useMemo\`, \`useCallback\` cho các component và hàm nặng.
    2.  **Lazy loading:** Sử dụng \`React.lazy\` và \`Suspense\` để chia nhỏ code bundle (Code splitting).
    3.  **Tối ưu hình ảnh:** Sử dụng định dạng hiện đại (WebP), lazy-load ảnh ngoài màn hình.
    4.  **Quản lý state:** Tránh đưa state cục bộ lên global store không cần thiết để hạn chế re-render diện rộng.`,
      sampleAnswer: `*Để tối ưu ứng dụng React ở dự án cũ, tôi tiến hành code splitting bằng React.lazy giúp giảm dung lượng bundle tải lần đầu xuống 35%. Sau đó, sử dụng useMemo cho các hàm tính toán filter phức tạp của bảng dữ liệu lớn, tránh việc tính toán lại vô ích mỗi khi component cha cập nhật.*`
    },
    {
      id: 3,
      question: "Sự khác biệt giữa SQL và NoSQL database là gì? Khi nào nên dùng loại nào?",
      suggestedAnswer: `*   **SQL (Relational):**
    *   Lưu trữ dữ liệu dạng bảng với lược đồ cấu trúc cố định (Strict schema).
    *   Hỗ trợ mạnh mẽ ACID transaction, đảm bảo tính toàn vẹn dữ liệu cực tốt.
    *   Scale theo chiều dọc (Vertical scaling).
*   **NoSQL (Non-relational):**
    *   Lưu trữ linh hoạt dưới dạng document (JSON), key-value, graph.
    *   Không yêu cầu schema cố định, dễ thay đổi cấu trúc nhanh.
    *   Scale theo chiều ngang rất tốt (Horizontal scaling).
*   **Lựa chọn:** Dùng SQL cho hệ thống giao dịch tài chính, quản lý tài khoản đòi hỏi độ chính xác cao. Dùng NoSQL khi dữ liệu không có cấu trúc cố định hoặc lượng ghi cực kỳ lớn (như chat logs, feeds, social network).`,
      sampleAnswer: `*Đối với phần quản lý giao dịch mua hàng và số dư ví của hệ thống e-commerce, tôi dùng PostgreSQL để đảm bảo tính ACID không bị sai sót tiền tệ. Còn đối với tính năng lưu log lượt click chuột và lịch sử tìm kiếm sản phẩm của người dùng, tôi dùng MongoDB để lưu dạng document linh hoạt và scale dung lượng ghi dễ dàng.*`
    },
    {
      id: 4,
      question: "Làm thế nào để bảo mật API chống các lỗi tấn công phổ biến như SQL Injection hoặc XSS?",
      suggestedAnswer: `*   **SQL Injection:**
    *   Tuyệt đối không cộng chuỗi SQL trực tiếp.
    *   Sử dụng Parameterized Queries (hoặc ORM như Knex/Sequelize).
*   **XSS (Cross-Site Scripting):**
    *   Sanitize đầu vào dữ liệu (loại bỏ các thẻ script độc hại).
    *   Sử dụng các thư viện bảo vệ headers như Helmet.js ở Node.js.
*   **Các biện pháp khác:** Áp dụng JWT bảo mật route nhạy cảm, sử dụng HTTPS, giới hạn Rate Limit để chống spam API.`,
      sampleAnswer: `*Trong dự án backend ExpressJS của mình, tôi sử dụng ORM Knex để thực hiện truy vấn an toàn tránh SQL Injection. Đồng thời, tôi tích hợp middleware Helmet và sử dụng thư viện DOMPurify ở frontend để lọc sạch HTML đầu vào của người dùng trước khi hiển thị ra màn hình.*`
    }
  ],
  sales: [
    {
      id: 1,
      question: "Nếu khách hàng từ chối mua sản phẩm vì chê mức giá quá cao, bạn sẽ xử lý như thế nào?",
      suggestedAnswer: `*   **Quy trình xử lý:**
    1.  **Lắng nghe & Đồng cảm:** Không cãi lý với khách hàng, thừa nhận giá sản phẩm có sự chênh lệch.
    2.  **Tập trung vào Giá trị:** Chuyển cuộc hội thoại từ "Giá bán" sang "Giá trị mang lại". Phân tích chi phí cơ hội hoặc lợi nhuận khách hàng nhận lại.
    3.  **Chia nhỏ chi phí:** Tính toán chi phí sử dụng theo ngày/tháng để thấy nó rất hợp lý.
    4.  **Đưa ra phương án hỗ trợ:** Trả góp, quà tặng kèm hoặc gói dùng thử giới hạn.`,
      sampleAnswer: `*Tôi sẽ nói: 'Dạ vâng, tôi rất hiểu là anh/chị đang cân nhắc kỹ về ngân sách chi trả lúc này. Tuy nhiên, nếu chúng ta sử dụng thiết bị này, tỷ lệ hao hụt nguyên liệu sẽ giảm 15%, tính ra mỗi tháng anh/chị tiết kiệm được hơn 5 triệu đồng, chỉ sau 3 tháng là đã hòa vốn mua máy ban đầu. Bên em cũng có chương trình trả góp 0% lãi suất hỗ trợ dòng tiền cho bên mình ạ.'*`
    },
    {
      id: 2,
      question: "Hãy thuyết phục tôi mua chiếc bút này (Sell me this pen)?",
      suggestedAnswer: `*   **Mục tiêu:** Đo lường kỹ năng khai thác nhu cầu của khách hàng thay vì chỉ giới thiệu sản phẩm vô hồn.
*   **Mẹo trả lời:**
    1.  **Đặt câu hỏi:** Khảo sát thói quen sử dụng bút của đối phương (Họ làm nghề gì, họ viết nhiều không, lần cuối họ ký một hợp đồng lớn là khi nào).
    2.  **Tạo ra nhu cầu (Pain point):** Tạo ra tình huống cần sử dụng bút cấp thiết (ví dụ: yêu cầu họ ký tên vào một văn bản quan trọng ngay lập tức nhưng họ không có bút).
    3.  **Đóng giao dịch:** Đưa chiếc bút ra giải quyết vấn đề của họ.`,
      sampleAnswer: `*Anh làm giám đốc kinh doanh chắc hẳn thường xuyên phải ký duyệt các giấy tờ quan trọng đúng không ạ? Anh đã bao giờ gặp tình huống chuẩn bị ký một hợp đồng lớn nhưng lại quên mang bút và phải đi mượn một chiếc bút bi nhựa thông thường làm mất đi vẻ chuyên nghiệp chưa? Chiếc bút máy cao cấp bằng kim loại này sẽ thể hiện vị thế và phong thái của anh mỗi khi ký kết. Hiện em chỉ còn đúng một chiếc duy nhất ở đây, anh muốn sở hữu nó ngay bây giờ chứ ạ?*`
    },
    {
      id: 3,
      question: "Làm thế nào bạn tìm kiếm và khai thác các khách hàng tiềm năng mới?",
      suggestedAnswer: `*   **Quy trình tìm kiếm:**
    1.  **Xác định chân dung khách hàng:** Hiểu rõ đối tượng mục tiêu (độ tuổi, sở thích, hành vi, ngành nghề).
    2.  **Khai thác đa kênh:** Kết hợp kênh Online (Mạng xã hội, LinkedIn, Email) và Offline (Hội thảo, sự kiện kết nối doanh nghiệp).
    3.  **Chăm sóc mối quan hệ cũ:** Nhờ khách hàng cũ giới thiệu khách hàng mới (Referral).`,
      sampleAnswer: `*Trước tiên, tôi vẽ chân dung khách hàng cho sản phẩm B2B của chúng ta là các giám đốc nhân sự. Tôi chủ động tìm kiếm và kết nối với họ qua LinkedIn, chia sẻ các bài viết hữu ích về nhân sự để tạo lòng tin trước khi tiếp cận chào hàng trực tiếp. Ngoài ra, tôi duy trì mối quan hệ tốt với khách hàng cũ và 20% doanh số mới của tôi đến từ việc họ giới thiệu đồng nghiệp.*`
    },
    {
      id: 4,
      question: "Bạn xử lý như thế nào nếu doanh số tháng đó của bạn không đạt KPI?",
      suggestedAnswer: `*   **Mục tiêu:** Kiểm tra khả năng tự nhận định lỗi sai, tính chịu trách nhiệm và tinh thần vượt khó dưới áp lực.
*   **Mẹo trả lời:**
    1.  Nhìn nhận thực tế và tìm ra nguyên nhân cốt lõi (do thị trường, do kịch bản chốt sales, hay do phân bổ thời gian).
    2.  Đưa ra kế hoạch hành động cụ thể để bù đắp doanh số vào tháng tiếp theo.`,
      sampleAnswer: `*Nếu không đạt KPI, tôi sẽ ngồi phân tích lại tỷ lệ chuyển đổi của phễu bán hàng cá nhân xem mình bị tắc ở bước nào (gọi điện bị từ chối nhiều hay bước chốt hợp đồng bị chậm). Từ đó, tôi điều chỉnh lại kịch bản tư vấn và lập kế hoạch gọi thêm 20 cuộc gọi chất lượng mỗi ngày để nhanh chóng bù đắp doanh số thiếu hụt vào tháng sau.*`
    }
  ],
  marketing: [
    {
      id: 1,
      question: "Sự khác biệt cơ bản giữa SEO (Search Engine Optimization) và SEM (Search Engine Marketing) là gì?",
      suggestedAnswer: `*   **SEO:**
    *   Tối ưu hóa công cụ tìm kiếm tự nhiên (Organic).
    *   Không tốn chi phí click trực tiếp.
    *   Cần thời gian dài (3-6 tháng) để thấy hiệu quả. Mang tính bền vững cao.
*   **SEM:**
    *   Tiếp thị trên công cụ tìm kiếm bằng quảng cáo trả phí (PPC - Pay Per Click).
    *   Tốn chi phí cho mỗi lượt nhấp chuột.
    *   Hiển thị lập tức ở top đầu kết quả tìm kiếm. Dễ đo lường chuyển đổi nhanh.`,
      sampleAnswer: `*Trong chiến dịch ra mắt sản phẩm mới của công ty cũ, tôi kết hợp cả hai: Sử dụng SEM (chạy Google Ads) để tiếp cận nhanh khách hàng đang có nhu cầu mua ngay trong tuần đầu tiên, đồng thời triển khai kế hoạch SEO nội dung bài viết chuyên sâu dài hạn để duy trì lượng traffic bền vững và miễn phí sau 6 tháng tiếp theo.*`
    },
    {
      id: 2,
      question: "Làm thế nào để xây dựng một chiến dịch Content Marketing thu hút traffic với ngân sách bằng 0?",
      suggestedAnswer: `*   **Giải pháp:**
    1.  **Nghiên cứu Pain Point:** Tìm hiểu những câu hỏi, vấn đề thực sự nhức nhối của khách hàng mục tiêu đang thảo luận trên các group, cộng đồng.
    2.  **Viết nội dung giải pháp chất lượng cao:** Xây dựng cẩm nang chi tiết hướng dẫn giải quyết tận gốc vấn đề đó.
    3.  **Tối ưu SEO On-page:** Đảm bảo bài viết chuẩn SEO để thu hút traffic tự nhiên.
    4.  **Seeding tự nhiên:** Chia sẻ bài viết lên các cộng đồng liên quan dưới dạng chia sẻ kinh nghiệm chứ không quảng cáo.`,
      sampleAnswer: `*Tại dự án trước, tôi đã xây dựng bài cẩm nang 'Tự thiết lập phễu bán hàng B2B' chuẩn SEO. Sau đó, tôi mang chia sẻ lên các group Facebook và LinkedIn dành cho Startup. Bài viết nhận được hơn 500 lượt share tự nhiên, mang lại hơn 10.000 lượt traffic truy cập website chỉ trong 1 tuần mà không tốn đồng chi phí quảng cáo nào.*`
    },
    {
      id: 3,
      question: "Những chỉ số quan trọng nào (KPIs) bạn dùng để đo lường hiệu quả một chiến dịch quảng cáo trả phí?",
      suggestedAnswer: `*   **Các chỉ số chính:**
    1.  **CTR (Click-Through Rate):** Tỷ lệ click vào quảng cáo, phản ánh độ hấp dẫn của hình ảnh/nội dung.
    2.  **CPC (Cost Per Click):** Chi phí cho mỗi lượt nhấp chuột.
    3.  **CPA (Cost Per Action) / CPL (Cost Per Lead):** Chi phí để có một khách hàng tiềm năng.
    4.  **ROI (Return on Investment) / ROAS (Return on Ad Spend):** Lợi nhuận mang lại trên chi phí quảng cáo bỏ ra (Chỉ số tối hậu).`,
      sampleAnswer: `*Mặc dù CTR hay CPC giúp tôi đánh giá chất lượng mẫu quảng cáo, chỉ số tối hậu tôi dùng để đo lường thành công của chiến dịch là CPL (Cost Per Lead) và ROAS. Quảng cáo có thể có CTR cao nhưng nếu lead mang về không chất lượng và ROAS nhỏ hơn 1 thì chiến dịch đó vẫn là không hiệu quả.*`
    },
    {
      id: 4,
      question: "Bạn xử lý khủng hoảng truyền thông mạng xã hội cho thương hiệu như thế nào?",
      suggestedAnswer: `*   **Quy trình xử lý:**
    1.  **Phát hiện và Đánh giá:** Nhanh chóng đo lường quy mô khủng hoảng, xác định nguyên nhân.
    2.  **Lắng nghe & Phản hồi nhanh:** Không xóa bài viết/comment tiêu cực vô tội vạ, đưa ra thông báo ghi nhận sự việc chính thức từ đại diện thương hiệu.
    3.  **Đưa ra giải pháp xử lý triệt để:** Sửa sai bằng hành động thực tế (đền bù sản phẩm lỗi, xin lỗi khách hàng).
    4.  **Đo lường sau khủng hoảng:** Theo dõi tâm lý dư luận sau khi xử lý.`,
      sampleAnswer: `*Tôi sẽ thành lập ban phản ứng nhanh. Bước đầu tiên là đăng thông cáo báo chí ngắn gọn xác nhận lỗi sản phẩm và cam kết thu hồi đền bù cho khách hàng bị ảnh hưởng trong vòng 24 giờ. Chúng tôi chủ động đối thoại lịch sự dưới các bài đăng thay vì xóa bài để tránh thổi bùng cơn giận dữ của cộng đồng mạng.*`
    }
  ],
  hr: [
    {
      id: 1,
      question: "Làm thế nào bạn giải quyết một mâu thuẫn nội bộ gay gắt giữa hai nhân viên trong phòng?",
      suggestedAnswer: `*   **Quy trình giải quyết:**
    1.  **Thu thập thông tin khách quan:** Gặp riêng từng người để lắng nghe góc nhìn của họ mà không phán xét.
    2.  **Tìm điểm chung:** Đưa cả hai ngồi lại trong phòng kín, tập trung vào mục tiêu chung của dự án thay vì cái tôi cá nhân.
    3.  **Đề xuất giải pháp và cam kết:** Thống nhất quy tắc làm việc và phân chia vai trò rõ ràng hơn để tránh giẫm chân lên nhau.`,
      sampleAnswer: `*Tôi sẽ không phân xử ai đúng ai sai ngay lập tức. Tôi gặp riêng từng nhân sự để thấu hiểu gốc rễ bất đồng. Sau đó, tôi mời cả hai họp chung và chỉ ra rằng mâu thuẫn này đang làm chậm tiến độ dự án chung 15%. Tôi đề xuất phân chia lại nhiệm vụ phụ trách rõ ràng và thiết lập quy trình duyệt chéo minh bạch. Kết quả là mâu thuẫn được giải quyết và dự án hoàn thành đúng hạn.*`
    },
    {
      id: 2,
      question: "Quy trình đánh giá hiệu suất nhân viên (KPIs/OKRs) hiệu quả bao gồm những bước nào?",
      suggestedAnswer: `*   **Quy trình chuẩn:**
    1.  **Thiết lập mục tiêu đầu kỳ:** Thống nhất các chỉ số đo lường (Measurable) từ đầu quý/năm.
    2.  **Giám sát & Phản hồi liên tục (Check-in):** Họp ngắn hàng tuần/tháng để kịp thời gỡ nút thắt.
    3.  **Đánh giá cuối kỳ:** Đánh giá đa chiều (360 độ - Tự đánh giá, sếp đánh giá, đồng nghiệp đánh giá).
    4.  **Lập kế hoạch cải thiện và phát triển:** Xây dựng mục tiêu cho kỳ tiếp theo.`,
      sampleAnswer: `*Ở doanh nghiệp trước, tôi áp dụng chu kỳ check-in OKR hàng tháng thay vì chỉ đánh giá 1 lần vào cuối năm. Việc này giúp quản lý kịp thời hỗ trợ nhân viên khi họ gặp khó khăn và giảm thiểu tình trạng chệch mục tiêu dự án ban đầu.*`
    },
    {
      id: 3,
      question: "Làm sao để thu hút và tuyển dụng được các ứng viên thụ động (Passive Candidates) tài năng?",
      suggestedAnswer: `*   **Chiến lược tiếp cận:**
    1.  **Xây dựng Employer Branding mạnh:** Tạo dựng hình ảnh công ty là nơi làm việc lý tưởng.
    2.  **Chủ động Networking:** Tham gia các cộng đồng chuyên môn, theo dõi các chuyên gia trong ngành.
    3.  **Tiếp cận cá nhân hóa:** Khi liên hệ mời cơ hội việc làm, hãy chỉ ra điểm mạnh cụ thể của họ phù hợp với lộ trình phát triển tại công ty thay vì gửi JD chung chung.`,
      sampleAnswer: `*Khi cần tuyển Tech Lead, tôi không đăng tin tuyển dụng đại trà. Tôi tìm kiếm hồ sơ của họ trên GitHub/LinkedIn, xem các bài viết chuyên môn họ chia sẻ. Tôi gửi email cá nhân bày tỏ sự ấn tượng về một bài viết của họ và mời một buổi cafe trao đổi cởi mở về định hướng phát triển của họ. Nhờ vậy, tôi đã tuyển được 3 nhân sự chủ chốt bằng phương thức này.*`
    },
    {
      id: 4,
      question: "Khi một nhân sự chủ chốt đột ngột xin nghỉ việc, bạn sẽ xử lý thế nào để đảm bảo vận hành?",
      suggestedAnswer: `*   **Quy trình phản ứng nhanh:**
    1.  **Phỏng vấn nghỉ việc (Exit Interview):** Tìm hiểu nguyên nhân thực sự (do lương, môi trường, hay định hướng) để xem có thể giữ chân họ lại không.
    2.  **Xác định rủi ro vận hành:** Lập tức rà soát các công việc nhân sự đó đang nắm giữ để phân chia chuyển giao khẩn cấp.
    3.  **Kích hoạt kế hoạch kế nhiệm (Succession Plan):** Bàn giao cho nhân sự dự phòng hoặc tuyển dụng gấp.`,
      sampleAnswer: `*Tôi sẽ gặp riêng nhân sự đó để tìm hiểu lý do. Nếu không thể thuyết phục họ ở lại, tôi sẽ yêu cầu họ lập tức lập danh sách tài liệu hóa toàn bộ quy trình công việc và hướng dẫn bàn giao cho một nhân viên senior khác trong team chịu trách nhiệm tạm thời, đồng thời kích hoạt tuyển dụng khẩn cấp để lấp chỗ trống.*`
    }
  ],
  finance: [
    {
      id: 1,
      question: "Sự khác biệt cốt lõi giữa Dòng tiền (Cash Flow) và Lợi nhuận (Profit) là gì?",
      suggestedAnswer: `*   **Lợi nhuận (Profit):**
    *   Doanh thu trừ chi phí trong một kỳ kế toán (trên sổ sách kế toán dồn tích).
    *   Có thể có lợi nhuận cao nhưng vẫn không có tiền mặt (do chưa thu được nợ khách hàng).
*   **Dòng tiền (Cash Flow):**
    *   Lượng tiền thực tế ra và vào tài khoản ngân hàng của doanh nghiệp.
    *   Đảm bảo khả năng thanh toán công nợ ngắn hạn, trả lương, vận hành hàng ngày.
*   **Kết luận:** Lợi nhuận thể hiện hiệu quả kinh doanh trên giấy tờ, còn Dòng tiền thể hiện sức khỏe sinh tồn thực tế của doanh nghiệp.`,
      sampleAnswer: `*Doanh nghiệp có thể báo cáo lợi nhuận rất tốt cuối năm nhờ các đơn hàng lớn đã ký, nhưng nếu khách hàng chậm thanh toán 90 ngày, doanh nghiệp vẫn có thể rơi vào tình trạng mất thanh khoản và phá sản kỹ thuật do thiếu dòng tiền trả lương và nhà cung cấp ngắn hạn.*`
    },
    {
      id: 2,
      question: "Làm thế nào để phát hiện và ngăn ngừa các sai sót, gian lận tài chính trong doanh nghiệp?",
      suggestedAnswer: `*   **Biện pháp kiểm soát:**
    1.  **Phân tách nhiệm vụ (Segregation of Duties):** Không để một người vừa lập kế hoạch thu chi, vừa giữ quỹ và vừa ghi sổ kế toán.
    2.  **Đối chiếu định kỳ:** Đối chiếu số dư tài khoản ngân hàng và kiểm kê quỹ tiền mặt hàng ngày/tuần.
    3.  **Kiểm toán nội bộ:** Thường xuyên chạy rà soát kiểm tra ngẫu nhiên các chứng từ hóa đơn.`,
      sampleAnswer: `*Tôi thiết lập quy trình kiểm soát chặt chẽ: Mọi khoản chi trên 5 triệu đều phải có tối thiểu 2 cấp duyệt phê duyệt bằng chữ ký số. Đồng thời, tôi thực hiện đối chiếu chéo số dư sổ quỹ tiền mặt với sao kê ngân hàng độc lập hàng tuần để phát hiện chênh lệch ngay lập tức.*`
    },
    {
      id: 3,
      question: "Cách bạn lập ngân sách tài chính (Budgeting) hàng năm cho các phòng ban như thế nào?",
      suggestedAnswer: `*   **Quy trình lập ngân sách:**
    1.  **Phân tích lịch sử chi tiêu:** Đánh giá hiệu quả sử dụng ngân sách của năm trước.
    2.  **Dự báo dựa trên mục tiêu kinh doanh:** Làm việc với các trưởng bộ phận để nắm rõ mục tiêu tăng trưởng và nhu cầu thực tế của họ.
    3.  **Lập ngân sách từ gốc (Zero-Based Budgeting):** Yêu cầu giải trình chi tiết từng hạng mục chi tiêu thay vì chỉ tăng đều theo tỷ lệ phần trăm năm ngoái.
    4.  **Dự phòng rủi ro:** Phân bổ 5-10% ngân sách dự phòng phát sinh.`,
      sampleAnswer: `*Tôi yêu cầu các phòng ban bảo vệ kế hoạch chi tiêu của mình dựa trên mục tiêu doanh số cụ thể (ROI). Ví dụ phòng Marketing muốn tăng ngân sách 20% thì phải chứng minh được chiến dịch đó mang lại lượng lead tăng tương ứng bao nhiêu phần trăm, tránh việc duyệt ngân sách cảm tính.*`
    },
    {
      id: 4,
      question: "Phương pháp khấu hao tài sản cố định nào phổ biến nhất và ưu nhược điểm của nó?",
      suggestedAnswer: `*   **Phương pháp khấu hao đường thẳng (Straight-Line Depreciation):**
    *   *Mô tả:* Phân bổ giá trị tài sản đều theo thời gian sử dụng hữu ích.
    *   *Ưu điểm:* Đơn giản, dễ tính toán, chi phí khấu hao ổn định qua các năm giúp dễ lập kế hoạch tài chính.
    *   *Nhược điểm:* Không phản ánh đúng mức độ hao mòn thực tế của các tài sản giảm giá trị nhanh (như thiết bị công nghệ, máy tính).
*   **Phương pháp khấu hao số dư giảm dần (Declining Balance Method):**
    *   Khấu hao nhanh trong những năm đầu sử dụng, phù hợp với tài sản công nghệ cao.`,
      sampleAnswer: `*Tôi ưu tiên áp dụng phương pháp khấu hao đường thẳng cho các tài sản cố định như văn phòng, xe đưa đón nhân viên vì tính ổn định cao. Còn đối với dàn máy chủ server phục vụ nghiên cứu công nghệ, tôi áp dụng khấu hao nhanh để kịp thời thu hồi vốn trước khi công nghệ bị lỗi thời.*`
    }
  ]
};

const SmartSuggestedAnswer = ({ answer }) => {
  if (!answer) return null;

  let isJson = false;
  let data = null;
  
  if (typeof answer === "string" && answer.trim().startsWith("{") && answer.trim().endsWith("}")) {
    try {
      data = JSON.parse(answer);
      isJson = true;
    } catch {
      isJson = false;
    }
  }

  if (!isJson) {
    return (
      <MDEditor.Markdown
        source={answer}
        style={{ background: "transparent", color: "inherit", fontSize: "12px" }}
      />
    );
  }

  return (
    <div className="space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
      {data.model_answer && (
        <div className="space-y-1 bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-sky-100/30 dark:border-white/5 shadow-inner">
          <p className="font-bold text-[#0ea5e9] mb-1">💡 Câu trả lời mẫu tham khảo:</p>
          <p className="italic font-medium">{data.model_answer}</p>
        </div>
      )}
      
      {data.steps && data.steps.length > 0 && (
        <div className="space-y-2">
          <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            📋 Các bước triển khai gợi ý:
          </p>
          <div className="space-y-2.5 pl-3.5 border-l-2 border-[#0ea5e9]/50">
            {data.steps.map((step, idx) => (
              <div key={idx} className="space-y-0.5">
                <span className="font-black text-[#0ea5e9] text-[10px] uppercase tracking-wider block">
                  Bước {step.label || idx + 1}:
                </span>
                <p className="font-bold text-slate-600 dark:text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.suggested_time && (
        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1">
          ⏱️ Thời gian trả lời khuyến nghị: {data.suggested_time} giây
        </div>
      )}
    </div>
  );
};

const LEVEL_OPTIONS = [
  { value: "INTERN", label: "Thực tập sinh (Intern)" },
  { value: "JUNIOR", label: "Nhân viên mới (Junior)" },
  { value: "MID", label: "Nhân viên có kinh nghiệm (Mid-level)" },
  { value: "SENIOR", label: "Chuyên viên cao cấp (Senior)" },
  { value: "LEAD", label: "Trưởng nhóm / Quản lý (Team Lead/Manager)" }
];

export default function AIQuestionGenerator() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("common"); // category id or "ai_custom"
  const [expandedId, setExpandedId] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("tips"); // "tips" or "sample"

  // AI Generator States
  const [position, setPosition] = useState("");
  const [skills, setSkills] = useState("");
  const [level, setLevel] = useState("JUNIOR");
  const [aiQuestions, setAiQuestions] = useState([]);

  const generateMutation = useMutation({
    mutationFn: (data) => toolApi.generateQuestions(data),
    onSuccess: (res) => {
      if (res?.success) {
        setAiQuestions(res.data);
        setExpandedId(null);
        setActiveSubTab("tips");
      }
    }
  });

  const handleAiSubmit = (e) => {
    e.preventDefault();
    if (!position.trim()) return;

    generateMutation.mutate({
      position,
      skills,
      experienceLevel: level
    });
  };

  const handlePractice = (questionText) => {
    navigate(`/interview-practice?question=${encodeURIComponent(questionText)}`);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Lấy danh sách câu hỏi hiện tại để render
  const getCurrentQuestions = () => {
    if (activeCategory === "ai_custom") {
      return aiQuestions;
    }
    return CURATED_QUESTIONS[activeCategory] || [];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* CỘT TRÁI: DANH MỤC NGÀNH NGHỀ & AI TRIGGER */}
      <div className="lg:col-span-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl space-y-3">
        <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Danh mục câu hỏi
        </div>
        
        <div className="space-y-1">
          {CURATED_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setExpandedId(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  isSelected
                    ? "bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon size={16} className={isSelected ? "text-[#0ea5e9]" : "text-slate-400"} />
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="border-t border-slate-100 dark:border-white/5 my-2 pt-2">
          <button
            onClick={() => {
              setActiveCategory("ai_custom");
              setExpandedId(null);
            }}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 border-dashed ${
              activeCategory === "ai_custom"
                ? "bg-[#0ea5e9] text-white border-transparent shadow-lg shadow-sky-500/20"
                : "border-[#0ea5e9]/40 text-[#0ea5e9] hover:bg-sky-50 dark:hover:bg-sky-950/20"
            }`}
          >
            <Sparkles size={14} />
            Thiết kế câu hỏi riêng bằng AI
          </button>
        </div>
      </div>

      {/* CỘT PHẢI: CHI TIẾT CÂU HỎI */}
      <div className="lg:col-span-8 space-y-4">
        
        {/* VIEW 1: TRƯỜNG HỢP CHỌN CÁC NGÀNH CÓ SẴN (CLONE TOPCV) */}
        {activeCategory !== "ai_custom" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0ea5e9]" />
                {CURATED_CATEGORIES.find(c => c.id === activeCategory)?.label}
              </h3>
              <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                {getCurrentQuestions().length} câu hỏi kinh điển
              </span>
            </div>

            {getCurrentQuestions().map((q) => {
              const isExpanded = expandedId === q.id;
              return (
                <div 
                  key={q.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {/* Accordion Header */}
                  <div 
                    onClick={() => toggleExpand(q.id)}
                    className="p-5 flex items-start justify-between gap-4 cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                  >
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-950/50 text-[#0ea5e9] font-black text-xs font-mono">
                        {q.id}
                      </span>
                      <p className="text-sm font-bold text-slate-800 dark:text-white leading-relaxed pt-0.5">
                        {q.question}
                      </p>
                    </div>
                    <div className="text-slate-400 dark:text-slate-500 pt-1 flex-shrink-0">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* Accordion Body */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-50 dark:border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                      {/* Sub-tabs: Tips vs Sample Answer */}
                      <div className="flex border-b border-slate-100 dark:border-white/5">
                        <button
                          onClick={() => setActiveSubTab("tips")}
                          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                            activeSubTab === "tips"
                              ? "border-[#0ea5e9] text-[#0ea5e9]"
                              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          }`}
                        >
                          Gợi ý & Mẹo trả lời
                        </button>
                        <button
                          onClick={() => setActiveSubTab("sample")}
                          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                            activeSubTab === "sample"
                              ? "border-[#0ea5e9] text-[#0ea5e9]"
                              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          }`}
                        >
                          Câu trả lời mẫu tham khảo
                        </button>
                      </div>

                      {/* Content Area */}
                      <div className="bg-sky-50/40 dark:bg-sky-950/10 p-5 rounded-xl border border-sky-100/50 dark:border-sky-900/10 min-h-[100px] text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                        {activeSubTab === "tips" ? (
                          <SmartSuggestedAnswer answer={q.suggestedAnswer} />
                        ) : (
                          <div className="italic bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-sky-100/30 dark:border-white/5 shadow-inner">
                            <MDEditor.Markdown
                              source={q.sampleAnswer}
                              style={{ background: "transparent", color: "inherit", fontSize: "12px" }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => handlePractice(q.question)}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] active:scale-[0.97] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                        >
                          <Mic size={14} /> Luyện tập với AI <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: TRƯỜNG HỢP CHỌN AI CUSTOM GENERATOR */}
        {activeCategory === "ai_custom" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Form sinh câu hỏi bằng AI */}
            <form onSubmit={handleAiSubmit} className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="space-y-2 md:col-span-4">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Briefcase size={14} className="text-[#0ea5e9]" />
                  Vị trí công việc
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: NodeJS Engineer..."
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none text-xs font-bold text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-3">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Code size={14} className="text-[#0ea5e9]" />
                  Kỹ năng chính
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Express, SQL..."
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none text-xs font-bold text-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-2 md:col-span-3">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Star size={14} className="text-[#0ea5e9]" />
                  Cấp bậc
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none text-xs font-bold text-slate-700 dark:text-white appearance-none"
                >
                  {LEVEL_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={generateMutation.isPending}
                  className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white py-2.5 rounded-xl font-bold text-xs transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Tạo câu hỏi <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Hiển thị câu hỏi đã sinh */}
            {aiQuestions.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                  <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Bộ câu hỏi AI sinh cho vị trí {position}
                  </h3>
                  <span className="text-[10px] font-black text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-full border border-amber-100 dark:border-amber-900/30">
                    AI generated
                  </span>
                </div>

                {aiQuestions.map((q) => {
                  const isExpanded = expandedId === q.id;
                  return (
                    <div 
                      key={q.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 animate-in fade-in duration-300"
                    >
                      <div 
                        onClick={() => toggleExpand(q.id)}
                        className="p-5 flex items-start justify-between gap-4 cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                      >
                        <div className="flex gap-3">
                          <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 font-black text-xs font-mono">
                            {q.id}
                          </span>
                          <p className="text-sm font-bold text-slate-800 dark:text-white leading-relaxed pt-0.5">
                            {q.question}
                          </p>
                        </div>
                        <div className="text-slate-400 dark:text-slate-500 pt-1 flex-shrink-0">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-5 pb-5 pt-1 border-t border-slate-50 dark:border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                          <div className="bg-amber-50/30 dark:bg-amber-950/5 p-4 rounded-xl border border-amber-100/30 dark:border-amber-900/10">
                            <p className="text-[10px] font-black text-amber-600 tracking-wider mb-2 flex items-center gap-1.5">
                              <Star size={12} /> AI Gợi ý hướng trả lời
                            </p>
                            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                              <SmartSuggestedAnswer answer={q.suggestedAnswer} />
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={() => handlePractice(q.question)}
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] active:scale-[0.97] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                            >
                              <Mic size={14} /> Luyện tập với AI <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500 bg-white/40 dark:bg-slate-900/20 backdrop-blur-sm rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
                <Sparkles className="w-16 h-16 opacity-20 mb-4 animate-pulse text-amber-400" />
                <span className="font-bold text-sm">Vui lòng điền thông tin vị trí công việc phía trên để AI thiết kế bộ câu hỏi riêng biệt.</span>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
