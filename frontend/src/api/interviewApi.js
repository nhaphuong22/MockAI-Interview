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
  return axiosClient.post("/api/interviews/init", data);
};
