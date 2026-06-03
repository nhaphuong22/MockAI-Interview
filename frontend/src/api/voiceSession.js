import { axiosClient } from "./axiosClient";

/**
 * Register a new voice session
 * @param {number} interviewId - The ID of the interview session
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const createVoiceSessionApi = async (interviewId) => {
  return axiosClient.post("/voice-sessions", { interviewId });
};

/**
 * Upload audio file for Speech-To-Text transcription
 * @param {Blob} audioBlob - Audio clip blob to upload
 * @param {string} [draftTranscript] - Native transcription fallback
 * @returns {Promise<{success: boolean, data: {text: string, audioUrl: string}}>}
 */
export const transcribeAudioApi = async (audioBlob, draftTranscript = "") => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "response-audio.webm");
  if (draftTranscript) {
    formData.append("transcript", draftTranscript);
  }

  return axiosClient.post("/voice-sessions/transcribe", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Finalize a voice session and update duration
 * @param {number} sessionId - The ID of the voice session
 * @param {number} durationSeconds - The total duration of the call in seconds
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const completeVoiceSessionApi = async (sessionId, durationSeconds) => {
  return axiosClient.put(`/voice-sessions/${sessionId}/complete`, { durationSeconds });
};

/**
 * Trigger AI evaluation, package results as JSON, upload to Cloudinary and retrieve full assessment
 * @param {number} sessionId - The ID of the voice session
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const assessVoiceSessionApi = async (sessionId) => {
  return axiosClient.post(`/voice-sessions/${sessionId}/assess`);
};
