/**
 * Định dạng mức lương của tin tuyển dụng theo tiếng Việt chu đáo
 * @param {number} salaryMin - Mức lương tối thiểu
 * @param {number} salaryMax - Mức lương tối đa
 * @param {boolean} isSalaryVisible - Trạng thái hiển thị lương công khai
 * @returns {string} Chuỗi hiển thị mức lương
 */
export const formatSalary = (salaryMin, salaryMax, isSalaryVisible) => {
  let salaryStr = 'Thỏa thuận';
  if (isSalaryVisible && (salaryMin || salaryMax)) {
    const formatNum = (num) => num ? num.toLocaleString('vi-VN') + 'đ' : '';
    if (salaryMin && salaryMax) {
      salaryStr = `${formatNum(salaryMin)} - ${formatNum(salaryMax)}`;
    } else if (salaryMin) {
      salaryStr = `Từ ${formatNum(salaryMin)}`;
    } else if (salaryMax) {
      salaryStr = `Đến ${formatNum(salaryMax)}`;
    }
  }
  return salaryStr;
};
