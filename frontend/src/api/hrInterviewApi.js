import axiosClient from './axiosClient';

// Candidate khởi động phiên phỏng vấn HR thật
export const initHRInterviewApi = (applicationId) => {
  return axiosClient.post('/interviews/hr/init', { applicationId });
};

// Candidate lấy kết quả sau khi xong
export const getHRInterviewResultApi = async (interviewId) => {
  return await axiosClient.get(`/interviews/hr/result/${interviewId}`);
};

/**
 * Lấy toàn bộ Q&A (Transcript) của phiên phỏng vấn (Dành cho HR)
 */
export const getHRInterviewTranscriptApi = async (interviewId) => {
  return await axiosClient.get(`/interviews/hr/transcript/${interviewId}`);
};

/**
 * Hoàn tất phỏng vấn HR (gọi AI tổng hợp kết quả)
 * @param {string|number} interviewId 
 * @param {number} totalTabViolations
 */
export const finishHRInterviewApi = async (interviewId, totalTabViolations) => {
  return await axiosClient.post('/interviews/hr/finish', {
    interviewId,
    totalTabViolations
  });
};

// HR mời ứng viên phỏng vấn AI
export const inviteAIInterviewApi = (applicationId) => {
  return axiosClient.patch(`/applications/${applicationId}/invite-ai-interview`);
};
