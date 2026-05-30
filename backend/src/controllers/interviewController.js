import { initInterviewSession } from '../services/interviewService.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';
import db from '../db/knex.js';
import { evaluateCandidateAnswer } from '../services/groqService.js';

/**
 * Handle POST /api/interviews/init
 * Start/register a new interview session and fetch dynamic questions
 */
export const startInterviewSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      jobId, 
      customPosition, 
      customSkills, 
      experienceLevel, 
      cvId,
      cv_id,
      cvText,
      type = 'PRACTICE' 
    } = req.body;

    const sessionData = await initInterviewSession({
      userId,
      jobId: jobId ? Number(jobId) : null,
      customPosition,
      customSkills,
      experienceLevel,
      cvId: cvId || cv_id ? Number(cvId || cv_id) : null,
      cvText,
      type
    });

    return sendResponse(res, 201, sessionData);

  } catch (error) {
    console.error('Start interview session error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

/**
 * Handle POST /api/interviews/answers
 * Submit candidate's answer for a question, evaluate using Groq, and persist to DB
 */
export const submitAnswer = async (req, res) => {
  try {
    const { questionId, answerText } = req.body;
    
    if (!questionId) {
      return sendError(res, 400, 'questionId is required');
    }
    if (!answerText || answerText.trim().length === 0) {
      return sendError(res, 400, 'answerText is required');
    }

    // 1. Fetch targeted question details
    const question = await db('interview_questions')
      .where({ id: Number(questionId) })
      .first();

    if (!question) {
      return sendError(res, 404, 'Interview question not found');
    }

    // 2. Perform AI evaluation using Groq Qwen 3 32B model
    console.log('Evaluating candidate answer using Qwen 3 32B...');
    const evaluation = await evaluateCandidateAnswer(
      question.question_text,
      question.expected_answer,
      answerText.trim()
    );

    // 3. Persist to candidate_answers table
    const existingAnswer = await db('candidate_answers')
      .where({ interview_question_id: Number(questionId) })
      .first();

    let savedAnswer = null;
    if (existingAnswer) {
      const [updated] = await db('candidate_answers')
        .where({ id: existingAnswer.id })
        .update({
          answer_text: answerText.trim(),
          ai_feedback: evaluation.feedback,
          score: evaluation.score,
          updated_at: new Date()
        })
        .returning('*');
      savedAnswer = updated;
    } else {
      const [inserted] = await db('candidate_answers')
        .insert({
          interview_question_id: Number(questionId),
          answer_text: answerText.trim(),
          ai_feedback: evaluation.feedback,
          score: evaluation.score,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');
      savedAnswer = inserted;
    }

    return sendResponse(res, 200, {
      message: 'Candidate answer saved and graded successfully',
      data: savedAnswer
    });

  } catch (error) {
    console.error('Submit answer error:', error);
    return sendError(res, 500, 'Failed to save and grade candidate answer');
  }
};
