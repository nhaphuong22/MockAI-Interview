import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Upload và bóc tách chữ từ CV PDF
 */
export const uploadCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không tìm thấy file CV đính kèm (pdf).' });
    }

    const data = await pdfParse(req.file.buffer);
    
    // data.text chứa nội dung text thô của PDF
    // data.numpages chứa số trang
    return res.status(200).json({
      message: 'Bóc tách CV thành công.',
      data: {
        text: data.text.trim(),
        pages: data.numpages,
        info: data.info,
      }
    });
  } catch (error) {
    console.error('Lỗi khi đọc file CV:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi khi bóc tách file CV.', error: error.message });
  }
};

/**
 * AI chấm điểm CV dựa trên Job Description
 */
export const scoreCV = async (req, res) => {
  try {
    const { cv_text, job_description } = req.body;
    
    if (!cv_text) {
      return res.status(400).json({ message: 'Vui lòng cung cấp nội dung CV (cv_text).' });
    }

    // TODO: Tích hợp Llama-3 AI ở đây để chấm điểm
    // Nếu có job_description thì chấm theo JD, nếu không có thì đánh giá tổng quan
    // Giả lập dữ liệu trả về tạm thời
    const simulatedResponse = {
      overallScore: 85,
      sections: [
        { name: "Thông tin cá nhân", score: 95, feedback: "Đầy đủ và rõ ràng" },
        { name: "Kinh nghiệm làm việc", score: 90, feedback: "Phù hợp với JD, có số liệu cụ thể" },
        { name: "Kỹ năng", score: 80, feedback: "Nên bổ sung thêm các kỹ năng được yêu cầu trong JD" },
        { name: "Học vấn", score: 85, feedback: "Đạt yêu cầu" },
        { name: "Định dạng & ATS", score: 75, feedback: "Cần chứa nhiều keyword từ JD hơn để tối ưu ATS" },
      ],
      strengths: [
        "Kinh nghiệm làm việc phù hợp với yêu cầu của vị trí",
        "Có nhiều kỹ năng công nghệ liên quan",
        "Trình bày rõ ràng"
      ],
      improvements: [
        "Cần nhấn mạnh thêm các dự án thực tế liên quan trực tiếp đến JD",
        "Bổ sung thêm một số từ khóa kỹ năng mềm",
        "Cải thiện mô tả kinh nghiệm cho sát với yêu cầu JD hơn"
      ]
    };

    return res.status(200).json({
      message: 'Đánh giá CV thành công (Mô phỏng).',
      data: simulatedResponse
    });
  } catch (error) {
    console.error('Lỗi khi chấm điểm CV:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống khi chấm điểm.' });
  }
};
