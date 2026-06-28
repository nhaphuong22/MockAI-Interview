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
    console.warn('[Groq API] Gặp lỗi rate limit hoặc sự cố kết nối, kích hoạt bộ câu hỏi tĩnh dự phòng chất lượng cao:', error.message);
    
    const fallbackQuestions = [];
    const skillList = (skills || 'kỹ năng chuyên môn').split(',').map(s => s.trim()).filter(Boolean);
    
    const targetSkills = skillList.length > 0 ? skillList : ['kỹ năng chuyên môn'];

    targetSkills.forEach((sk) => {
      fallbackQuestions.push(
        {
          question_text: `Hãy trình bày những kiến thức cơ bản nhất về kỹ năng/công nghệ ${sk} và cách bạn áp dụng nó trong dự án thực tế?`,
          expected_answer: `Ứng viên giải thích được khái niệm cốt lõi của ${sk}, các thành phần quan trọng và liên hệ cụ thể tới một bài toán/dự án cũ.`,
          score_weight: 1
        },
        {
          question_text: `Khi làm việc với ${sk}, những thách thức lớn nhất về mặt kiến trúc hoặc tối ưu hiệu năng mà bạn từng gặp phải là gì? Bạn đã giải quyết như thế nào?`,
          expected_answer: `Nêu được vấn đề kỹ thuật đặc thù của ${sk} (ví dụ re-render, blocking event loop, query performance...) và mô tả chi tiết phương án giải quyết (cách config, code optimization...).`,
          score_weight: 1
        },
        {
          question_text: `Làm thế nào bạn so sánh ${sk} với các giải pháp công nghệ thay thế khác trong cùng lĩnh vực? Ưu nhược điểm là gì?`,
          expected_answer: `So sánh đa chiều về hiệu năng, tốc độ phát triển, độ phức tạp của mã nguồn và tính mở rộng.`,
          score_weight: 1
        }
      );
    });

    if (fallbackQuestions.length < 3) {
      fallbackQuestions.push({
        question_text: "Hãy tự đánh giá mức độ thành thạo của bản thân đối với các kỹ năng được yêu cầu trong buổi phỏng vấn hôm nay?",
        expected_answer: "Ứng viên tự tin nêu các thế mạnh và hướng học tập cải thiện kỹ năng.",
        score_weight: 1
      });
    }

    return fallbackQuestions.slice(0, 5);
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




