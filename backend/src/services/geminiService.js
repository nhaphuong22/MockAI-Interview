import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { safeParseJSON } from '../helper/jsonHelper.js';

/**
 * Khởi tạo client Gemini. 
 * Hàm này dùng cho HR Interview (để đảm bảo tính ổn định và tách biệt với Practice).
 */
const getGeminiModel = (systemInstruction) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('GEMINI_API_KEY chưa được cấu hình hoặc giá trị không hợp lệ trong file .env ở Backend!');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  // Sử dụng gemini-2.5-flash làm mặc định (bản 2026, ổn định hơn bản latest)
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  
  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
    generationConfig: {
      temperature: 0.3, // Giảm temperature để output JSON ổn định hơn
      responseMimeType: "application/json"
    }
  });
};

/**
 * Generate 8 dynamic, highly-customized interview questions using Gemini (HR Mode)
 */
export const generateQuestionsFromGemini = async ({
  position = '',
  skills = '',
  experienceLevel = 'JUNIOR',
  cvText = ''
}) => {
  if (process.env.GEMINI_API_KEY === 'mock-gemini-key') {
    return [
      { question_text: "Chào bạn, bạn có thể giới thiệu ngắn gọn về bản thân không?", expected_answer: "Ứng viên chào hỏi lịch sự và giới thiệu ngắn gọn.", score_weight: 1 },
      { question_text: "Trong CV, tôi thấy bạn đã làm dự án X. Bạn có thể giải thích cấu trúc dự án này không?", expected_answer: "Ứng viên giải thích chi tiết cấu trúc dự án.", score_weight: 2 },
      { question_text: "Bạn đã sử dụng những công nghệ gì cho dự án Y?", expected_answer: "Liệt kê chính xác công nghệ và mục đích.", score_weight: 1 },
      { question_text: `Với vị trí ${position}, bạn có thể cho biết một tính năng cốt lõi bạn từng triển khai?`, expected_answer: "Phân tích tính năng cốt lõi từ thực tế.", score_weight: 2 },
      { question_text: "Bạn xử lý lỗi và ngoại lệ như thế nào trong dự án cũ?", expected_answer: "Đưa ra chiến lược xử lý lỗi cụ thể.", score_weight: 2 },
      { question_text: "Bạn dùng công cụ gì để tối ưu hiệu suất trong công việc?", expected_answer: "Nêu ra các công cụ tối ưu phù hợp.", score_weight: 1 },
      { question_text: "Trong quá trình làm việc, bạn đã giải quyết conflict với đồng nghiệp thế nào?", expected_answer: "Sử dụng cấu trúc STAR để trả lời.", score_weight: 1 },
      { question_text: "Cảm ơn bạn. Phỏng vấn đến đây là kết thúc. Bạn có câu hỏi nào không?", expected_answer: "Ứng viên cảm ơn và chào tạm biệt.", score_weight: 1 }
    ];
  }

  const systemPrompt = `Bạn là một Chuyên gia Tuyển dụng AI cao cấp chuyên ngành Tech/HR. 
Nhiệm vụ của bạn là dựa vào CV của ứng viên, vị trí ứng tuyển và kỹ năng chuyên môn được cung cấp để sinh ra chính xác **8 câu hỏi phỏng vấn** theo lộ trình bắt buộc sau đây:

- **Câu 1 (Giai đoạn 1 - Small talk)**: Lời chào và gợi ý ứng viên bắt đầu bằng lời xã giao, làm quen và giới thiệu ngắn về bản thân.
  - expected_answer: "Ứng viên cần chủ động thực hiện giao tiếp xã giao (small talk - ví dụ: chúc ngày tốt lành, hỏi thăm nhẹ nhàng) và giới thiệu ngắn gọn, lịch sự về bản thân."
- **Câu 2 & 3 (Giai đoạn 2 - Phỏng vấn chi tiết dự án thực tế trong CV)**: Các câu hỏi khai thác sâu vào các dự án cụ thể và lịch sử làm việc được liệt kê trong CV của ứng viên. Bạn BẮT BUỘC phải trích xuất và gọi tên cụ thể dự án (ví dụ: "dự án website bán quần áo", "dự án quản lý nhân sự"...) hoặc tên công ty cũ có trong CV của ứng viên để làm bối cảnh câu hỏi.
  - expected_answer: "Ứng viên giải trình chi tiết về công nghệ, kiến trúc sử dụng trong dự án của họ, mô tả rõ vai trò và nhiệm vụ cụ thể mà họ tham gia thực hiện."
- **Câu 4, 5, 6, 7 (Giai đoạn 3 - Chuyên môn thực chiến gắn liền với dự án trong CV)**: Các câu hỏi kỹ thuật chuyên môn chuyên sâu liên quan đến vị trí ứng tuyển và các kỹ năng, nhưng phải được đặt trực tiếp vào ngữ cảnh của các dự án hoặc công việc cũ ứng viên đã làm trong CV. KHÔNG đặt câu hỏi lý thuyết suông dạng định nghĩa hoặc câu hỏi chung chung chung không có ngữ cảnh. 
  *Ví dụ thay vì hỏi: "Làm thế nào để tối ưu hiệu năng component React?", hãy hỏi: "Trong dự án website bán quần áo X của bạn sử dụng ReactJS và NodeJS, bạn đã tối ưu hiệu năng hoặc tránh re-render cho các component hiển thị danh sách sản phẩm như thế nào?"*
  - expected_answer: "Ứng viên đưa ra câu trả lời mang chiều sâu kỹ thuật, sử dụng thuật ngữ chuyên môn chính xác, phân tích các giải pháp và so sánh các ưu/nhược điểm rõ ràng."
- **Câu 8 (Giai đoạn 4 - Cảm ơn & Chào tạm biệt)**: Lời kết luận từ người phỏng vấn thông báo rằng buổi phỏng vấn chuyên môn đã kết thúc, nhằm gợi ý và kiểm tra xem ứng viên có chủ động gửi lời cảm ơn và chào tạm biệt lịch thiệp hay không.
  - expected_answer: "Ứng viên chủ động nói lời cảm ơn nhà tuyển dụng/AI và chào tạm biệt một cách chuyên nghiệp, lịch sự để kết thúc buổi phỏng vấn."

Các câu hỏi phải tuân thủ nghiêm ngặt các quy tắc tuyệt đối sau:
1. TUYỆT ĐỐI KHÔNG đặt câu hỏi hoặc đề cập đến bất kỳ chứng chỉ học thuật, chứng chỉ ngoại ngữ (như IELTS, TOEIC) hay chứng chỉ chuyên môn (như AWS, Azure, GCP, CCNA, PMP, Agile/Scrum...) của ứng viên. Hãy phớt lờ hoàn toàn các chứng chỉ này.
2. BẮT BUỘC tất cả câu hỏi kỹ thuật và nghiệp vụ (từ Câu 2 đến Câu 7) phải chứa thông tin bối cảnh cụ thể trích xuất trực tiếp từ các DỰ ÁN (Projects) hoặc KINH NGHIỆM LÀM VIỆC (Work Experience) ghi trong CV của ứng viên. Bạn phải gọi tên các dự án này hoặc tên công ty cũ của họ trong câu hỏi.
3. RÀO CHẮN DỰ PHÒNG: Chỉ khi CV thực sự trống rỗng, không thể bóc tách hoặc không chứa bất kỳ dự án/kinh nghiệm nào, bạn mới được phép đặt câu hỏi tình huống giả lập chung chung dựa trên vị trí ứng tuyển và kỹ năng chuyên môn yêu cầu. Trong trường hợp đó, hãy mở đầu câu hỏi bằng: "Vì CV của bạn chưa ghi chi tiết các dự án thực tế, tôi muốn hỏi bạn về..." để ứng viên rõ bối cảnh.
4. Các câu hỏi chuyên môn phải xoay quanh vị trí ứng tuyển và mức độ kinh nghiệm được yêu cầu (Junior/Middle/Senior).
5. Ngôn ngữ câu hỏi phải là tiếng Việt tự nhiên, chuyên nghiệp và chuẩn xác thuật ngữ chuyên ngành.

Bạn PHẢI trả về kết quả ở định dạng JSON duy nhất, có cấu trúc như sau:
{
  "questions": [
    {
      "question_text": "Nội dung câu hỏi phỏng vấn...",
      "expected_answer": "Ý chính ứng viên cần trình bày (TỐI ĐA 15 TỪ, RẤT NGẮN GỌN).",
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
    const model = getGeminiModel(systemPrompt);
    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    const parsedData = safeParseJSON(text);

    if (parsedData && Array.isArray(parsedData.questions) && parsedData.questions.length > 0) {
      return parsedData.questions.map(q => ({
        question_text: q.question_text,
        expected_answer: q.expected_answer || 'Không có gợi ý câu trả lời mong đợi.',
        score_weight: Number(q.score_weight) || 1
      }));
    } else {
      throw new Error('Gemini returned invalid JSON schema');
    }

  } catch (error) {
    console.error('Failed to generate questions from Gemini API:', error);
    throw error;
  }
};

/**
 * Evaluate candidate's real answer compared to expected answers using Gemini
 */
export const evaluateCandidateAnswerGemini = async (questionText, expectedAnswer, candidateAnswer) => {
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

  let retries = 0;
  while (retries < 3) {
    try {
      const model = getGeminiModel(systemPrompt);
      const result = await model.generateContent(userPrompt);
      const text = result.response.text();
      const parsed = safeParseJSON(text);
      
      const scoreVal = Number(parsed.score);
      return {
        score: !isNaN(scoreVal) ? scoreVal : 80,
        feedback: parsed.feedback || "Câu trả lời khá tốt."
      };
    } catch (err) {
      if (err?.status === 429 && retries < 2) {
        console.warn(`[Gemini] Rate limit exceeded, retrying in ${3000 * (retries + 1)}ms...`);
        await new Promise(resolve => setTimeout(resolve, 3000 * (retries + 1)));
        retries++;
        continue;
      }
      console.error('Failed to evaluate candidate answer via Gemini:', err);
      throw err;
    }
  }
};

/**
 * Generate a comprehensive, personalized overall assessment of the interview using Gemini
 */
export const generateOverallAssessmentFromGemini = async ({
  candidateName = '',
  position = '',
  skills = '',
  qaDetails = [],
  totalViolations = 0
}) => {
  const systemPrompt = `Bạn là một Chuyên gia Đánh giá Tuyển dụng AI cao cấp chuyên ngành Tech/HR.
Nhiệm vụ của bạn là CHẤM ĐIỂM (thang điểm 100) cho TỪNG câu trả lời của ứng viên dựa trên đáp án mong đợi, VÀ phân tích toàn bộ kết quả để đưa ra nhận xét tổng quan.

Quy trình đánh giá phải dựa trên 4 giai đoạn bắt buộc sau:
1. **Giai đoạn 1: Small talk mở đầu**: Nhận xét ở câu trả lời đầu tiên (Câu 1) xem ứng viên có chủ động chào hỏi xã giao thân thiện, lịch thiệp và tự nhiên không.
2. **Giai đoạn 2: Dự án trong CV**: Nhận xét các câu trả lời ở Câu 2 và Câu 3 xem ứng viên giải trình các dự án trong CV thế nào (về techstack, tính chi tiết của dự án, và vai trò thực tế của họ).
3. **Giai đoạn 3: Chuyên môn & Vị trí**: Nhận xét các câu trả lời ở Câu 4, 5, 6, 7 về năng lực chuyên môn chuyên sâu của ứng viên, sự hiểu biết và mức độ phù hợp với vị trí ứng tuyển.
4. **Giai đoạn 4: Cảm ơn & Chào tạm biệt**: Nhận xét ở câu trả lời cuối cùng (Câu 8) xem ứng viên có chủ động nói lời cảm ơn và chào tạm biệt lịch sự, chuyên nghiệp trước khi kết thúc không.

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
  "evaluations": [
    {
      "question_id": 1,
      "score": 85,
      "feedback": "Nhận xét chi tiết cho câu trả lời này..."
    }
  ],
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

4. TỔNG SỐ LẦN VI PHẠM QUY CHẾ (Total Violations):
   => ${totalViolations} lần

5. CHI TIẾT TỪNG CÂU HỎI VÀ CÂU TRẢ LỜI CỦA ỨNG VIÊN (Detailed Q&A Breakdown):
========================================================================
${qaDetails.map((qa) => `
[CÂU HỎI ID ${qa.id}]: ${qa.question}
- Đáp án mong đợi: ${qa.expected_answer}
- Câu trả lời của ứng viên: ${qa.answer}
`).join('\n')}
========================================================================

Dựa trên toàn bộ kết quả phỏng vấn thực tế ở trên, hãy CHẤM ĐIỂM cho từng câu hỏi và sinh ra báo cáo đánh giá tổng quan bằng tiếng Việt dưới dạng JSON theo đúng rào chắn cấu hình trong System Prompt!`;

  try {
    const model = getGeminiModel(systemPrompt);
    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    const parsedData = safeParseJSON(text);

    return {
      evaluations: parsedData?.evaluations || [],
      feedback_summary: parsedData?.feedback_summary || 'Đánh giá tổng quan đã được tạo thành công.',
      radar_skills: parsedData?.radar_skills || {
        technical_depth: 80,
        communication: 80,
        problem_solving: 80,
        confidence: 80,
        star_structure: 80
      },
      learning_path: parsedData?.learning_path || [
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
  } catch (err) {
    console.error('Failed to generate overall assessment via Gemini:', err);
    throw err;
  }
};

/**
 * Generate a master campaign report for a specific job based on all candidates' data
 * This is the "Boss" in the Worker-Boss architecture.
 */
export const generateCampaignReportFromGemini = async ({ jobTitle, requirements, candidatesData }) => {
  const systemPrompt = `Bạn là Giám đốc Tuyển dụng (Head of Talent Acquisition) cao cấp.
Nhiệm vụ của bạn là tổng hợp và phân tích toàn bộ kết quả phỏng vấn của chiến dịch tuyển dụng dựa trên dữ liệu do hệ thống AI chấm điểm (Groq).

Bạn sẽ nhận được:
1. Vị trí tuyển dụng và yêu cầu kỹ năng.
2. Danh sách các ứng viên đã hoàn thành phỏng vấn (bao gồm Tên, Điểm tổng, Nhận xét tóm tắt, và Lỗi vi phạm trung thực).

Yêu cầu Báo Cáo Chiến Dịch:
- Viết bằng tiếng Việt chuyên nghiệp, sắc bén và trực quan.
- Nhận xét chất lượng chung của đợt ứng tuyển này.
- Liệt kê "Bảng Xếp Hạng" (Top ứng viên xuất sắc nhất, có thể đề cập đến 2-3 người nổi bật).
- Phân tích ngắn gọn điểm mạnh, điểm yếu chung của các ứng viên tham gia.
- Đề xuất chiến lược bước tiếp theo cho HR (ví dụ: Ai nên gọi phỏng vấn vòng 2, ai cần cân nhắc do lỗi vi phạm).

Hãy trả về kết quả định dạng JSON duy nhất, KHÔNG chứa markdown hay text thừa:
{
  "statistics": {
    "total_candidates": 3,
    "qualified": 1,
    "rejected": 2,
    "average_score": 60
  },
  "campaign_summary": "Tóm tắt cực kỳ ngắn gọn, đi thẳng vào vấn đề (tối đa 3 câu)...",
  "action_categories": {
    "interview_now": [
      { "name": "Tên ứng viên", "score": 90, "reason": "Điểm mạnh nhất..." }
    ],
    "keep_in_pool": [
      { "name": "Tên ứng viên", "score": 70, "reason": "Tiềm năng nhưng thiếu..." }
    ],
    "reject_immediately": [
      { "name": "Tên ứng viên", "score": 65, "reason": "Lý do loại (VD: Gian lận liếc mắt 5 lần)..." }
    ]
  },
  "skill_gap_analysis": "Phân tích nhanh mảng kỹ năng mà đa số ứng viên đang yếu để HR báo cáo lại với Hiring Manager...",
  "hr_recommendation": "Đề xuất chiến lược ngắn gọn..."
}`;

  const userPrompt = `Dữ liệu Chiến Dịch Tuyển Dụng:
- Vị trí: ${jobTitle}
- Yêu cầu: ${requirements}

- Danh sách Ứng viên:
${candidatesData.map((c, i) => `
[Ứng viên ${i + 1}] Tên: ${c.name}
- Điểm: ${c.score}/100
- Vi phạm quy chế: ${c.violations} lần
- Nhận xét chi tiết từ AI: ${c.summary}
`).join('\n')}

Dựa vào dữ liệu trên, hãy sinh Báo Cáo Tổng Hợp dưới dạng JSON!`;

  try {
    const model = getGeminiModel(systemPrompt);
    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    const parsedData = safeParseJSON(text);

    return {
      statistics: parsedData?.statistics || { total_candidates: candidatesData.length, qualified: 0, rejected: 0, average_score: 0 },
      campaign_summary: parsedData?.campaign_summary || 'Đã tổng hợp thành công báo cáo chiến dịch.',
      action_categories: parsedData?.action_categories || { interview_now: [], keep_in_pool: [], reject_immediately: [] },
      skill_gap_analysis: parsedData?.skill_gap_analysis || 'Chưa có phân tích điểm yếu.',
      hr_recommendation: parsedData?.hr_recommendation || 'Xem xét gọi phỏng vấn các ứng viên điểm cao.'
    };
  } catch (err) {
    console.error('Failed to generate campaign report via Gemini:', err);
    throw err;
  }
};
