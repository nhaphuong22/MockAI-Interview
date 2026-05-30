import db from '../db/knex.js';
import { generateQuestionsFromGroq } from './groqService.js';

/**
 * Initialize a new interview and generate dynamic questions based on CV + Position + Skills
 * Utilizes Qwen 3 32B on Groq for ultra-personalized evaluation questions.
 * 
 * @param {object} params
 * @param {number} params.userId - Candidate User ID
 * @param {number} [params.jobId] - Optional Job ID being applied to
 * @param {string} [params.customPosition] - Selected position title (if PRACTICE)
 * @param {string} [params.customSkills] - Comma-separated skills list (if PRACTICE)
 * @param {string} [params.experienceLevel] - Selected experience level
 * @param {number} [params.cvId] - Dynamically uploaded/linked CV ID
 * @param {string} [params.type] - PRACTICE or REAL
 * @returns {Promise<object>} The created interview record with generated questions
 */
export const initInterviewSession = async ({
  userId,
  jobId = null,
  customPosition = '',
  customSkills = '',
  experienceLevel = 'JUNIOR',
  cvId = null,
  cvText = '',
  type = 'PRACTICE'
}) => {
  // 1. Retrieve the candidate's CV (Use transient cvText, linked cvId, or fallback to database CV)
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

  // 2. Create the interview record in PostgreSQL
  const [interview] = await db('interviews')
    .insert({
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
    })
    .returning('*');

  // 3. Generate customized interview questions using Qwen 3 32B on Groq
  const aiQuestions = await generateQuestionsFromGroq({
    position: customPosition || 'Software Engineer',
    skills: customSkills || 'Programming',
    experienceLevel: experienceLevel,
    cvText: finalCvText
  });

  // 4. Save dynamic questions to interview_questions table in database
  const questionsToInsert = aiQuestions.map((q, index) => ({
    interview_id: interview.id,
    question_text: q.question_text,
    expected_answer: q.expected_answer,
    score_weight: q.score_weight || 1,
    created_at: new Date(),
    updated_at: new Date()
  }));

  const insertedQuestions = await db('interview_questions')
    .insert(questionsToInsert)
    .returning('*');

  return {
    ...interview,
    questions: insertedQuestions
  };
};
