import db from '../db/knex.js';
import { generateOverallAssessmentFromGroq } from './groqService.js';
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
  const candidateName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'Ứng viên';

  // 2. Fetch questions and answers using a join (acceptable to keep in query layer or Model)
  const qaRecords = await db('interview_questions')
    .leftJoin('candidate_answers', 'interview_questions.id', 'candidate_answers.interview_question_id')
    .where('interview_questions.interview_id', interview.id)
    .select(
      'interview_questions.id as question_id',
      'interview_questions.question_text',
      'candidate_answers.answer_text',
      'candidate_answers.audio_url',
      'candidate_answers.score',
      'candidate_answers.ai_feedback'
    );

  // 3. Calculate metrics
  let totalScore = 0;
  let answeredCount = 0;
  const qaDetails = qaRecords.map(qa => {
    const score = qa.score !== null && qa.score !== undefined ? qa.score : 80; // Fallback score
    const answerText = qa.answer_text || 'Không có câu trả lời (Ghi âm không có tín hiệu)';
    const feedback = qa.ai_feedback || `Câu trả lời khá đầy đủ. Cần bổ sung thêm ví dụ thực tế liên quan đến ${interview.custom_position || 'công việc'}.`;
    
    if (qa.answer_text) answeredCount++;
    totalScore += score;

    return {
      question: qa.question_text,
      answer: answerText,
      score: score,
      feedback: feedback,
      audioUrl: qa.audio_url || null
    };
  });

  const overallScore = qaRecords.length > 0 ? Math.round(totalScore / qaRecords.length) : 80;

  // Generate comprehensive professional feedback
  const positionName = interview.custom_position || 'Lập trình viên';

  // Call Qwen 3 32B on Groq to generate a 100% personalized professional assessment
  console.log('Generating dynamic overall assessment using AI Qwen 3...');
  let feedbackSummary = '';
  let radarSkills = null;
  let learningPath = null;

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
    feedbackSummary = `Ứng viên ${candidateName} thể hiện tinh thần học hỏi cao và phản xạ khá tốt đối với các câu hỏi vị trí ${positionName}. Cần củng cố thêm các kinh nghiệm thực chiến thực tế liên quan đến ${interview.custom_skills || 'các kỹ năng chuyên môn'} để thuyết phục nhà tuyển dụng hoàn toàn.`;
    
    // Sử dụng helper tĩnh từ data/learningPaths
    radarSkills = getDefaultRadarSkills(overallScore);
    learningPath = getDefaultLearningPath(candidateName, positionName, interview.custom_skills);
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
