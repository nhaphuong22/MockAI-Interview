import { axiosClient } from "./axiosClient";

/**
 * Login user with email and password.
 * @param {string} email
 * @param {string} password
 */
export const loginApi = async (email, password) => {
  return axiosClient.post("/auth/login", { email, password });
};

/**
 * Register a new user. Sends verification email — does NOT auto-login.
 * @param {object} data
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} data.fullName
 * @param {string} data.role - 'jobseeker' | 'recruiter'
 */
export const registerApi = async (data) => {
  return axiosClient.post("/auth/register", data);
};

/**
 * Upload avatar image
 * @param {File} file
 */
export const uploadAvatarApi = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  return axiosClient.post("/auth/upload-avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Login user via Google OAuth.
 * @param {string} idToken
 */
export const loginGoogleApi = async (idToken) => {
  return axiosClient.post("/auth/google", { idToken });
};

/**
 * Logout current user (clears server-side session if applicable).
 */
export const logoutApi = async () => {
  return axiosClient.post("/auth/logout");
};

/**
 * Verify email using the token from the verification link.
 * @param {string} token
 */
export const verifyEmailApi = async (token, email = null) => {
  return axiosClient.post("/auth/verify-email", { token, email });
};

/**
 * Resend email verification link to the given email.
 * @param {string} email
 */
export const resendVerificationApi = async (email) => {
  return axiosClient.post("/auth/resend-verification", { email });
};

/**
 * Request a password reset email.
 * @param {string} email
 */
export const forgotPasswordApi = async (email) => {
  return axiosClient.post("/auth/forgot-password", { email });
};

/**
 * Reset password using the token from the reset email link.
 * @param {string} token
 * @param {string} password - New password
 */
export const resetPasswordApi = async (token, password) => {
  return axiosClient.post("/auth/reset-password", { token, password });
};

/**
 * Change password for the currently authenticated user.
 * @param {string} currentPassword
 * @param {string} newPassword
 */
export const changePasswordApi = async (currentPassword, newPassword) => {
  return axiosClient.post("/auth/change-password", { currentPassword, newPassword });
};

/**
 * Update user profile.
 * @param {object} data
 */
export const updateProfileApi = async (data) => {
  return axiosClient.put("/auth/profile", data);
};
