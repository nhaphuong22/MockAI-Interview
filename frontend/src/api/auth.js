import { axiosClient } from "./axiosClient";

/**
 * Login user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{success: boolean, data: {user: object, token: string}}>}
 */
export const loginApi = async (email, password) => {
  return axiosClient.post("/api/auth/login", { email, password });
};

/**
 * Register user
 * @param {object} data
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} data.fullName
 * @param {string} data.role - 'jobseeker' | 'recruiter'
 * @returns {Promise<{success: boolean, data: {user: object, token: string}}>}
 */
export const registerApi = async (data) => {
  return axiosClient.post("/api/auth/register", data);
};

/**
 * Login user via Google
 * @param {string} idToken
 * @returns {Promise<{success: boolean, data: {user: object, token: string}}>}
 */
export const loginGoogleApi = async (idToken) => {
  return axiosClient.post("/api/auth/google", { idToken });
};

/**
 * Update user profile
 * @param {object} data
 * @param {string} [data.fullName]
 * @param {string} [data.phone]
 * @param {string} [data.address]
 * @param {string} [data.bio]
 * @param {string} [data.avatarUrl]
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const updateProfileApi = async (data) => {
  return axiosClient.put("/api/auth/profile", data);
};


