import { createRequire } from 'module';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import { safeParseJSON } from '../helper/jsonHelper.js';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Bóc tách văn bản từ buffer PDF của CV
 * @param {Buffer} fileBuffer - Buffer của tệp PDF tải lên
 * @returns {Promise<{text: string, pages: number, info: object}>} Văn bản bóc tách và thông tin trang
 */
export const parseCVBuffer = async (fileBuffer) => {
  let data;
  try {
    data = await pdfParse(fileBuffer);
  } catch (error) {
    throw new Error('File PDF không hợp lệ hoặc bị hỏng. Vui lòng kiểm tra lại định dạng file.');
  }
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
 * AI chấm điểm CV dựa trên Job Description sử dụng Groq API Qwen 3 32B
 * @param {string} cvText - Văn bản bóc tách từ CV
 * @param {string} jobDescription - Mô tả công việc cần đối chiếu
 * @returns {Promise<object>} Điểm số và nhận xét chi tiết
 */
export const evaluateCV = async (cvText, jobTitle, jobDescription) => {
  const apiKey = process.env.GROQ_API_KEY;
  const modelName = process.env.GROQ_MODEL || 'qwen/qwen3-32b';

  // Dữ liệu giả lập dự phòng khi có lỗi API hoặc cấu hình thiếu
  const fallbackData = {
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
    ],
    skillTree: {
      track: jobTitle || "Chuyên viên",
      nodes: [
        { id: "fundamental_1", label: "Kiến thức nền tảng", level: 1, category: "Nền tảng", status: "unlocked", score: 0 },
        { id: "fundamental_2", label: "Tư duy nghiệp vụ", level: 1, category: "Nền tảng", status: "unlocked", score: 0 },
        { id: "core_1", label: "Kỹ năng chuyên môn cốt lõi", level: 2, category: "Chuyên môn", status: "locked", score: 0 },
        { id: "core_2", label: "Công cụ chuyên ngành", level: 2, category: "Công cụ", status: "locked", score: 0 },
        { id: "core_3", label: "Giải quyết vấn đề", level: 2, category: "Kỹ năng", status: "locked", score: 0 },
        { id: "advanced_1", label: "Quản lý & Tối ưu", level: 3, category: "Nâng cao", status: "locked", score: 0 },
        { id: "advanced_2", label: "Hoạch định chiến lược", level: 3, category: "Nâng cao", status: "locked", score: 0 }
      ],
      links: [
        { source: "fundamental_1", target: "core_1" },
        { source: "fundamental_2", target: "core_2" },
        { source: "core_1", target: "advanced_1" },
        { source: "core_2", target: "advanced_2" },
        { source: "core_3", target: "advanced_1" }
      ]
    }
  };

  if (!apiKey || apiKey === 'gsk_your_groq_api_key_here' || apiKey.trim().length === 0) {
    console.log("[ATS Evaluation] GROQ_API_KEY chưa cấu hình thực tế, sử dụng dữ liệu giả lập.");
    return fallbackData;
  }

  const systemPrompt = `Bạn là một chuyên gia đánh giá CV, chấm điểm ATS (Applicant Tracking System) cao cấp và là chuyên gia thiết kế Lộ trình Phát triển Năng lực (Learning Path Architect).
Nhiệm vụ của bạn là so khớp chi tiết CV của ứng viên (dưới dạng văn bản thô) với Mô tả công việc (Job Description - JD) được cung cấp.

1. Hãy tính toán điểm số tổng quan (overallScore từ 0 đến 100) dựa trên mức độ phù hợp về kỹ năng, kinh nghiệm và học vấn.
2. Hãy chấm điểm và nhận xét cho 5 khía cạnh cụ thể:
- "Thông tin cá nhân": Đánh giá mức độ rõ ràng, đầy đủ của thông tin liên hệ.
- "Kinh nghiệm làm việc": Đánh giá độ phù hợp của các dự án, công việc cũ với yêu cầu trong JD.
- "Kỹ năng": Đánh giá mức độ khớp giữa các kỹ năng chuyên môn được liệt kê trong CV so với JD.
- "Học vấn": Đánh giá mức độ đáp ứng về bằng cấp, chuyên ngành.
- "Định dạng & ATS": Đánh giá cấu trúc trình bày và mức độ xuất hiện của các từ khóa quan trọng.
3. Chỉ ra 3 Điểm mạnh chính (strengths) và 3 Khuyến nghị cải thiện (improvements) bằng Tiếng Việt.
4. Sinh ra một Cây Kỹ Năng RPG (RPG Skill Tree) cá nhân hóa (gọi là skillTree), thiết kế dưới dạng đồ thị có hướng không chu trình (Directed Acyclic Graph - DAG) phân cấp thành 3 Level (Tiers) tăng dần:
   - Level 1: Kỹ năng nền tảng thiết yếu cho vị trí này (2-3 nodes).
   - Level 2: Kỹ năng chuyên môn cốt lõi bắt buộc phải làm việc được (3-5 nodes).
   - Level 3: Kỹ năng chuyên sâu, nâng cao hoặc công cụ đặc thù (2-4 nodes).
   Tổng số node trong cây phải từ 8 đến 12 nodes.
   Các node phải được liên kết logic với nhau bằng các "links" (source -> target). Ví dụ: Level 1 -> Level 2. Không được có liên kết vòng tròn hoặc node cô lập.
   Mỗi node có cấu trúc:
   - id: Chuỗi snake_case viết thường, duy nhất (ví dụ: "corporate_accounting", "advanced_excel").
   - label: Tên kỹ năng thân thiện hiển thị bằng Tiếng Việt.
   - level: Cấp độ (1, 2, hoặc 3).
   - category: Nhóm kỹ năng (ví dụ: "Chuyên môn", "Công cụ", "Kỹ năng mềm").
   - status: Nếu kỹ năng này đã được đề cập hoặc thể hiện tốt trong CV của ứng viên, hãy đặt trạng thái là "unlocked". Nếu ứng viên chưa có hoặc chưa mạnh kỹ năng này, hãy đặt là "locked".
   - score: Đặt mặc định là 0 cho tất cả các node.

Bạn PHẢI trả về kết quả dưới định dạng JSON duy nhất, có cấu trúc như sau:
{
  "overallScore": 85,
  "sections": [
    { "name": "Thông tin cá nhân", "score": 95, "feedback": "Nhận xét chi tiết bằng Tiếng Việt..." },
    { "name": "Kinh nghiệm làm việc", "score": 90, "feedback": "Nhận xét chi tiết bằng Tiếng Việt..." },
    { "name": "Kỹ năng", "score": 80, "feedback": "Nhận xét chi tiết bằng Tiếng Việt..." },
    { "name": "Học vấn", "score": 85, "feedback": "Nhận xét chi tiết bằng Tiếng Việt..." },
    { "name": "Định dạng & ATS", "score": 75, "feedback": "Nhận xét chi tiết bằng Tiếng Việt..." }
  ],
  "strengths": [
    "Điểm mạnh 1...",
    "Điểm mạnh 2...",
    "Điểm mạnh 3..."
  ],
  "improvements": [
    "Khuyến nghị cải thiện 1...",
    "Khuyến nghị cải thiện 2...",
    "Khuyến nghị cải thiện 3..."
  ],
  "skillTree": {
    "track": "Tên vị trí công việc (ví dụ: Financial Analyst, Frontend Developer)",
    "nodes": [
      { "id": "accounting_principles", "label": "Nguyên lý kế toán", "level": 1, "category": "Chuyên môn", "status": "unlocked", "score": 0 },
      ...
    ],
    "links": [
      { "source": "accounting_principles", "target": "financial_modeling" }
    ]
  }
}`;

  const userPrompt = `Dưới đây là thông tin chi tiết:
1. Thông tin công việc:
- Vị trí ứng tuyển: ${jobTitle || "Không có (Hãy đánh giá tổng quan CV)"}
- Mô tả công việc (Job Description - JD):
=========================================
${jobDescription || "Không có (Hãy chấm điểm dựa trên vị trí ứng tuyển hoặc thông tin chung)"}
=========================================

2. Văn bản CV bóc tách của ứng viên (Candidate CV Text):
=========================================
${cvText || "Không có nội dung CV (Hãy chấm điểm dựa trên JD và thông tin chung)"}
=========================================

Hãy thực hiện đánh giá, tính điểm và sinh cây kỹ năng RPG rồi trả về JSON chính xác theo cấu trúc yêu cầu.`;

  try {
    console.log(`[ATS Evaluation] Đang gửi yêu cầu chấm điểm CV và sinh cây kỹ năng lên Groq API sử dụng model ${modelName}...`);
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API request failed with status: ${response.status}`);
    }

    const resData = await response.json();
    const content = resData.choices[0].message.content;
    const parsedData = safeParseJSON(content);

    // Chuẩn hóa dữ liệu trả về để tránh trường hợp thiếu/sai trường
    const overallScore = Number(parsedData.overallScore) || 50;
    const sections = Array.isArray(parsedData.sections) ? parsedData.sections.map(s => ({
      name: String(s.name),
      score: Number(s.score) || 50,
      feedback: String(s.feedback)
    })) : fallbackData.sections;

    const strengths = Array.isArray(parsedData.strengths) ? parsedData.strengths.map(String) : fallbackData.strengths;
    const improvements = Array.isArray(parsedData.improvements) ? parsedData.improvements.map(String) : fallbackData.improvements;

    // Chuẩn hóa skillTree từ AI
    let skillTree = parsedData.skillTree || fallbackData.skillTree;
    if (skillTree && Array.isArray(skillTree.nodes)) {
      skillTree.track = skillTree.track || jobTitle || "Chuyên viên";
      skillTree.nodes = skillTree.nodes.map(n => ({
        id: String(n.id),
        label: String(n.label),
        level: Number(n.level) || 2,
        category: String(n.category || "Chuyên môn"),
        status: String(n.status) === 'unlocked' ? 'unlocked' : 'locked',
        score: Number(n.score) || 0
      }));
      if (!Array.isArray(skillTree.links)) {
        skillTree.links = [];
      } else {
        skillTree.links = skillTree.links.map(l => ({
          source: String(l.source),
          target: String(l.target)
        }));
      }
    } else {
      skillTree = fallbackData.skillTree;
    }

    console.log(`[ATS Evaluation] Chấm điểm CV và sinh cây kỹ năng hoàn tất thành công! Điểm overall: ${overallScore}`);
    return {
      overallScore,
      sections,
      strengths,
      improvements,
      skillTree
    };
  } catch (error) {
    console.error('[ATS Evaluation] Lỗi khi kết nối Groq API để chấm điểm CV, sử dụng fallback:', error);
    return fallbackData;
  }
};

/**
 * Sinh PDF báo cáo đánh giá CV bằng pdfkit dưới dạng Buffer
 */
export const generatePDFReportBuffer = (evaluation, candidateName, jobTitle) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 0, size: 'A4', bufferPages: true });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

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

      const primary = '#0ea5e9';
      const dark = '#0f172a';
      const textMain = '#334155';
      const success = '#10b981';
      const warning = '#f59e0b';
      const bgLight = '#f8fafc';

      // 1. VẼ HEADER ĐẬM CHẤT CÔNG NGHỆ (Full Width)
      doc.rect(0, 0, doc.page.width, 120).fill(dark);
      doc.fillColor('white').font('Bold').fontSize(22).text('MOCKAI INTERVIEW', 50, 35);
      doc.fillColor(primary).font('Regular').fontSize(12).text(`BÁO CÁO PHÂN TÍCH ATS CV - ỨNG VIÊN: ${candidateName.toUpperCase()}`, 50, 68);
      doc.fillColor('white').font('Regular').fontSize(10).text(`Vị trí ứng tuyển: ${jobTitle}`, 50, 85);

      // Điểm tổng quan ở góc phải Header
      doc.fillColor(primary).font('Bold').fontSize(40).text(evaluation.overallScore || 0, doc.page.width - 180, 33, { align: 'right', width: 80 });
      doc.fillColor('white').font('Regular').fontSize(14).text('/ 100', doc.page.width - 90, 55);

      doc.x = 50;
      doc.y = 150; 

      doc.on('pageAdded', () => {
        doc.x = 50;
        doc.y = 50;
      });

      // 2. VŨ KHÍ BÍ MẬT (Điểm Mạnh)
      doc.fillColor(success).font('Bold').fontSize(14).text('Điểm Mạnh Của Hồ Sơ (Strengths)');
      doc.moveDown(0.4);
      doc.fillColor(textMain).font('Regular').fontSize(11);
      (evaluation.strengths || []).forEach(s => {
        doc.text(`•  ${s}`, { lineGap: 4 });
      });
      doc.moveDown(1.2);

      // 3. ĐIỂM CẦN KHẮC PHỤC (Improvements)
      doc.fillColor(warning).font('Bold').fontSize(14).text('Khuyến Nghị Cải Thiện (Improvements)');
      doc.moveDown(0.4);
      doc.fillColor(textMain).font('Regular').fontSize(11);
      (evaluation.improvements || []).forEach(i => {
        doc.text(`•  ${i}`, { lineGap: 4 });
      });
      doc.moveDown(1.2);

      // 4. PHÂN TÍCH CHI TIẾT
      doc.fillColor(primary).font('Bold').fontSize(14).text('Điểm Số Theo Tiêu Chí Đánh Giá');
      doc.moveDown(0.4);

      (evaluation.sections || []).forEach(sec => {
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
        }
        const startY = doc.y;
        doc.rect(50, startY, doc.page.width - 100, 26).fill(bgLight);
        let scoreColor = sec.score >= 80 ? success : sec.score >= 60 ? primary : warning;
        doc.fillColor(dark).font('Bold').fontSize(11).text(sec.name, 62, startY + 8);
        doc.fillColor(scoreColor).font('Bold').fontSize(11).text(`${sec.score} / 100`, 50, startY + 8, { align: 'right', width: doc.page.width - 115 });
        doc.y = startY + 34;
        doc.fillColor(textMain).font('Regular').fontSize(10).text(sec.feedback, 50, doc.y, { width: doc.page.width - 100, lineGap: 3 });
        doc.moveDown(0.8);
      });

      // 5. FOOTER
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fillColor('#94a3b8').font('Regular').fontSize(9);
        doc.text(`MockAI Interview Report - Trang ${i + 1} / ${range.count}`, 0, doc.page.height - 25, { align: 'center' });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
