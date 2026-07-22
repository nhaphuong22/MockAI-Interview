import { generateQuestionsFromGroq } from '../services/groqService.js';
import { sendResponse, sendError } from '../ultils/responseHelper.js';

// ─── LƯƠNG CƠ SỞ & LƯƠNG TỐI THIỂU VÙNG (CẬP NHẬT 2024-2026) ──────────────────
const LƯƠNG_CƠ_SỞ = 2340000; // Áp dụng từ 01/07/2024
const MỨC_ĐÓNG_TỐI_ĐA_BHXH_BHYT = 20 * LƯƠNG_CƠ_SỞ; // 46,800,000đ

const REGION_SALARIES = {
  I: 4960000,
  II: 4410000,
  III: 3860000,
  IV: 3450000
};

/**
 * Hàm tính toán chi tiết Lương Gross sang Net
 */
function computeGrossToNet({
  grossSalary,
  dependents = 0,
  insuranceSalaryOption = 'FULL',
  customInsuranceSalary = 0,
  region = 'I'
}) {
  const parsedGross = Math.max(0, parseFloat(grossSalary) || 0);
  const parsedDependents = Math.max(0, parseInt(dependents) || 0);
  const parsedCustomInsurance = Math.max(0, parseFloat(customInsuranceSalary) || 0);

  // 1. Mức lương đóng bảo hiểm
  let baseInsuranceSalary = parsedGross;
  if (insuranceSalaryOption === 'CUSTOM') {
    baseInsuranceSalary = parsedCustomInsurance;
  }

  const minRegionSalary = REGION_SALARIES[region] || REGION_SALARIES.I;
  const MỨC_ĐÓNG_TỐI_ĐA_BHTN = 20 * minRegionSalary;

  const bhxhSalary = Math.min(baseInsuranceSalary, MỨC_ĐÓNG_TỐI_ĐA_BHXH_BHYT);
  const bhytSalary = Math.min(baseInsuranceSalary, MỨC_ĐÓNG_TỐI_ĐA_BHXH_BHYT);
  const bhtnSalary = Math.min(baseInsuranceSalary, MỨC_ĐÓNG_TỐI_ĐA_BHTN);

  // 2. Bảo hiểm người lao động đóng (10.5%)
  const bhxhEmployee = bhxhSalary * 0.08;
  const bhytEmployee = bhytSalary * 0.015;
  const bhtnEmployee = bhtnSalary * 0.01;
  const totalInsuranceEmployee = bhxhEmployee + bhytEmployee + bhtnEmployee;

  // 3. Thu nhập trước thuế
  const incomeBeforeDeduction = Math.max(0, parsedGross - totalInsuranceEmployee);

  // 4. Giảm trừ gia cảnh
  const personalDeduction = 11000000;
  const dependentDeduction = parsedDependents * 4400000;
  const totalDeduction = personalDeduction + dependentDeduction;

  // 5. Thu nhập tính thuế
  const taxableIncome = Math.max(0, incomeBeforeDeduction - totalDeduction);

  // 6. Thuế TNCN lũy tiến 7 bậc
  let tax = 0;
  const taxSteps = [];

  if (taxableIncome > 0) {
    let remainingIncome = taxableIncome;
    const steps = [
      { limit: 5000000, rate: 0.05, label: 'Bậc 1 (Đến 5 triệu đ)' },
      { limit: 5000000, rate: 0.10, label: 'Bậc 2 (Trên 5 đến 10 triệu đ)' },
      { limit: 8000000, rate: 0.15, label: 'Bậc 3 (Trên 10 đến 18 triệu đ)' },
      { limit: 14000000, rate: 0.20, label: 'Bậc 4 (Trên 18 đến 32 triệu đ)' },
      { limit: 20000000, rate: 0.25, label: 'Bậc 5 (Trên 32 đến 52 triệu đ)' },
      { limit: 28000000, rate: 0.30, label: 'Bậc 6 (Trên 52 đến 80 triệu đ)' },
      { limit: Infinity, rate: 0.35, label: 'Bậc 7 (Trên 80 triệu đ)' }
    ];

    for (const step of steps) {
      if (remainingIncome <= 0) break;
      const taxableAmountInStep = Math.min(remainingIncome, step.limit);
      const stepTax = taxableAmountInStep * step.rate;
      tax += stepTax;
      
      taxSteps.push({
        label: step.label,
        taxableAmount: Math.round(taxableAmountInStep),
        rate: step.rate * 100,
        taxAmount: Math.round(stepTax)
      });

      remainingIncome -= taxableAmountInStep;
    }
  }

  // 7. Lương Net thực nhận
  const netSalary = Math.max(0, parsedGross - totalInsuranceEmployee - tax);

  // 8. Bảo hiểm người sử dụng lao động đóng thêm (21.5%)
  const bhxhEmployer = bhxhSalary * 0.175;
  const bhytEmployer = bhytSalary * 0.03;
  const bhtnEmployer = bhtnSalary * 0.01;
  const totalInsuranceEmployer = bhxhEmployer + bhytEmployer + bhtnEmployer;
  const totalCostEmployer = parsedGross + totalInsuranceEmployer;

  return {
    grossSalary: Math.round(parsedGross),
    netSalary: Math.round(netSalary),
    tax: Math.round(tax),
    totalInsuranceEmployee: Math.round(totalInsuranceEmployee),
    incomeBeforeDeduction: Math.round(incomeBeforeDeduction),
    deductions: {
      personal: personalDeduction,
      dependents: dependentDeduction,
      total: totalDeduction
    },
    taxableIncome: Math.round(taxableIncome),
    employeeInsurance: {
      bhxh: Math.round(bhxhEmployee),
      bhyt: Math.round(bhytEmployee),
      bhtn: Math.round(bhtnEmployee),
      total: Math.round(totalInsuranceEmployee)
    },
    employerInsurance: {
      bhxh: Math.round(bhxhEmployer),
      bhyt: Math.round(bhytEmployer),
      bhtn: Math.round(bhtnEmployer),
      total: Math.round(totalInsuranceEmployer)
    },
    totalCostEmployer: Math.round(totalCostEmployer),
    taxSteps
  };
}

