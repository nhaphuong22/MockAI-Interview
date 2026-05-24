import { axiosClient } from "./axiosClient";

/**
 * Register a new voice session
 * @param {number} interviewId - The ID of the interview session
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const createVoiceSessionApi = async (interviewId) => {
  return axiosClient.post("/api/voice-sessions", { interviewId });
};
