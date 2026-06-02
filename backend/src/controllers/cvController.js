import { parseCVBuffer, evaluateCV } from '../services/cvService.js';

/**
 * Upload và bóc tách chữ từ CV PDF
 */
export const uploadCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không tìm thấy file CV đính kèm (pdf).' });
    }

    const cvData = await parseCVBuffer(req.file.buffer);

    return res.status(200).json({
      message: 'Bóc tách CV thành công.',
      data: cvData
    });
  } catch (error) {
    if (
      error.message === 'File PDF chứa lượng văn bản quá lớn, không giống một CV thông thường. Vui lòng tải lên CV ngắn gọn hơn!'
    ) {
      return res.status(400).json({ message: error.message });
    }
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

    const evaluationData = await evaluateCV(cv_text, job_description);

    return res.status(200).json({
      message: 'Đánh giá CV thành công (Mô phỏng).',
      data: evaluationData
    });
  } catch (error) {
    console.error('Lỗi khi chấm điểm CV:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống khi chấm điểm.' });
  }
};
