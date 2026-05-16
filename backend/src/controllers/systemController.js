import { sendResponse } from '../ultils/responseHelper.js';

export const getStatus = (req, res) => {
  return sendResponse(res, 200, {
    message: 'MockAI-Interview Backend is running!',
    timestamp: new Date().toISOString()
  });
};
