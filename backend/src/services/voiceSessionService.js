import db from '../db/knex.js';
import { generateOverallAssessmentFromGroq } from './groqService.js';
import { updateSkillTreeOnInterviewComplete } from './skillTreeService.js';
import { 
  findSessionById, 
  insertSession, 
  updateSession 
} from '../models/voiceSessionModel.js';
import { 
  findInterviewWithOwner, 
  updateInterview, 
  findAssessmentByInterviewId, 
  insertAssessment, 
  updateAssessment 
} from '../models/interviewModel.js';
import { 
  getDefaultLearningPath, 
  getDefaultRadarSkills 
} from '../data/learningPaths.js';
import { NotFoundError, UnauthorizedError } from '../core/customErrors.js';

/**
 * Helper: Extract candidate's name from CV text
 */
function extractNameFromCvText(cvText) {
  if (!cvText) return null;
  const lines = cvText.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  const ignoreList = [
    'cv', 'curriculum vitae', 'sơ yếu lý lịch', 'hồ sơ xin việc', 
    'resume', 'profile', 'thông tin cá nhân', 'personal details',
    'họ và tên', 'họ tên', 'name', 'full name'
  ];

  // Regex nhận dạng định dạng tên tiếng Việt viết hoa chữ cái đầu (2-4 từ)
  const namePattern = /^[A-ZĐĂÂÊÔƠƯ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]+\s+[A-ZĐĂÂÊÔƠƯ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]+(?:\s+[A-ZĐĂÂÊÔƠƯ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]+){0,2}$/;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Bỏ qua các dòng trong danh sách loại trừ hoặc chứa thông tin liên lạc, ký tự đặc biệt
    if (
      ignoreList.some(ig => lowerLine.includes(ig)) ||
      lowerLine.includes('@') ||
      lowerLine.includes('/') ||
      lowerLine.includes(':') ||
      /\d/.test(lowerLine)
    ) {
      continue;
    }
    
    // Kiểm tra nếu dòng khớp cấu trúc tên tiếng Việt viết hoa chữ đầu
    if (namePattern.test(line) && line.length < 40) {
      return line;
    }
  }
  return null;
}


/**
 * Create a new voice session for an interview
 * @param {number} userId - The ID of the authenticated user
 * @param {number} interviewId - The ID of the interview
 * @returns {Promise<object>} The created voice session record
 */
export const createVoiceSession = async (userId, interviewId) => {
  // 1. Check if the interview exists and belongs to the user via interviewModel
  const interview = await findInterviewWithOwner(interviewId, userId);

  if (!interview) {
    throw new UnauthorizedError('Interview not found or unauthorized');
  }

  // 2. Insert new voice session with CONNECTED status via voiceSessionModel
  const [voiceSession] = await insertSession({
    interview_id: interviewId,
    status: 'CONNECTED',
    duration_seconds: 0,
    created_at: new Date(),
    updated_at: new Date()
  });

  // 3. Update interview status to IN_PROGRESS if it is PENDING via interviewModel
  if (interview.status === 'PENDING') {
    await updateInterview(interviewId, {
      status: 'IN_PROGRESS',
      started_at: new Date(),
      updated_at: new Date()
    });
  }

  return voiceSession;
};

/**
 * Finalize a voice session and update duration
 * @param {number} sessionId - The voice session ID
 * @param {number} durationSeconds - Session duration in seconds
 * @param {number} userId - Authenticated user ID
 * @returns {Promise<object>} Updated voice session record
 */
export const finalizeVoiceSession = async (sessionId, durationSeconds, userId) => {
  // 1. Verify voice session exists via voiceSessionModel
  const voiceSession = await findSessionById(sessionId);

  if (!voiceSession) {
    throw new NotFoundError('Voice session not found');
  }

  // 2. Check ownership via interview table via interviewModel
  const interview = await findInterviewWithOwner(voiceSession.interview_id, userId);

  if (!interview) {
    throw new UnauthorizedError('Unauthorized access to this session');
  }

  // 3. Update voice session state via voiceSessionModel
  const [updatedSession] = await updateSession(sessionId, {
    status: 'DISCONNECTED',
    duration_seconds: Number(durationSeconds),
    updated_at: new Date()
  });

  // 4. Update interview status via interviewModel
  await updateInterview(voiceSession.interview_id, {
    status: 'COMPLETED',
    ended_at: new Date(),
    updated_at: new Date()
  });

  return updatedSession;
};

