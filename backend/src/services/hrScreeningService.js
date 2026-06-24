import { safeParseJSON } from '../helper/jsonHelper.js';

/**
 * Tiền xử lý văn bản CV để xóa bớt rác định dạng và giảm token
 */
const cleanRawText = (text) => {
  if (!text) return "";
  return text
    .replace(/\s+/g, ' ') // Xóa khoảng trắng thừa
    .replace(/[^\w\s\p{P}\p{L}]/gu, '') // Chỉ giữ lại chữ, số và dấu câu (hỗ trợ Unicode tiếng Việt)
    .trim();
};

/**
 * Pipeline Lọc CV dành riêng cho HR
 * Kết hợp Rule-based (thông qua AI check) và Semantic Matching
 * 
 * @param {string} rawCvText - Text bóc tách từ PDF
 * @param {object} job - Thông tin công việc (title, description)
 * @param {Array} jobRequirements - Danh sách tiêu chí đánh giá tự động (is_mandatory, requirement_text)
 * @returns {Promise<object>} Kết quả đánh giá
 */
export const runHrScreeningPipeline = async (rawCvText, job, jobRequirements) => {
  const apiKey = process.env.GROQ_API_KEY;
  const modelName = 'llama-3.3-70b-versatile'; // Sử dụng model Llama 3.3 70B mới nhất của Groq

  if (!apiKey || apiKey === 'gsk_your_groq_api_key_here' || apiKey.trim().length === 0) {
    throw new Error('GROQ_API_KEY chưa được cấu hình. Hệ thống từ chối chấm ảo.');
  }

  const cleanedCv = cleanRawText(rawCvText);

  // Phân tách tiêu chí bắt buộc và không bắt buộc
  const mandatoryCriteria = jobRequirements.filter(req => req.is_mandatory).map(r => r.requirement_text);
  const optionalCriteria = jobRequirements.filter(req => !req.is_mandatory).map(r => r.requirement_text);

  const systemPrompt = `Bạn là một AI Giám đốc Nhân sự (CHRO) sắc sảo, công tâm và có tư duy cấp tiến. 
Nhiệm vụ của bạn là sàng lọc CV ứng viên dựa trên Yêu cầu công việc (Job Description) và Tiêu chí đánh giá tự động.

HƯỚNG DẪN ĐÁNH GIÁ (TUÂN THỦ NGHIÊM NGẶT):

1. BLIND SCREENING (ẨN DANH):
Tuyệt đối BỎ QUA các yếu tố về tên tuổi, giới tính, dân tộc, hình ảnh hoặc tên trường Đại học. Chỉ tập trung vào Năng lực (Competency) và Kinh nghiệm (Experience).

2. KNOCK-OUT RULES (VÒNG GỬI XE):
Bạn phải kiểm tra chặt chẽ các "Tiêu chí bắt buộc". Nếu CV thiếu RÕ RÀNG một tiêu chí bắt buộc (ví dụ: Yêu cầu Tiếng Anh 6.5 nhưng CV ghi 5.0, hoặc yêu cầu 3 năm kinh nghiệm nhưng CV chỉ có 1 năm), đánh giá knockout_status là "REJECTED" và giải thích ở knockout_reason. Nếu đạt hoặc không có thông tin phủ định rõ ràng, cho "PASSED".

3. SEMANTIC MATCHING (CHẤM ĐIỂM NGỮ NGHĨA - KHÔNG CHẤM TỪ KHÓA THÔ):
- Hiểu sự tương đương công nghệ: Nếu JD yêu cầu React, ứng viên có kinh nghiệm chuyên sâu Next.js hoặc Vue.js, hãy ghi nhận và cho điểm cao về tư duy Frontend. Đừng máy móc trừ điểm.
- Đánh giá chiều sâu: Phân biệt giữa việc "Liệt kê kỹ năng" và "Thực sự ứng dụng trong dự án".

4. POSITIVE NOTES & NEGATIVE NOTES (ĐIỂM CỘNG & ĐIỂM TRỪ):
- Positive Notes (Điểm cộng): Đánh giá các tín hiệu tích cực như thành tích xuất sắc chứng minh bằng số liệu thực tế (Data-driven achievements), quản lý ngân sách lớn, tối ưu hệ thống, trình độ vượt trội (Overqualified). Mỗi điểm cộng hãy TĂNG thêm điểm \`semantic_score\`.
- Negative Notes (Điểm trừ): Đánh giá các điểm chưa tốt như nhảy việc liên tục (Job hopping), khoảng trống thời gian (gap year), mô tả chung chung. Mỗi điểm trừ hãy GIẢM đi một chút \`semantic_score\` (khoảng 5-10 điểm), không đánh rớt ngay lập tức.

5. ZERO TOLERANCE (KHÔNG KHOAN NHƯỢNG):
Nếu CV chứa ngôn từ tục tĩu, chửi thề, tiếng lóng vô văn hóa, hoặc có thái độ chống đối/thiếu tôn trọng công ty cũ, BẮT BUỘC đánh rớt (REJECTED) và ép \`semantic_score\` về 0 ngay lập tức, bất kể ứng viên có bao nhiêu kinh nghiệm.

Bạn PHẢI trả về JSON duy nhất theo định dạng sau:
{
  "knockout_status": "PASSED" hoặc "REJECTED",
  "knockout_reason": "Giải thích ngắn gọn tại sao rớt vòng gửi xe (nếu REJECTED). Nếu PASSED thì để chuỗi rỗng.",
  "semantic_score": <Điểm từ 0-100 sau khi đã cộng/trừ các Notes. NẾU dính Zero Tolerance, ép về 0>,
  "evaluation_summary": "Nhận xét tổng quan về ứng viên (Tiếng Việt)",
  "positive_notes": ["Điểm cộng 1", "Điểm cộng 2"],
  "negative_notes": ["Điểm trừ 1", "Điểm trừ 2"],
  "interview_notes": "Lưu ý cho HR vòng phỏng vấn (Ví dụ: Hỏi lý do nhảy việc, kỳ vọng lương với ứng viên Overqualified...)",
  "matched_skills": ["Kỹ năng 1", "Kỹ năng 2"],
  "missing_skills": ["Kỹ năng 1", "Kỹ năng 2"]
}
`;

  const userPrompt = `
THÔNG TIN CÔNG VIỆC:
- Vị trí: ${job.title}
- Mô tả chi tiết: ${job.description || "Không có"}

TIÊU CHÍ ĐÁNH GIÁ TỰ ĐỘNG (TỪ HR):
- Tiêu chí BẮT BUỘC (Knock-out): ${mandatoryCriteria.length > 0 ? mandatoryCriteria.join('; ') : "Không có"}
- Tiêu chí ưu tiên (Optional): ${optionalCriteria.length > 0 ? optionalCriteria.join('; ') : "Không có"}

CV ỨNG VIÊN (Raw Text):
====================
${cleanedCv || "Không có nội dung CV"}
====================

Hãy thực hiện đánh giá toàn diện và trả về kết quả định dạng JSON.`;

  console.log(`[HR Screening] Đang đánh giá CV qua AI Pipeline bằng model ${modelName}...`);
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
      temperature: 0.2 // Giữ temperature thấp để tăng tính logic và chính xác khi đánh giá
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[HR Screening] Groq API Error: ${response.status} - ${errText}`);
    throw new Error(`Lỗi khi gọi AI phân tích CV: ${response.status}`);
  }

  const resData = await response.json();
  const content = resData.choices[0].message.content;
  const parsedData = safeParseJSON(content);

  if (!parsedData) {
    throw new Error('AI trả về dữ liệu không đúng chuẩn JSON.');
  }

  // Đảm bảo cấu trúc trả về chuẩn
  return {
    knockout_status: parsedData.knockout_status || 'PASSED',
    knockout_reason: parsedData.knockout_reason || '',
    semantic_score: typeof parsedData.semantic_score === 'number' ? parsedData.semantic_score : 50,
    evaluation_summary: parsedData.evaluation_summary || 'Đã phân tích CV thành công.',
    positive_notes: Array.isArray(parsedData.positive_notes) ? parsedData.positive_notes : [],
    negative_notes: Array.isArray(parsedData.negative_notes) ? parsedData.negative_notes : [],
    interview_notes: parsedData.interview_notes || '',
    matched_skills: Array.isArray(parsedData.matched_skills) ? parsedData.matched_skills : [],
    missing_skills: Array.isArray(parsedData.missing_skills) ? parsedData.missing_skills : []
  };
};
