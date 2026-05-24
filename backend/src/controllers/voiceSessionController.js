import { createVoiceSession } from '../services/voiceSessionService.js';
import { transcribeAudio } from '../services/sttService.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';

/**
 * Handle POST /api/voice-sessions
 * Register a new voice session
 */
export const registerVoiceSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { interviewId, interview_id } = req.body;
    
    // Support both camelCase and snake_case from client
    const targetInterviewId = interviewId || interview_id;

    if (!targetInterviewId) {
      return sendError(res, 400, 'interviewId is required');
    }

    const voiceSession = await createVoiceSession(userId, Number(targetInterviewId));

    return sendResponse(res, 201, voiceSession);

  } catch (error) {
    if (error.message === 'Interview not found or unauthorized') {
      return sendError(res, 404, error.message);
    }
    
    console.error('Register voice session error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

/**
 * Handle POST /api/voice-sessions/transcribe
 * Upload short audio clip and convert to text (Speech-To-Text)
 */
export const transcribeVoiceSession = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No audio file uploaded');
    }

    const { transcript = '' } = req.body;
    
    // Perform STT
    const transcription = await transcribeAudio(req.file.path, transcript);

    // Formulate static file url relative to client
    const audioUrl = `/uploads/audio/${req.file.filename}`;

    return sendResponse(res, 200, {
      text: transcription,
      audioUrl: audioUrl
    });

  } catch (error) {
    console.error('Transcribe audio error:', error);
    return sendError(res, 500, 'Failed to transcribe audio clip');
  }
};

