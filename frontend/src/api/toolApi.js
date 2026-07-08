import { axiosClient } from "./axiosClient";

export const toolApi = {
  /**
   * Tính lương Gross sang Net & chi tiết thuế TNCN
   * @param {Object} data - { grossSalary, dependents, insuranceSalaryOption, customInsuranceSalary }
   */
  calculateSalary: (data) => {
    return axiosClient.post("/tools/calculate-salary", data);
  },

  /**
   * Sinh câu hỏi phỏng vấn bằng AI
   * @param {Object} data - { position, skills, experienceLevel }
   */
  generateQuestions: (data) => {
    return axiosClient.post("/tools/generate-questions", data);
  }
};
