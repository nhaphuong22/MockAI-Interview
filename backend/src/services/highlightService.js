import db from '../db/knex.js';
import { generateHighlightsFromGemini } from './geminiService.js';

/**
 * Generate and save interview highlights for a given interview ID
 * @param {number} interviewId - The ID of the interview session
 * @param {number} totalTabViolations - The number of tab violations
 * @returns {Promise<Object>} The generated and saved highlight record
 */
export const generateInterviewHighlights = async (interviewId, totalTabViolations = 0) => {
  try {
    console.log(`[HighlightService] Generating highlights for Interview ID: ${interviewId}...`);

    // 1. Lấy thông tin chi tiết buổi phỏng vấn
    const interview = await db('interviews').where({ id: interviewId }).first();
    if (!interview) {
      throw new Error(`Interview with ID ${interviewId} not found`);
    }

    // 2. Lấy thông tin ứng viên
    const user = await db('users').where({ id: interview.user_id }).first();
    const candidateName = user ? user.full_name : 'Ứng viên';

    // 3. Lấy vị trí phỏng vấn
    let position = interview.custom_position || 'Vị trí phỏng vấn';
    if (interview.job_id) {
      const job = await db('jobs').where({ id: interview.job_id }).first();
      if (job) {
        position = job.title;
      }
    }

    // 4. Lấy danh sách câu hỏi và câu trả lời để dựng transcript
    const questions = await db('interview_questions')
      .where({ interview_id: interviewId })
      .orderBy('order_index', 'asc');

    const questionIds = questions.map(q => q.id);
    const answers = questionIds.length > 0 
      ? await db('candidate_answers').whereIn('interview_question_id', questionIds)
      : [];

    let totalGazeViolations = 0;
    const qaDetails = questions.map((q) => {
      const ans = answers.find(a => a.interview_question_id === q.id);
      if (ans) {
        totalGazeViolations += ans.gaze_violations || 0;
      }
      return {
        id: q.id,
        question: q.question_text,
        expected_answer: q.expected_answer || '',
        answer: ans ? ans.answer_text : 'Không trả lời',
        gaze_violations: ans ? (ans.gaze_violations || 0) : 0
      };
    });

    // 5. Kiểm tra vi phạm và trạng thái đình chỉ
    const isSuspended = interview.status === 'SUSPENDED';
    
    // Tổng số lỗi vi phạm (bao gồm vi phạm ánh mắt và vi phạm chuyển tab)
    const totalViolations = totalGazeViolations + (totalTabViolations || 0); 

    // 6. Gọi Gemini API để sinh Highlights
    const highlights = await generateHighlightsFromGemini({
      candidateName,
      position,
      qaDetails,
      totalViolations,
      isSuspended
    });

    // 7. Upsert vào bảng interview_highlights
    const existingHighlight = await db('interview_highlights')
      .where({ interview_id: interviewId })
      .first();

    const highlightData = {
      interview_id: interviewId,
      highlight_summary: highlights.highlight_summary,
      is_flagged: highlights.is_flagged,
      timestamps_data: JSON.stringify(highlights.timestamps_data),
      updated_at: new Date()
    };

    let resultRecord;
    if (existingHighlight) {
      const [updated] = await db('interview_highlights')
        .where({ id: existingHighlight.id })
        .update(highlightData)
        .returning('*');
      resultRecord = updated;
      console.log(`[HighlightService] Updated highlights for Interview ID: ${interviewId}`);
    } else {
      highlightData.created_at = new Date();
      const [inserted] = await db('interview_highlights')
        .insert(highlightData)
        .returning('*');
      resultRecord = inserted;
      console.log(`[HighlightService] Inserted new highlights for Interview ID: ${interviewId}`);
    }

    return resultRecord;
  } catch (error) {
    console.error(`[HighlightService] Error generating highlights for Interview ID ${interviewId}:`, error);
    throw error;
  }
};
