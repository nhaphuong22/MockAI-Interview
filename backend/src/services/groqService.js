/**
 * Groq API AI Service
 * Connects to Groq Cloud API using Qwen 3 32B model to generate highly customized tech questions
 * based on candidate's raw CV text, targeted position and skills.
 */

import { safeParseJSON } from '../helper/jsonHelper.js';

/**
 * Helper function to perform fetch with retries and exponential backoff
 * especially targeting HTTP 429 Rate Limit errors.
 */
const fetchWithRetry = async (url, options, maxRetries = 3, delayMs = 1500) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429) {
        attempt++;
        if (attempt >= maxRetries) {
          return response;
        }
        const backoffDelay = delayMs * Math.pow(2, attempt - 1);
        console.warn(`[Groq API] Rate Limited (429). Retrying in ${backoffDelay}ms... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        continue;
      }
      return response;
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      const backoffDelay = delayMs * Math.pow(2, attempt - 1);
      console.warn(`[Groq API] Network error: ${error.message}. Retrying in ${backoffDelay}ms... (Attempt ${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
};

const STAGE_LABELS = [
  'Giai đoạn 1 - Nhập cuộc',
  'Giai đoạn 2 - Điểm mạnh/yếu',
  'Giai đoạn 2 - Định hướng',
  'Giai đoạn 3 - Tình huống',
  'Giai đoạn 3 - Dự án CV',
  'Giai đoạn 3 - Kiến thức chuyên môn',
  'Giai đoạn 4 - Lương & kỳ vọng',
  'Giai đoạn 4 - Câu hỏi ngược'
];

const PLACEHOLDER_RE = /\[(?:Tên dự án|tên dự án|Tên|X|Y|dự án cụ thể|kỹ thuật\/phương pháp|vấn đề cụ thể)\]/i;

const MODEL_ANSWER_PLACEHOLDER_RE = /\[[^\]]{2,60}\]|\$\{(?:co|sk2?|pos)\}/i;

const hasUnresolvedPlaceholders = (text = '') =>
  PLACEHOLDER_RE.test(text) || MODEL_ANSWER_PLACEHOLDER_RE.test(text);

const hasCvContent = (cvText) => {
  const t = (cvText || '').trim();
  return t.length > 50 && !t.toLowerCase().includes('không có cv');
};

const TECH_KEYWORD_RE = /\b(?:React(?:\.js|JS)?|Vue(?:\.js)?|Angular|Node\.js|TypeScript|JavaScript|Python|Java|SQL|MongoDB|PostgreSQL|GraphQL|REST(?:ful)?(?:\s+API)?|Jest|Docker|Kubernetes|AWS|Git|HTML|CSS|Tailwind|Next\.js|Redux|Webpack)\b/gi;

/**
 * Extract short skill labels for question templates — never inject full job descriptions.
 */
const extractSkillKeywords = (skillsText = '', jobDescription = '', position = '') => {
  const combined = `${skillsText}\n${jobDescription}`.trim();
  if (!combined) {
    return position ? [position] : ['kỹ năng chuyên môn'];
  }

  const commaParts = combined.split(/[,;]/).map((s) => s.trim()).filter((s) => s.length > 0 && s.length < 60);
  if (commaParts.length > 1) {
    return commaParts.slice(0, 5);
  }

  const techMatches = combined.match(TECH_KEYWORD_RE);
  if (techMatches && techMatches.length > 0) {
    const normalized = [...new Set(techMatches.map((s) => s.replace(/\.js$/i, '.js')))];
    return normalized.slice(0, 5);
  }

  const toolMatches = [...combined.matchAll(/bằng\s+([A-Za-z0-9.#+\/]+)/gi)].map((m) => m[1].trim());
  if (toolMatches.length > 0) {
    return [...new Set(toolMatches)].slice(0, 5);
  }

  if (position && position.length < 60) {
    return [position];
  }

  return ['kỹ năng chuyên môn'];
};

const encodeExpectedAnswer = (modelAnswer, steps, suggestedTime = 120) =>
  JSON.stringify({ model_answer: modelAnswer, steps, suggested_time: suggestedTime });

const MIN_STEP_DESC_LEN = 60;

const sanitizeStepDesc = (desc = '') =>
  desc
    .replace(/\s*Lý do:\s*/gi, ' ')
    .replace(/\s*Ví dụ:\s*.+$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

const isValidStepDesc = (desc = '') =>
  desc.length >= MIN_STEP_DESC_LEN && !/\b(?:lý do|ví dụ)\s*:/i.test(desc);

/** Prefer AI desc when long enough; otherwise use stage fallback for that label. */
const resolveStepDesc = (aiDesc, fallbackDesc = '') => {
  const cleaned = sanitizeStepDesc(aiDesc);
  const fb = sanitizeStepDesc(fallbackDesc);
  if (isValidStepDesc(cleaned)) return cleaned;
  if (isValidStepDesc(fb)) return fb;
  return fb || cleaned;
};

/** Build one answer-step line — single instructional sentence, min 60 chars, no examples. */
const richStep = (instruction) =>
  sanitizeStepDesc(String(instruction).replace(/\s+/g, ' ').trim());

const GENERIC_STEP_PHRASES = [
  'nêu 1–2 điểm mạnh có ví dụ',
  'thừa nhận điểm yếu thực tế',
  'mô tả kế hoạch cải thiện đang thực hiện',
  'chào hỏi lịch sự, giới thiệu tên',
  'kết bằng định hướng phát triển',
  'đặt 1–2 câu hỏi thông minh',
  'nêu khoảng lương hoặc cách định giá',
  'định nghĩa hoặc giải thích khái niệm cốt lõi',
  'đưa ví dụ thực tế hoặc use case',
  'mô tả cách tiếp cận có cấu trúc'
];

const isShallowAnswerSteps = (expectedAnswer) => {
  try {
    const parsed = JSON.parse(expectedAnswer);
    const steps = parsed?.steps;
    if (!Array.isArray(steps) || steps.length < 4) return true;
    const hasStart = steps.some((s) => s.label === 'START');
    const hasEnd = steps.some((s) => s.label === 'END');
    const numbered = steps.filter((s) => /^\d+$/.test(String(s.label))).length;
    if (!hasStart || !hasEnd || numbered < 2) return true;
    return steps.some((s) => {
      const d = (s.desc || '').trim();
      if (!isValidStepDesc(d)) return true;
      return GENERIC_STEP_PHRASES.some((p) => d.toLowerCase().includes(p.toLowerCase()) && d.length < 80);
    });
  } catch {
    return true;
  }
};

/** Detailed answer_steps per interview slot — golden format for fallbacks. */
const buildDetailedAnswerSteps = (slotIndex, { pos, company, sk, sk2, projectHint }) => {
  const co = company || 'công ty';
  const templates = [
    [
      { label: 'START', desc: richStep(
        `Mở đầu bằng lời chào lịch sự và giới thiệu họ tên, trình độ hoặc kinh nghiệm nổi bật nhất liên quan trực tiếp đến vị trí ${pos}, tạo ấn tượng chuyên nghiệp ngay từ những giây đầu tiên.`
      ) },
      { label: '1', desc: richStep(
        'Tóm tắt 1–2 dự án hoặc thành tựu có số liệu đo lường được như tăng hiệu năng, giảm bug hoặc số tính năng đã hoàn thành trong thời gian cụ thể, tránh mô tả chung chung không kiểm chứng được.'
      ) },
      { label: '2', desc: richStep(
        `Nêu định hướng phát triển ngắn hạn (6–12 tháng) và dài hạn (2–3 năm) trong lĩnh vực ${pos}, thể hiện lộ trình rõ ràng và cam kết phát triển thay vì chỉ ứng tuyển vì cần việc.`
      ) },
      { label: 'END', desc: richStep(
        `Kết bằng câu thể hiện sự hứng thú đóng góp cho ${co} và mong muốn được trao đổi sâu hơn về vai trò, trách nhiệm cũng như cơ hội phát triển nghề nghiệp tại đây.`
      ) }
    ],
    [
      { label: 'START', desc: richStep(
        `Chọn 1–2 điểm mạnh cốt lõi phù hợp JD (ví dụ kỹ năng ${sk}) và mở đầu bằng dẫn chứng thực tế từ dự án hoặc công việc đã làm.`
      ) },
      { label: '1', desc: richStep(
        'Thừa nhận 1 điểm yếu thật sự (không phải điểm mạnh giả dạng yếu) và mô tả ngắn gọn tác động của nó đến chất lượng hoặc tiến độ công việc hàng ngày.'
      ) },
      { label: '2', desc: richStep(
        'Trình bày hành động cụ thể đang thực hiện để cải thiện điểm yếu: khóa học, mentor, quy trình mới hoặc công cụ hỗ trợ, kèm timeline và cách đo tiến độ.'
      ) },
      { label: 'END', desc: richStep(
        `Liên hệ điểm mạnh và kế hoạch cải thiện điểm yếu với giá trị bạn mang lại cho team nếu được nhận vào vị trí ${pos} tại ${co}.`
      ) }
    ],
    [
      { label: 'START', desc: richStep(
        `Mở đầu bằng câu khẳng định sự quan tâm và phù hợp của bạn với vị trí ${pos} tại ${co}, kết hợp định hướng phát triển nghề nghiệp dài hạn một cách rõ ràng.`
      ) },
      { label: '1', desc: richStep(
        `Nêu rõ mục tiêu nghề nghiệp dài hạn trong lĩnh vực ${pos}: chuyên gia framework, Tech Lead, mảng UI/UX, hiệu năng hoặc hướng bạn thực sự muốn theo đuổi.`
      ) },
      { label: '2', desc: richStep(
        `Giải thích tại sao ${co} là môi trường phù hợp để đạt mục tiêu — liên kết văn hóa, dự án thực tế, cơ hội học hỏi và stack công nghệ ${sk} của công ty.`
      ) },
      { label: '3', desc: richStep(
        'Trình bày kế hoạch cụ thể 3–5 năm: kỹ năng muốn học thêm, loại dự án muốn đóng góp và vị trí mục tiêu (Senior, Lead hoặc chuyên gia mảng).'
      ) },
      { label: 'END', desc: richStep(
        `Khẳng định cam kết và mong muốn đóng góp lâu dài cho sự phát triển của ${co}, thể hiện thái độ chủ động và gắn bó với tổ chức.`
      ) }
    ],
    [
      { label: 'START', desc: richStep(
        'Nhắc lại tình huống giả định bằng lời của bạn để chứng minh bạn hiểu đề bài trước khi đi vào phân tích nguyên nhân và đề xuất giải pháp.'
      ) },
      { label: '1', desc: richStep(
        'Phân tích nguyên nhân gốc rễ (root cause) và liệt kê 2–3 phương án khả thi kèm trade-off về chi phí, thời gian triển khai và tác động đến hệ thống.'
      ) },
      { label: '2', desc: richStep(
        `Chọn phương án tối ưu cho bối cảnh ${pos}, mô tả các bước triển khai cụ thể với ${sk} và cách bạn sẽ kiểm chứng hiệu quả sau khi áp dụng.`
      ) },
      { label: 'END', desc: richStep(
        'Nêu cách đo lường kết quả (metrics/KPI) và rủi ro còn lại sau khi áp dụng giải pháp, kèm biện pháp giảm thiểu nếu kết quả chưa đạt kỳ vọng.'
      ) }
    ],
    [
      { label: 'START', desc: richStep(
        `Đặt bối cảnh dự án${projectHint ? ` "${projectHint}"` : ''}: thời gian, quy mô team và vai trò chính xác của bạn trong dự án theo khung STAR (Situation).`
      ) },
      { label: '1', desc: richStep(
        'Mô tả thách thức hoặc nhiệm vụ khó nhất (Task) — phải cụ thể về mặt kỹ thuật hoặc nghiệp vụ, tránh mô tả chung chung không kiểm chứng được.'
      ) },
      { label: '2', desc: richStep(
        `Trình bày hành động bạn đã làm (Action): công nghệ ${sk}, quyết định kiến trúc, cách debug hoặc tối ưu — làm rõ phần việc do bạn trực tiếp đảm nhiệm.`
      ) },
      { label: 'END', desc: richStep(
        'Chốt bằng kết quả đo lường được (Result): số liệu cụ thể, phản hồi từ stakeholder và bài học rút ra để áp dụng cho dự án tương tự sau này.'
      ) }
    ],
    [
      { label: 'START', desc: richStep(
        `Định nghĩa ${sk} bằng ngôn ngữ chuyên môn chuẩn, sau đó giải thích vai trò của nó trong stack và quy trình phát triển phần mềm cho vị trí ${pos}.`
      ) },
      { label: '1', desc: richStep(
        `So sánh ${sk} với ${sk2 !== sk ? sk2 : 'giải pháp thay thế phổ biến'} — nêu ưu điểm, nhược điểm và tiêu chí quyết định nên dùng công nghệ nào trong từng bối cảnh.`
      ) },
      { label: '2', desc: richStep(
        `Mô tả cách bạn đã áp dụng ${sk} trong dự án thực tế: vấn đề gặp phải, quyết định kỹ thuật đã chọn và kết quả đạt được sau khi triển khai.`
      ) },
      { label: 'END', desc: richStep(
        'Tóm tắt best practice hoặc anti-pattern cần tránh khi làm việc với công nghệ này, thể hiện chiều sâu kinh nghiệm thực chiến thay vì chỉ lý thuyết.'
      ) }
    ],
    [
      { label: 'START', desc: richStep(
        `Mở bằng cách nêu phương pháp định giá bản thân: research thị trường, level hiện tại, yêu cầu JD và kinh nghiệm thực tế liên quan đến vị trí ${pos}.`
      ) },
      { label: '1', desc: richStep(
        `Đưa khoảng lương mong muốn hoặc mức linh hoạt, giải thích căn cứ dựa trên kỹ năng ${sk}, dự án đã làm và mức thị trường cho level tương ứng.`
      ) },
      { label: '2', desc: richStep(
        `Nêu kỳ vọng về quyền lợi và văn hóa tại ${co}: cơ hội học hỏi, work-life balance, công nghệ, lộ trình thăng tiến và môi trường làm việc bạn quan tâm.`
      ) },
      { label: 'END', desc: richStep(
        'Kết bằng thái độ cởi mở trao đổi chi tiết sau khi hiểu rõ JD và benefit package, thể hiện linh hoạt trong đàm phán mà không chỉ tập trung vào con số lương.'
      ) }
    ],
    [
      { label: 'START', desc: richStep(
        'Cảm ơn chân thành HR vì thời gian phỏng vấn trước khi đặt câu hỏi ngược, thể hiện sự tôn trọng và chuyên nghiệp ở giai đoạn kết thúc buổi phỏng vấn.'
      ) },
      { label: '1', desc: richStep(
        `Đặt câu hỏi về lộ trình phát triển ${pos} và cơ cấu team: số người, quy trình Agile/Scrum, tiêu chí đánh giá thăng tiến và thời gian mentor junior.`
      ) },
      { label: '2', desc: richStep(
        `Hỏi thêm về stack công nghệ hoặc dự án sắp tới liên quan ${sk} tại ${co}, thể hiện bạn đã research công ty và quan tâm đến công việc thực tế sẽ làm.`
      ) },
      { label: 'END', desc: richStep(
        `Chào tạm biệt lịch sự, nhắc lại sự hứng thú với vị trí tại ${co} và mong chờ phản hồi từ phía công ty trong thời gian sớm nhất.`
      ) }
    ]
  ];
  const steps = templates[slotIndex] || templates[0];
  steps.forEach((s) => {
    if (!isValidStepDesc(s.desc)) {
      console.warn(`[Groq] Fallback step ${s.label} slot ${slotIndex} only ${(s.desc || '').length} chars`);
    }
  });
  return steps;
};

const ANSWER_STEPS_GOLDEN_EXAMPLE = `MẪU CHUẨN answer_steps (BẮT BUỘC bám sát format này cho TẤT CẢ 8 câu):
{
  "question_text": "Bạn có thể chia sẻ định hướng nghề nghiệp trong 2–5 năm tới không? Và tại sao bạn chọn ứng tuyển vị trí Front End Developer tại FPT Software?",
  "expected_answer": "Dạ thưa anh/chị, trong 2–5 năm tới em hướng tới trở thành Senior Front-end Developer chuyên sâu về hiệu năng và design system. Em chọn FPT Software vì công ty có nhiều dự án quy mô lớn dùng React.js, phù hợp lộ trình em muốn phát triển. Năm 1–2 em tập trung TypeScript và Jest; năm 3–5 em mong lead module front-end. Em cam kết đồng hành lâu dài với FPT Software.",
  "answer_steps": [
    { "label": "START", "desc": "Mở đầu bằng câu khẳng định sự quan tâm và phù hợp của bạn với vị trí Front End Developer tại FPT Software, kết hợp định hướng phát triển nghề nghiệp dài hạn một cách rõ ràng và tự nhiên." },
    { "label": "1", "desc": "Nêu rõ mục tiêu nghề nghiệp dài hạn trong lĩnh vực Front End Development: chuyên gia framework, đóng góp dự án lớn, phát triển UI/UX và tối ưu hiệu năng." },
    { "label": "2", "desc": "Giải thích tại sao FPT Software là môi trường lý tưởng để đạt mục tiêu — liên kết văn hóa, dự án thực tế, cơ hội học hỏi và stack công nghệ của công ty." },
    { "label": "3", "desc": "Trình bày kế hoạch cụ thể 3–5 năm: kỹ năng muốn học thêm, loại dự án muốn đóng góp, vị trí mục tiêu (Senior Developer, Tech Lead, chuyên gia mảng)." },
    { "label": "END", "desc": "Khẳng định cam kết và mong muốn đóng góp lâu dài cho sự phát triển của FPT Software, thể hiện thái độ chủ động và gắn bó với tổ chức." }
  ],
  "suggested_time": 150
}

QUY TẮC answer_steps (TUYỆT ĐỐI):
- Mỗi bước chỉ là một câu hướng dẫn cụ thể việc cần làm — tối thiểu 60 ký tự.
- KHÔNG dùng nhãn "Lý do:" hay "Ví dụ:"; KHÔNG chèn câu mẫu hay ví dụ minh họa trong desc.
- Cấu trúc bắt buộc: START + ít nhất 2 bước số (1,2 hoặc 1,2,3) + END = tối thiểu 4 bước.
- suggested_time: 120–180 giây tùy độ phức tạp câu hỏi.`;

const mapRawQuestions = (parsedQuestions) =>
  parsedQuestions.map((q) => {
    const modelAnswer = q.expected_answer || '';
    const answerSteps = Array.isArray(q.answer_steps) && q.answer_steps.length > 0
      ? q.answer_steps.map((s) => ({ ...s, desc: sanitizeStepDesc(s.desc || '') }))
      : null;
    const suggestedTime = Number(q.suggested_time) || 120;
    const encodedAnswer = answerSteps
      ? encodeExpectedAnswer(modelAnswer, answerSteps, suggestedTime)
      : modelAnswer;

    return {
      question_text: q.question_text,
      expected_answer: encodedAnswer,
      score_weight: Number(q.score_weight) || 1
    };
  });

/**
 * Full first-person model answer — no [brackets] or ${variable} tags.
 */
const buildCompleteModelAnswer = (slotIndex, { pos, company, sk, sk2, projectHint }) => {
  const co = company || 'công ty';
  const proj = projectHint || 'dự án gần nhất';
  const answers = [
    `Dạ em chào anh/chị. Em tên là Nguyễn Văn A, hiện có khoảng 2 năm kinh nghiệm phát triển giao diện với ${sk}. Trước đây em đã tối ưu bundle React giúp giảm 35% thời gian tải trang cho một ứng dụng thương mại điện tử. Trong 2–3 năm tới em muốn trở thành ${pos} chuyên sâu về hiệu năng và trải nghiệm người dùng. Em rất mong được đóng góp cho ${co} và trao đổi thêm về vị trí hôm nay.`,
    `Điểm mạnh lớn nhất của em là debug nhanh các lỗi state phức tạp trong ${sk} nhờ React DevTools và kinh nghiệm thực chiến. Điểm yếu em đang khắc phục là thiên hướng tối ưu quá sớm trước khi hoàn thiện tính năng, đôi khi làm chậm tiến độ sprint. Để cải thiện, em áp dụng time-box 2 giờ mỗi ngày cho feature chính và chỉ refactor sau khi có feedback từ code review. Em tin thế mạnh ${sk} kết hợp quy trình team sẽ giúp em đóng góp hiệu quả nếu được nhận.`,
    `Dạ thưa anh/chị, trong 2–5 năm tới em hướng tới trở thành Senior ${pos} chuyên sâu về hiệu năng và xây dựng design system. Em chọn ${co} vì công ty có nhiều dự án quy mô lớn sử dụng ${sk}, môi trường học hỏi tốt và định hướng công nghệ phù hợp với lộ trình cá nhân. Cụ thể, năm 1–2 em muốn thành thạo ${sk2} và kiểm thử tự động với Jest; năm 3–5 em mong lead module front-end hoặc mentor các bạn junior. Em cam kết đồng hành lâu dài và đóng góp tích cực vào sự phát triển của ${co}.`,
    `Em hiểu đây là bài toán tối ưu hiệu năng khi hệ thống ${pos} xử lý lượng dữ liệu lớn. Trước tiên em sẽ đo đạc bottleneck bằng Lighthouse và profiling để xác định nguyên nhân gốc rễ thay vì đoán mò. Sau đó em cân nhắc các phương án như lazy loading component, memoization, cache API và phân trang — so sánh trade-off về độ phức tạp và tác động. Em sẽ chọn giải pháp có ROI cao nhất, triển khai theo sprint nhỏ và đo lại KPI. Mục tiêu là giảm ít nhất 25–30% thời gian phản hồi mà vẫn đảm bảo chất lượng code.`,
    `Trong dự án ${proj}, em đảm nhận vai trò front-end developer phụ trách module xác thực và giao diện học tập. Thách thức lớn nhất là tích hợp OAuth 2.0 và Web Speech API đồng thời giữ latency dưới 200ms trên thiết bị cấu hình thấp. Em tách logic speech ra custom hook, dùng Context API quản lý state và viết integration test bằng Jest để tránh regression. Kết quả là giảm 35% thời gian onboarding người dùng mới và không có critical bug sau 3 sprint release.`,
    `${sk} là thư viện JavaScript phổ biến để xây dựng giao diện người dùng theo mô hình component, cho phép render hiệu quả nhờ Virtual DOM. Trong công việc ${pos}, em dùng ${sk} kết hợp ${sk2} để quản lý state và tách biệt logic UI. So với framework khác, ${sk} linh hoạt hơn khi tích hợp dần vào dự án có sẵn nhưng đòi hỏi kỷ luật về cấu trúc component. Em thường áp dụng useMemo, useCallback và code splitting để tối ưu re-render. Trong dự án trước, cách tiếp cận này giúp giảm 40% thời gian tải trang đầu.`,
    `Em đã tham khảo mức lương thị trường cho ${pos} ở khu vực TP.HCM trên TopCV và Glassdoor. Với kinh nghiệm hiện tại và kỹ năng ${sk}, em kỳ vọng mức lương gross khoảng 18–22 triệu, linh hoạt theo toàn bộ package và phạm vi công việc thực tế. Ngoài lương, em quan tâm đến môi trường code review chất lượng, thời gian học ${sk2} mỗi tuần và lộ trình thăng tiến rõ ràng tại ${co}. Em sẵn sàng trao đổi chi tiết sau khi hiểu rõ JD và cơ cấu benefit của công ty.`,
    `Dạ em xin cảm ơn anh/chị đã dành thời gian phỏng vấn em hôm nay. Em muốn hỏi lộ trình phát triển từ mid lên senior cho vị trí ${pos} tại ${co} thường mất bao lâu và tiêu chí đánh giá cụ thể là gì. Em cũng muốn biết team hiện đang dùng ${sk} phiên bản nào và có kế hoạch nâng cấp stack trong năm tới không. Em rất hứng thú với vị trí này và mong có cơ hội đóng góp cho ${co}. Em chào anh/chị ạ!`
  ];
  return answers[slotIndex] || answers[0];
};

const buildStepContext = ({ position, skills, companyName, cvText, jobDescription = '' }) => {
  const skillList = extractSkillKeywords(skills, jobDescription, position);
  const cvSnippet = (cvText || '').slice(0, 500);
  const projectHint = cvSnippet.match(/(?:dự án|project)[:\s]+([^\n,.]{3,60})/i)?.[1]?.trim()
    || cvSnippet.match(/(?:công ty|company)[:\s]+([^\n,.]{3,60})/i)?.[1]?.trim()
    || null;
  const sk = skillList[0] || 'kỹ năng chuyên môn';
  return {
    pos: position || 'vị trí ứng tuyển',
    company: companyName || 'công ty',
    sk,
    sk2: skillList[1] || sk,
    projectHint
  };
};

/** Enforce ≥60-char desc per step; replace short AI steps with stage fallback text. */
const applyAnswerStepsEnforcement = (expectedAnswer, slotIndex, context) => {
  const ctx = buildStepContext(context);
  const fallbackSteps = buildDetailedAnswerSteps(slotIndex, ctx);
  const fallbackByLabel = Object.fromEntries(fallbackSteps.map((s) => [String(s.label), s.desc]));

  let parsed;
  try {
    parsed = JSON.parse(expectedAnswer);
  } catch {
    return encodeExpectedAnswer(buildCompleteModelAnswer(slotIndex, ctx), fallbackSteps, 120);
  }

  const rawSteps = Array.isArray(parsed.steps) && parsed.steps.length > 0 ? parsed.steps : fallbackSteps;
  const steps = rawSteps.map((s) => ({
    label: String(s.label),
    desc: resolveStepDesc(s.desc, fallbackByLabel[String(s.label)])
  }));

  const modelAnswer = parsed.model_answer && !hasUnresolvedPlaceholders(parsed.model_answer)
    ? parsed.model_answer
    : buildCompleteModelAnswer(slotIndex, ctx);

  const encoded = encodeExpectedAnswer(modelAnswer, steps, Number(parsed.suggested_time) || 120);
  if (isShallowAnswerSteps(encoded)) {
    return encodeExpectedAnswer(modelAnswer, fallbackSteps, Number(parsed.suggested_time) || 120);
  }
  return encoded;
};

/**
 * Stage-aware fallback for each of the 8 mandatory interview slots (index 0–7).
 */
const buildStageFallback = (slotIndex, { position, skills, companyName, cvText, jobDescription = '' }) => {
  const ctx = buildStepContext({ position, skills, companyName, cvText, jobDescription });
  const { pos, company, sk, sk2, projectHint } = ctx;

  const fallbacks = [
    {
      question_text: `Xin chào! Rất vui được gặp bạn trong buổi phỏng vấn hôm nay cho vị trí ${pos}. Bạn có thể giới thiệu ngắn gọn về bản thân và định hướng phát triển sự nghiệp của mình không?`,
      expected_answer: encodeExpectedAnswer(
        buildCompleteModelAnswer(0, { pos, company, sk, sk2, projectHint }),
        buildDetailedAnswerSteps(0, { pos, company, sk, sk2, projectHint }),
        120
      ),
      score_weight: 1
    },
    {
      question_text: 'Trong quá trình làm việc, bạn tự nhận thấy đâu là điểm mạnh vượt trội và điểm yếu lớn nhất của mình? Bạn đã và đang làm gì để khắc phục điểm yếu đó?',
      expected_answer: encodeExpectedAnswer(
        buildCompleteModelAnswer(1, { pos, company, sk, sk2, projectHint }),
        buildDetailedAnswerSteps(1, { pos, company, sk, sk2, projectHint }),
        150
      ),
      score_weight: 1
    },
    {
      question_text: `Bạn có thể chia sẻ định hướng nghề nghiệp trong 2–5 năm tới không? Và tại sao bạn chọn ứng tuyển vị trí ${pos}${companyName ? ` tại ${company}` : ''}?`,
      expected_answer: encodeExpectedAnswer(
        buildCompleteModelAnswer(2, { pos, company, sk, sk2, projectHint }),
        buildDetailedAnswerSteps(2, { pos, company, sk, sk2, projectHint }),
        150
      ),
      score_weight: 1
    },
    {
      question_text: `Giả sử bạn đang xử lý một tình huống khó khăn đặc thù của ngành ${pos} (không liên quan trực tiếp đến CV), bạn sẽ phân tích và giải quyết như thế nào?`,
      expected_answer: encodeExpectedAnswer(
        buildCompleteModelAnswer(3, { pos, company, sk, sk2, projectHint }),
        buildDetailedAnswerSteps(3, { pos, company, sk, sk2, projectHint }),
        180
      ),
      score_weight: 2
    },
    {
      question_text: projectHint
        ? `Trong CV bạn có đề cập đến "${projectHint}". Bạn có thể chia sẻ vai trò, thách thức và cách bạn giải quyết trong dự án đó không?`
        : hasCvContent(cvText)
          ? 'Trong CV của bạn, hãy chọn một dự án hoặc kinh nghiệm làm việc nổi bật nhất và mô tả vai trò, thách thức cũng như kết quả đạt được?'
          : `Vì CV chưa ghi chi tiết dự án, bạn có thể kể về một dự án thực tế liên quan đến ${pos} mà bạn từng tham gia?`,
      expected_answer: encodeExpectedAnswer(
        buildCompleteModelAnswer(4, { pos, company, sk, sk2, projectHint }),
        buildDetailedAnswerSteps(4, { pos, company, sk, sk2, projectHint }),
        180
      ),
      score_weight: 2
    },
    {
      question_text: `Hãy trình bày kiến thức chuyên môn cốt lõi về ${sk} cho vị trí ${pos}. ${sk2 !== sk ? `Bạn cũng có thể đề cập thêm về ${sk2}.` : ''}`,
      expected_answer: encodeExpectedAnswer(
        buildCompleteModelAnswer(5, { pos, company, sk, sk2, projectHint }),
        buildDetailedAnswerSteps(5, { pos, company, sk, sk2, projectHint }),
        150
      ),
      score_weight: 2
    },
    {
      question_text: `Kỳ vọng của bạn về mức lương, quyền lợi và môi trường làm việc lý tưởng tại ${company} là gì?`,
      expected_answer: encodeExpectedAnswer(
        buildCompleteModelAnswer(6, { pos, company, sk, sk2, projectHint }),
        buildDetailedAnswerSteps(6, { pos, company, sk, sk2, projectHint }),
        120
      ),
      score_weight: 1
    },
    {
      question_text: `Cảm ơn bạn đã tham gia buổi phỏng vấn cho vị trí ${pos}. Buổi phỏng vấn đến đây là kết thúc — bạn có câu hỏi ngược nào dành cho chúng tôi không?`,
      expected_answer: encodeExpectedAnswer(
        buildCompleteModelAnswer(7, { pos, company, sk, sk2, projectHint }),
        buildDetailedAnswerSteps(7, { pos, company, sk, sk2, projectHint }),
        90
      ),
      score_weight: 1
    }
  ];

  const fb = fallbacks[slotIndex] || fallbacks[fallbacks.length - 1];
  return { ...fb, _source: 'stage-fallback', _stage: STAGE_LABELS[slotIndex] };
};

/**
 * Validate AI-generated questions against the 8-slot stage contract.
 */
const validateQuestionSet = (questions, cvText) => {
  const issues = [];

  if (!Array.isArray(questions) || questions.length === 0) {
    issues.push({ type: 'empty', detail: 'No questions returned' });
    return issues;
  }

  if (questions.length !== 8) {
    issues.push({ type: 'count', detail: `Expected 8, got ${questions.length}` });
  }

  const normalizedTexts = questions.map((q) => (q.question_text || '').trim().toLowerCase());
  const seen = new Map();

  normalizedTexts.forEach((text, i) => {
    if (!text) {
      issues.push({ type: 'empty_slot', slot: i + 1, detail: `Slot ${i + 1} has empty question_text` });
      return;
    }
    if (seen.has(text)) {
      issues.push({ type: 'duplicate', slot: i + 1, detail: `Slot ${i + 1} duplicates slot ${seen.get(text) + 1}` });
    } else {
      seen.set(text, i);
    }
    if (hasCvContent(cvText) && PLACEHOLDER_RE.test(questions[i].question_text)) {
      issues.push({ type: 'placeholder', slot: i + 1, detail: `Slot ${i + 1} contains unresolved placeholder` });
    }
    if (isShallowAnswerSteps(questions[i].expected_answer)) {
      issues.push({ type: 'shallow_steps', slot: i + 1, detail: `Slot ${i + 1} answer_steps too short — each step needs >= 60 chars` });
    }
    try {
      const parsed = JSON.parse(questions[i].expected_answer);
      if (parsed?.model_answer && hasUnresolvedPlaceholders(parsed.model_answer)) {
        issues.push({ type: 'model_placeholder', slot: i + 1, detail: `Slot ${i + 1} model_answer contains [brackets] or unresolved tags` });
      }
    } catch {
      if (hasUnresolvedPlaceholders(questions[i].expected_answer)) {
        issues.push({ type: 'model_placeholder', slot: i + 1, detail: `Slot ${i + 1} expected_answer contains placeholders` });
      }
    }
  });

  return issues;
};

/**
 * Normalize to exactly 8 stage-aligned questions; replace invalid/duplicate/missing slots.
 */
const normalizeToEightStages = (questions, context, genLog) => {
  const slots = Array.from({ length: 8 }, (_, i) => {
    const aiQ = questions[i];
    if (aiQ?.question_text?.trim()) {
      return { ...aiQ, _source: 'ai', _stage: STAGE_LABELS[i] };
    }
    genLog.paddedSlots.push({ slot: i + 1, stage: STAGE_LABELS[i], reason: 'missing' });
    return buildStageFallback(i, context);
  });

  const seen = new Map();
  return slots.map((q, i) => {
    const key = (q.question_text || '').trim().toLowerCase();
    const hasPlaceholder = hasCvContent(context.cvText) && PLACEHOLDER_RE.test(q.question_text || '');
    const isDuplicate = seen.has(key);
    seen.set(key, i);

    if (hasPlaceholder || isDuplicate || !key) {
      const reason = hasPlaceholder ? 'placeholder' : isDuplicate ? 'duplicate' : 'empty';
      genLog.replacedSlots.push({ slot: i + 1, stage: STAGE_LABELS[i], reason, original: (q.question_text || '').slice(0, 80) });
      return buildStageFallback(i, context);
    }
    if (isShallowAnswerSteps(q.expected_answer)) {
      const fb = buildStageFallback(i, context);
      genLog.replacedSlots.push({ slot: i + 1, stage: STAGE_LABELS[i], reason: 'shallow_steps', original: 'answer_steps enriched' });
      return { ...q, expected_answer: fb.expected_answer, _source: 'steps-enriched' };
    }
    try {
      const parsed = JSON.parse(q.expected_answer);
      if (parsed?.model_answer && hasUnresolvedPlaceholders(parsed.model_answer)) {
        const fb = buildStageFallback(i, context);
        genLog.replacedSlots.push({ slot: i + 1, stage: STAGE_LABELS[i], reason: 'model_placeholder', original: parsed.model_answer.slice(0, 60) });
        return { ...q, expected_answer: fb.expected_answer, _source: 'model-enriched' };
      }
    } catch { /* plain text */ }

    const enforced = applyAnswerStepsEnforcement(q.expected_answer, i, context);
    if (enforced !== q.expected_answer) {
      genLog.replacedSlots.push({ slot: i + 1, stage: STAGE_LABELS[i], reason: 'steps_min_length', original: 'short step desc replaced' });
    }
    return { ...q, expected_answer: enforced, _source: q._source || 'ai' };
  });
};

const callGroqQuestionAPI = async (apiKey, modelName, systemPrompt, userPrompt) => {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: modelName,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API request failed with status: ${response.status}`);
  }

  const resData = await response.json();
  const content = resData.choices[0].message.content;
  const parsedData = safeParseJSON(content);

  if (!parsedData || !Array.isArray(parsedData.questions) || parsedData.questions.length === 0) {
    throw new Error('Groq returned invalid JSON schema');
  }

  return parsedData.questions;
};

/**
 * Generate 8 dynamic, highly-customized interview questions using Qwen 3 32B on Groq
 * 
 * @param {object} params
 * @param {string} params.position - Position title
 * @param {string} params.skills - Comma-separated skills
 * @param {string} params.experienceLevel - Experience level (JUNIOR, MID, SENIOR...)
 * @param {string} params.cvText - Parsed CV text
 * @returns {Promise<Array<{question_text: string, expected_answer: string, score_weight: number}>>}
 */
export const generateQuestionsFromGroq = async ({
  position = '',
  skills = '',
  companyName = '',
  jobDescription = '',
  experienceLevel = 'JUNIOR',
  cvText = ''
}) => {
  const apiKey = process.env.GROQ_API_KEY;
  const modelName = process.env.GROQ_MODEL || 'qwen/qwen3-32b';

  // 1. Fallback Validation: Throw real configuration error if key is missing to avoid hidden mock data
  if (!apiKey || apiKey === 'gsk_your_groq_api_key_here' || apiKey.trim().length === 0) {
    throw new Error('GROQ_API_KEY chưa được cấu hình hoặc giá trị không hợp lệ trong file .env ở Backend! Vui lòng thiết lập key Groq thực tế để AI hoạt động.');
  }

  if (apiKey === 'mock-groq-key') {
    return [
      { question_text: "Chào bạn, bạn có thể giới thiệu ngắn gọn về bản thân không?", expected_answer: "Ứng viên chào hỏi lịch sự, giới thiệu bản thân súc tích và nêu định hướng công việc mong muốn.", score_weight: 1 },
      { question_text: "Bạn có thể tự nhận xét về những điểm mạnh vượt trội và điểm yếu lớn nhất của bản thân trong công việc là gì?", expected_answer: "Nêu rõ điểm mạnh phù hợp với công việc và điểm yếu thực tế kèm giải pháp khắc phục cụ thể.", score_weight: 1 },
      { question_text: "Định hướng phát triển nghề nghiệp chi tiết trong 3 năm tới của bạn là gì và tại sao bạn lại ứng tuyển vị trí này?", expected_answer: "Nêu rõ lộ trình nghề nghiệp rõ ràng, lý do ứng tuyển thuyết phục thể hiện sự quan tâm tới vị trí.", score_weight: 1 },
      { question_text: `Đối với vị trí ${position}, giả sử bạn gặp một tình huống thực tế khó khăn (ví dụ: tối ưu xử lý dữ liệu lớn hoặc giải quyết phàn nàn của khách hàng), bạn sẽ làm thế nào?`, expected_answer: "Ứng viên phân tích tình huống một cách logic, đưa ra phương án xử lý cụ thể, khả thi và tối ưu.", score_weight: 2 },
      { question_text: `Trong CV của bạn, bạn đã triển khai dự án thực tế nào nổi bật? Hãy chia sẻ vai trò và nhiệm vụ cụ thể của bạn?`, expected_answer: "Giải trình chi tiết về công nghệ, kiến trúc sử dụng trong dự án của họ, mô tả rõ vai trò và nhiệm vụ.", score_weight: 2 },
      { question_text: "Hãy chia sẻ một khó khăn lớn nhất bạn gặp phải trong dự án cũ và bạn đã khắc phục nó thế nào?", expected_answer: "Ứng viên mô tả khó khăn kỹ thuật hoặc quy trình, áp dụng cấu trúc STAR để giải thích hành động và kết quả.", score_weight: 2 },
      { question_text: "Kỳ vọng của bạn về mức lương mong muốn, quyền lợi cũng như văn hóa làm việc của công ty như thế nào?", expected_answer: "Ứng viên đưa ra mức lương mong muốn hợp lý và bày tỏ kỳ vọng cụ thể về môi trường làm việc chuyên nghiệp.", score_weight: 1 },
      { question_text: "Cảm ơn bạn, buổi phỏng vấn đến đây là kết thúc. Bạn có câu hỏi ngược nào dành cho tôi không?", expected_answer: "Ứng viên đặt 1-2 câu hỏi thông minh thể hiện sự quan tâm sâu sắc tới công việc và nói lời chào tạm biệt lịch sự.", score_weight: 1 }
    ];
  }

  const systemPrompt = `Bạn là một Chuyên gia Tuyển dụng AI cao cấp, am hiểu nhiều ngành nghề khác nhau (như Công nghệ thông tin, Kinh doanh, Marketing, Nhân sự, Tài chính, Thiết kế, v.v.).
Nhiệm vụ của bạn là dựa vào CV của ứng viên, vị trí ứng tuyển và kỹ năng chuyên môn được cung cấp để sinh ra chính xác **8 câu hỏi phỏng vấn** theo lộ trình thực tế như phỏng vấn với HR dưới đây:

- **Câu 1 (Giai đoạn 1 - Nhập cuộc & Giới thiệu bản thân)**: Lời chào và gợi ý ứng viên thực hiện giao tiếp xã giao nhẹ nhàng (small talk), giới thiệu ngắn gọn, lịch sự về bản thân cũng như định hướng phát triển tổng quan.
- **Câu 2 (Giai đoạn 2 - Khai thác điểm mạnh & điểm yếu)**: Câu hỏi yêu cầu ứng viên tự nhận định về các điểm mạnh vượt trội và điểm yếu lớn nhất của bản thân trong công việc, đồng thời nêu cách cải thiện điểm yếu đó.
- **Câu 3 (Giai đoạn 2 - Định hướng nghề nghiệp & Lý do ứng tuyển)**: Câu hỏi khai thác định hướng nghề nghiệp chi tiết (ngắn hạn & dài hạn) và lý do tại sao ứng viên muốn ứng tuyển vào vị trí này.
- **Câu 4 (Giai đoạn 3 - Tư duy giải quyết vấn đề qua tình huống thực tế ngoài CV)**: Đưa ra một tình huống thực tế giả định hóc búa đặc thù của ngành nghề đó (không có trong CV) để đánh giá tư duy giải quyết vấn đề của ứng viên.
  *Ví dụ với ngành IT: "Hãy nêu phương án tối ưu một truy vấn SQL trong bảng chứa hơn 1 triệu bản ghi người dùng khi hệ thống bị chậm."*
  *Ví dụ với Sales/Marketing: "Làm thế nào bạn thuyết phục một khách hàng lớn đang từ chối mua sản phẩm vì chê giá cao?"*
- **Câu 5 (Giai đoạn 3 - Kinh nghiệm thực tế & Dự án trong CV)**: Các câu hỏi khai thác sâu vào các dự án cụ thể và lịch sử làm việc được liệt kê trong CV của ứng viên. Bạn BẮT BUỘC phải trích xuất và gọi tên cụ thể dự án hoặc tên công ty cũ có trong CV để làm bối cảnh câu hỏi nhằm kiểm tra tính thực chiến.
- **Câu 6 (Giai đoạn 3 - Câu hỏi về kiến thức chuyên môn)**: Các câu hỏi đặt nặng về lý thuyết của vị trí mà ứng viên đang ứng tuyển.
  * ví dụ với ngành IT: "Restful API là gì? Hãy cho tôi biết về 1 số Http method và khi nào thì dùng nó??", "Hãy giải thích về cơ chế polling và websocket??"
  * ví dụ với ngành Marketing: "SEO on-page và SEO off-page là gì? Hãy cho tôi biết 1 số công cụ SEO và khi nào thì dùng nó??"
- **Câu 7 (Giai đoạn 4 - Lương, quyền lợi & Kỳ vọng)**: Câu hỏi khai thác kỳ vọng của ứng viên về mức lương mong muốn, quyền lợi cũng như văn hóa, môi trường làm việc lý tưởng mà họ mong đợi ở công ty.
- **Câu 8 (Giai đoạn 4 - Câu hỏi ngược & Chào tạm biệt)**: Lời kết luận từ người phỏng vấn thông báo buổi phỏng vấn kết thúc, đồng thời gợi ý và kiểm tra xem ứng viên có câu hỏi ngược nào dành cho nhà tuyển dụng/HR để thể hiện sự quan tâm, sau đó chào tạm biệt lịch sự hay không.

Các câu hỏi phải tuân thủ nghiêm ngặt các quy tắc tuyệt đối sau:
1. Thiết kế linh hoạt dựa trên vị trí ứng tuyển và kỹ năng yêu cầu để áp dụng cho mọi ngành nghề khác nhau (IT, Sales, Marketing, Nhân sự, Tài chính, v.v.).
2. BẮT BUỘC Câu 5 phải chứa thông tin bối cảnh cụ thể trích xuất trực tiếp từ các DỰ ÁN (Projects) hoặc KINH NGHIỆM LÀM VIỆC (Work Experience) ghi trong CV của ứng viên. Nếu CV thực sự trống rỗng, hãy mở đầu câu hỏi bằng: "Vì CV của bạn chưa ghi chi tiết các dự án thực tế, tôi muốn hỏi bạn về..." để ứng viên rõ bối cảnh.
3. Nếu có Mô tả công việc (Job Description) được cung cấp, BẮT BUỘC phải tập trung generate câu hỏi xoay quanh các yêu cầu kỹ thuật và kỹ năng được liệt kê trong JD đó, thay vì sinh câu hỏi chung chung.
4. Nếu có Tên công ty được cung cấp, hãy cá nhân hóa câu hỏi bối cảnh để phù hợp với lĩnh vực hoạt động, sản phẩm và văn hóa của công ty đó.
5. Ngôn ngữ câu hỏi phải là tiếng Việt tự nhiên, chuyên nghiệp và chuẩn xác thuật ngữ chuyên ngành.

⚠️ PHÂN BIỆT RÕ CÁC PHẦN DỮ LIỆU:
- "question_text": Câu hỏi DO NGƯỜI PHỎNG VẤN (HR) đặt ra.
- "expected_answer": Câu trả lời mẫu HOÀN CHỈNH của ứng viên — viết ngôi thứ nhất, 3–6 câu đầy đủ ý (100–200 từ), CÓ SỐ LIỆU/DỰ ÁN CỤ THỂ. TUYỆT ĐỐI KHÔNG dùng placeholder [trong ngoặc vuông] hay biến \${co}/\${sk} — phải ghi tên công ty, công nghệ, con số thật.
- "answer_steps": Lộ trình ANSWER STRUCTURE trên UI. Mỗi "desc" là **một câu hướng dẫn cụ thể** (tối thiểu 60 ký tự), bám sát câu hỏi, vị trí, công ty, CV. Chỉ mô tả việc cần làm — KHÔNG "Lý do:", KHÔNG "Ví dụ:", KHÔNG câu mẫu minh họa.
- "suggested_time": Tổng thời gian khuyến nghị (giây, 120–180). UI hiển thị: "Phân bổ thời gian hợp lý... trong {suggested_time} giây."

${ANSWER_STEPS_GOLDEN_EXAMPLE}

Bạn PHẢI trả về kết quả ở định dạng JSON duy nhất — mỗi câu trong mảng "questions" phải có answer_steps theo ĐÚNG format mẫu trên:
{
  "questions": [ /* 8 objects, mỗi object có question_text, expected_answer, answer_steps, suggested_time, score_weight */ ]
}

LƯU Ý TUYỆT ĐỐI:
1. "question_text" PHẢI là câu hỏi của HR/phỏng vấn viên — KHÔNG bao giờ viết theo ngôi thứ nhất của ứng viên.
2. "expected_answer" PHẢI là đoạn văn hoàn chỉnh ứng viên có thể đọc ngay — KHÔNG chứa [mục tiêu], [Tên], \${co} hay bất kỳ chỗ trống nào.
3. "answer_steps" PHẢI có START + ít nhất 2 bước số + END; mỗi desc ĐẾM KÝ TỰ ≥ 60 (viết dài, chi tiết), chỉ hướng dẫn hành động — không "Lý do:", không "Ví dụ:", không chèn câu trả lời mẫu.
4. BẮT BUỘC phải sinh đủ CHÍNH XÁC 8 CÂU HỎI — không ít hơn, không nhiều hơn. Đây là yêu cầu bắt buộc và tuyệt đối không được bỏ qua.`;

  const companyContext = companyName ? `\n5. TÊN CÔNG TY (Company Context):\n   => ${companyName} (Hãy cá nhân hóa câu hỏi theo lĩnh vực, sản phẩm và văn hóa làm việc của công ty này)` : '';
  const jdContext = jobDescription ? `\n6. MÔ TẢ CÔNG VIỆC / YÊU CẦU KỸ NĂNG (Job Description):\n=========================================\n${jobDescription}\n=========================================\n(Ưu tiên generate câu hỏi xoay quanh các kỹ năng và yêu cầu cụ thể từ JD này)` : '';

  const userPrompt = `Dưới đây là thông tin chi tiết và dữ liệu bối cảnh phỏng vấn của ứng viên:

1. VỊ TRÍ ỨNG TUYỂN (Target Position):
   => ${position}

2. CẤP BẬC KINH NGHIỆM (Experience Level):
   => ${experienceLevel}

3. KỸ NĂNG CHUYÊN MÔN YÊU CẦU (Target Skills):
   => ${skills}${companyContext}${jdContext}

4. NỘI DUNG CHI TIẾT TỪ CV BÓC TÁCH CỦA ỨNG VIÊN (Candidate CV Raw Text):
=========================================
${cvText || 'Không có CV tải lên (Hãy sinh câu hỏi thực chiến chuẩn hóa dựa trên Vị trí và Kỹ năng chuyên môn yêu cầu)'}
=========================================

Dựa trên toàn bộ dữ liệu bối cảnh thực tế ở trên, hãy thực thi nhiệm vụ và sinh ra chính xác **8 câu hỏi phỏng vấn** dưới dạng JSON theo đúng rào chắn cấu hình trong System Prompt!`;

  const context = { position, skills, companyName, jobDescription, experienceLevel, cvText };
  const genLog = {
    timestamp: new Date().toISOString(),
    position,
    experienceLevel,
    cvLength: (cvText || '').length,
    hasCv: hasCvContent(cvText),
    model: modelName,
    aiRawCount: 0,
    retries: 0,
    validationIssues: [],
    paddedSlots: [],
    replacedSlots: [],
    finalSources: []
  };

  const MAX_RETRIES = 2;
  let lastIssues = [];
  let mappedQuestions = [];

  try {
    let userPromptCurrent = userPrompt;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        genLog.retries = attempt;
        const issueSummary = lastIssues.map((i) => i.detail).join('; ');
        userPromptCurrent = `${userPrompt}

⚠️ LẦN SINH TRƯỚC KHÔNG HỢP LỆ. Vui lòng sửa và sinh lại CHÍNH XÁC 8 câu hỏi:
- Các lỗi phát hiện: ${issueSummary}
- TUYỆT ĐỐI KHÔNG lặp lại cùng một câu hỏi ở nhiều vị trí.
- Câu 5 BẮT BUỘC gọi tên dự án/công ty CỤ THỂ từ CV — KHÔNG dùng placeholder như [Tên dự án].
- Câu 6 phải là câu hỏi lý thuyết/chuyên môn, Câu 7 về lương/kỳ vọng, Câu 8 là câu hỏi ngược/chào tạm biệt.
- answer_steps MỖI CÂU: START + 2-3 bước số + END; mỗi desc ĐẾM KÝ TỰ ≥ 60 (viết dài, chi tiết), chỉ hướng dẫn hành động — không "Lý do:", không "Ví dụ:", không câu mẫu.
- expected_answer MỖI CÂU phải là đoạn văn hoàn chỉnh, không có [brackets] hay \${tags}.`;
        console.warn(`[Groq QuestionGen] Retry ${attempt}/${MAX_RETRIES} due to validation issues:`, issueSummary);
      }

      const rawQuestions = await callGroqQuestionAPI(apiKey, modelName, systemPrompt, userPromptCurrent);
      genLog.aiRawCount = rawQuestions.length;

      mappedQuestions = mapRawQuestions(rawQuestions);
      if (mappedQuestions.length > 8) {
        console.warn(`[Groq QuestionGen] AI returned ${mappedQuestions.length} questions, trimming to 8.`);
        mappedQuestions = mappedQuestions.slice(0, 8);
      }

      lastIssues = validateQuestionSet(mappedQuestions, cvText);
      genLog.validationIssues = lastIssues;

      if (lastIssues.length === 0 && mappedQuestions.length === 8) {
        break;
      }
    }

    if (lastIssues.length > 0) {
      console.warn('[Groq QuestionGen] Validation issues remain after retries; applying stage-aware normalization.', lastIssues);
      genLog.fallbackAfterRetries = true;
    }

    const finalQuestions = normalizeToEightStages(mappedQuestions, context, genLog);
    genLog.finalSources = finalQuestions.map((q, i) => ({
      slot: i + 1,
      stage: STAGE_LABELS[i],
      source: q._source || 'ai'
    }));
    genLog.finalCount = finalQuestions.length;

    const cleaned = finalQuestions.map(({ _source, _stage, ...q }) => q);
    console.log('[Groq QuestionGen] Session log:', JSON.stringify(genLog, null, 2));
    return cleaned;

  } catch (error) {
    console.warn('[Groq API] Gặp lỗi rate limit hoặc sự cố kết nối, kích hoạt bộ câu hỏi stage-fallback:', error.message);

    const genLog = { paddedSlots: [], replacedSlots: [], fallbackMode: 'api-error' };
    const finalQuestions = Array.from({ length: 8 }, (_, i) => buildStageFallback(i, context));
    genLog.finalSources = finalQuestions.map((q, i) => ({
      slot: i + 1,
      stage: STAGE_LABELS[i],
      source: 'stage-fallback-api-error'
    }));
    console.log('[Groq QuestionGen] Session log (API error fallback):', JSON.stringify(genLog, null, 2));

    return finalQuestions.map(({ _source, _stage, ...q }) => q);
  }
};

/**
 * Evaluate candidate's real answer compared to expected answers using Groq Qwen 3 32B
 */
export const evaluateCandidateAnswer = async (questionText, expectedAnswer, candidateAnswer) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'gsk_your_groq_api_key_here' || apiKey.trim().length === 0) {
    throw new Error('GROQ_API_KEY chưa được cấu hình hoặc giá trị không hợp lệ trong file .env ở Backend! Vui lòng thiết lập key Groq thực tế để đánh giá câu trả lời.');
  }

  const systemPrompt = `Bạn là một Chuyên gia Đánh giá Phỏng vấn AI cao cấp am hiểu đa ngành nghề. Nhiệm vụ của bạn là đánh giá câu trả lời của ứng viên so với câu hỏi và đáp án mong đợi.
Hãy chấm điểm từ 0 đến 100 dựa trên độ sâu chuyên môn, tính liên quan và chính xác của câu trả lời. Đồng thời đưa ra 1-2 câu nhận xét chuyên sâu bằng tiếng Việt.
Đặc biệt, nếu câu trả lời của ứng viên quá chung chung, mơ hồ, thiếu chi tiết hoặc chưa đi vào trọng tâm, bạn hãy đánh dấu "is_generic" là true và tự động gợi ý một câu hỏi xoáy sâu (follow-up question) bằng tiếng Việt để khai thác thêm thông tin/làm rõ câu trả lời của ứng viên. Nếu câu trả lời đã tốt và đầy đủ, hãy để "is_generic" là false và "follow_up_question" là null.

Bạn PHẢI trả về duy nhất định dạng JSON có cấu trúc sau:
{
  "score": 85,
  "feedback": "Nhận xét chi tiết của bạn...",
  "is_generic": true,
  "follow_up_question": {
    "question_text": "Câu hỏi xoáy sâu cụ thể để khai thác thêm...",
    "expected_answer": "Ý chính cụ thể ứng viên cần giải thích rõ để đạt điểm..."
  }
}`;

  const userPrompt = `Câu hỏi phỏng vấn:
=> ${questionText}

Đáp án mong đợi:
=> ${expectedAnswer}

Câu trả lời thực tế của ứng viên:
=> ${candidateAnswer}`;

  try {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'qwen/qwen3-32b',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API request failed with status: ${response.status}`);
    }

    const resData = await response.json();
    const parsed = safeParseJSON(resData.choices[0].message.content);
    const scoreVal = Number(parsed.score);
    return {
      score: !isNaN(scoreVal) ? scoreVal : 80,
      feedback: parsed.feedback || "Câu trả lời khá tốt.",
      is_generic: parsed.is_generic || false,
      follow_up_question: parsed.follow_up_question || null
    };
  } catch (err) {
    console.error('Failed to evaluate candidate answer via Groq:', err);
    throw err;
  }
};

/**
 * Generate a comprehensive, personalized overall assessment of the interview using Qwen 3 32B on Groq Cloud
 * Based on target position, skills, overall score and detailed Q&A breakdown.
 * 
 * @param {object} params
 * @param {string} params.candidateName - Candidate's full name
 * @param {string} params.position - Targeted position title
 * @param {string} params.skills - Target skills
 * @param {number} params.overallScore - Calculated overall score (0-100)
 * @param {Array} params.qaDetails - Array of question-answer-score-feedback objects
 * @param {number} params.totalViolations - Total number of tab/gaze violations
 * @returns {Promise<{feedback_summary: string, radar_skills: object, learning_path: Array}>}
 */
export const generateOverallAssessmentFromGroq = async ({
  candidateName = '',
  position = '',
  skills = '',
  overallScore = 80,
  qaDetails = [],
  totalViolations = 0
}) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'gsk_your_groq_api_key_here' || apiKey.trim().length === 0) {
    throw new Error('GROQ_API_KEY chưa được cấu hình hoặc giá trị không hợp lệ trong file .env ở Backend! Vui lòng thiết lập key Groq thực tế để đánh giá tổng quan.');
  }

  const systemPrompt = `Bạn là một Chuyên gia Đánh giá Tuyển dụng AI cao cấp chuyên ngành HR.
Nhiệm vụ của bạn là phân tích toàn bộ kết quả của cuộc phỏng vấn dựa trên thông tin ứng viên, vị trí tuyển dụng, các kỹ năng yêu cầu và danh sách chi tiết các câu trả lời thực tế của ứng viên kèm theo điểm số và nhận xét của từng câu.

Bạn PHẢI phân tích, nhận xét và đánh giá toàn bộ quy trình phỏng vấn dựa trên 4 giai đoạn bắt buộc sau (Hãy tự động nhận diện nội dung câu hỏi để phân loại vào giai đoạn phù hợp, không dựa vào số thứ tự index cứng vì tổng số câu hỏi có thể thay đổi động từ 8 đến 10 câu do có chèn thêm câu hỏi xoáy sâu):
1. **Giai đoạn 1: Nhập cuộc & Giới thiệu bản thân**: Đánh giá câu hỏi đầu tiên (mở đầu, small talk, giới thiệu bản thân).
2. **Giai đoạn 2: Khai thác bản thân (Điểm mạnh/yếu, định hướng)**: Đánh giá các câu hỏi liên quan đến điểm mạnh, điểm yếu và định hướng phát triển công việc.
3. **Giai đoạn 3: Tư duy & Kinh nghiệm thực tế (STAR, tình huống thực tế ngoài CV, dự án CV)**: Đánh giá các câu hỏi chuyên môn chuyên sâu, tình huống thực tế giả định ngoài CV và các dự án trong CV (bao gồm các câu hỏi xoáy sâu liên quan).
4. **Giai đoạn 4: Lương thưởng, kỳ vọng & Câu hỏi ngược/Chào tạm biệt**: Đánh giá các câu hỏi về kỳ vọng lương, văn hóa doanh nghiệp, câu hỏi ngược cho nhà tuyển dụng và lời kết thúc phỏng vấn.

Dựa vào đó, bạn PHẢI tạo ra một báo cáo đánh giá tổng quan cá nhân hóa 100% (KHÔNG SỬ DỤNG MẪU TĨNH), bao gồm:
1. Nhận xét tổng quan (feedback_summary): Viết bằng Tiếng Việt tự nhiên và chuyên nghiệp để nhận xét chi tiết toàn bộ các quy trình trên. Bạn PHẢI:
   - Nhận xét chi tiết mức độ thể hiện của ứng viên qua từng quy trình phỏng vấn (từ Giai đoạn 1 đến Giai đoạn 4), nhấn mạnh rõ tính chủ động xã giao ở đầu buổi và tính chủ động cảm ơn/chào tạm biệt ở cuối buổi.
   - Chỉ ra rõ các **Điểm mạnh** và **Điểm yếu** thực tế hiện tại của ứng viên thông qua các câu trả lời phỏng vấn.
   - Đưa ra **Lời khuyên luyện tập** chi tiết để ứng viên cải thiện kỹ năng giao tiếp cũng như chuyên môn.
2. Điểm số radar (radar_skills): Đánh giá 5 khía cạnh năng lực từ 0-100:
   - technical_depth (Kỹ năng cứng/chuyên môn): Phản ánh thực tế độ sâu kiến thức qua các câu trả lời kỹ thuật.
   - communication (Giao tiếp): Khả năng diễn đạt ý tưởng rõ ràng, súc tích.
   - problem_solving (Giải quyết vấn đề): Cách tiếp cận và giải quyết các tình huống hoặc bài toán kỹ thuật.
   - confidence (Độ tự tin): Thể hiện qua giọng điệu, cách khẳng định hoặc lập luận (ước lượng từ độ tự tin của câu trả lời).
   - star_structure (Cấu trúc STAR): Mức độ ứng dụng phương pháp STAR (Bối cảnh, Nhiệm vụ, Hành động, Kết quả) trong các câu trả lời hành vi/kinh nghiệm.
3. Lộ trình ôn tập gợi ý 10 ngày (learning_path): Gồm chính xác 3 chặng học tập được may đo riêng dựa trên chính những lỗ hổng kỹ thuật hoặc điểm yếu giao tiếp được phát hiện trong các câu trả lời của ứng viên:
   - Chặng 1: Ngày 1 - 3 (Tập trung sửa chữa lỗ hổng lớn nhất hoặc cấu trúc cơ bản).
   - Chặng 2: Ngày 4 - 7 (Tập trung nâng cao kỹ năng thực chiến bị thiếu sót).
   - Chặng 3: Ngày 8 - 10 (Luyện tập nâng cao, tâm lý và chuẩn bị thực tế).
4. Vi phạm quy chế (Violations): Bạn được cung cấp tổng số lần vi phạm quy chế (chuyển tab hoặc liếc mắt ra ngoài). BẮT BUỘC phải đưa nhận xét về sự trung thực/tập trung này vào phần "feedback_summary" để báo cáo cho HR. Nếu vi phạm = 0, hãy khen ngợi.

Bạn PHẢI trả về kết quả dưới định dạng JSON duy nhất như sau:
{
  "feedback_summary": "Nhận xét tổng quan bao gồm nhận định 4 giai đoạn, điểm mạnh/yếu và lời khuyên...",
  "radar_skills": {
    "technical_depth": 80,
    "communication": 85,
    "problem_solving": 75,
    "confidence": 80,
    "star_structure": 70
  },
  "learning_path": [
    {
      "phase": "Chặng 1: Củng cố Kiến thức & Cấu trúc (Ngày 1 - 3)",
      "topic": "Chủ đề cụ thể cần ôn tập...",
      "action": "Hành động thực hành chi tiết..."
    },
    {
      "phase": "Chặng 2: Nâng cao Chuyên môn thực tế (Ngày 4 - 7)",
      "topic": "Chủ đề cụ thể cần ôn tập...",
      "action": "Hành động thực hành chi tiết..."
    },
    {
      "phase": "Chặng 3: Làm chủ tâm lý & Giọng điệu (Ngày 8 - 10)",
      "topic": "Chủ đề cụ thể cần ôn tập...",
      "action": "Hành động thực hành chi tiết..."
    }
  ]
}`;

  const userPrompt = `Dưới đây là dữ liệu thực tế từ cuộc phỏng vấn của ứng viên:

1. TÊN ỨNG VIÊN (Candidate Name):
   => ${candidateName}

2. VỊ TRÍ ỨNG TUYỂN (Target Position):
   => ${position}

3. KỸ NĂNG CHUYÊN MÔN YÊU CẦU (Target Skills):
   => ${skills}

4. ĐIỂM SỐ TRUNG BÌNH THỰC TẾ (Overall Score):
   => ${overallScore}/100

5. TỔNG SỐ LẦN VI PHẠM QUY CHẾ (Total Violations):
   => ${totalViolations} lần

6. CHI TIẾT TỪNG CÂU HỎI VÀ CÂU TRẢ LỜI CỦA ỨNG VIÊN (Detailed Q&A Breakdown):
========================================================================
${qaDetails.map((qa, index) => `
[CÂU HỎI ${index + 1}]: ${qa.question}
- Câu trả lời của ứng viên: ${qa.answer}
- Điểm số đạt được: ${qa.score}/100
- Nhận xét của AI cho câu hỏi này: ${qa.feedback}
`).join('\n')}
========================================================================

Dựa trên toàn bộ kết quả phỏng vấn thực tế ở trên, hãy thực hiện phân tích chuyên sâu và sinh ra báo cáo đánh giá tổng quan bằng tiếng Việt dưới dạng JSON theo đúng rào chắn cấu hình trong System Prompt!`;

  try {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'qwen/qwen3-32b',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API request failed with status: ${response.status}`);
    }

    const resData = await response.json();
    const content = resData.choices[0].message.content;
    const parsedData = safeParseJSON(content);

    return {
      feedback_summary: parsedData.feedback_summary || 'Đánh giá tổng quan đã được tạo thành công.',
      radar_skills: parsedData.radar_skills || {
        technical_depth: overallScore,
        communication: overallScore,
        problem_solving: overallScore,
        confidence: overallScore,
        star_structure: overallScore
      },
      learning_path: parsedData.learning_path || [
        {
          phase: 'Chặng 1: Củng cố Kiến thức & Cấu trúc (Ngày 1 - 3)',
          topic: 'Cấu trúc câu trả lời STAR',
          action: 'Luyện tập trả lời bằng cách chia rõ Bối cảnh, Nhiệm vụ, Hành động và Kết quả.'
        },
        {
          phase: 'Chặng 2: Nâng cao Chuyên môn thực tế (Ngày 4 - 7)',
          topic: 'Tập trung ôn tập chuyên sâu',
          action: 'Nghiên cứu sâu các khía cạnh kỹ thuật còn thiếu sót.'
        },
        {
          phase: 'Chặng 3: Làm chủ tâm lý & Giọng điệu (Ngày 8 - 10)',
          topic: 'Luyện tập hội thoại',
          action: 'Luyện tập kiểm soát tốc độ nói và duy trì năng lượng tích cực.'
        }
      ]
    };

  } catch (error) {
    console.error('Failed to generate overall assessment from Groq API:', error);
    throw error;
  }
};

/**
 * Evaluate all candidate answers and generate overall HR report in a single API call.
 * 
 * @param {object} params
 * @returns {Promise<{evaluations: Array, overall_assessment: object}>}
 */
export const evaluateAllAndGenerateHRReport = async ({
  candidateName = '',
  position = '',
  skills = '',
  qaDetails = [],
  totalViolations = 0
}) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'gsk_your_groq_api_key_here' || apiKey.trim().length === 0) {
    throw new Error('GROQ_API_KEY chưa được cấu hình hoặc giá trị không hợp lệ trong file .env ở Backend!');
  }

  const systemPrompt = `Bạn là một Chuyên gia Tuyển dụng AI cao cấp chuyên ngành HR. Nhiệm vụ của bạn là nhận vào danh sách các câu hỏi và câu trả lời thực tế của ứng viên trong một buổi phỏng vấn. Bạn PHẢI thực hiện 2 việc ĐỒNG THỜI trong cùng 1 lần xử lý:

1. Chấm điểm từng câu trả lời (Gắn liền với ID của câu hỏi):
   - Đánh giá từ 0 đến 100 dựa trên chuyên môn và sự phù hợp.
   - Nếu ở Input có lưu ý "Gaze Violations" (Liếc mắt gian lận) của câu nào, bạn hãy mạnh tay TRỪ ĐIỂM câu đó (tối đa trừ 50 điểm) và GHI RÕ LỜI CẢNH BÁO vào feedback. Nếu ứng viên 'Không trả lời', hãy cho 0 điểm.
   - Viết 1-2 câu nhận xét (feedback) cho mỗi câu trả lời.

2. Phân tích Tổng quan (Overall Assessment) dựa trên toàn bộ các câu hỏi thuộc 4 giai đoạn (Từ mở đầu tới kết thúc).
   - Dựa vào đó viết "feedback_summary" bao gồm: điểm mạnh, điểm yếu, lời khuyên. BẮT BUỘC nhận xét về mức độ trung thực nếu "Tổng số vi phạm quy chế (Tab/Gaze)" lớn hơn 0.
   - Đánh giá 5 trục kỹ năng (radar_skills): technical_depth, communication, problem_solving, confidence, star_structure (thang điểm 0-100). KHÔNG TẠO learning_path.

Bạn PHẢI trả về JSON DUY NHẤT theo định dạng MẪU CHUẨN sau:
{
  "evaluations": [
    {
      "id": 1, 
      "score": 85,
      "feedback": "Nhận xét cho câu hỏi này..."
    }
  ],
  "overall_assessment": {
    "feedback_summary": "Nhận xét tổng quan toàn bộ buổi phỏng vấn...",
    "radar_skills": {
      "technical_depth": 80,
      "communication": 85,
      "problem_solving": 75,
      "confidence": 80,
      "star_structure": 70
    }
  }
}`;

  const userPrompt = `Dữ liệu phỏng vấn:
- Ứng viên: ${candidateName}
- Vị trí: ${position}
- Kỹ năng yêu cầu: ${skills}
- Tổng số vi phạm quy chế (Tab/Gaze): ${totalViolations} lần

CHI TIẾT CÁC CÂU HỎI VÀ TRẢ LỜI:
${qaDetails.map(qa => `[ID: ${qa.id}] Câu hỏi: ${qa.question}
=> Đáp án mong đợi: ${qa.expected_answer}
=> Trả lời thực tế: ${qa.answer}
=> Ghi chú vi phạm cho câu này: Có ${qa.gaze_violations || 0} lần nhìn lệch khỏi khung hình (Gaze Violations).`).join('\n\n')}

Hãy sinh ra JSON kết quả chấm điểm và báo cáo tổng hợp.`;

  try {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'qwen/qwen3-32b',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API request failed with status: ${response.status}`);
    }

    const resData = await response.json();
    const content = resData.choices[0].message.content;
    const parsedData = safeParseJSON(content);

    return parsedData;
  } catch (error) {
    console.error('Failed to batch evaluate via Groq API:', error);
    throw error;
  }
};