/**
 * Assess a voice session and package results
 * @param {number} sessionId - The voice session ID
 * @param {number} userId - Authenticated user ID
 * @returns {Promise<object>} Assessed report object
 */
export const assessAndPackageResult = async (sessionId, userId) => {
  // 1. Retrieve session and verify ownership via Models
  const voiceSession = await findSessionById(sessionId);

  if (!voiceSession) {
    throw new NotFoundError('Voice session not found');
  }

  const interview = await findInterviewWithOwner(voiceSession.interview_id, userId);

  if (!interview) {
    throw new UnauthorizedError('Unauthorized access to this session');
  }

  const user = await db('users').where({ id: userId }).first();
  
  // Extract candidate name from CV parsed text with fallback to user full_name or email
  let cvText = '';
  if (interview.cv_id) {
    const cvRecord = await db('cvs').where({ id: interview.cv_id }).first();
    if (cvRecord) {
      cvText = cvRecord.parsed_text || '';
    }
  }
  const nameFromCv = extractNameFromCvText(cvText);
  const candidateName = nameFromCv || (user ? user.full_name || user.email : 'Ứng viên');

  // 2. Fetch questions and answers using a join (acceptable to keep in query layer or Model)
  const qaRecords = await db('interview_questions')
    .leftJoin('candidate_answers', 'interview_questions.id', 'candidate_answers.interview_question_id')
    .where('interview_questions.interview_id', interview.id)
    .select(
      'interview_questions.id as question_id',
      'interview_questions.question_text',
      'interview_questions.expected_answer',
      'interview_questions.order_index',
      'candidate_answers.answer_text',
      'candidate_answers.audio_url',
      'candidate_answers.score',
      'candidate_answers.ai_feedback'
    )
    .orderBy('interview_questions.order_index', 'asc');

  // 3. Calculate metrics
  let totalScore = 0;
  let answeredCount = 0;
  const qaDetails = qaRecords.map(qa => {
    const isAnswered = qa.answer_text && 
                       qa.answer_text.trim() !== '' && 
                       qa.answer_text !== 'Không có câu trả lời (Ghi âm không có tín hiệu)';

    const score = isAnswered 
      ? (qa.score !== null && qa.score !== undefined ? qa.score : 80) 
      : 0;

    const answerText = qa.answer_text || 'Không có câu trả lời (Ghi âm không có tín hiệu)';
    
    const feedback = isAnswered 
      ? (qa.ai_feedback || `Câu trả lời khá đầy đủ. Cần bổ sung thêm ví dụ thực tế liên quan đến ${interview.custom_position || 'công việc'}.`) 
      : 'Không có câu trả lời (Ứng viên không trả lời câu hỏi này).';
    
    if (isAnswered) answeredCount++;
    totalScore += score;

    return {
      question: qa.question_text,
      answer: answerText,
      score: score,
      feedback: feedback,
      expected_answer: qa.expected_answer || null,
      audioUrl: qa.audio_url || null
    };
  });

  const overallScore = qaRecords.length > 0 ? Math.round(totalScore / qaRecords.length) : 0;

  // Generate comprehensive professional feedback
  const positionName = interview.custom_position || 'Lập trình viên';
  
  let feedbackSummary = '';
  let radarSkills = null;
  let learningPath = null;

  if (answeredCount === 0) {
    feedbackSummary = `Ứng viên ${candidateName} không trả lời bất kỳ câu hỏi nào trong buổi phỏng vấn này. Vui lòng luyện tập và hoàn thành đầy đủ các câu hỏi để nhận được phân tích và đánh giá năng lực chi tiết từ AI.`;
    radarSkills = {
      technical_depth: 0,
      communication: 0,
      problem_solving: 0,
      confidence: 0,
      star_structure: 0
    };
    learningPath = [
      {
        phase: 'Chặng 1: Bắt đầu Luyện tập (Ngày 1 - 3)',
        topic: 'Làm quen với giao diện phỏng vấn',
        action: 'Thử trả lời các câu hỏi xã giao cơ bản để làm quen với micro và hệ thống.'
      },
      {
        phase: 'Chặng 2: Chuẩn bị nội dung (Ngày 4 - 7)',
        topic: 'Xây dựng câu trả lời mẫu',
        action: 'Chuẩn bị trước các thông tin giới thiệu bản thân và các dự án trong CV.'
      },
      {
        phase: 'Chặng 3: Luyện tập hoàn chỉnh (Ngày 8 - 10)',
        topic: 'Thực hiện phỏng vấn thử',
        action: 'Trả lời đầy đủ cả 8 câu hỏi phỏng vấn để AI đánh giá toàn diện.'
      }
    ];
  } else {
    // Call Qwen 3 32B on Groq to generate a 100% personalized professional assessment
    console.log('Generating dynamic overall assessment using AI Qwen 3...');
    try {
      const aiAssessment = await generateOverallAssessmentFromGroq({
        candidateName,
        position: positionName,
        skills: interview.custom_skills || 'Công nghệ thông tin',
        overallScore,
        qaDetails
      });
      feedbackSummary = aiAssessment.feedback_summary;
      radarSkills = aiAssessment.radar_skills;
      learningPath = aiAssessment.learning_path;
    } catch (aiErr) {
      console.error('Failed to generate AI overall assessment, using professional dynamic fallback:', aiErr.message);
      
      if (overallScore >= 50) {
        feedbackSummary = `Ứng viên ${candidateName} thể hiện tinh thần học hỏi cao và phản xạ khá tốt đối với các câu hỏi vị trí ${positionName}. Cần củng cố thêm các kinh nghiệm thực chiến thực tế liên quan đến ${interview.custom_skills || 'các kỹ năng chuyên môn'} để thuyết phục nhà tuyển dụng hoàn toàn.`;
      } else {
        feedbackSummary = `Ứng viên ${candidateName} cần luyện tập thêm để cải thiện kỹ năng trả lời phỏng vấn cho vị trí ${positionName}. Hãy chú trọng trả lời đầy đủ, chi tiết hơn và củng cố kiến thức chuyên môn về ${interview.custom_skills || 'các kỹ năng yêu cầu'}.`;
      }
      
      // Sử dụng helper tĩnh từ data/learningPaths
      radarSkills = getDefaultRadarSkills(overallScore);
      learningPath = getDefaultLearningPath(candidateName, positionName, interview.custom_skills);
    }
  }

  // 4. Save to assessments table via interviewModel
  const existingAssessment = await findAssessmentByInterviewId(interview.id);

  if (existingAssessment) {
    await updateAssessment(existingAssessment.id, {
      overall_score: overallScore,
      feedback_summary: feedbackSummary,
      learning_path: JSON.stringify(learningPath),
      radar_skills: JSON.stringify(radarSkills),
      qa_details: JSON.stringify(qaDetails),
      updated_at: new Date()
    });
  } else {
      await insertAssessment({
        interview_id: interview.id,
        overall_score: overallScore,
        feedback_summary: feedbackSummary,
        learning_path: JSON.stringify(learningPath),
        radar_skills: JSON.stringify(radarSkills),
        qa_details: JSON.stringify(qaDetails),
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // 4.5. Cập nhật cây kỹ năng của ứng viên
    try {
      await updateSkillTreeOnInterviewComplete(
        interview.user_id,
        interview.custom_skills,
        overallScore
      );
    } catch (stErr) {
      console.error('[SkillTree] Lỗi khi cập nhật cây kỹ năng sau buổi phỏng vấn thử:', stErr.message);
    }

    // 5. Package results as JSON object
  return {
    interview_id: interview.id,
    session_id: Number(sessionId),
    candidate_name: candidateName,
    position: positionName,
    overall_score: overallScore,
    duration_seconds: voiceSession.duration_seconds,
    feedback_summary: feedbackSummary,
    qa_details: qaDetails,
    radar_skills: radarSkills,
    learning_path: learningPath,
    generated_at: new Date()
  };
};