/**
 * API: Tính lương Gross <-> Net & Thuế TNCN lũy tiến chi tiết
 */
export const calculateSalary = async (req, res) => {
  try {
    const { 
      type = 'GROSS_TO_NET', // 'GROSS_TO_NET' hoặc 'NET_TO_GROSS'
      grossSalary = 0, 
      netSalaryInput = 0,
      dependents = 0, 
      insuranceSalaryOption = 'FULL', // 'FULL' hoặc 'CUSTOM'
      customInsuranceSalary = 0,
      region = 'I'
    } = req.body;

    let calcResult = null;

    if (type === 'NET_TO_GROSS') {
      const targetNet = Math.max(0, parseFloat(netSalaryInput || grossSalary) || 0);
      
      // Binary search để tìm Gross tạo ra targetNet
      let low = targetNet;
      let high = targetNet * 2.5 + 50000000;
      let bestGross = low;

      for (let i = 0; i < 60; i++) {
        const mid = (low + high) / 2;
        const testRes = computeGrossToNet({
          grossSalary: mid,
          dependents,
          insuranceSalaryOption,
          customInsuranceSalary,
          region
        });

        if (Math.abs(testRes.netSalary - targetNet) < 1) {
          bestGross = mid;
          break;
        }

        if (testRes.netSalary < targetNet) {
          low = mid;
        } else {
          high = mid;
        }
        bestGross = mid;
      }

      calcResult = computeGrossToNet({
        grossSalary: bestGross,
        dependents,
        insuranceSalaryOption,
        customInsuranceSalary,
        region
      });
      // Chuẩn hóa netSalary theo targetNet nếu khoảng chênh lệch nhỏ hơn 100đ
      if (Math.abs(calcResult.netSalary - targetNet) <= 100) {
        calcResult.netSalary = targetNet;
      }
    } else {
      calcResult = computeGrossToNet({
        grossSalary,
        dependents,
        insuranceSalaryOption,
        customInsuranceSalary,
        region
      });
    }

    return sendResponse(res, 200, {
      ...calcResult,
      calcType: type
    });
  } catch (error) {
    console.error('[calculateSalary Error]:', error);
    return sendError(res, 500, 'Lỗi tính toán lương.');
  }
};

/**
 * API: Sinh câu hỏi phỏng vấn thông minh dựa trên thông tin vị trí + kỹ năng
 */
export const generateQuestions = async (req, res) => {
  try {
    const { position = '', skills = '', experienceLevel = 'JUNIOR' } = req.body;

    if (!position.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp vị trí ứng tuyển (Job Title).'
      });
    }

    // Gọi hàm có sẵn từ Groq Service để sinh câu hỏi
    const questions = await generateQuestionsFromGroq({
      position,
      skills,
      experienceLevel,
      cvText: 'Không có CV' // Gọi không cần CV vì đây là công cụ ôn tập chung
    });

    // Định dạng lại cấu trúc trả về gọn nhẹ hơn cho Frontend
    const formattedQuestions = questions.map((q, idx) => ({
      id: idx + 1,
      question: q.question_text || q.question,
      suggestedAnswer: q.expected_answer || q.suggested_answer || 'Ứng viên phân tích vấn đề logic, rõ ràng.',
    }));

    return res.json({
      success: true,
      data: formattedQuestions
    });
  } catch (error) {
    console.error('[generateQuestions Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Không thể sinh câu hỏi bằng AI.'
    });
  }
};
