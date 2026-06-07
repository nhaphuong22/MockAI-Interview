import { parseCVBuffer, evaluateCV } from '../services/cvService.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import cloudinary from '../core/cloudinary.js';

/**
 * Helper: Upload file buffer lên Cloudinary dạng raw
 */
const uploadToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    const cleanName = path.parse(originalName).name.replace(/[^a-zA-Z0-9_]/g, '_');
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'cvs',
        public_id: `${Date.now()}-${cleanName}.pdf`
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload và bóc tách chữ từ CV PDF
 */
export const uploadCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không tìm thấy file CV đính kèm (pdf).' });
    }

    const cvData = await parseCVBuffer(req.file.buffer);

    // Upload buffer lên Cloudinary
    console.log(`[CV] Đang upload buffer CV của file ${req.file.originalname} lên Cloudinary...`);
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    const fileUrl = cloudinaryResult.secure_url;
    console.log(`[CV] Upload Cloudinary thành công! URL: ${fileUrl}`);

    return res.status(200).json({
      message: 'Bóc tách CV thành công.',
      data: {
        ...cvData,
        fileUrl: fileUrl
      }
    });
  } catch (error) {
    if (
      error.message === 'File PDF chứa lượng văn bản quá lớn, không giống một CV thông thường. Vui lòng tải lên CV ngắn gọn hơn!'
    ) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Lỗi khi đọc và upload file CV:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi khi tải CV lên Cloudinary.', error: error.message });
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

/**
 * Xuất PDF báo cáo đánh giá CV
 */
export const exportPdf = async (req, res) => {
  try {
    const { overallScore, strengths, improvements, sections } = req.body;

    if (!overallScore || !sections) {
      return res.status(400).json({ message: 'Thiếu dữ liệu đánh giá để xuất PDF.' });
    }

    // Bật bufferPages để có thể vẽ Header/Footer ở cuối
    const doc = new PDFDocument({ margin: 0, size: 'A4', bufferPages: true });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="CV_Review_Report.pdf"');
    
    doc.pipe(res);

    // Hỗ trợ tiếng Việt bằng font Arial trên Windows (fallback về mặc định nếu không có)
    const fontPath = 'C:/Windows/Fonts/arial.ttf';
    const fontBoldPath = 'C:/Windows/Fonts/arialbd.ttf';
    
    if (fs.existsSync(fontPath)) {
      doc.registerFont('Regular', fontPath);
      if (fs.existsSync(fontBoldPath)) {
        doc.registerFont('Bold', fontBoldPath);
      } else {
        doc.registerFont('Bold', fontPath);
      }
      doc.font('Regular');
    } else {
      doc.registerFont('Regular', 'Helvetica');
      doc.registerFont('Bold', 'Helvetica-Bold');
      doc.font('Regular');
    }

    // Bảng màu (Premium Colors)
    const primary = '#0ea5e9';
    const dark = '#0f172a';
    const textMain = '#334155';
    const success = '#10b981';
    const warning = '#f59e0b';
    const bgLight = '#f8fafc';

    // 1. VẼ HEADER ĐẬM CHẤT CÔNG NGHỆ (Full Width)
    doc.rect(0, 0, doc.page.width, 120).fill(dark);
    
    // Header text
    doc.fillColor('white').font('Bold').fontSize(26).text('MOCKAI INTERVIEW', 50, 40);
    doc.fillColor(primary).font('Regular').fontSize(14).text('BÁO CÁO PHÂN TÍCH CV (AI GENERATED)', 50, 75);

    // Điểm tổng quan ở góc phải Header
    // Box chứa điểm (overallScore) được dịch sang trái để không bị đè lên / 100
    doc.fillColor(primary).font('Bold').fontSize(45).text(overallScore, doc.page.width - 180, 33, { align: 'right', width: 80 });
    doc.fillColor('white').font('Regular').fontSize(16).text('/ 100', doc.page.width - 90, 58);

    // Cài đặt lề cho nội dung chính
    doc.x = 50;
    doc.y = 150; 

    // Bắt sự kiện tạo trang mới để reset lề
    doc.on('pageAdded', () => {
      doc.x = 50;
      doc.y = 50;
    });

    // 2. VŨ KHÍ BÍ MẬT (Điểm Mạnh)
    doc.fillColor(success).font('Bold').fontSize(16).text('Vũ Khí Bí Mật (Điểm Mạnh)');
    doc.moveDown(0.5);
    doc.fillColor(textMain).font('Regular').fontSize(12);
    (strengths || []).forEach(s => {
      doc.text(`•  ${s}`, { lineGap: 5 });
    });
    doc.moveDown(1.5);

    // 3. ĐIỂM MÙ CẦN KHẮC PHỤC (Điểm Yếu)
    doc.fillColor(warning).font('Bold').fontSize(16).text('Điểm Mù Cần Khắc Phục');
    doc.moveDown(0.5);
    doc.fillColor(textMain).font('Regular').fontSize(12);
    (improvements || []).forEach(i => {
      doc.text(`•  ${i}`, { lineGap: 5 });
    });
    doc.moveDown(1.5);

    // 4. PHÂN TÍCH KỸ NĂNG CHI TIẾT
    doc.fillColor(primary).font('Bold').fontSize(16).text('Phân Tích Kỹ Năng Chi Tiết');
    doc.moveDown(0.5);

    (sections || []).forEach(sec => {
      // Đẩy sang trang mới nếu phần này có khả năng bị cắt đôi (tràn lề dưới)
      if (doc.y > doc.page.height - 100) {
        doc.addPage();
      }

      const startY = doc.y;
      
      // Vẽ hộp nền xám nhạt cho tiêu đề section
      doc.rect(50, startY, doc.page.width - 100, 30).fill(bgLight);
      
      let scoreColor = sec.score >= 80 ? success : sec.score >= 60 ? primary : warning;

      doc.fillColor(dark).font('Bold').fontSize(12).text(sec.name, 65, startY + 9);
      doc.fillColor(scoreColor).font('Bold').fontSize(12).text(`${sec.score}/ 100`, 50, startY + 9, { align: 'right', width: doc.page.width - 115 });
      
      // Vẽ nội dung đánh giá bên dưới hộp
      doc.y = startY + 40;
      doc.fillColor(textMain).font('Regular').fontSize(11).text(sec.feedback, 50, doc.y, { width: doc.page.width - 100, lineGap: 4 });
      doc.moveDown(1);
    });

    // 5. THÊM FOOTER CHO TẤT CẢ CÁC TRANG
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.fillColor('#94a3b8').font('Regular').fontSize(10);
      doc.text(`MockAI Interview Report - Trang ${i + 1} / ${range.count}`, 0, doc.page.height - 30, { align: 'center' });
    }

    doc.end();

  } catch (error) {
    console.error('Lỗi khi xuất PDF:', error);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Lỗi hệ thống khi tạo PDF.' });
    }
  }
};