/**
 * Moderate blog content using Groq Cloud API to verify if it is relevant to job tips, CV, or interviews
 * 
 * @param {object} params
 * @param {string} params.title - Blog title
 * @param {string} params.content - Blog content
 * @param {string} params.category - Blog category
 * @param {Array} params.tags - Blog tags
 * @returns {Promise<{relevant: boolean, reason: string}>}
 */
export const moderateBlogContentWithGroq = async ({
  title = '',
  content = '',
  category = '',
  tags = []
}) => {
  const apiKey = process.env.GROQ_API_KEY;
  const modelName = process.env.GROQ_MODEL || 'qwen/qwen3-32b';

  // Fallback Validation: Throw configuration error if API key is missing
  if (!apiKey || apiKey === 'gsk_your_groq_api_key_here' || apiKey.trim().length === 0) {
    throw new Error('GROQ_API_KEY chưa được cấu hình hoặc giá trị không hợp lệ trong file .env ở Backend!');
  }

  if (apiKey === 'mock-groq-key') {
    // Mock response for testing
    const isRelevant = title.toLowerCase().includes('cv') || 
                       title.toLowerCase().includes('job') || 
                       title.toLowerCase().includes('phong van') || 
                       title.toLowerCase().includes('phỏng vấn') || 
                       title.toLowerCase().includes('tim viec') || 
                       title.toLowerCase().includes('tìm việc') || 
                       title.toLowerCase().includes('su nghiep') || 
                       title.toLowerCase().includes('sự nghiệp') || 
                       title.toLowerCase().includes('lương') || 
                       title.toLowerCase().includes('career');
    return {
      relevant: isRelevant,
      reason: isRelevant ? '' : 'Bài viết không liên quan đến chủ đề tìm việc, viết CV hay phỏng vấn.'
    };
  }

  const systemPrompt = `Bạn là một AI kiểm duyệt nội dung (Blog Moderator Bot) cho một nền tảng hỗ trợ việc làm.
Nhiệm vụ của bạn là đánh giá xem một bài viết (Blog Post) có liên quan đến các chủ đề sau hay không:
1. Mẹo tìm việc, định hướng sự nghiệp, kinh nghiệm làm việc (job search tips, career advice, work experience).
2. Hướng dẫn viết CV, portfolio, hồ sơ năng lực (CV writing guide, portfolio tips).
3. Kinh nghiệm phỏng vấn, chuẩn bị phỏng vấn (interview tips, interview prep).
4. Thông tin thị trường lao động, mức lương, xu hướng công nghệ liên quan đến nghề nghiệp.

Bạn hãy từ chối các bài viết không liên quan đến các chủ đề trên (ví dụ: công thức nấu ăn, tin tức thể thao giải trí, chia sẻ cuộc sống cá nhân không liên quan đến công sở, quảng cáo sản phẩm khác...).

Bạn PHẢI trả về duy nhất định dạng JSON có cấu trúc sau:
{
  "relevant": true,
  "reason": ""
}
Nếu relevant là false, hãy cung cấp lý do từ chối (reason) bằng tiếng Việt thật súc tích, chuyên nghiệp (ví dụ: "Nội dung bài viết nói về chủ đề ẩm thực, không liên quan đến mẹo tìm việc hoặc viết CV.").`;

  const userPrompt = `Hãy duyệt bài viết sau:
Tiêu đề: ${title}
Danh mục: ${category}
Tags: ${Array.isArray(tags) ? tags.join(', ') : ''}
Nội dung:
${content.substring(0, 1000)} ${content.length > 1000 ? '...' : ''}`;

  try {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API request failed with status: ${response.status}`);
    }

    const resData = await response.json();
    const contentRes = resData.choices[0].message.content;
    const parsedData = safeParseJSON(contentRes);

    return {
      relevant: parsedData.relevant === true || parsedData.relevant === 'true',
      reason: parsedData.reason || ''
    };
  } catch (error) {
    console.error('Failed to moderate blog content via Groq API:', error);
    // In case of API failure, default to true to not block users
    return {
      relevant: true,
      reason: ''
    };
  }
};

/**
 * Generate a single daily flash question with expected answer guidelines
 * for a specific career track using Groq Cloud API (Qwen 3 32B model)
 * 
 * @param {string} track - Career track (e.g., 'frontend', 'backend', etc.)
 * @returns {Promise<{question_text: string, sample_answer: string}>}
 */
export const generateDailyQuestionFromGroq = async (track = '') => {
  const apiKey = process.env.GROQ_API_KEY;
  const modelName = process.env.GROQ_MODEL || 'qwen/qwen3-32b';

  if (!apiKey || apiKey === 'gsk_your_groq_api_key_here' || apiKey.trim().length === 0) {
    throw new Error('GROQ_API_KEY chưa được cấu hình hoặc giá trị không hợp lệ trong file .env ở Backend!');
  }

  if (apiKey === 'mock-groq-key') {
    const mockQuestions = {
      frontend: {
        question_text: "Restful API là gì? Hãy cho tôi biết về 1 số Http method và khi nào thì dùng nó?",
        sample_answer: "RESTful API là chuẩn thiết kế API sử dụng HTTP methods: GET (lấy dữ liệu), POST (tạo mới), PUT (cập nhật toàn bộ), PATCH (cập nhật một phần), DELETE (xóa)."
      },
      backend: {
        question_text: "Hãy giải thích về cơ chế connection pooling trong PostgreSQL và tại sao nó quan trọng?",
        sample_answer: "Connection pooling giữ các kết nối database mở sẵn và dùng lại chúng, tránh việc tạo/đóng kết nối liên tục giúp giảm thiểu độ trễ và tải cho DB."
      },
      fullstack: {
        question_text: "So sánh Server-Side Rendering (SSR) và Client-Side Rendering (CSR) về SEO và trải nghiệm người dùng?",
        sample_answer: "SSR render HTML ở server nên tốt cho SEO và load lần đầu nhanh. CSR render ở client nên mượt mà sau khi load xong nhưng kém SEO hơn."
      },
      design: {
        question_text: "Quy tắc 60-30-10 trong phối màu UI/UX thiết kế là gì?",
        sample_answer: "Quy tắc phối màu gồm: 60% màu chủ đạo (nền), 30% màu phụ (cấu trúc/text), và 10% màu nhấn (CTA, highlight)."
      },
      qa: {
        question_text: "Phân biệt Regression Testing và Sanity Testing?",
        sample_answer: "Regression testing kiểm thử toàn bộ hệ thống sau thay đổi để đảm bảo không lỗi cũ. Sanity testing kiểm tra nhanh một phần tính năng cụ thể vừa cập nhật."
      },
      pm: {
        question_text: "Khái niệm MVP (Minimum Viable Product) là gì và làm thế nào để xác định phạm vi của MVP?",
        sample_answer: "MVP là phiên bản sản phẩm tối giản nhất chứa đủ tính năng cốt lõi để thu thập phản hồi từ người dùng thực tế nhằm tối ưu hóa chi phí."
      },
      data_science: {
        question_text: "Phân biệt Overfitting và Underfitting trong mô hình học máy?",
        sample_answer: "Overfitting là mô hình quá khớp dữ liệu train nhưng kém trên dữ liệu mới. Underfitting là mô hình quá đơn giản không học được cấu trúc dữ liệu."
      }
    };
    return mockQuestions[track.toLowerCase()] || {
      question_text: `Hãy trả lời câu hỏi chuyên môn ngắn gọn về ngành nghề: ${track}`,
      sample_answer: `Gợi ý câu trả lời cho ngành nghề: ${track}.`
    };
  }

  const systemPrompt = `Bạn là một Chuyên gia Tuyển dụng AI cao cấp.
Nhiệm vụ của bạn là sinh ra duy nhất **1 câu hỏi phỏng vấn nhanh hóc búa** (Daily Flash Interview) và **câu trả lời gợi ý cực kỳ súc tích** cho ngành nghề (career track) được cung cấp.

Yêu cầu câu hỏi:
1. Câu hỏi phải mang tính thực chiến, tập trung vào các vấn đề hóc búa, kỹ thuật chuyên sâu hoặc các tình huống giải quyết vấn đề của ngành nghề đó.
2. Ngôn ngữ câu hỏi phải là tiếng Việt tự nhiên, chuyên nghiệp và chuẩn xác thuật ngữ chuyên ngành.
3. Câu hỏi phải rõ ràng, kích thích tư duy và trả lời được trong vòng 60 giây.

Yêu cầu câu trả lời gợi ý (sample_answer):
1. Phải cực kỳ ngắn gọn, súc tích (dưới 40 từ).
2. Tóm tắt các ý chính cốt lõi nhất ứng viên cần trả lời để đạt điểm tối đa.

Bạn PHẢI trả về kết quả ở định dạng JSON duy nhất, có cấu trúc như sau:
{
  "question_text": "Nội dung câu hỏi phỏng vấn...",
  "sample_answer": "Ý chính cốt lõi ứng viên cần trình bày (cực kỳ ngắn gọn)..."
}`;

  const userPrompt = `Hãy sinh 1 câu hỏi phỏng vấn nhanh hàng ngày cho ngành nghề (career track): ${track}`;

  try {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API request failed with status: ${response.status}`);
    }

    const resData = await response.json();
    const content = resData.choices[0].message.content;
    const parsedData = safeParseJSON(content);

    if (parsedData && parsedData.question_text) {
      return {
        question_text: parsedData.question_text,
        sample_answer: parsedData.sample_answer || 'Không có gợi ý câu trả lời.'
      };
    } else {
      throw new Error('Groq returned invalid JSON schema for daily question');
    }
  } catch (error) {
    console.error(`Failed to generate daily question for track ${track} from Groq API:`, error);
    throw error;
  }
};

