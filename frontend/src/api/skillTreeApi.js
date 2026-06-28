import { axiosClient } from "./axiosClient";

/**
 * Fetch candidate's current skill tree graph
 */
export const getSkillTreeApi = async () => {
  return axiosClient.get("/skill-tree");
};

/**
 * Fetch detailed resources for a specific skill node
 */
export const getSkillNodeDetailsApi = async (nodeId, label) => {
  return axiosClient.get(`/skill-tree/node/${nodeId}`, { params: { label } });
};
