import cron from 'node-cron';
import db from '../db/knex.js';
import { generateDailyQuestionFromGroq } from './groqService.js';
import { sendRealtimeNotification } from '../socket.js';

// Career tracks to support
const TRACKS = ['frontend', 'backend', 'fullstack', 'design', 'qa', 'pm', 'data_science'];

// Helper function to sleep (for retries with exponential backoff)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate daily questions for all tracks with retry logic and fallback
 */
export const runDailyQuestionGeneration = async () => {
  console.log('[Daily Scheduler] Starting daily question generation for all tracks...');

  for (const track of TRACKS) {
    let success = false;
    let retries = 0;
    let questionData = null;

    while (retries < 3 && !success) {
      try {
        questionData = await generateDailyQuestionFromGroq(track);
        success = true;
      } catch (error) {
        retries++;
        console.error(`[Daily Scheduler] Failed to generate question for track: ${track} (Attempt ${retries}/3). Error:`, error.message);
        if (retries < 3) {
          const delay = 3000 * Math.pow(2, retries - 1);
          console.log(`[Daily Scheduler] Retrying after ${delay}ms...`);
          await sleep(delay);
        }
      }
    }

    // Fallback if Groq API fails completely
    if (!success || !questionData) {
      console.warn(`[Daily Scheduler] Groq API failed for track: ${track}. Using fallback templates.`);
      const fallbacks = {
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
      questionData = fallbacks[track] || {
        question_text: `Hãy trả lời câu hỏi chuyên môn ngắn gọn về ngành nghề: ${track}`,
        sample_answer: `Gợi ý câu trả lời cho ngành nghề: ${track}.`
      };
    }

    try {
      // Save to database
      const [insertedQuestion] = await db('daily_questions')
        .insert({
          track: track,
          question_text: questionData.question_text,
          sample_answer: questionData.sample_answer,
          created_at: db.fn.now()
        })
        .returning('*');

      console.log(`[Daily Scheduler] Saved question for track: ${track} (ID: ${insertedQuestion.id})`);

      // Notify candidates (users with role = 'USER' in RBAC)
      const candidates = await db('users')
        .join('user_roles', 'users.id', '=', 'user_roles.user_id')
        .join('roles', 'user_roles.role_id', '=', 'roles.id')
        .where('roles.name', '=', 'USER')
        .select('users.id');
      for (const candidate of candidates) {
        try {
          const [notification] = await db('notifications')
            .insert({
              user_id: candidate.id,
              type: 'SYSTEM_NOTICE',
              title: `Thử thách phỏng vấn ${track.toUpperCase()} hôm nay!`,
              content: `Câu hỏi hôm nay: "${questionData.question_text.substring(0, 80)}..."`,
              link: `/daily-challenge?track=${track}`,
              reference_id: insertedQuestion.id,
              reference_type: 'daily_question',
              is_read: false
            })
            .returning('*');

          // Send via Socket.io
          sendRealtimeNotification(candidate.id, {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            content: notification.content,
            link: notification.link,
            is_read: notification.is_read,
            created_at: notification.created_at
          });
        } catch (notiError) {
          console.error(`[Daily Scheduler] Failed to create notification for user ${candidate.id}:`, notiError.message);
        }
      }
    } catch (dbError) {
      console.error(`[Daily Scheduler] Failed to save daily question for track: ${track}. Error:`, dbError.message);
    }
  }

  console.log('[Daily Scheduler] Completed daily question generation.');
};

/**
 * Initialize background cron job
 */
export const initDailyScheduler = () => {
  console.log('[Daily Scheduler] Initializing daily challenge scheduler cron job...');
  
  // Schedule to run at 00:00 every day
  // Syntax: 0 0 * * *
  cron.schedule('0 0 * * *', async () => {
    try {
      await runDailyQuestionGeneration();
    } catch (err) {
      console.error('[Daily Scheduler] Critical error in daily cron execution:', err);
    }
  });

  console.log('[Daily Scheduler] Cron job scheduled successfully for 00:00 daily.');
};
