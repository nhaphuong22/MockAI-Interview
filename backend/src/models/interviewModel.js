import db from '../db/knex.js';

export const findInterviewById = async (id) => {
  return db('interviews').where({ id }).first();
};

export const findInterviewWithOwner = async (id, userId) => {
  return db('interviews').where({ id, user_id: userId }).first();
};

export const insertInterview = async (interviewData) => {
  return db('interviews').insert(interviewData).returning('*');
};

export const updateInterview = async (id, updateData) => {
  return db('interviews').where({ id }).update(updateData);
};

export const findQuestionById = async (id) => {
  return db('interview_questions').where({ id }).first();
};

export const insertQuestions = async (questionsData) => {
  return db('interview_questions').insert(questionsData).returning('*');
};

export const findExistingAnswer = async (questionId) => {
  return db('candidate_answers').where({ interview_question_id: questionId }).first();
};

export const insertAnswer = async (answerData) => {
  return db('candidate_answers').insert(answerData).returning('*');
};

export const updateAnswer = async (answerId, answerData) => {
  return db('candidate_answers').where({ id: answerId }).update(answerData).returning('*');
};

export const findAssessmentByInterviewId = async (interviewId) => {
  return db('assessments').where({ interview_id: interviewId }).first();
};

export const insertAssessment = async (assessmentData) => {
  return db('assessments').insert(assessmentData);
};

export const updateAssessment = async (assessmentId, assessmentData) => {
  return db('assessments').where({ id: assessmentId }).update(assessmentData);
};

export const fetchInterviewsByUser = async (userId) => {
  return db('interviews')
    .leftJoin('assessments', 'interviews.id', 'assessments.interview_id')
    .leftJoin('voice_sessions', 'interviews.id', 'voice_sessions.interview_id')
    .select([
      'interviews.id',
      'interviews.custom_position',
      'interviews.created_at',
      'interviews.status',
      'interviews.type',
      'assessments.overall_score',
      'assessments.feedback_summary',
      'assessments.radar_skills',
      'assessments.learning_path',
      'assessments.qa_details',
      'voice_sessions.duration_seconds as duration'
    ])
    .where('interviews.user_id', userId)
    .orderBy('interviews.created_at', 'desc');
};
