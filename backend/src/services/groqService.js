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
  - expected_answer: "Ứng viên chào hỏi lịch thiệp, giới thiệu bản thân súc tích và nêu định hướng công việc mong muốn."
- **Câu 2 (Giai đoạn 2 - Khai thác điểm mạnh & điểm yếu)**: Câu hỏi yêu cầu ứng viên tự nhận định về các điểm mạnh vượt trội và điểm yếu lớn nhất của bản thân trong công việc, đồng thời nêu cách cải thiện điểm yếu đó.
  - expected_answer: "Ứng viên nêu rõ điểm mạnh phù hợp với công việc và điểm yếu thực tế kèm giải pháp khắc phục cụ thể."
- **Câu 3 (Giai đoạn 2 - Định hướng nghề nghiệp & Lý do ứng tuyển)**: Câu hỏi khai thác định hướng nghề nghiệp chi tiết (ngắn hạn & dài hạn) và lý do tại sao ứng viên muốn ứng tuyển vào vị trí này.
  - expected_answer: "Ứng viên nêu rõ lộ trình nghề nghiệp rõ ràng, lý do ứng tuyển thuyết phục thể hiện sự quan tâm tới vị trí và công việc."
- **Câu 4 (Giai đoạn 3 - Tư duy giải quyết vấn đề qua tình huống thực tế ngoài CV)**: Đưa ra một tình huống thực tế giả định hóc búa đặc thù của ngành nghề đó (không có trong CV) để đánh giá tư duy giải quyết vấn đề của ứng viên.
  *Ví dụ với ngành IT: "Hãy nêu phương án tối ưu một truy vấn SQL trong bảng chứa hơn 1 triệu bản ghi người dùng khi hệ thống bị chậm."*
  *Ví dụ với Sales/Marketing: "Làm thế nào bạn thuyết phục một khách hàng lớn đang từ chối mua sản phẩm vì chê giá cao?"*
  - expected_answer: "Ứng viên phân tích tình huống một cách logic, đưa ra phương án xử lý cụ thể, khả thi và tối ưu."
- **Câu 5 (Giai đoạn 3 - Kinh nghiệm thực tế & Dự án trong CV)**: Các câu hỏi khai thác sâu vào các dự án cụ thể và lịch sử làm việc được liệt kê trong CV của ứng viên. Bạn BẮT BUỘC phải trích xuất và gọi tên cụ thể dự án hoặc tên công ty cũ có trong CV để làm bối cảnh câu hỏi nhằm kiểm tra tính thực chiến.
  - expected_answer: "Ứng viên giải trình chi tiết về công nghệ/quy trình, kiến trúc/giải pháp sử dụng trong dự án của họ, mô tả rõ vai trò và nhiệm vụ cụ thể."
- **Câu 6 (Giai đoạn 3 - Câu hỏi về kiến thức chuyên môn)**: Các câu hỏi đặt nặng về lý thuyết của vị trí mà ứng viên đang ứng tuyển.
  * ví dụ với ngành IT: "Restful API là gì? Hãy cho tôi biết về 1 số Http method và khi nào thì dùng nó??", "Hãy giải thích về cơ chế polling và websocket??"
  * ví dụ với ngành Marketing: "SEO on-page và SEO off-page là gì? Hãy cho tôi biết 1 số công cụ SEO và khi nào thì dùng nó??"
  - expected_answer: "Ứng viên trả lời các câu hỏi về kiến thức chuyên môn một cách tự tin và chuyên nghiệp, thể hiện sự hiểu biết về bản thân và khả năng làm việc trong môi trường công sở."
- **Câu 7 (Giai đoạn 4 - Lương, quyền lợi & Kỳ vọng)**: Câu hỏi khai thác kỳ vọng của ứng viên về mức lương mong muốn, quyền lợi cũng như văn hóa, môi trường làm việc lý tưởng mà họ mong đợi ở công ty.
  - expected_answer: "Ứng viên đưa ra mức lương mong muốn hợp lý và bày tỏ kỳ vọng cụ thể về môi trường làm việc một cách chuyên nghiệp."
