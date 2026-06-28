import { sendResponse, sendError } from '../ultils/responseHelper.js';
import { runDailyQuestionGeneration } from '../services/dailySchedulerService.js';

const getSystemPrompt = (isAuthenticated) => `Bạn là MockAI Assistant — trợ lý AI thông minh của nền tảng MockAI Interview.

Nhiệm vụ chính và Giới hạn (BẮT BUỘC TUÂN THỦ):
- RÀO CHẮN NGỮ CẢNH: Bạn CHỈ ĐƯỢC PHÉP trả lời các câu hỏi liên quan trực tiếp đến hệ thống MockAI Interview. TUYỆT ĐỐI KHÔNG trả lời chủ đề ngoài hệ thống.
${isAuthenticated ? "" : '- YÊU CẦU ĐĂNG NHẬP: Khi người dùng muốn dùng các tính năng, hãy nhắc nhở: "Bạn vui lòng đăng ký/đăng nhập để mình hỗ trợ tốt nhất nhé!"'}
- DANH SÁCH TÍNH NĂNG & ĐƯỜNG DẪN CHÍNH XÁC:
  + Luyện tập Phỏng vấn AI: /interview-practice
  + Chấm điểm CV: /cv-review
  + Tìm việc làm: /jobs
  + Quản lý ứng tuyển: /applications
  + Cộng đồng & Blog: /community
  + Hồ sơ cá nhân: /profile

PHONG CÁCH ĐÀM THOẠI & ĐỊNH DẠNG (BẮT BUỘC):
1. TRẢ LỜI NGẮN GỌN & TỰ NHIÊN: Giống như một cuộc trò chuyện thật. Tránh viết một bài văn dài dòng hướng dẫn từ A-Z.
2. CÁ NHÂN HÓA & HỎI NGƯỜI DÙNG: Luôn kết thúc tin nhắn bằng 1 câu hỏi để dẫn dắt họ (VD: "Bạn đã có CV chưa?", "Bạn đang muốn tìm việc trong lĩnh vực nào?").
3. GIỚI HẠN NÚT BẤM (CTA): KHÔNG ĐƯỢC thả quá 3 nút bấm (link) trong cùng 1 tin nhắn. Chỉ chọn 2-3 nút phù hợp nhất với bước tiếp theo của người dùng.
4. THỨ TỰ LOGIC: Nếu họ hỏi cách tìm việc, hãy tư vấn theo thứ tự chuẩn: Cập nhật hồ sơ -> Chấm điểm CV -> Tìm việc -> Ứng tuyển -> Luyện phỏng vấn. Không đưa khuyên luyện phỏng vấn hay quản lý hồ sơ khi họ chưa có CV.
5. MENU HÀNH ĐỘNG RÕ RÀNG: Không nhét link lộn xộn trong câu chữ. Gom tối đa 3 link thành một Menu ở dòng cuối cùng.
  ---
  (Ví dụ bắt buộc:
  ---
  **🚀 Gợi ý cho bạn:**
  [👉 Tôi muốn tìm việc ngay](/jobs)
  [👉 Chấm điểm CV trước](/cv-review))

- Giảm thiểu số lượng emoji, giữ giao diện chuyên nghiệp.
- Luôn ưu tiên trả lời bằng tiếng Việt.`;

/**
 * POST /api/ai/chat
 * Handle AI chatbot messages — open to all users (no auth required)
 */
export const aiChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return sendError(res, 400, 'Nội dung tin nhắn không được để trống.');
    }

    if (message.trim().length > 2000) {
      return sendError(res, 400, 'Tin nhắn quá dài. Vui lòng giữ dưới 2000 ký tự.');
    }

    const apiKey = process.env.GROQ_API_KEY;
    const modelName = process.env.GROQ_CHAT_MODEL || process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

    // If no API key configured, return a polite fallback
    if (!apiKey || apiKey === 'gsk_your_groq_api_key_here' || apiKey.trim().length === 0) {
      return sendResponse(res, 200, {
        reply: 'Xin chào! Tôi là MockAI Assistant. Hiện tại hệ thống đang trong quá trình cấu hình. Vui lòng thử lại sau hoặc liên hệ team hỗ trợ để được giúp đỡ trực tiếp.'
      });
    }

    // Build conversation history for context (max 10 recent messages to save tokens)
    const recentHistory = Array.isArray(history) ? history.slice(-10) : [];
    
    // Check if user is authenticated via Authorization header
    const authHeader = req.headers.authorization;
    const isAuthenticated = authHeader && authHeader.startsWith('Bearer ') && authHeader.length > 20;

    const messages = [
      { role: 'system', content: getSystemPrompt(isAuthenticated) },
      ...recentHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: String(msg.content || '')
      })),
      { role: 'user', content: message.trim() }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('[AI Chat] Groq API error:', response.status, errBody);
      return sendError(res, 502, 'Trợ lý AI tạm thời không khả dụng. Vui lòng thử lại sau.');
    }

    const data = await response.json();
    let reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return sendError(res, 502, 'Trợ lý AI không trả về phản hồi hợp lệ.');
    }

    // Strip <think>...</think> blocks if the user is using a reasoning model (like DeepSeek R1)
    reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    return sendResponse(res, 200, { reply });
  } catch (error) {
    console.error('[AI Chat] Unexpected error:', error);
    return sendError(res, 500, 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại.');
  }
};

/**
 * POST /api/ai/trigger-daily-questions
 * Manually trigger daily question generation for all tracks (for testing)
 */
export const triggerDailyQuestions = async (req, res) => {
  try {
    await runDailyQuestionGeneration();
    return sendResponse(res, 200, { message: 'Đã trigger thành công sinh câu hỏi hàng ngày cho các track.' });
  } catch (error) {
    console.error('[AI Trigger Daily] Error:', error);
    return sendError(res, 500, `Lỗi khi sinh câu hỏi: ${error.message}`);
  }
};
