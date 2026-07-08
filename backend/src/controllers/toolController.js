import { generateQuestionsFromGroq } from '../services/groqService.js';

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
 * API: Tính lương Gross sang Net & Thuế TNCN lũy tiến chi tiết
 */
export const calculateSalary = async (req, res) => {
  try {
    const { 
      grossSalary = 0, 
      dependents = 0, 
      insuranceSalaryOption = 'FULL', // 'FULL' hoặc 'CUSTOM'
      customInsuranceSalary = 0,
      region = 'I'
    } = req.body;

    const parsedGross = Math.max(0, parseFloat(grossSalary));
    const parsedDependents = Math.max(0, parseInt(dependents) || 0);
    const parsedCustomInsurance = Math.max(0, parseFloat(customInsuranceSalary));

    // 1. Xác định mức lương đóng bảo hiểm
    let baseInsuranceSalary = parsedGross;
    if (insuranceSalaryOption === 'CUSTOM') {
      baseInsuranceSalary = parsedCustomInsurance;
    }

    // Giới hạn mức trần đóng bảo hiểm
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

    // 3. Tính thu nhập chịu thuế (Trước giảm trừ)
    const incomeBeforeDeduction = Math.max(0, parsedGross - totalInsuranceEmployee);

    // 4. Các khoản giảm trừ gia cảnh
    const personalDeduction = 11000000; // 11 triệuđ
    const dependentDeduction = parsedDependents * 4400000; // 4.4 triệuđ/người
    const totalDeduction = personalDeduction + dependentDeduction;

    // 5. Thu nhập tính thuế (Sau giảm trừ)
    const taxableIncome = Math.max(0, incomeBeforeDeduction - totalDeduction);

    // 6. Tính thuế thu nhập cá nhân lũy tiến từng phần
    // Chi tiết biểu thuế:
    // Bậc 1: Đến 5tr: 5%
    // Bậc 2: Trên 5tr đến 10tr: 10% (Trừ 250k)
    // Bậc 3: Trên 10tr đến 18tr: 15% (Trừ 750k)
    // Bậc 4: Trên 18tr đến 32tr: 20% (Trừ 1.65tr)
    // Bậc 5: Trên 32tr đến 52tr: 25% (Trừ 3.25tr)
    // Bậc 6: Trên 52tr đến 80tr: 30% (Trừ 5.85tr)
    // Bậc 7: Trên 80tr: 35% (Trừ 9.85tr)
    let tax = 0;
    const taxSteps = []; // Chi tiết từng bậc thuế để vẽ bảng/biểu đồ ở frontend

    if (taxableIncome > 0) {
      let remainingIncome = taxableIncome;

      const steps = [
        { limit: 5000000, rate: 0.05, label: 'Bậc 1 (Đến 5 triệuđ)' },
        { limit: 5000000, rate: 0.10, label: 'Bậc 2 (Trên 5 đến 10 triệuđ)' },
        { limit: 8000000, rate: 0.15, label: 'Bậc 3 (Trên 10 đến 18 triệuđ)' },
        { limit: 14000000, rate: 0.20, label: 'Bậc 4 (Trên 18 đến 32 triệuđ)' },
        { limit: 20000000, rate: 0.25, label: 'Bậc 5 (Trên 32 đến 52 triệuđ)' },
        { limit: 28000000, rate: 0.30, label: 'Bậc 6 (Trên 52 đến 80 triệuđ)' },
        { limit: Infinity, rate: 0.35, label: 'Bậc 7 (Trên 80 triệuđ)' }
      ];

      for (const step of steps) {
        if (remainingIncome <= 0) break;
        const taxableAmountInStep = Math.min(remainingIncome, step.limit);
        const stepTax = taxableAmountInStep * step.rate;
        tax += stepTax;
        
        taxSteps.push({
          label: step.label,
          taxableAmount: taxableAmountInStep,
          rate: step.rate * 100,
          taxAmount: stepTax
        });

        remainingIncome -= taxableAmountInStep;
      }
    }

    // 7. Lương Net thực nhận
    const netSalary = parsedGross - totalInsuranceEmployee - tax;

    // 8. Bảo hiểm người sử dụng lao động đóng thêm (21.5%)
    const bhxhEmployer = bhxhSalary * 0.175;
    const bhytEmployer = bhytSalary * 0.03;
    const bhtnEmployer = bhtnSalary * 0.01;
    const totalInsuranceEmployer = bhxhEmployer + bhytEmployer + bhtnEmployer;
    const totalCostEmployer = parsedGross + totalInsuranceEmployer;

    return res.json({
      success: true,
      data: {
        grossSalary: parsedGross,
        netSalary: Math.round(netSalary),
        tax: Math.round(tax),
        totalInsuranceEmployee: Math.round(totalInsuranceEmployee),
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
      }
    });
  } catch (error) {
    console.error('[calculateSalary Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi tính toán lương.'
    });
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