- **Câu 8 (Giai đoạn 4 - Câu hỏi ngược & Chào tạm biệt)**: Lời kết luận từ người phỏng vấn thông báo buổi phỏng vấn kết thúc, đồng thời gợi ý và kiểm tra xem ứng viên có câu hỏi ngược nào dành cho nhà tuyển dụng/HR để thể hiện sự quan tâm, sau đó chào tạm biệt lịch sự hay không.
  - expected_answer: "Ứng viên đặt 1-2 câu hỏi thông minh, chủ động gửi lời cảm ơn và chào tạm biệt lịch sự để kết thúc."

Các câu hỏi phải tuân thủ nghiêm ngặt các quy tắc tuyệt đối sau:
1. Thiết kế linh hoạt dựa trên vị trí ứng tuyển và kỹ năng yêu cầu để áp dụng cho mọi ngành nghề khác nhau (IT, Sales, Marketing, Nhân sự, Tài chính, v.v.).
2. BẮT BUỘC Câu 5 phải chứa thông tin bối cảnh cụ thể trích xuất trực tiếp từ các DỰ ÁN (Projects) hoặc KINH NGHIỆM LÀM VIỆC (Work Experience) ghi trong CV của ứng viên. Nếu CV thực sự trống rỗng, hãy mở đầu câu hỏi bằng: "Vì CV của bạn chưa ghi chi tiết các dự án thực tế, tôi muốn hỏi bạn về..." để ứng viên rõ bối cảnh.
3. Ngôn ngữ câu hỏi phải là tiếng Việt tự nhiên, chuyên nghiệp và chuẩn xác thuật ngữ chuyên ngành.

Bạn PHẢI trả về kết quả ở định dạng JSON duy nhất, có cấu trúc như sau:
{
  "questions": [
    {
      "question_text": "Nội dung câu hỏi phỏng vấn...",
      "expected_answer": "Các ý chính, giải pháp cụ thể mà ứng viên cần trình bày...",
      "score_weight": 1
    }
  ]
}`;

  const userPrompt = `Dưới đây là thông tin chi tiết và dữ liệu bối cảnh phỏng vấn của ứng viên:

1. VỊ TRÍ ỨNG TUYỂN (Target Position):
   => ${position}

2. CẤP BẬC KINH NGHIỆM (Experience Level):
   => ${experienceLevel}

3. KỸ NĂNG CHUYÊN MÔN YÊU CẦU (Target Skills):
   => ${skills}

4. NỘI DUNG CHI TIẾT TỪ CV BÓC TÁCH CỦA ỨNG VIÊN (Candidate CV Raw Text):
=========================================
${cvText || "Không có CV tải lên (Hãy sinh câu hỏi thực chiến chuẩn hóa dựa trên Vị trí và Kỹ năng chuyên môn yêu cầu)"}
=========================================

Dựa trên toàn bộ dữ liệu bối cảnh thực tế ở trên, hãy thực thi nhiệm vụ và sinh ra chính xác **8 câu hỏi phỏng vấn** dưới dạng JSON theo đúng rào chắn cấu hình trong System Prompt!`;

  try {
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    // Call Groq API via fetchWithRetry
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

    if (parsedData && Array.isArray(parsedData.questions) && parsedData.questions.length > 0) {
      // Ensure score_weight is a number
      return parsedData.questions.map(q => ({
        question_text: q.question_text,
        expected_answer: q.expected_answer || 'Không có gợi ý câu trả lời mong đợi.',
        score_weight: Number(q.score_weight) || 1
      }));
    } else {
      throw new Error('Groq returned invalid JSON schema');
    }

  } catch (error) {
    console.error('Failed to generate questions from Groq API:', error);
    throw error;
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

