import { axiosClient } from "./axiosClient";

/**
 * Fetch candidate's current daily streak and challenge status
 */
export const getDailyStreakApi = async () => {
  return axiosClient.get("/daily-challenge/streak");
};

/**
 * Fetch the daily mock question for a specific career track
 * @param {string} track - Career track (e.g. 'frontend', 'backend')
 */
export const getDailyQuestionApi = async (track) => {
  return axiosClient.get("/daily-challenge/question", { params: { track } });
};

/**
 * Submit daily challenge audio recording for AI grading
 * @param {FormData} formData - Contains 'audio' file and 'questionId'
 */
export const submitDailyAnswerApi = async (formData) => {
  return axiosClient.post("/daily-challenge/submit", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

/**
 * Fetch top 50 candidates leaderboard rankings
 */
export const getLeaderboardApi = async () => {
  return axiosClient.get("/daily-challenge/leaderboard");
};
