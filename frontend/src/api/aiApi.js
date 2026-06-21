import { axiosClient } from './axiosClient';

/**
 * Send a message to the MockAI Assistant chatbot.
 * @param {string} message - The user's message
 * @param {Array} history - Conversation history array of {role, content} objects
 * @returns {Promise<{reply: string}>}
 */
export const sendChatMessage = (message, history = []) => {
  return axiosClient.post('/ai/chat', { message, history });
};
