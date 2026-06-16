import { axiosClient } from "./axiosClient";

/**
 * Initialize a new interview session
 * @param {object} data
 * @param {number} [data.jobId] - Optional Job ID
 * @param {string} [data.customPosition] - Custom practice job position
 * @param {string} [data.customSkills] - Custom practice skills (comma separated)
 * @param {string} [data.experienceLevel] - Custom practice experience level
 * @param {string} [data.type] - PRACTICE or REAL
 * @returns {Promise<object>} The created interview session with generated questions
 */
export const initInterviewApi = async (data) => {
  return axiosClient.post("/interviews/init", data);
};

/**
 * Submit candidate's answer for real-time grading and DB storage
 * @param {number} questionId - The ID of the targeted interview question
 * @param {string} answerText - Candidate's text answer
 * @returns {Promise<object>} Graded answer object containing score and ai_feedback
 */
export const submitAnswerApi = async (questionId, answerText, audioUrl = null, gazeViolations = 0) => {
  return axiosClient.post("/interviews/answers", { questionId, answerText, audioUrl, gazeViolations });
};

export const getInterviewHistoryApi = async () => {
  return axiosClient.get("/interviews");
};