/**
 * Generate learning details for a specific skill node using Groq Llama/Qwen.
 *
 * @param {object} params
 * @param {string} params.nodeId - The unique ID of the node.
 * @param {string} params.nodeLabel - The display label of the node.
 * @param {string} params.cvText - The candidate's CV text.
 * @returns {Promise<object>} JSON object containing feedback, practice questions, and courses.
 */
export const generateSkillNodeDetailsFromGroq = async ({
  nodeId = '',
  nodeLabel = '',
  cvText = ''
}) => {
  const apiKey = process.env.GROQ_API_KEY;
  const modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  if (!apiKey || apiKey === 'gsk_your_groq_api_key_here' || apiKey.trim().length === 0) {
    throw new Error('GROQ_API_KEY chưa được cấu hình.');
  }

  if (apiKey === 'mock-groq-key') {
    // Return a mock object directly if key is a mock
    return {
      ai_feedback: `Kỹ năng ${nodeLabel} của bạn được đánh giá cao trong CV. Bạn nên tập trung thực hành các câu hỏi thực chiến để nâng cao điểm số.`,
      practice_questions: [
        { question: `Nêu một ví dụ thực tế về ứng dụng ${nodeLabel} trong dự án cũ?`, expected_answer: "Ứng viên giải thích chi tiết ngữ cảnh và giải pháp sử dụng." },
        { question: `Những lỗi thường gặp khi triển khai ${nodeLabel} và cách tối ưu?`, expected_answer: "Liệt kê lỗi hiệu năng và cách fix." },
        { question: `Tại sao bạn lựa chọn ${nodeLabel} thay vì các giải pháp thay thế khác?`, expected_answer: "So sánh ưu nhược điểm kỹ thuật rõ ràng." }
      ],
      courses: [
        { title: `Tài liệu hướng dẫn ${nodeLabel} chính thức`, url: `https://www.google.com/search?q=${encodeURIComponent(nodeLabel + ' documentation')}` },
        { title: `Khóa học ${nodeLabel} thực chiến trên FreeCodeCamp`, url: "https://www.freecodecamp.org/" }
      ]
    };
  }

  const systemPrompt = `Bạn là một AI Mentor đào tạo lập trình viên Tech chuyên nghiệp.
Nhiệm vụ của bạn là dựa vào kỹ năng được chỉ định và nội dung CV của ứng viên (nếu có) để tạo tài liệu ôn tập và phỏng vấn thử.

HƯỚNG DẪN ĐÁNH GIÁ & SINH CÂU HỎI:
1. Nhận xét ngắn (ai_feedback): Đánh giá nhanh kinh nghiệm của ứng viên với kỹ năng này dựa trên CV của họ. Nếu CV không nhắc đến kỹ năng này, hãy đưa ra lời khuyên ôn tập tổng quan cho kỹ năng này. Viết bằng tiếng Việt tự nhiên, tối đa 3 câu.
2. 3 câu hỏi phỏng vấn thử (practice_questions) cụ thể, thực tế xoay quanh kỹ năng này, phù hợp để luyện tập. Mỗi câu hỏi gồm nội dung câu hỏi (question) và gợi ý trả lời (expected_answer - tối đa 15 từ, ngắn gọn).
3. 2 link khóa học/tài liệu tự học uy tín (courses), mỗi link gồm tên khóa học/tài liệu (title) và URL liên kết (url). Hãy dùng các link tài liệu gốc uy tín (ví dụ: react.dev, developer.mozilla.org, typescriptlang.org, v.v.).

Bạn PHẢI trả về JSON duy nhất theo cấu trúc sau:
{
  "ai_feedback": "Nhận xét của bạn...",
  "practice_questions": [
    { "question": "Nội dung câu hỏi 1", "expected_answer": "Gợi ý trả lời 1" },
    { "question": "Nội dung câu hỏi 2", "expected_answer": "Gợi ý trả lời 2" },
    { "question": "Nội dung câu hỏi 3", "expected_answer": "Gợi ý trả lời 3" }
  ],
  "courses": [
    { "title": "Tên tài liệu 1", "url": "URL 1" },
    { "title": "Tên tài liệu 2", "url": "URL 2" }
  ]
}
`;

  const userPrompt = `
KỸ NĂNG YÊU CẦU:
- ID: ${nodeId}
- Label: ${nodeLabel}

NỘI DUNG CV CỦA ỨNG VIÊN:
=========================================
${cvText || "Không có CV tải lên (Hãy sinh câu hỏi và nhận xét tổng quan dựa trên kiến thức chuẩn)"}
=========================================
`;

  try {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.4
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API request failed with status: ${response.status}`);
    }

    const resData = await response.json();
    const content = resData.choices[0].message.content;
    const parsedData = safeParseJSON(content);

    if (parsedData) {
      return {
        ai_feedback: parsedData.ai_feedback || `Kế hoạch ôn tập cho kỹ năng ${nodeLabel}.`,
        practice_questions: Array.isArray(parsedData.practice_questions) ? parsedData.practice_questions : [],
        courses: Array.isArray(parsedData.courses) ? parsedData.courses : []
      };
    } else {
      throw new Error('Groq returned invalid JSON schema for skill node details');
    }
  } catch (error) {
    console.error(`Failed to generate skill node details for ${nodeLabel} from Groq API:`, error);
    throw error;
  }
};




