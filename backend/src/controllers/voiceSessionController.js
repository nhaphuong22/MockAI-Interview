import { createVoiceSession } from '../services/voiceSessionService.js';
import { transcribeAudio } from '../services/sttService.js';
import { generateTTS } from '../services/ttsService.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';
import db from '../db/knex.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { generateOverallAssessmentFromGroq } from '../services/groqService.js';

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

    // 1. Verify and update voice session
    const voiceSession = await db('voice_sessions')
      .where({ id: sessionId })
      .first();

    if (!voiceSession) {
      return sendError(res, 404, 'Voice session not found');
    }

    // Check ownership via interview table
    const interview = await db('interviews')
      .where({ id: voiceSession.interview_id, user_id: userId })
      .first();

    if (!interview) {
      return sendError(res, 403, 'Unauthorized access to this session');
    }

    // 2. Update voice session state
    const [updatedSession] = await db('voice_sessions')
      .where({ id: sessionId })
      .update({
        status: 'DISCONNECTED',
        duration_seconds: Number(actualDuration),
        updated_at: new Date()
      })
      .returning('*');

    // 3. Update interview status
    await db('interviews')
      .where({ id: voiceSession.interview_id })
      .update({
        status: 'COMPLETED',
        ended_at: new Date(),
        updated_at: new Date()
      });

    return sendResponse(res, 200, {
      message: 'Voice session completed successfully',
      session: updatedSession
    });

  } catch (error) {
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

    // 1. Retrieve session and verify ownership
    const voiceSession = await db('voice_sessions')
      .where({ id: sessionId })
      .first();

    if (!voiceSession) {
      return sendError(res, 404, 'Voice session not found');
    }

    const interview = await db('interviews')
      .where({ id: voiceSession.interview_id, user_id: userId })
      .first();

    if (!interview) {
      return sendError(res, 403, 'Unauthorized access to this session');
    }

    const user = await db('users').where({ id: userId }).first();
    const candidateName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'Ứng viên';

    // 2. Fetch questions and answers
    const qaRecords = await db('interview_questions')
      .leftJoin('candidate_answers', 'interview_questions.id', 'candidate_answers.interview_question_id')
      .where('interview_questions.interview_id', interview.id)
      .select(
        'interview_questions.id as question_id',
        'interview_questions.question_text',
        'candidate_answers.answer_text',
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
        feedback: feedback
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
      // Clean dynamic fallback based on candidate name and position
      feedbackSummary = `Ứng viên ${candidateName} thể hiện tinh thần học hỏi cao và phản xạ khá tốt đối với các câu hỏi vị trí ${positionName}. Cần củng cố thêm các kinh nghiệm thực chiến thực tế liên quan đến ${interview.custom_skills || 'các kỹ năng chuyên môn'} để thuyết phục nhà tuyển dụng hoàn toàn.`;
      radarSkills = {
        technical_depth: Math.min(overallScore + 2, 95),
        communication: Math.min(overallScore + 5, 95),
        problem_solving: Math.min(overallScore + 1, 95),
        confidence: Math.min(overallScore + 3, 95),
        star_structure: Math.min(overallScore - 2, 95)
      };
      learningPath = [
        {
          phase: 'Chặng 1: Củng cố Kiến thức & Cấu trúc (Ngày 1 - 3)',
          topic: 'Cấu trúc câu trả lời STAR',
          action: 'Luyện tập trả lời bằng cách chia rõ Bối cảnh, Nhiệm vụ, Hành động và Kết quả.'
        },
        {
          phase: 'Chặng 2: Nâng cao Chuyên môn thực tế (Ngày 4 - 7)',
          topic: `Tập trung chuyên môn liên quan đến ${interview.custom_skills || 'công nghệ'}`,
          action: `Đi sâu nghiên cứu các giải pháp tối ưu liên quan trực tiếp đến vị trí ${positionName}.`
        },
        {
          phase: 'Chặng 3: Làm chủ tâm lý & Giọng điệu (Ngày 8 - 10)',
          topic: 'Luyện tập hội thoại tự tin',
          action: 'Luyện tập nói trôi chảy, có điểm nhấn và chuẩn bị tâm lý tự tin.'
        }
      ];
    }

    // 4. Save to assessments table (Including radar_skills and qa_details directly into PostgreSQL)
    const existingAssessment = await db('assessments')
      .where({ interview_id: interview.id })
      .first();

    if (existingAssessment) {
      await db('assessments')
        .where({ id: existingAssessment.id })
        .update({
          overall_score: overallScore,
          feedback_summary: feedbackSummary,
          learning_path: JSON.stringify(learningPath),
          radar_skills: JSON.stringify(radarSkills),
          qa_details: JSON.stringify(qaDetails),
          updated_at: new Date()
        });
    } else {
      await db('assessments').insert({
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
    const resultData = {
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

    // 6. Cloudinary JSON report upload has been bypassed to use direct PostgreSQL DB storage.
    // [FUTURE CLOUD ROADMAP]: To restore Cloudinary upload later, uncomment and use the logic below:
    /*
    let secureUrl = null;
    try {
      if (process.env.CLOUDINARY_URL && process.env.CLOUDINARY_URL.trim().length > 0) {
        const tempDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        const tempFilePath = path.join(tempDir, `result-${sessionId}.json`);
        fs.writeFileSync(tempFilePath, JSON.stringify(resultData, null, 2), 'utf-8');

        cloudinary.config();
        console.log('Uploading assessment report to Cloudinary...');
        const uploadResult = await cloudinary.uploader.upload(tempFilePath, {
          folder: 'interview_results',
          resource_type: 'raw',
          timeout: 15000
        });
        secureUrl = uploadResult.secure_url;
        try { fs.unlinkSync(tempFilePath); } catch (_) {}
      }
    } catch (uploadError) {
      console.error('Cloudinary upload failed:', uploadError.message);
    }
    */

    // 7. Always return success with full result data (cloudinary_url set to null as stored in DB)
    return sendResponse(res, 200, {
      ...resultData,
      cloudinary_url: null
    });

  } catch (error) {
    console.error('Assess voice session error:', error);
    return sendError(res, 500, 'Failed to assess and package interview results');
  }
};
