/**
 * Groq API AI Service
 * Connects to Groq Cloud API using Qwen 3 32B model to generate highly customized tech questions
 * based on candidate's raw CV text, targeted position and skills.
 */

/**
 * Clean markdown blocks and parse JSON safely
 */
const safeParseJSON = (str) => {
  let clean = str.trim();
  if (clean.startsWith('```json')) {
    clean = clean.slice(7);
  } else if (clean.startsWith('```')) {
    clean = clean.slice(3);
  }
  if (clean.endsWith('```')) {
    clean = clean.slice(0, -3);
  }
  return JSON.parse(clean.trim());
};

/**
 * Generate 5 dynamic, highly-customized interview questions using Qwen 3 32B on Groq
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

  // 2. Formulate Prompt
  const systemPrompt = `Bạn là một Chuyên gia Tuyển dụng AI cao cấp chuyên ngành Tech/HR. 
Nhiệm vụ của bạn là dựa vào CV của ứng viên, vị trí tuyển dụng ứng tuyển và các kỹ năng chuyên môn được cung cấp để sinh ra chính xác 5 câu hỏi phỏng vấn độc bản, chuyên sâu và mang tính thực chiến cao.

Các câu hỏi phải tuân thủ nghiêm ngặt các quy tắc:
1. May đo trực tiếp theo kinh nghiệm, dự án, công nghệ cốt lõi và các điểm nổi bật (hoặc điểm thiếu sót tiềm ẩn) trích xuất trực tiếp từ CV ứng viên.
2. Xoay quanh vị trí ứng tuyển và mức độ kinh nghiệm được yêu cầu (Junior/Middle/Senior).
3. Đánh giá sâu sắc các kỹ năng chuyên môn thực chiến thông qua các câu hỏi tình huống thực tế hoặc thiết kế hệ thống.
4. KHÔNG đặt các câu hỏi lý thuyết suông dễ học vẹt (ví dụ: 'React là gì?' hay 'Khái niệm OOP'). Hãy đặt câu hỏi bắt đầu bằng tình huống hoặc yêu cầu so sánh/tối ưu.
5. Ngôn ngữ câu hỏi phải là tiếng Việt tự nhiên, chuyên nghiệp và chuẩn xác thuật ngữ chuyên ngành.

Bạn PHẢI trả về kết quả ở định dạng JSON duy nhất, có cấu trúc như sau:
{
  "questions": [
    {
      "question_text": "Nội dung câu hỏi phỏng vấn chi tiết...",
      "expected_answer": "Các ý chính, giải pháp kỹ thuật cụ thể mà ứng viên cần trình bày để đạt điểm tối đa...",
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
${cvText || "Không có CV tải lên (Hãy sinh câu hỏi thực chiến chuẩn hóa dựa trên Vị trí và Kỹ năng yêu cầu)"}
=========================================

Dựa trên toàn bộ dữ liệu bối cảnh thực tế ở trên, hãy thực thi nhiệm vụ và sinh ra chính xác 5 câu hỏi phỏng vấn dưới dạng JSON theo đúng rào chắn cấu hình trong System Prompt!`;

  try {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    
    // Call Groq API via Node.js global fetch
    const response = await fetch(url, {
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

  const systemPrompt = `Bạn là một Chuyên gia Đánh giá Phỏng vấn AI tech. Nhiệm vụ của bạn là đánh giá câu trả lời của ứng viên so với câu hỏi và đáp án mong đợi.
Hãy chấm điểm từ 0 đến 100 dựa trên độ sâu kỹ thuật, tính liên quan và chính xác. Đồng thời đưa ra 1-2 câu nhận xét chuyên sâu bằng tiếng Việt về điểm mạnh hoặc điểm cần cải thiện.
Bạn PHẢI trả về duy nhất định dạng JSON có cấu trúc sau:
{
  "score": 85,
  "feedback": "Nhận xét chi tiết của bạn..."
}`;

  const userPrompt = `Câu hỏi phỏng vấn:
=> ${questionText}

Đáp án mong đợi:
=> ${expectedAnswer}

Câu trả lời thực tế của ứng viên:
=> ${candidateAnswer}`;

  try {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const response = await fetch(url, {
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
      feedback: parsed.feedback || "Câu trả lời khá tốt."
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
 * @returns {Promise<{feedback_summary: string, radar_skills: object, learning_path: Array}>}
 */
export const generateOverallAssessmentFromGroq = async ({
  candidateName = '',
  position = '',
  skills = '',
  overallScore = 80,
  qaDetails = []
}) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'gsk_your_groq_api_key_here' || apiKey.trim().length === 0) {
    throw new Error('GROQ_API_KEY chưa được cấu hình hoặc giá trị không hợp lệ trong file .env ở Backend! Vui lòng thiết lập key Groq thực tế để đánh giá tổng quan.');
  }

  const systemPrompt = `Bạn là một Chuyên gia Đánh giá Tuyển dụng AI cao cấp chuyên ngành Tech/HR.
Nhiệm vụ của bạn là phân tích toàn bộ kết quả của cuộc phỏng vấn dựa trên thông tin ứng viên, vị trí tuyển dụng, các kỹ năng yêu cầu và danh sách chi tiết các câu trả lời thực tế của ứng viên kèm theo điểm số và nhận xét của từng câu.

Dựa vào đó, bạn PHẢI tạo ra một báo cáo đánh giá tổng quan cá nhân hóa 100% (KHÔNG SỬ DỤNG MẪU TĨNH), bao gồm:
1. Nhận xét tổng quan (feedback_summary): Đánh giá chân thực, thẳng thắn nhưng mang tính xây dựng về năng lực của ứng viên qua buổi phỏng vấn này. Nhận xét cụ thể những điểm tốt và những câu trả lời còn thiếu sót kỹ thuật hoặc chưa cấu trúc tốt (khoảng 3-4 câu).
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

Bạn PHẢI trả về kết quả dưới định dạng JSON duy nhất như sau:
{
  "feedback_summary": "Nhận xét tổng quan...",
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

5. CHI TIẾT TỪNG CÂU HỎI VÀ CÂU TRẢ LỜI CỦA ỨNG VIÊN (Detailed Q&A Breakdown):
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
    const response = await fetch(url, {
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

