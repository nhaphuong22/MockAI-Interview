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

