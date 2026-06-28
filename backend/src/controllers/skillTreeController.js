import db from '../db/knex.js';
import { generateSkillNodeDetailsFromGroq } from '../services/groqService.js';

// In-memory cache for skill node details to prevent API rate limits (429)
const nodeDetailsCache = new Map(); // key: `${userId}:${nodeId}` -> details

// Static Fallback Data for all 20 Skills (Frontend & Backend Tracks)
const staticNodeDetails = {
  // Frontend Track Skills
  html5: {
    ai_feedback: "HTML5 là nền tảng của mọi trang Web. Bạn cần nắm chắc cách dựng cấu trúc trang chuẩn Semantic HTML5, cấu trúc DOM tối ưu và các thẻ SEO.",
    practice_questions: [
      { question: "Thẻ Semantic HTML5 là gì và tại sao chúng ta nên sử dụng chúng thay vì thẻ div vô nghĩa?", expected_answer: "Giúp tối ưu SEO, tăng tính tiếp cận (accessibility) và làm mã nguồn dễ đọc hơn." },
      { question: "Sự khác biệt giữa LocalStorage, SessionStorage và Cookies là gì?", expected_answer: "LocalStorage lưu vô hạn, SessionStorage mất khi đóng tab, Cookies có thời hạn và gửi kèm request." },
      { question: "Thuộc tính 'async' và 'defer' trong thẻ script hoạt động khác nhau như thế nào?", expected_answer: "Async chạy ngay khi tải xong chặn render HTML, Defer chạy sau khi HTML parse xong hoàn toàn." }
    ],
    courses: [
      { title: "MDN Web Docs: HTML basics", url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics" },
      { title: "W3Schools HTML Tutorial", url: "https://www.w3schools.com/html/" }
    ]
  },
  css3: {
    ai_feedback: "CSS3 giúp tạo kiểu dáng và bố cục trang web. Tập trung nắm vững Flexbox, Grid Layout, Responsive Design, và CSS Variables.",
    practice_questions: [
      { question: "Giải thích sự khác biệt giữa Flexbox và CSS Grid Layout? Khi nào nên dùng cái nào?", expected_answer: "Flexbox bố cục 1 chiều (hàng/cột), CSS Grid bố cục 2 chiều phức tạp (hàng và cột)." },
      { question: "Các giá trị 'position: absolute', 'relative', 'fixed', 'sticky' hoạt động như thế nào?", expected_answer: "Absolute theo thẻ cha gần nhất có position, Fixed theo viewport, Sticky chuyển từ relative sang fixed." },
      { question: "CSS Box Model là gì? Thuộc tính 'box-sizing: border-box' thay đổi nó thế nào?", expected_answer: "Box model gồm margin, border, padding, content. Border-box gộp padding và border vào width/height." }
    ],
    courses: [
      { title: "CSS Tricks: A Complete Guide to Flexbox", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" },
      { title: "MDN Web Docs: CSS basics", url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/CSS_basics" }
    ]
  },
  javascript: {
    ai_feedback: "JavaScript ES6+ là ngôn ngữ chính thức của Frontend. Cần thành thạo Asynchronous JS (Promise, async/await), Scope, Closures, và ES6 Destructuring.",
    practice_questions: [
      { question: "Closure trong JavaScript là gì và hãy nêu một ví dụ ứng dụng thực tế?", expected_answer: "Là hàm có thể nhớ và truy cập các biến từ scope cha của nó ngay cả khi đã thực thi xong." },
      { question: "Sự khác biệt giữa so sánh '==' và '===' trong JavaScript là gì?", expected_answer: "'==' so sánh giá trị sau khi ép kiểu, '===' so sánh nghiêm ngặt cả giá trị và kiểu dữ liệu." },
      { question: "Callback Hell là gì và Promise/Async-Await giải quyết nó như thế nào?", expected_answer: "Callback hell là các callback lồng nhau sâu; Promise/async-await giúp viết code bất đồng bộ trông đồng bộ hơn." }
    ],
    courses: [
      { title: "JavaScript.info: The Modern JavaScript Tutorial", url: "https://javascript.info/" },
      { title: "MDN Web Docs: JavaScript basics", url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics" }
    ]
  },
  tailwindcss: {
    ai_feedback: "Tailwind CSS là framework utility-first giúp phát triển UI cực kỳ nhanh. Hãy nắm rõ cấu trúc config, responsive classes, và cơ chế JIT compiler.",
    practice_questions: [
      { question: "Lợi ích lớn nhất của việc sử dụng Tailwind CSS so với CSS thuần là gì?", expected_answer: "Viết class trực tiếp trong HTML giúp tăng tốc phát triển, tránh file CSS phình to, giao diện đồng bộ." },
      { question: "Làm thế nào để tạo responsive layout (Mobile, Desktop) trong Tailwind CSS?", expected_answer: "Sử dụng các tiền tố kích thước màn hình như sm:, md:, lg:, xl: trước các class style." },
      { question: "Làm thế nào để cấu hình custom màu sắc hoặc spacing trong dự án Tailwind?", expected_answer: "Cấu hình mở rộng trong file tailwind.config.js tại mục theme.extend." }
    ],
    courses: [
      { title: "Tailwind CSS Official Documentation", url: "https://tailwindcss.com/docs" },
      { title: "Tailwind CSS Components Library", url: "https://tailwindui.com/" }
    ]
  },
  typescript: {
    ai_feedback: "TypeScript mang kiểu tĩnh vào JavaScript, tăng độ tin cậy của mã nguồn. Hãy thực hành Interfaces, Types, Generics, và Type Narrowing.",
    practice_questions: [
      { question: "Sự khác biệt chính giữa Interface và Type trong TypeScript là gì?", expected_answer: "Interface hỗ trợ gộp khai báo (declaration merging), Type hỗ trợ các kiểu union, tuple, primitive." },
      { question: "Generics trong TypeScript giải quyết vấn đề gì?", expected_answer: "Giúp tạo các component, hàm tái sử dụng hoạt động được với nhiều kiểu dữ liệu mà vẫn giữ an toàn kiểu." },
      { question: "Kiểu 'any' và 'unknown' khác nhau như thế nào?", expected_answer: "Any bỏ qua kiểm tra kiểu, Unknown bắt buộc phải kiểm tra kiểu (type narrowing) trước khi sử dụng." }
    ],
    courses: [
      { title: "TypeScript Official Handbook", url: "https://www.typescriptlang.org/docs/" },
      { title: "TypeScript Deep Dive", url: "https://basarat.gitbook.io/typescript/" }
    ]
  },
  reactjs: {
    ai_feedback: "ReactJS là thư viện phát triển giao diện hàng đầu. Hãy làm quen với Lifecycle hooks, Virtual DOM, Reconciliation, và Context API.",
    practice_questions: [
      { question: "React sử dụng Virtual DOM và cơ chế Diffing thế nào để tối ưu re-render?", expected_answer: "React so sánh Virtual DOM cũ và mới, chỉ cập nhật những phần thay đổi thực sự lên DOM vật lý." },
      { question: "Sự khác biệt giữa useEffect và useLayoutEffect là gì?", expected_answer: "useEffect chạy bất đồng bộ sau khi paint, useLayoutEffect chạy đồng bộ trước khi trình duyệt vẽ giao diện." },
      { question: "Mục đích sử dụng của React Context API là gì? Khi nào nên dùng nó?", expected_answer: "Dùng để chia sẻ state toàn cục cho cây component mà không cần prop drilling sâu." }
    ],
    courses: [
      { title: "React Official Documentation", url: "https://react.dev/" },
      { title: "React Hooks Guide", url: "https://react.dev/reference/react" }
    ]
  },
  zustand: {
    ai_feedback: "Zustand là công cụ quản lý state cực nhẹ và hiệu quả cho React. Hãy hiểu cách tạo store, selectors, và middleware persist.",
    practice_questions: [
      { question: "Tại sao Zustand được coi là giải pháp thay thế tốt hơn Redux trong nhiều dự án nhỏ và vừa?", expected_answer: "Zustand cực nhẹ, ít boilerplate code, không dùng Context Provider bọc ngoài, hiệu năng tối ưu." },
      { question: "Tại sao chúng ta nên sử dụng selector khi lấy dữ liệu từ Zustand store?", expected_answer: "Tránh re-render không mong muốn khi các state khác trong store thay đổi mà component không dùng." },
      { question: "Làm thế nào để đồng bộ Zustand state vào LocalStorage tự động?", expected_answer: "Sử dụng middleware persist tích hợp sẵn của Zustand khi định nghĩa store." }
    ],
    courses: [
      { title: "Zustand Official Repository & Docs", url: "https://github.com/pmndrs/zustand" },
      { title: "State Management in React with Zustand", url: "https://freecodecamp.org/" }
    ]
  },
  nextjs: {
    ai_feedback: "Next.js là React framework hỗ trợ Server-Side Rendering (SSR) và Static Site Generation (SSG). Hãy thành thạo App Router và Server Actions.",
    practice_questions: [
      { question: "Sự khác biệt giữa Server-Side Rendering (SSR) và Static Site Generation (SSG) là gì?", expected_answer: "SSR sinh HTML động trên mỗi request, SSG sinh HTML tĩnh một lần lúc build time." },
      { question: "Mục đích của folder 'app' (App Router) trong Next.js 13+ là gì?", expected_answer: "Quản lý router dạng cây thư mục, hỗ trợ Layouts, Server Components và nested routes mặc định." },
      { question: "Server Actions trong Next.js là gì và vai trò của nó?", expected_answer: "Cho phép chạy code trực tiếp trên server từ client component mà không cần tự viết API route." }
    ],
    courses: [
      { title: "Next.js Documentation & Tutorials", url: "https://nextjs.org/docs" },
      { title: "Learn Next.js Course", url: "https://nextjs.org/learn" }
    ]
  },
  api_integration: {
    ai_feedback: "Tích hợp API là phần không thể thiếu của Frontend. Hãy nắm vững Axios, interceptors, REST API, và cách xử lý lỗi API.",
    practice_questions: [
      { question: "Axios Interceptor dùng để làm gì trong ứng dụng Frontend?", expected_answer: "Đánh chặn request/response để tự động đính kèm token hoặc xử lý lỗi tập trung." },
      { question: "Trạng thái HTTP status code 401 và 403 khác nhau như thế nào?", expected_answer: "401 là chưa đăng nhập (Unauthorized), 403 là đã đăng nhập nhưng không có quyền (Forbidden)." },
      { question: "Làm thế nào để tối ưu hiệu suất khi gọi nhiều API bất đồng bộ cùng lúc?", expected_answer: "Sử dụng Promise.all để kích hoạt các API chạy song song thay vì gọi tuần tự." }
    ],
    courses: [
      { title: "Axios Official Documentation", url: "https://axios-http.com/docs/intro" },
      { title: "MDN: Using the Fetch API", url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch" }
    ]
  },
  testing: {
    ai_feedback: "Kiểm thử giúp mã nguồn bền vững. Hãy tìm hiểu về Unit Test (Jest) và Integration/UI Test (React Testing Library).",
    practice_questions: [
      { question: "Sự khác biệt giữa Unit Test và Integration Test là gì?", expected_answer: "Unit test kiểm thử một hàm/component cô lập, Integration test kiểm thử sự kết hợp giữa nhiều module." },
      { question: "Làm cách nào để mô phỏng (mock) một hàm gọi API trong Jest?", expected_answer: "Sử dụng jest.mock hoặc jest.spyOn để tránh gọi API thực tế khi chạy kiểm thử." },
      { question: "React Testing Library khuyến nghị truy vấn element dựa trên tiêu chí nào tốt nhất?", expected_answer: "Truy vấn dựa trên Accessibility role (getByRole) để mô phỏng đúng cách người dùng nhìn giao diện." }
    ],
    courses: [
      { title: "Jest Testing Framework Docs", url: "https://jestjs.io/" },
      { title: "React Testing Library Tutorial", url: "https://testing-library.com/docs/react-testing-library/intro/" }
    ]
  },

  // Backend Track Skills
  nodejs: {
    ai_feedback: "Node.js cho phép chạy JavaScript trên server. Hãy hiểu rõ Event Loop, Non-blocking I/O, và cơ chế Streams/Buffers.",
    practice_questions: [
      { question: "Event Loop trong Node.js hoạt động như thế nào?", expected_answer: "Quản lý và thực thi các callback bất đồng bộ qua các phase nhờ luồng đơn." },
      { question: "Non-blocking I/O có ý nghĩa gì đối với hiệu năng của Node.js?", expected_answer: "Cho phép xử lý hàng ngàn kết nối đồng thời mà không bị nghẽn luồng chính." },
      { question: "Sự khác biệt giữa process.nextTick() và setImmediate() là gì?", expected_answer: "nextTick chạy ngay sau block hiện tại trước Event Loop, setImmediate chạy ở phase check tiếp theo." }
    ],
    courses: [
      { title: "Node.js Official Documentation", url: "https://nodejs.org/en/docs/" },
      { title: "Node.js Design Patterns", url: "https://www.nodejsdesignpatterns.com/" }
    ]
  },
  express: {
    ai_feedback: "Express.js là framework web tối giản cho Node.js. Nắm vững Middlewares, Routing, Error handling, và Route params.",
    practice_questions: [
      { question: "Middleware trong Express là gì và cách nó hoạt động?", expected_answer: "Là hàm có quyền truy cập request, response và hàm next() để thực thi logic chuyển tiếp." },
      { question: "Làm thế nào để xử lý lỗi tập trung (Global Error Handler) trong Express?", expected_answer: "Định nghĩa một middleware nhận đủ 4 tham số (err, req, res, next) đặt ở cuối router config." },
      { question: "Sự khác biệt giữa req.params và req.query là gì?", expected_answer: "req.params lấy biến từ đường dẫn động (/:id), req.query lấy tham số sau dấu hỏi (?key=value)." }
    ],
    courses: [
      { title: "Express.js Guide", url: "https://expressjs.com/" },
      { title: "Express Middleware Tutorial", url: "https://expressjs.com/en/guide/using-middleware.html" }
    ]
  },
  sql: {
    ai_feedback: "SQL và Cơ sở dữ liệu quan hệ là nền tảng Backend. Hãy tập trung học Indexes, Joins, Transactions, và Group By.",
    practice_questions: [
      { question: "Index trong Database là gì và tại sao không nên đánh index cho tất cả các cột?", expected_answer: "Giúp tăng tốc độ truy vấn đọc dữ liệu, nhưng làm chậm thao tác ghi và tốn dung lượng lưu trữ." },
      { question: "Sự khác biệt giữa INNER JOIN, LEFT JOIN và RIGHT JOIN là gì?", expected_answer: "INNER lấy phần giao, LEFT lấy toàn bộ bảng trái và phần giao, RIGHT lấy toàn bộ bảng phải và giao." },
      { question: "ACID trong Database Transaction đại diện cho những thuộc tính gì?", expected_answer: "Tính nguyên tử (Atomicity), Nhất quán (Consistency), Cô lập (Isolation), Bền vững (Durability)." }
    ],
    courses: [
      { title: "SQL Bolt: Interactive SQL Tutorial", url: "https://sqlbolt.com/" },
      { title: "W3Schools SQL Tutorial", url: "https://www.w3schools.com/sql/" }
    ]
  },
  postgresql: {
    ai_feedback: "PostgreSQL là hệ quản trị CSDL quan hệ nâng cao. Cần hiểu rõ JSONB columns, Full-text Search, và Connection Pooling.",
    practice_questions: [
      { question: "Kiểu dữ liệu JSONB trong PostgreSQL khác gì với kiểu JSON thông thường?", expected_answer: "JSON lưu dạng text thô, JSONB lưu nhị phân đã phân tích giúp truy vấn nhanh hơn và hỗ trợ index." },
      { question: "Connection Pool là gì và tại sao Backend cần sử dụng nó khi kết nối Postgres?", expected_answer: "Duy trì sẵn các kết nối mở để tái sử dụng, tránh tốn tài nguyên mở/đóng kết nối liên tục." },
      { question: "Làm thế nào để xem giải trình kế hoạch thực thi truy vấn trong Postgres?", expected_answer: "Sử dụng tiền tố EXPLAIN hoặc EXPLAIN ANALYZE trước câu lệnh SQL để xem chi tiết." }
    ],
    courses: [
      { title: "PostgreSQL Official Documentation", url: "https://www.postgresql.org/docs/" },
      { title: "Postgres Tutorial for Beginners", url: "https://www.postgresqltutorial.com/" }
    ]
  },
  knex: {
    ai_feedback: "Knex.js là query builder mạnh mẽ cho SQL trong Node.js. Hãy học cách sử dụng Migrations, Seeds, và các truy vấn JOIN phức tạp.",
    practice_questions: [
      { question: "Migration trong Knex.js dùng để làm gì?", expected_answer: "Quản lý phiên bản cấu trúc bảng cơ sở dữ liệu, cho phép nâng cấp hoặc hạ cấp schema an toàn." },
      { question: "Sự khác biệt chính giữa Knex Query Builder và ORM (như Sequelize/Prisma) là gì?", expected_answer: "Knex viết gần với SQL thô hơn, nhẹ hơn và linh hoạt hơn, không ép kiểu dữ liệu object mapping." },
      { question: "Làm cách nào để bắt đầu chạy giao dịch (Transaction) trong Knex?", expected_answer: "Sử dụng hàm db.transaction(async trx => { ... }) để nhóm các câu lệnh vào cùng 1 phiên." }
    ],
    courses: [
      { title: "Knex.js Official Documentation", url: "https://knexjs.org/" },
      { title: "Database Migrations with Knex", url: "https://knexjs.org/guide/migrations.html" }
    ]
  },
  rest_api: {
    ai_feedback: "Thiết kế RESTful API là kỹ năng Backend cốt lõi. Hãy hiểu rõ HTTP Methods, HTTP Status Codes, và API Versioning.",
    practice_questions: [
      { question: "Quy tắc đặt tên URI chuẩn trong REST API là gì?", expected_answer: "Sử dụng danh từ số nhiều, chữ thường, ngăn cách bằng dấu gạch ngang, tránh dùng động từ." },
      { question: "Sự khác biệt giữa PUT và PATCH HTTP method là gì?", expected_answer: "PUT thay thế hoàn toàn tài nguyên, PATCH chỉ cập nhật một phần thuộc tính thay đổi." },
      { question: "Idempotent trong HTTP methods nghĩa là gì? Phương thức nào có tính chất này?", expected_answer: "Gửi 1 hay nhiều request trùng lặp đều cho kết quả giống nhau ở server. (GET, PUT, DELETE)." }
    ],
    courses: [
      { title: "RESTful API Design Best Practices", url: "https://restfulapi.net/" },
      { title: "HTTP API Design Guide", url: "https://github.com/interagent/http-api-design" }
    ]
  },
  jwt_auth: {
    ai_feedback: "Bảo mật xác thực thông qua JWT (JSON Web Token) và mã hóa Bcrypt. Hãy nắm vững JWT payload, Signature, Refresh Token, và CORS.",
    practice_questions: [
      { question: "JSON Web Token (JWT) gồm có những phần nào cấu thành?", expected_answer: "3 phần: Header (thuật toán), Payload (dữ liệu ứng viên), và Signature (chữ ký bảo mật)." },
      { question: "Tại sao không nên lưu trữ thông tin nhạy cảm (như mật khẩu) vào trong JWT Payload?", expected_answer: "Payload chỉ được mã hóa base64 thô, bất kỳ ai cũng có thể giải mã và đọc được nội dung." },
      { question: "Cơ chế hoạt động của Access Token và Refresh Token là gì?", expected_answer: "Access token ngắn hạn để xác thực request, Refresh token dài hạn để lấy access token mới." }
    ],
    courses: [
      { title: "JWT.io Introduction to JSON Web Tokens", url: "https://jwt.io/introduction" },
      { title: "Auth0: Refresh Tokens Explained", url: "https://auth0.com/docs/secure/tokens/refresh-tokens" }
    ]
  },
  redis: {
    ai_feedback: "Redis là in-memory database dùng để caching, session store. Cần thành thạo TTL (Time to live), Cache Invalidation, và Redis Types.",
    practice_questions: [
      { question: "Cache Invalidation là gì và tại sao nó quan trọng?", expected_answer: "Xóa hoặc cập nhật cache khi dữ liệu gốc thay đổi để đảm bảo client nhận dữ liệu mới nhất." },
      { question: "Redis lưu trữ dữ liệu ở đâu và ưu điểm lớn nhất là gì?", expected_answer: "Lưu hoàn toàn trên RAM giúp tốc độ đọc/ghi siêu nhanh (dưới mili-giây)." },
      { question: "Khái niệm TTL (Time-To-Live) trong Redis dùng để làm gì?", expected_answer: "Đặt thời hạn tự động xóa khóa dữ liệu khỏi cache để giải phóng bộ nhớ RAM." }
    ],
    courses: [
      { title: "Redis Official Documentation", url: "https://redis.io/documentation" },
      { title: "University.Redis: Free courses", url: "https://university.redis.com/" }
    ]
  },
  socket_io: {
    ai_feedback: "Socket.io giúp kết nối thời gian thực hai chiều giữa client và server. Nắm vững rooms, namespaces, broadcast, và kết nối lại (reconnect).",
    practice_questions: [
      { question: "Sự khác biệt chính giữa WebSockets và HTTP là gì?", expected_answer: "HTTP là request-response ngắn hạn một chiều, WebSockets duy trì kết nối liên tục hai chiều." },
      { question: "Làm thế nào để gửi thông điệp tới toàn bộ client ngoại trừ client gửi tin (Broadcast) trong Socket.io?", expected_answer: "Sử dụng cú pháp socket.broadcast.emit('event', data) ở phía server." },
      { question: "Khái niệm 'Room' trong Socket.io dùng để làm gì?", expected_answer: "Nhóm các kết nối socket lại với nhau để gửi tin nhắn riêng cho nhóm đó (ví dụ kênh chat)." }
    ],
    courses: [
      { title: "Socket.io Official Documentation", url: "https://socket.io/docs/v4/" },
      { title: "WebSockets MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API" }
    ]
  },
  docker: {
    ai_feedback: "Docker giúp đóng gói ứng dụng chạy đồng bộ ở mọi môi trường. Hãy học Dockerfile, Docker Compose, và Images/Containers.",
    practice_questions: [
      { question: "Sự khác biệt giữa Docker Image và Docker Container là gì?", expected_answer: "Image là bản thiết kế đóng gói tĩnh, Container là một thực thể chạy động của Image đó." },
      { question: "Docker Compose dùng để làm gì trong phát triển ứng dụng Backend?", expected_answer: "Định nghĩa và khởi chạy ứng dụng đa container (app, database, redis) thông qua 1 file cấu hình yml." },
      { question: "Tại sao nên dùng file .dockerignore khi build Docker Image?", expected_answer: "Loại bỏ các file thừa (như node_modules) giúp giảm dung lượng image và tăng tốc độ build." }
    ],
    courses: [
      { title: "Docker Getting Started Guide", url: "https://docs.docker.com/get-started/" },
      { title: "Play with Docker: Interactive Tutorials", url: "https://labs.play-with-docker.com/" }
    ]
  }
};

/**
 * Get the current user's skill tree graph.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {Promise<void>}
 */
export const getSkillTree = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`[SkillTree] Đang lấy cây kỹ năng cho User ${userId}...`);

    const skillTree = await db('user_skill_trees').where({ user_id: userId }).first();

    if (!skillTree) {
      console.log(`[SkillTree] User ${userId} chưa khởi tạo cây kỹ năng.`);
      return res.status(200).json({
        message: 'Chưa khởi tạo cây kỹ năng.',
        data: null
      });
    }

    // Parse graph_data if it is stored as a string
    const graphData = typeof skillTree.graph_data === 'string'
      ? JSON.parse(skillTree.graph_data)
      : skillTree.graph_data;

    return res.status(200).json({
      message: 'Lấy cây kỹ năng thành công.',
      data: {
        id: skillTree.id,
        user_id: skillTree.user_id,
        graph_data: graphData,
        last_updated: skillTree.last_updated
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy cây kỹ năng:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi lấy cây kỹ năng.' });
  }
};

/**
 * Get detailed learning resources & practice questions for a specific skill node.
 * Integrates Groq AI Service and falls back to detailed static content on error/mock key.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {Promise<void>}
 */
export const getSkillTreeNodeDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nodeId } = req.params;
    const { label } = req.query;

    console.log(`[SkillTree] Đang lấy thông tin chi tiết cho Node ${nodeId} (${label}) của User ${userId}...`);

    // 1. Kiểm tra cache trước để tránh gọi API liên tục (429 Rate Limit)
    const cacheKey = `${userId}:${nodeId.toLowerCase()}`;
    if (nodeDetailsCache.has(cacheKey)) {
      console.log(`[SkillTree] Trả về dữ liệu chi tiết của Node ${nodeId} từ In-Memory Cache.`);
      return res.status(200).json({
        message: 'Lấy thông tin chi tiết node thành công (Cached).',
        data: nodeDetailsCache.get(cacheKey)
      });
    }

    // Fetch candidate's latest CV to customize AI feedback
    const cv = await db('cvs').where({ user_id: userId }).orderBy('created_at', 'desc').first();
    const cvText = cv?.parsed_text || '';

    let details = null;

    // Call Groq API via Service
    try {
      details = await generateSkillNodeDetailsFromGroq({
        nodeId,
        nodeLabel: label || nodeId,
        cvText
      });
    } catch (aiError) {
      console.warn(`[SkillTree] Không thể gọi Groq AI. Sử dụng Static Fallback cho node ${nodeId}:`, aiError.message);
    }

    // Fallback if AI fails or returns null
    if (!details) {
      const fallback = staticNodeDetails[nodeId.toLowerCase()];
      if (fallback) {
        details = fallback;
      } else {
        // General fallback if nodeId is not pre-defined
        details = {
          ai_feedback: `Kỹ năng ${label || nodeId} của bạn đang được phát triển. Hãy tham khảo tài liệu hướng dẫn và ôn luyện phỏng vấn thường xuyên để cải thiện.`,
          practice_questions: [
            { question: `Hãy trình bày những kiến thức cơ bản nhất về kỹ năng ${label || nodeId}?`, expected_answer: "Ứng viên nêu định nghĩa và ứng dụng cơ bản." },
            { question: `Những thách thức lớn nhất khi áp dụng ${label || nodeId} là gì?`, expected_answer: "Nêu các vấn đề hiệu năng và cách giải quyết." },
            { question: `Bạn đã từng sử dụng ${label || nodeId} trong các dự án thực tế nào?`, expected_answer: "Mô tả dự án cũ có sử dụng công nghệ này." }
          ],
          courses: [
            { title: `Tài liệu học tập ${label || nodeId}`, url: `https://www.google.com/search?q=${encodeURIComponent((label || nodeId) + ' tutorial')}` },
            { title: `FreeCodeCamp Technical Courses`, url: "https://www.freecodecamp.org/" }
          ]
        };
      }
    }

    // 2. Lưu vào cache trước khi trả về
    nodeDetailsCache.set(cacheKey, details);

    return res.status(200).json({
      message: 'Lấy thông tin chi tiết node thành công.',
      data: details
    });
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin chi tiết node ${req.params.nodeId}:`, error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi lấy chi tiết node.' });
  }
};
