import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Bóc tách văn bản từ buffer PDF của CV
 * @param {Buffer} fileBuffer - Buffer của tệp PDF tải lên
 * @returns {Promise<{text: string, pages: number, info: object}>} Văn bản bóc tách và thông tin trang
 */
export const parseCVBuffer = async (fileBuffer) => {
  const data = await pdfParse(fileBuffer);
  const extractedText = data.text.trim();

  // Kiểm tra kích thước văn bản
  if (extractedText.length > 20000) {
    throw new Error('File PDF chứa lượng văn bản quá lớn, không giống một CV thông thường. Vui lòng tải lên CV ngắn gọn hơn!');
  }

  return {
    text: extractedText,
    pages: data.numpages,
    info: data.info,
  };
};

/**
 * AI chấm điểm CV dựa trên Job Description (Giả lập)
 * @param {string} cvText - Văn bản bóc tách từ CV
 * @param {string} jobDescription - Mô tả công việc cần đối chiếu
 * @returns {Promise<object>} Điểm số và nhận xét chi tiết
 */
export const evaluateCV = async (cvText, jobDescription) => {
  // Giả lập dữ liệu trả về tạm thời (Có thể nâng cấp tích hợp Llama/Groq ở đây)
  return {
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
};
