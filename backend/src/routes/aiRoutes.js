import express from 'express';
import { aiChat, triggerDailyQuestions } from '../controllers/aiController.js';

const router = express.Router();

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Gửi tin nhắn đến trợ lý AI (MockAI Assistant)
 *     description: Nhận tin nhắn từ người dùng và lịch sử cuộc trò chuyện, trả về phản hồi từ mô hình AI (Groq). Không yêu cầu đăng nhập.
 *     tags:
 *       - AI Assistant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Gợi ý cho tôi 3 câu hỏi phỏng vấn ReactJS"
 *               history:
 *                 type: array
 *                 description: Lịch sử cuộc trò chuyện (tối đa 10 tin nhắn gần nhất)
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: Phản hồi từ trợ lý AI.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *       400:
 *         description: Tin nhắn không hợp lệ hoặc thiếu nội dung.
 *       502:
 *         description: Lỗi kết nối tới AI provider (Groq API).
 */
router.post('/chat', aiChat);
router.post('/trigger-daily-questions', triggerDailyQuestions);

export default router;
