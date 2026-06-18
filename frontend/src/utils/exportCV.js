import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Xuất element thành file PDF
 * @param {HTMLElement} element - The DOM element to export
 * @param {string} fileName - Output filename
 */
export const exportToPDF = async (element, fileName = 'cv.pdf') => {
  if (!element) return;

  try {
    // 1. Convert DOM to canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Tăng scale để tăng độ nét (retina quality)
      useCORS: true, // Cho phép tải ảnh từ domain khác nếu có
      logging: false,
      backgroundColor: '#ffffff'
    });

    // 2. Calculate dimensions for A4
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // 3. Add image to PDF
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    // Nếu nội dung dài hơn 1 trang A4, tự động thêm trang mới
    let heightLeft = pdfHeight - pdf.internal.pageSize.getHeight();
    let position = -pdf.internal.pageSize.getHeight();

    while (heightLeft > 0) {
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      position -= pdf.internal.pageSize.getHeight();
    }

    // 4. Download
    pdf.save(fileName);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw new Error('Không thể xuất file PDF. Vui lòng thử lại.', { cause: error });
  }
};
