import { sendResponse, sendError } from '../ultils/responseHelper.js';

// System prompt defining the AI assistant's persona and scope
const SYSTEM_PROMPT = `Bạn là MockAI Assistant — trợ lý AI thông minh của nền tảng MockAI Interview, một nền tảng hỗ trợ việc làm cao cấp tích hợp AI tại Việt Nam.

Nhiệm vụ chính của bạn:
- Tư vấn, hỗ trợ ứng viên và nhà tuyển dụng sử dụng nền tảng MockAI Interview.
- Giúp ứng viên chuẩn bị phỏng vấn: gợi ý câu hỏi theo lĩnh vực, hướng dẫn trả lời, mẹo phỏng vấn.
- Tư vấn nghề nghiệp: định hướng ngành, xây dựng lộ trình phát triển, đánh giá kỹ năng.
- Giải thích cách dùng các tính năng trên nền tảng (ATS CV Scoring, AI Interview, Job Board...).
- Trả lời câu hỏi về ngành tuyển dụng, xu hướng thị trường lao động tại Việt Nam.

Phong cách giao tiếp:
- Thân thiện, chuyên nghiệp, nhiệt tình và dễ hiểu.
- Ưu tiên trả lời bằng tiếng Việt, trừ khi người dùng hỏi bằng tiếng Anh.
- Câu trả lời ngắn gọn, súc tích. Dùng danh sách khi liệt kê nhiều điểm.
- Nếu không biết hoặc ngoài phạm vi hiểu biết, hãy thành thật và đề xuất liên hệ team hỗ trợ.

Giới hạn:
- Không tạo nội dung có hại, không phù hợp hoặc vi phạm pháp luật.
- Không cung cấp thông tin cá nhân, tài chính, y tế cụ thể mang tính chất tư vấn chuyên sâu.`;

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
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
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
