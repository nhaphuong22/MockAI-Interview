import { axiosClient } from "./axiosClient";

/**
 * Create a new job posting
 * @param {object} jobData
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const createJobApi = async (jobData) => {
  return axiosClient.post("/api/jobs", jobData);
};

/**
 * Get all jobs with filters
 * @param {object} params - Query parameters
 * @returns {Promise<{success: boolean, data: {jobs: array, pagination: object}}>}
 */
export const getJobsApi = async (params = {}) => {
  return axiosClient.get("/api/jobs", { params });
};

/**
 * Get job by ID
 * @param {number} jobId
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const getJobByIdApi = async (jobId) => {
  return axiosClient.get(`/api/jobs/${jobId}`);
};

/**
 * Update job
 * @param {number} jobId
 * @param {object} jobData
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const updateJobApi = async (jobId, jobData) => {
  return axiosClient.put(`/api/jobs/${jobId}`, jobData);
};

/**
 * Delete job
 * @param {number} jobId
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const deleteJobApi = async (jobId) => {
  return axiosClient.delete(`/api/jobs/${jobId}`);
};
