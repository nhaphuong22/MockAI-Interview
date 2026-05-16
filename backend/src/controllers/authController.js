import { loginUser } from '../services/authService.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required');
    }

    const result = await loginUser(email, password);

    return sendResponse(res, 200, result);

  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return sendError(res, 401, 'Invalid credentials');
    }
    console.error('Login controller error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};
