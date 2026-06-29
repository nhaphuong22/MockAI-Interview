import db from '../db/knex.js';
import { generateQuestionsFromGroq, evaluateCandidateAnswer } from './groqService.js';
import { evaluateCandidateAnswerGemini } from './geminiService.js';
import { 
  findInterviewWithOwner, 
  insertInterview, 
  insertQuestions,
  findQuestionById,
  findExistingAnswer,
  insertAnswer,
  updateAnswer,
  fetchInterviewsByUser
} from '../models/interviewModel.js';
import { NotFoundError, ValidationError } from '../core/customErrors.js';

const STAGE_HINTS = [
  'GĐ1-Nhập cuộc',
  'GĐ2-Điểm mạnh/yếu',
  'GĐ2-Định hướng',
  'GĐ3-Tình huống',
  'GĐ3-Dự án CV',
  'GĐ3-Chuyên môn',
  'GĐ4-Lương/Kỳ vọng',
  'GĐ4-Câu hỏi ngược'
];

/**
 * Initialize a new interview and generate dynamic questions based on CV + Position + Skills
 * Utilizes Qwen 3 32B on Groq for ultra-personalized evaluation questions.
 */
export const initInterviewSession = async ({
  userId,
  jobId = null,
  customPosition = '',
  customSkills = '',
  companyName = '',
  jobDescription = '',
  experienceLevel = 'JUNIOR',
  cvId = null,
  cvText = '',
  type = 'PRACTICE',
  questions = []
}) => {
  // 1. Retrieve the candidate's CV
  let finalCvText = cvText || '';
  let linkedCvId = cvId;

  if (!finalCvText) {
    let targetCv = null;
    if (cvId) {
      targetCv = await db('cvs')
        .where({ id: cvId, user_id: userId })
        .first();
    } else {
      targetCv = await db('cvs')
        .where({ user_id: userId })
        .orderBy('created_at', 'desc')
        .first();
    }
    if (targetCv) {
      finalCvText = targetCv.parsed_text || '';
      linkedCvId = targetCv.id;
    }
  }

  // 2. Create the interview record via interviewModel
  const [interview] = await insertInterview({
    user_id: userId,
    cv_id: linkedCvId || null,
    job_id: jobId,
    custom_position: customPosition || null,
    custom_skills: customSkills || null,
    experience_level: experienceLevel || null,
    type: type,
    status: 'PENDING',
    created_at: new Date(),
    updated_at: new Date()
  });

  // 3. Generate customized interview questions using Qwen 3 32B on Groq or use custom questions
  let finalQuestions = [];
  if (questions && questions.length > 0) {
    console.log(`[InterviewService] Using ${questions.length} pre-defined questions for skill practice.`);
    finalQuestions = questions.map(q => ({
      question_text: q.question_text || q.question,
      expected_answer: q.expected_answer || 'Ứng viên trả lời theo kiến thức chuyên môn.',
      score_weight: q.score_weight || 1
    }));
  } else {
    const aiQuestions = await generateQuestionsFromGroq({
      position: customPosition || 'Software Engineer',
      skills: customSkills || 'Programming',
      companyName: companyName || '',
      jobDescription: jobDescription || '',
      experienceLevel: experienceLevel,
      cvText: finalCvText
    });
    finalQuestions = aiQuestions;
    console.log(`[InterviewService] Interview #${interview.id} — generated ${finalQuestions.length} questions for position "${customPosition || 'N/A'}"`);
    finalQuestions.forEach((q, i) => {
      const preview = (q.question_text || '').slice(0, 70).replace(/\n/g, ' ');
      const isSupplement = /^Câu hỏi bổ sung/i.test(q.question_text || '');
      console.log(`  [Q${i + 1}] ${STAGE_HINTS[i] || 'Extra'}${isSupplement ? ' (legacy supplement)' : ''}: ${preview}...`);
    });
  }

  // 4. Save dynamic questions to interview_questions table via interviewModel
  const questionsToInsert = finalQuestions.map((q, index) => ({
    interview_id: interview.id,
    question_text: q.question_text,
    expected_answer: q.expected_answer,
    score_weight: q.score_weight || 1,
    order_index: (index + 1) * 10, // 10, 20, 30, 40, 50, 60, 70, 80
    created_at: new Date(),
    updated_at: new Date()
  }));

  const insertedQuestions = await insertQuestions(questionsToInsert);
  insertedQuestions.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  return {
    ...interview,
    questions: insertedQuestions
  };
};

/**
 * Submit candidate's answer for a question, evaluate using Groq, and persist to DB
 */
