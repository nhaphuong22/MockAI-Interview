import { createVoiceSession, finalizeVoiceSession, assessAndPackageResult } from '../services/voiceSessionService.js';
import { transcribeAudio } from '../services/sttService.js';
import { generateTTS } from '../services/ttsService.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';
import cloudinary from '../core/cloudinary.js';
import fs from 'fs';

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
    
    // Perform STT (Speech-to-Text translation)
    const transcription = await transcribeAudio(req.file.path, transcript);

    // Upload the audio recording file to Cloudinary with fallback support
    let audioUrl = '';
    try {
      console.log('Uploading candidate voice recording to Cloudinary...');
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'auto',
        folder: 'interview-audios'
      });
      audioUrl = uploadResult.secure_url;
      console.log('Voice recording successfully uploaded to Cloudinary:', audioUrl);
    } catch (uploadError) {
      console.error('Failed to upload candidate audio to Cloudinary, falling back to local file:', uploadError);
      // Fallback to local server static path
      audioUrl = `/uploads/audio/${req.file.filename}`;
    }

    // Clean up/Delete temporary local audio file on the server to save storage space
    try {
      await fs.promises.unlink(req.file.path);
      console.log('Temporary local audio file deleted successfully.');
    } catch (unlinkError) {
      console.error('Failed to delete temporary local audio file:', unlinkError);
    }

    return sendResponse(res, 200, {
      text: transcription,
      audioUrl: audioUrl
    });

  } catch (error) {
    console.error('Transcribe audio error:', error);
    return sendError(res, 500, 'Failed to transcribe audio clip');
  }
};

/**
 * Handle POST /api/voice-sessions/tts
 * Generate and stream Text-To-Speech audio of interview question (Fallback)
 */
export const getTTSAudio = async (req, res) => {
  try {
    const { text, lang = 'vi-VN' } = req.body;

    if (!text) {
      return sendError(res, 400, 'text is required to generate speech');
    }

    const audioBuffer = await generateTTS(text, lang);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400'
    });

    return res.send(audioBuffer);

  } catch (error) {
    console.error('TTS Controller error:', error);
    return sendError(res, 500, 'Failed to generate speech audio');
  }
};

/**
 * Handle PUT /api/voice-sessions/:id/complete
 * Finalize a voice session and update duration
 */
export const completeVoiceSession = async (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    const { durationSeconds, duration_seconds } = req.body;
    const userId = req.user.id;

    const actualDuration = durationSeconds !== undefined ? durationSeconds : duration_seconds;

    if (actualDuration === undefined) {
      return sendError(res, 400, 'durationSeconds is required');
    }

    const updatedSession = await finalizeVoiceSession(sessionId, actualDuration, userId);

    return sendResponse(res, 200, {
      message: 'Voice session completed successfully',
      session: updatedSession
    });

  } catch (error) {
    if (error.message === 'Voice session not found') {
      return sendError(res, 404, error.message);
    }
    if (error.message === 'Unauthorized access to this session') {
      return sendError(res, 403, error.message);
    }
    console.error('Complete voice session error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

/**
 * Handle POST /api/voice-sessions/:id/assess
 * Trigger AI evaluation, package result as JSON, upload to Cloudinary and return URL
 */
export const assessVoiceSession = async (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    const userId = req.user.id;

    const resultData = await assessAndPackageResult(sessionId, userId);

    // Return success with full result data (cloudinary_url set to null as stored in DB)
    return sendResponse(res, 200, {
      ...resultData,
      cloudinary_url: null
    });

  } catch (error) {
    if (error.message === 'Voice session not found') {
      return sendError(res, 404, error.message);
    }
    if (error.message === 'Unauthorized access to this session') {
      return sendError(res, 403, error.message);
    }
    console.error('Assess voice session error:', error);
    return sendError(res, 500, 'Failed to assess and package interview results');
  }
};

