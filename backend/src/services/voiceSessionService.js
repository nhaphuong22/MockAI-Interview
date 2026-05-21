import db from '../db/knex.js';

/**
 * Create a new voice session for an interview
 * @param {number} userId - The ID of the authenticated user
 * @param {number} interviewId - The ID of the interview
 * @returns {Promise<object>} The created voice session record
 */
export const createVoiceSession = async (userId, interviewId) => {
  // 1. Check if the interview exists and belongs to the user
  const interview = await db('interviews')
    .where({ id: interviewId, user_id: userId })
    .first();

  if (!interview) {
    throw new Error('Interview not found or unauthorized');
  }

  // 2. Insert new voice session with CONNECTED status
  const [voiceSession] = await db('voice_sessions')
    .insert({
      interview_id: interviewId,
      status: 'CONNECTED',
      duration_seconds: 0,
      created_at: new Date(),
      updated_at: new Date()
    })
    .returning('*');

  // 3. Update interview status to IN_PROGRESS if it is PENDING
  if (interview.status === 'PENDING') {
    await db('interviews')
      .where({ id: interviewId })
      .update({
        status: 'IN_PROGRESS',
        started_at: new Date(),
        updated_at: new Date()
      });
  }

  return voiceSession;
};
