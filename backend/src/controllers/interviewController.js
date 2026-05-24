import { initInterviewSession } from '../services/interviewService.js';
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
      customPosition, 
      customSkills, 
      experienceLevel, 
      type = 'PRACTICE' 
    } = req.body;

    const sessionData = await initInterviewSession({
      userId,
      jobId: jobId ? Number(jobId) : null,
      customPosition,
      customSkills,
      experienceLevel,
      type
    });

    return sendResponse(res, 201, sessionData);

  } catch (error) {
    console.error('Start interview session error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};
