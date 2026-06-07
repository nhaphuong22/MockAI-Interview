import { initInterviewSession, submitCandidateAnswer, getUserInterviews } from '../services/interviewService.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';

/**
 * Handle POST /api/interviews/init
 * Start/register a new interview session and fetch dynamic questions
 */
export const startInterviewSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      jobId, 
      applicationId,
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
      applicationId: applicationId ? Number(applicationId) : null,
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
    const { questionId, answerText, audioUrl, audio_url } = req.body;
    
    if (!questionId) {
      return sendError(res, 400, 'questionId is required');
    }
    if (!answerText || answerText.trim().length === 0) {
      return sendError(res, 400, 'answerText is required');
    }

    const actualAudioUrl = audioUrl || audio_url || null;

    const savedAnswer = await submitCandidateAnswer(questionId, answerText, actualAudioUrl);

    return sendResponse(res, 200, {
      message: 'Candidate answer saved and graded successfully',
      data: savedAnswer
    });

  } catch (error) {
    if (error.message === 'Interview question not found') {
      return sendError(res, 404, error.message);
    }
    console.error('Submit answer error:', error);
    return sendError(res, 500, 'Failed to save and grade candidate answer');
  }
};

/**
 * Handle GET /api/interviews
 * Retrieve candidate's interview history
 */
export const getInterviewsHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await getUserInterviews(userId);
    return sendResponse(res, 200, history);
  } catch (error) {
    console.error('Get interview history error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