export const submitCandidateAnswer = async (questionId, answerText, audioUrl = null, gazeViolations = 0) => {
  // 1. Fetch targeted question details via interviewModel
  const question = await findQuestionById(Number(questionId));

  if (!question) {
    throw new NotFoundError('Interview question not found');
  }

  // 1.5. Determine interview mode
  const interviewId = question.interview_id;
  const interview = await db('interviews').where({ id: interviewId }).first();
  const isHRInterview = interview && interview.job_id != null;

  let evaluation;
  if (isHRInterview) {
    console.log(`Skipping Gemini evaluation for HR interview (will bulk evaluate at the end).`);
    evaluation = { score: null, feedback: null };
  } else {
    console.log(`Evaluating candidate answer using Groq...`);
    evaluation = await evaluateCandidateAnswer(
      question.question_text,
      question.expected_answer,
      answerText.trim()
    );
  }

  // Tính toán trừ điểm vi phạm ánh mắt
  const penalty = Math.min(50, (gazeViolations || 0) * 10);
  const finalScore = Math.max(0, (evaluation.score || 0) - penalty);

  // Bổ sung phản hồi về vi phạm ánh mắt nếu có
  let feedback = evaluation.feedback || '';
  if (gazeViolations > 0) {
    feedback += `\n\n[Cảnh báo AI]: Phát hiện ${gazeViolations} lần ứng viên nhìn lệch khỏi khung hình phỏng vấn. Điểm số bị trừ ${penalty} điểm.`;
  }

  // 3. Persist to candidate_answers table via interviewModel
  const existingAnswer = await findExistingAnswer(Number(questionId));

  let savedAnswer = null;
  if (existingAnswer) {
    const updateData = {
      answer_text: answerText.trim(),
      ai_feedback: feedback,
      score: finalScore,
      gaze_violations: gazeViolations,
      gaze_score_penalty: penalty,
      updated_at: new Date()
    };
    if (audioUrl) {
      updateData.audio_url = audioUrl;
    }
    const [updated] = await updateAnswer(existingAnswer.id, updateData);
    savedAnswer = updated;
  } else {
    const insertData = {
      interview_question_id: Number(questionId),
      answer_text: answerText.trim(),
      ai_feedback: feedback,
      score: finalScore,
      gaze_violations: gazeViolations,
      gaze_score_penalty: penalty,
      created_at: new Date(),
      updated_at: new Date()
    };
    if (audioUrl) {
      insertData.audio_url = audioUrl;
    }
    const [inserted] = await insertAnswer(insertData);
    savedAnswer = inserted;
  }

  // 4. Dynamic follow-up question logic (only for PRACTICE mode, not for specific skill node practice)
  const isSkillPractice = interview && interview.custom_position && interview.custom_position.startsWith('Luyện tập kỹ năng');
  if (interview && interview.type === 'PRACTICE' && !isSkillPractice && evaluation.is_generic && evaluation.follow_up_question) {
    // Check total questions count
    const allQuestions = await db('interview_questions')
      .where({ interview_id: interviewId })
      .orderBy('order_index', 'asc');

    if (allQuestions.length < 10) {
      // Find index of current question in the sorted array
      const currentIndex = allQuestions.findIndex(q => q.id === question.id);
      let newOrderIndex;
      if (currentIndex !== -1 && currentIndex < allQuestions.length - 1) {
        newOrderIndex = (allQuestions[currentIndex].order_index + allQuestions[currentIndex + 1].order_index) / 2;
      } else {
        newOrderIndex = (question.order_index || 0) + 10;
      }

      const [followUpQuestion] = await db('interview_questions').insert({
        interview_id: interviewId,
        question_text: `[Xoáy sâu] ${evaluation.follow_up_question.question_text}`,
        expected_answer: evaluation.follow_up_question.expected_answer || 'Ứng viên giải thích chi tiết hơn câu trả lời.',
        score_weight: 1,
        order_index: newOrderIndex,
        created_at: new Date(),
        updated_at: new Date()
      }).returning('*');

      console.log(`[Follow-up AI] Interview #${interviewId} — inserted follow-up after Q#${questionId} (generic answer). Total questions: ${allQuestions.length + 1}. Preview: "${(evaluation.follow_up_question.question_text || '').slice(0, 60)}..."`);
    }
  }

  // Fetch updated list of questions sorted by order_index
  const updatedQuestions = await db('interview_questions')
    .where({ interview_id: interviewId })
    .orderBy('order_index', 'asc');

  return {
    ...savedAnswer,
    updatedQuestions
  };
};

/**
 * Fetch and format interview history for candidate
 * @param {number} userId - The authenticated user ID
 * @returns {Promise<Array>} List of user interview sessions
 */
export const getUserInterviews = async (userId) => {
  const interviews = await fetchInterviewsByUser(userId);

  return interviews.map(item => {
    // Parse JSON strings safely
    let parsedRadar = null;
    let parsedPath = null;
    let parsedQa = null;

    try {
      parsedRadar = typeof item.radar_skills === 'string' ? JSON.parse(item.radar_skills) : item.radar_skills;
    } catch (_) {}
    try {
      parsedPath = typeof item.learning_path === 'string' ? JSON.parse(item.learning_path) : item.learning_path;
    } catch (_) {}
    try {
      parsedQa = typeof item.qa_details === 'string' ? JSON.parse(item.qa_details) : item.qa_details;
    } catch (_) {}

    return {
      id: item.id,
      position: item.custom_position || 'Lập trình viên',
      date: item.created_at,
      status: item.status,
      type: item.type,
      overall_score: item.overall_score ?? 80,
      duration_seconds: item.duration || 0,
      feedback_summary: item.feedback_summary || '',
      radar_skills: parsedRadar || {
        technical_depth: 80,
        communication: 80,
        problem_solving: 80,
        confidence: 80,
        star_structure: 80
      },
      learning_path: parsedPath || [],
      qa_details: parsedQa || []
    };
  });
};
