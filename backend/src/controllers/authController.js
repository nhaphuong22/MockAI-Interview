import { loginUser, registerUser, loginGoogleUser, updateUserProfile } from '../services/authService.js';
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

export const register = async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    if (!email || !password || !fullName) {
      return sendError(res, 400, 'Email, password, and full name are required');
    }

    // Map role from frontend (jobseeker -> USER, recruiter -> HR)
    let roleName = 'USER';
    if (role) {
      const normalizedRole = role.toUpperCase();
      if (normalizedRole === 'RECRUITER' || normalizedRole === 'HR') {
        roleName = 'HR';
      } else if (normalizedRole === 'JOBSEEKER' || normalizedRole === 'USER') {
        roleName = 'USER';
      } else if (normalizedRole === 'ADMIN') {
        roleName = 'ADMIN';
      }
    }

    const result = await registerUser(email, password, fullName, roleName);

    return sendResponse(res, 201, result);

  } catch (error) {
    if (error.message === 'Email already registered') {
      return sendError(res, 400, 'Email is already in use');
    }
    console.error('Register controller error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

export const loginGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return sendError(res, 400, 'ID Token is required');
    }

    const result = await loginGoogleUser(idToken);

    return sendResponse(res, 200, result);
  } catch (error) {
    if (
      error.message === 'Invalid Google Token' || 
      error.message === 'Token client ID mismatch' || 
      error.message === 'Token issuer mismatch'
    ) {
      return sendError(res, 401, error.message);
    }
    console.error('Google login controller error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phone, address, bio, avatarUrl } = req.body;

    const result = await updateUserProfile(userId, { fullName, phone, address, bio, avatarUrl });

    return sendResponse(res, 200, result);
  } catch (error) {
    if (error.message === 'User not found') {
      return sendError(res, 404, 'User not found');
    }
    console.error('Update profile controller error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};



